import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quoteSubmissionSchema, type InsertQuote, type InsertLead, type Lead } from "@shared/schema";
import { calculateIntelligentQuote, SERVICE_PRICING_CONFIG } from "./services/pricing";
import { sendQuoteNotification } from "./email";
import { z } from "zod";
import { quoteCacheMiddleware } from "./middleware/quoteCache";
import { quoteCalculationRateLimit } from "./middleware/rateLimit";
import { PRIORITY_SERVICES, CITIES } from "@shared/contentData";
import { sendNewLeadNotification, sendLeadPurchasedNotification, sendLeadPurchaseConfirmation } from "./services/emailNotifications";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { parseAndRoundQuote, normalizeLineItemsForEmail, calculateQuoteRange } from "@shared/utils";
import { getClosestBuildingFootprint } from "./services/overpass";
import Stripe from "stripe";

const stripe =
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-12-15.clover",
      })
    : null;

function getAuthUserId(req: any): string | null {
  // Normal path (OIDC)
  const direct = req?.user?.claims?.sub;
  if (direct) return direct;

  // Dev path: sessions created by `/api/auth/test-login`
  if (process.env.NODE_ENV === "development") {
    const fromSession = (req as any)?.session?.passport?.user?.claims?.sub;
    if (fromSession) return fromSession;
  }

  return null;
}

// Create service name and description maps for email normalization
const SERVICE_NAME_MAP: Record<string, string> = Object.entries(SERVICE_PRICING_CONFIG).reduce(
  (acc, [id, data]: any) => {
    acc[id] = data.name;
    return acc;
  },
  {} as Record<string, string>
);

const SERVICE_DATA_MAP: Record<string, { name: string; shortDescription: string }> = 
  PRIORITY_SERVICES.reduce((acc, service) => {
    acc[service.slug] = {
      name: service.name,
      shortDescription: service.shortDescription
    };
    return acc;
  }, {} as Record<string, { name: string; shortDescription: string }>);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // ============================================
  // ADMIN ANALYTICS (KPIs + charts)
  // ============================================
  const adminAnalyticsQuerySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).optional(),
    start: z.string().optional(), // ISO or YYYY-MM-DD
    end: z.string().optional(), // ISO or YYYY-MM-DD
  });

  function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? null : d;
  }

  function startOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function endOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  function dayKey(d: Date): string {
    // YYYY-MM-DD (local-ish via toISOString; good enough for charting)
    return d.toISOString().slice(0, 10);
  }

  function isInRange(d: Date | null, startMs: number, endMs: number): boolean {
    if (!d) return false;
    const t = d.getTime();
    return t >= startMs && t <= endMs;
  }

  function safeNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const n = typeof value === "number" ? value : parseFloat(String(value));
    return Number.isFinite(n) ? n : 0;
  }

  app.get(
    "/api/admin/analytics",
    isAuthenticated,
    requireRole(["admin"]),
    async (req: any, res) => {
      try {
        const parsed = adminAnalyticsQuerySchema.parse(req.query);
        const now = new Date();

        const endDate = endOfDay(toDate(parsed.end) ?? now);
        const days = parsed.days ?? 30;
        const startDate =
          startOfDay(toDate(parsed.start) ?? new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000));

        const startMs = startDate.getTime();
        const endMs = endDate.getTime();

        const [allLeads, allSubs] = await Promise.all([
          storage.getAllLeads(),
          storage.getAllSubcontractors(),
        ]);

        const allTime = {
          totalLeads: allLeads.length,
          pendingAdmin: allLeads.filter((l) => l.status === "pending_admin").length,
          accepted: allLeads.filter((l) => l.status === "accepted").length,
          available: allLeads.filter((l) => l.status === "available").length,
          purchased: allLeads.filter((l) => l.status === "purchased").length,
          totalRevenue: allLeads.reduce((sum, l) => sum + safeNumber(l.purchasePrice), 0),
        };

        const createdInRange = allLeads.filter((l) => isInRange(toDate(l.createdAt), startMs, endMs));
        const reviewedInRange = allLeads.filter((l) => isInRange(toDate(l.adminReviewedAt), startMs, endMs));
        const purchasedInRange = allLeads.filter((l) => isInRange(toDate(l.purchasedAt), startMs, endMs));

        const revenueInRange = purchasedInRange.reduce((sum, l) => sum + safeNumber(l.purchasePrice), 0);
        const avgPurchasePrice = purchasedInRange.length > 0 ? revenueInRange / purchasedInRange.length : 0;
        const purchaseConversion =
          createdInRange.length > 0 ? purchasedInRange.length / createdInRange.length : 0;

        const reviewLagHours = createdInRange
          .map((l) => {
            const created = toDate(l.createdAt);
            const reviewed = toDate(l.adminReviewedAt);
            if (!created || !reviewed) return null;
            return Math.max(0, (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60));
          })
          .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

        const avgTimeToReviewHours =
          reviewLagHours.length > 0
            ? reviewLagHours.reduce((a, b) => a + b, 0) / reviewLagHours.length
            : 0;

        const purchaseLagHours = purchasedInRange
          .map((l) => {
            const created = toDate(l.createdAt);
            const purchased = toDate(l.purchasedAt);
            if (!created || !purchased) return null;
            return Math.max(0, (purchased.getTime() - created.getTime()) / (1000 * 60 * 60));
          })
          .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

        const avgTimeToPurchaseHours =
          purchaseLagHours.length > 0
            ? purchaseLagHours.reduce((a, b) => a + b, 0) / purchaseLagHours.length
            : 0;

        const activeSubs = allSubs.length;
        const subsAgreementAccepted = allSubs.filter((s) => !!s.agreementAccepted).length;

        const availableLeadsNow = allLeads.filter((l) => l.status === "available");
        const availableAvgAgeHours =
          availableLeadsNow.length > 0
            ? availableLeadsNow
                .map((l) => {
                  const created = toDate(l.createdAt);
                  if (!created) return 0;
                  return Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60));
                })
                .reduce((a, b) => a + b, 0) / availableLeadsNow.length
            : 0;

        // Daily time series for charts
        const seriesMap = new Map<
          string,
          { date: string; leadsCreated: number; leadsReviewed: number; leadsPurchased: number; revenue: number }
        >();
        for (
          let d = startOfDay(startDate);
          d.getTime() <= endOfDay(endDate).getTime();
          d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
        ) {
          const key = dayKey(d);
          seriesMap.set(key, { date: key, leadsCreated: 0, leadsReviewed: 0, leadsPurchased: 0, revenue: 0 });
        }

        for (const l of allLeads) {
          const created = toDate(l.createdAt);
          if (created && isInRange(created, startMs, endMs)) {
            const key = dayKey(created);
            const row = seriesMap.get(key);
            if (row) row.leadsCreated += 1;
          }
          const reviewed = toDate(l.adminReviewedAt);
          if (reviewed && isInRange(reviewed, startMs, endMs)) {
            const key = dayKey(reviewed);
            const row = seriesMap.get(key);
            if (row) row.leadsReviewed += 1;
          }
          const purchased = toDate(l.purchasedAt);
          if (purchased && isInRange(purchased, startMs, endMs)) {
            const key = dayKey(purchased);
            const row = seriesMap.get(key);
            if (row) {
              row.leadsPurchased += 1;
              row.revenue += safeNumber(l.purchasePrice);
            }
          }
        }

        const daily = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // Breakdown by service/city (using createdAt in range for volume; purchasedAt in range for revenue)
        const byService = new Map<string, { serviceType: string; leadsCreated: number; purchases: number; revenue: number }>();
        const byCity = new Map<string, { city: string; leadsCreated: number; purchases: number; revenue: number }>();

        for (const l of createdInRange) {
          const svc = l.serviceType || "unknown";
          const city = l.city || "unknown";
          byService.set(svc, { serviceType: svc, leadsCreated: (byService.get(svc)?.leadsCreated ?? 0) + 1, purchases: byService.get(svc)?.purchases ?? 0, revenue: byService.get(svc)?.revenue ?? 0 });
          byCity.set(city, { city, leadsCreated: (byCity.get(city)?.leadsCreated ?? 0) + 1, purchases: byCity.get(city)?.purchases ?? 0, revenue: byCity.get(city)?.revenue ?? 0 });
        }

        for (const l of purchasedInRange) {
          const svc = l.serviceType || "unknown";
          const city = l.city || "unknown";
          const rev = safeNumber(l.purchasePrice);
          byService.set(svc, { serviceType: svc, leadsCreated: byService.get(svc)?.leadsCreated ?? 0, purchases: (byService.get(svc)?.purchases ?? 0) + 1, revenue: (byService.get(svc)?.revenue ?? 0) + rev });
          byCity.set(city, { city, leadsCreated: byCity.get(city)?.leadsCreated ?? 0, purchases: (byCity.get(city)?.purchases ?? 0) + 1, revenue: (byCity.get(city)?.revenue ?? 0) + rev });
        }

        const byServiceArr = Array.from(byService.values())
          .map((r) => ({
            ...r,
            conversion: r.leadsCreated > 0 ? r.purchases / r.leadsCreated : 0,
            avgPurchasePrice: r.purchases > 0 ? r.revenue / r.purchases : 0,
          }))
          .sort((a, b) => b.leadsCreated - a.leadsCreated);

        const byCityArr = Array.from(byCity.values())
          .map((r) => ({
            ...r,
            conversion: r.leadsCreated > 0 ? r.purchases / r.leadsCreated : 0,
            avgPurchasePrice: r.purchases > 0 ? r.revenue / r.purchases : 0,
          }))
          .sort((a, b) => b.leadsCreated - a.leadsCreated);

        // Top buyers (subcontractors) based on purchases in range
        const buyerAgg = new Map<string, { userId: string; purchases: number; revenue: number }>();
        for (const l of purchasedInRange) {
          const buyer = l.purchasedBy;
          if (!buyer) continue;
          const rev = safeNumber(l.purchasePrice);
          buyerAgg.set(buyer, {
            userId: buyer,
            purchases: (buyerAgg.get(buyer)?.purchases ?? 0) + 1,
            revenue: (buyerAgg.get(buyer)?.revenue ?? 0) + rev,
          });
        }

        const buyerRows = Array.from(buyerAgg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        const buyers = await Promise.all(
          buyerRows.map(async (row) => {
            const user = await storage.getUser(row.userId);
            const displayName =
              user?.company ||
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              user?.email ||
              row.userId;
            return {
              ...row,
              displayName,
            };
          })
        );

        res.json({
          success: true,
          range: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            days: Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
          },
          allTime,
          kpis: {
            leadsCreated: createdInRange.length,
            leadsReviewed: reviewedInRange.length,
            leadsPurchased: purchasedInRange.length,
            revenue: revenueInRange,
            avgPurchasePrice,
            purchaseConversion,
            avgTimeToReviewHours,
            avgTimeToPurchaseHours,
            availableNow: availableLeadsNow.length,
            availableAvgAgeHours,
            activeSubcontractors: activeSubs,
            subcontractorsAgreementAccepted: subsAgreementAccepted,
          },
          charts: {
            daily,
            byService: byServiceArr,
            byCity: byCityArr,
            topBuyers: buyers,
          },
        });
      } catch (error) {
        console.error("Error generating admin analytics:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate analytics" });
      }
    }
  );

  // DEV ONLY: Test authentication bypass for E2E testing
  if (process.env.NODE_ENV === "development") {
    app.post("/api/auth/test-login", async (req, res) => {
      try {
        const { userId, email, role } = req.body as {
          userId?: string;
          email?: string;
          role?: string;
        };

        if (!userId || typeof userId !== "string") {
          // #region agent log (hypothesis A)
          fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/auth/test-login',message:'test_login_missing_userId',data:{hasUserId:!!userId,userIdType:typeof userId,hasRole:!!role,hasEmail:!!email},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return res.status(400).json({ error: "userId is required" });
        }

        let user = await storage.getUser(userId);
        const userExistedBefore = !!user;
        
        if (!user) {
          // Dev convenience: create the user if it doesn't exist yet.
          const inferredRole =
            role ||
            (userId === "admin-temp-id"
              ? "admin"
              : userId === "sub-temp-id"
                ? "subcontractor"
                : "customer");

          user = await storage.upsertUser({
            id: userId,
            email: email || (userId === "admin-temp-id" ? "admin@lawncarekuna.com" : "contractor@example.com"),
            firstName: inferredRole === "admin" ? "Admin" : "Test",
            lastName: inferredRole === "admin" ? "User" : "Subcontractor",
            role: inferredRole,
          } as any);
        }

        // #region agent log (hypothesis A)
        fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/auth/test-login',message:'test_login_success',data:{userId:user.id,role:user.role,userExistedBefore,hasEmail:!!user.email,requestedRole:role||null},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Create a test session
        (req as any).session.passport = {
          user: {
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
            }
          }
        };
        
        await new Promise((resolve, reject) => {
          (req as any).session.save((err: any) => {
            if (err) reject(err);
            else resolve(undefined);
          });
        });
        
        console.log(`[TEST AUTH] Logged in user ${user.id} (${user.role})`);
        res.json({ success: true, user });
      } catch (error) {
        console.error("Error in test login:", error);
        res.status(500).json({ error: "Failed to login" });
      }
    });

    // DEV ONLY: Seed a small set of leads for deterministic QA
    // Creates: 1 pending_admin lead, 1 available lead, 1 purchased lead (owned by sub-temp-id).
    app.post("/api/dev/seed", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
      try {
        const { calculateLeadPrice } = await import("./services/leadPricing");

        // Ensure the test subcontractor exists (purchase history needs it).
        const subUserId = "sub-temp-id";
        const subUser =
          (await storage.getUser(subUserId)) ??
          (await storage.upsertUser({
            id: subUserId,
            email: "contractor@example.com",
            firstName: "Test",
            lastName: "Subcontractor",
            role: "subcontractor",
            agreementAccepted: true,
            agreementAcceptedAt: new Date(),
          } as any));

        const now = new Date();

        const makeQuoteAndLead = async (opts: {
          name: string;
          email: string;
          phone: string;
          city: string;
          propertyType: string;
          serviceType: string;
          frequency: string;
          finalQuote: number;
          status: "pending_admin" | "available" | "purchased" | "accepted";
          purchasedBy?: string;
        }) => {
          const quote = await storage.createQuote({
            name: opts.name,
            email: opts.email,
            phone: opts.phone,
            city: opts.city,
            propertyType: opts.propertyType,
            serviceType: opts.serviceType,
            frequency: opts.frequency,
            finalQuote: String(opts.finalQuote),
            address: `${opts.city}, Idaho`,
            selectedServices: [opts.serviceType],
            serviceData: { [opts.serviceType]: { propertySize: 5000, zones: 6, linearFeet: 200 } } as any,
            lineItems: [
              {
                serviceId: opts.serviceType,
                serviceName: opts.serviceType,
                basePrice: 100,
                adjustedPrice: opts.finalQuote,
                description: opts.serviceType,
              },
            ] as any,
            status: "pending",
          } as any);

          const { basePrice, currentPrice } = calculateLeadPrice({
            finalQuote: opts.finalQuote,
            frequency: opts.frequency,
            serviceType: opts.serviceType,
          });

          const lead = await storage.createLead({
            quoteId: quote.id,
            name: quote.name,
            email: quote.email,
            phone: quote.phone,
            address: quote.address ?? null,
            city: quote.city,
            propertyType: quote.propertyType,
            serviceType: quote.serviceType,
            selectedServices: (quote.selectedServices as any) ?? [],
            frequency: quote.frequency,
            finalQuote: quote.finalQuote,
            lineItems: quote.lineItems as any,
            serviceData: quote.serviceData as any,
            message: quote.message,
            baseLeadPrice: basePrice.toFixed(2),
            currentLeadPrice: currentPrice.toFixed(2),
            status: opts.status,
            adminDeclined: opts.status === "available",
            lastPriceUpdate: opts.status === "available" ? now : undefined,
            purchasedBy: opts.purchasedBy as any,
            purchasedAt: opts.status === "purchased" ? now : undefined,
            purchasePrice: opts.status === "purchased" ? currentPrice.toFixed(2) : undefined,
            stripePaymentIntentId: opts.status === "purchased" ? `pi_dev_seed_${quote.id}` : undefined,
          } as any);

          // If purchased, also create a purchase record for history.
          if (opts.status === "purchased") {
            await storage.createLeadPurchase({
              leadId: lead.id,
              userId: opts.purchasedBy || subUser.id,
              purchasePrice: lead.currentLeadPrice,
              stripePaymentIntentId: lead.stripePaymentIntentId || `pi_dev_seed_${lead.id}`,
            } as any);
          }

          return { quote, lead };
        };

        const pending = await makeQuoteAndLead({
          name: "Pending Lead",
          email: "pending@example.com",
          phone: "2085550100",
          city: "Kuna",
          propertyType: "residential",
          serviceType: "lawn-mowing",
          frequency: "one-time",
          finalQuote: 1200,
          status: "pending_admin",
        });

        const available = await makeQuoteAndLead({
          name: "Available Lead",
          email: "available@example.com",
          phone: "2085550101",
          city: "Meridian",
          propertyType: "residential",
          serviceType: "fertilization",
          frequency: "one-time",
          finalQuote: 800,
          status: "available",
        });

        const purchased = await makeQuoteAndLead({
          name: "Purchased Lead",
          email: "purchased@example.com",
          phone: "2085550102",
          city: "Boise",
          propertyType: "residential",
          serviceType: "aeration",
          frequency: "one-time",
          finalQuote: 1500,
          status: "purchased",
          purchasedBy: subUser.id,
        });

        // #region agent log (hypothesis B)
        fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/dev/seed',message:'dev_seed_success',data:{pendingLeadId:pending.lead.id,availableLeadId:available.lead.id,purchasedLeadId:purchased.lead.id,subUserId:subUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        res.json({
          success: true,
          seeded: {
            pendingLeadId: pending.lead.id,
            availableLeadId: available.lead.id,
            purchasedLeadId: purchased.lead.id,
          },
        });
      } catch (error) {
        console.error("[DEV SEED] Failed:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to seed" });
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const claims =
        req.user?.claims ??
        (process.env.NODE_ENV === "development"
          ? (req as any).session?.passport?.user?.claims
          : undefined);

      let user = await storage.getUser(userId);

      // If the user row doesn't exist yet (first login), create it from claims.
      // Role is intentionally not set here; storage defaults are applied (or an existing role is preserved).
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: claims?.email,
          firstName: claims?.first_name,
          lastName: claims?.last_name,
          profileImageUrl: claims?.profile_image_url,
        } as any);
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stripe: Create payment intent for lead purchase
  app.post("/api/create-payment-intent", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Payments are temporarily unavailable (Stripe not configured)" });
      }

      const { leadId } = req.body;
      
      if (!leadId) {
        return res.status(400).json({ error: "Lead ID is required" });
      }
      
      const lead = await storage.getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      if (lead.status !== "available") {
        return res.status(400).json({ error: "Lead is no longer available" });
      }
      
      // Get or create Stripe customer for this user
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "User not authenticated properly" });
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Verify user has accepted agreement
      if (!user.agreementAccepted) {
        return res.status(403).json({ error: "You must accept the legal agreement before purchasing leads" });
      }
      
      let stripeCustomerId = user.stripeCustomerId;
      
      // Create Stripe customer if not exists
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;
        
        // Save customer ID to user
        await storage.updateUser(user.id, { stripeCustomerId });
      }
      
      // Create payment intent for the lead price (amount is in cents)
      const amountInCents = Math.round(parseFloat(lead.currentLeadPrice || "10") * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: stripeCustomerId,
        metadata: {
          leadId: lead.id,
          userId: user.id,
          serviceType: lead.serviceType || "",
          city: lead.city || "",
        },
        description: `Lead purchase: ${lead.serviceType} in ${lead.city}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create payment intent" });
    }
  });

  // ============================================
  // GEO / MAP HELPERS (public)
  // ============================================
  const overpassBuildingsSchema = z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radius: z.coerce.number().optional(),
  });

  // Proxy Overpass building footprint lookup (server-side to avoid browser CORS/rate limits)
  app.post("/api/geodata/overpass/buildings", async (req, res) => {
    try {
      const { lat, lng, radius } = overpassBuildingsSchema.parse(req.body);
      const footprint = await getClosestBuildingFootprint({ lat, lng, radius });
      res.json({
        success: true,
        found: Array.isArray(footprint) && footprint.length > 0,
        latlngs: footprint,
      });
    } catch (error) {
      console.error("Overpass proxy error:", error);
      res.status(200).json({
        success: false,
        found: false,
        latlngs: null,
        message: error instanceof Error ? error.message : "Overpass lookup failed",
      });
    }
  });

  // Validation schema for quote calculation (flexible - only require essential fields)
  const calculateQuoteSchema = z.object({
    address: z.string().optional(),
    city: z.string().min(1, "City is required"),
    propertySize: z.coerce.number().positive("Property size must be a positive number").optional(),
    propertyType: z.enum(["residential", "commercial", "hoa", "property-management"]).optional(),
    serviceType: z.string().min(1, "Service type is required"),
    frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]).optional(),
    selectedServices: z.array(z.string()).optional(),
    serviceData: z.any().optional(), // Service-specific measurements
  });

  // Calculate intelligent quote with AI (with caching and rate limiting)
  app.post("/api/quotes/calculate", quoteCalculationRateLimit, quoteCacheMiddleware, async (req, res) => {
    try {
      // Validate request
      const validatedData = calculateQuoteSchema.parse(req.body);
      
      // Check if this is a multi-service quote with service-specific data
      if (validatedData.serviceData && validatedData.selectedServices && validatedData.selectedServices.length > 0) {
        // Use new multi-service pricing
        const { calculateMultiServiceQuote } = await import("./services/pricing");
        const quoteResult = await calculateMultiServiceQuote({
          selectedServices: validatedData.selectedServices,
          serviceData: validatedData.serviceData,
          propertyType: validatedData.propertyType || "residential",
          city: validatedData.city,
          address: validatedData.address,
          propertySize: validatedData.propertySize,
          frequency: validatedData.frequency || "one-time",
        });
        
        res.json({
          ...quoteResult,
          success: true,
        });
        return;
      }
      
      // Provide defaults for optional fields (legacy single-service path)
      const dataWithDefaults = {
        address: validatedData.address || `${validatedData.city}, Idaho`,
        city: validatedData.city,
        propertySize: validatedData.propertySize || 5000, // Default to median property size
        propertyType: validatedData.propertyType || "residential",
        serviceType: validatedData.serviceType,
        frequency: validatedData.frequency || "one-time",
        selectedServices: validatedData.selectedServices || [],
      };

      try {
        // Try AI-powered pricing
        const quoteResult = await calculateIntelligentQuote(dataWithDefaults);
        res.json({
          ...quoteResult,
          success: true,
        });
      } catch (aiError) {
        // AI failed - use deterministic fallback pricing
        console.error("AI pricing failed, using fallback:", aiError);
        
        const { SERVICE_PRICING_CONFIG, PROPERTY_MULTIPLIERS, FREQUENCY_DISCOUNTS, GROSS_MARGIN } = await import("./services/pricing");

        const roundUpToNearest5 = (value: number) => Math.ceil(value / 5) * 5;
        
        // Helper to calculate base cost per service with correct unit handling
        const calculateServiceBase = (serviceId: string, propertySize: number) => {
          const cfg: any = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG];
          if (!cfg) return 0;

          // Special models
          if (serviceId === "lawn-mowing") {
            return 35 + propertySize * 0.003;
          }
          if (serviceId === "sprinkler-blowout") {
            const zones = 6;
            const extraZones = Math.max(0, zones - 6);
            return 65 + extraZones * 5;
          }

          if (cfg.unit === "base_service" || cfg.unit === "base_project") return cfg.rate;
          if (cfg.unit === "sqft") return propertySize * cfg.rate;
          if (cfg.unit === "linear_ft") {
            const estimatedPerimeter = Math.sqrt(propertySize) * 4 * 0.6;
            return estimatedPerimeter * cfg.rate;
          }
          if (cfg.unit === "per_zone") return 6 * cfg.rate;
          if (cfg.unit === "per_tree") return 1 * cfg.rate;
          if (cfg.unit === "per_fixture") return 10 * cfg.rate;
          if (cfg.unit === "per_stump") return 1 * cfg.rate;
          if (cfg.unit === "per_sqft") return propertySize * cfg.rate;

          return 0;
        };
        
        // Calculate main service
        let baseCost = calculateServiceBase(dataWithDefaults.serviceType, dataWithDefaults.propertySize);
        const mainService: any = SERVICE_PRICING_CONFIG[dataWithDefaults.serviceType as keyof typeof SERVICE_PRICING_CONFIG];
        
        const lineItems = [
          {
            service: dataWithDefaults.serviceType,
            description: mainService?.name || dataWithDefaults.serviceType,
            basePrice: baseCost,
            adjustedPrice: baseCost,
          }
        ];
        
        // Add selected addon services
        if (dataWithDefaults.selectedServices && dataWithDefaults.selectedServices.length > 0) {
          for (const serviceId of dataWithDefaults.selectedServices) {
            const serviceBase = calculateServiceBase(serviceId, dataWithDefaults.propertySize);
            baseCost += serviceBase;
            
            lineItems.push({
              service: serviceId,
              description: SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG]?.name || serviceId,
              basePrice: serviceBase,
              adjustedPrice: serviceBase,
            });
          }
        }
        
        // Apply property type multiplier
        const propertyMultiplier = PROPERTY_MULTIPLIERS[dataWithDefaults.propertyType as keyof typeof PROPERTY_MULTIPLIERS] || 1.0;
        baseCost *= propertyMultiplier;
        
        // Apply complexity (use 1.2 as standard)
        const complexityScore = 1.2;
        const adjustedCost = baseCost * complexityScore;
        
        // Apply frequency discount
        const discount = FREQUENCY_DISCOUNTS[dataWithDefaults.frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
        const afterDiscount = adjustedCost * (1 - discount);

        // Compute final, customer-facing line item prices (gross margin + rounding)
        lineItems.forEach(item => {
          const lineCost = item.basePrice * propertyMultiplier * complexityScore * (1 - discount);
          const linePrice = lineCost / (1 - GROSS_MARGIN);
          item.adjustedPrice = roundUpToNearest5(linePrice);
        });

        // Ensure total matches itemized prices
        const finalQuote = lineItems.reduce((sum, item) => sum + item.adjustedPrice, 0);
        const rangePct = Math.max(0.1, Math.min(0.2, 0.1 + (complexityScore - 1) * 0.1));
        const { min: finalQuoteMin, max: finalQuoteMax } = calculateQuoteRange(finalQuote, rangePct);
        
        // Return fallback quote with proper margins
        res.json({
          baseCost: roundUpToNearest5(baseCost),
          adjustedCost: roundUpToNearest5(adjustedCost),
          finalQuote,
          finalQuoteMin,
          finalQuoteMax,
          lineItems: lineItems.map(item => ({
            ...item,
            basePrice: roundUpToNearest5(item.basePrice),
            adjustedPrice: roundUpToNearest5(item.adjustedPrice),
          })),
          aiAnalysis: {
            terrainDifficulty: "flat",
            obstacles: [],
            grassCondition: "moderate",
            accessibility: "easy",
            estimatedTimeMultiplier: 1.2,
            complexityScore: 1.2,
            reasoning: "Using standard pricing estimate (AI analysis unavailable)",
          },
          complexityScore: 1.2,
          breakdown: {
            laborCost: roundUpToNearest5(afterDiscount * 0.35),
            materialsCost: roundUpToNearest5(afterDiscount * 0.15),
            overhead: roundUpToNearest5(afterDiscount * 0.20),
            profit: roundUpToNearest5(finalQuote - afterDiscount),
          },
          success: true,
          aiFallback: true,
        });
      }
    } catch (error) {
      console.error("Quote calculation error:", error);
      
      if (error instanceof z.ZodError) {
        // Validation errors
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        // Unexpected server error
        res.status(500).json({
          success: false,
          message: "Failed to calculate quote. Please try again or contact us directly.",
        });
      }
    }
  });

  // Quote submission endpoint (from wizard)
  app.post("/api/quotes", async (req, res) => {
    try {
      // Validate using submission schema (includes AI fields)
      const validatedData = quoteSubmissionSchema.parse(req.body);

      // If the client didn't provide pricing, compute it server-side from selected services + measurements.
      // This keeps lead pricing consistent and prevents $0/null quotes from producing $10 leads.
      let autoPricing: null | {
        lineItems: any[];
        baseCost: number;
        adjustedCost: number;
        finalQuote: number;
        aiAnalysis: any;
        complexityScore: number;
      } = null;

      const hasFinalQuote =
        validatedData.finalQuote !== undefined &&
        validatedData.finalQuote !== null &&
        (() => {
          const rounded = parseAndRoundQuote(validatedData.finalQuote as any);
          return Number.isFinite(rounded) && rounded > 0;
        })();

      const shouldAutoCalculate =
        !hasFinalQuote &&
        Array.isArray(validatedData.selectedServices) &&
        validatedData.selectedServices.length > 0 &&
        validatedData.serviceData &&
        typeof validatedData.serviceData === "object";

      // #region agent log (hypothesis D)
      fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/quotes',message:'quote_submit_pricing_inputs',data:{hasFinalQuote,shouldAutoCalculate,selectedServicesCount:Array.isArray(validatedData.selectedServices)?validatedData.selectedServices.length:0,hasServiceData:!!validatedData.serviceData,hasLineItems:Array.isArray((validatedData as any).lineItems),frequency:validatedData.frequency||null,serviceType:validatedData.serviceType,city:validatedData.city},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'D'})}).catch(()=>{});
      // #endregion

      if (shouldAutoCalculate) {
        try {
          const { calculateMultiServiceQuote } = await import("./services/pricing");
          const propertySizeNum = validatedData.propertySize
            ? parseFloat(String(validatedData.propertySize))
            : undefined;

          const computed = await calculateMultiServiceQuote({
            selectedServices: validatedData.selectedServices as any,
            serviceData: validatedData.serviceData as any,
            propertyType: validatedData.propertyType,
            city: validatedData.city,
            address: validatedData.address,
            propertySize: Number.isFinite(propertySizeNum as any) ? (propertySizeNum as number) : undefined,
            frequency: validatedData.frequency || "one-time",
          });

          autoPricing = {
            lineItems: computed.lineItems,
            baseCost: computed.baseCost,
            adjustedCost: computed.adjustedCost,
            finalQuote: computed.finalQuote,
            aiAnalysis: computed.aiAnalysis,
            complexityScore: computed.complexityScore,
          };
        } catch (autoErr) {
          console.error("[quotes] Auto-calculate pricing failed; continuing without pricing:", autoErr);
          autoPricing = null;
        }
      }
      
      // Sanitize and normalize data for storage
      const quoteData: InsertQuote = {
        // Required fields
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        city: validatedData.city,
        propertyType: validatedData.propertyType,
        serviceType: validatedData.serviceType,
        
        // Optional core fields
        address: validatedData.address || null,
        message: validatedData.message || null,
        
        // Normalize propertySize to decimal string with NaN guard
        propertySize: validatedData.propertySize 
          ? (() => {
              const num = typeof validatedData.propertySize === 'number'
                ? validatedData.propertySize
                : parseFloat(String(validatedData.propertySize));
              if (isNaN(num) || num <= 0) {
                throw new Error("Invalid property size");
              }
              return String(num);
            })()
          : null,
        
        // Service details
        frequency: validatedData.frequency || null,
        selectedServices: validatedData.selectedServices || null,
        serviceData: validatedData.serviceData || null,
        
        // AI analysis (stored as JSONB)
        aiAnalysis: validatedData.aiAnalysis || autoPricing?.aiAnalysis || null,
        
        // Pricing (normalize to decimal strings with validation)
        complexityScore: (validatedData.complexityScore ?? autoPricing?.complexityScore)
          ? (() => {
              const raw = (validatedData.complexityScore ?? autoPricing?.complexityScore) as any;
              const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        baseCost: (validatedData.baseCost ?? autoPricing?.baseCost)
          ? (() => {
              const raw = (validatedData.baseCost ?? autoPricing?.baseCost) as any;
              const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        adjustedCost: (validatedData.adjustedCost ?? autoPricing?.adjustedCost)
          ? (() => {
              const raw = (validatedData.adjustedCost ?? autoPricing?.adjustedCost) as any;
              const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        finalQuote: (validatedData.finalQuote ?? autoPricing?.finalQuote)
          ? (() => {
              // Parse and round quote using shared utility (rounds UP to nearest $5)
              const rounded = parseAndRoundQuote((validatedData.finalQuote ?? autoPricing?.finalQuote) as any);
              return rounded > 0 ? String(rounded) : null;
            })()
          : null,
        lineItems: (Array.isArray(validatedData.lineItems) ? validatedData.lineItems : Array.isArray(autoPricing?.lineItems) ? autoPricing!.lineItems : null)
          ? (() => {
              // Normalize line items for email-friendly format with proper service names
              const normalized = normalizeLineItemsForEmail(
                (Array.isArray(validatedData.lineItems) ? validatedData.lineItems : autoPricing!.lineItems) as any,
                SERVICE_NAME_MAP,
                SERVICE_DATA_MAP
              );
              return normalized.length > 0 ? normalized : null;
            })()
          : null,
        
        // Status and scheduling
        status: validatedData.status || "pending",
        scheduledDate: validatedData.scheduledDate 
          ? (typeof validatedData.scheduledDate === 'string' 
              ? new Date(validatedData.scheduledDate) 
              : validatedData.scheduledDate)
          : null,
      };
      
      // Store quote
      const quote = await storage.createQuote(quoteData);
      
      // Create corresponding lead for admin dashboard
      // Calculate lead price using consistent pricing logic
      const { calculateLeadPrice } = await import("./services/leadPricing");
      const finalQuoteNum = quote.finalQuote ? parseFloat(quote.finalQuote) : 0;
      const { basePrice, currentPrice } = calculateLeadPrice({
        finalQuote: finalQuoteNum,
        frequency: quote.frequency || "one-time",
        serviceType: quote.serviceType,
      });
      const baseLeadPrice = basePrice.toFixed(2);
      const currentLeadPrice = currentPrice.toFixed(2);
      
      // Safely normalize selectedServices - must always be string[] for Lead schema
      let parsedSelectedServices: string[] = [];
      
      if (quote.selectedServices === null || quote.selectedServices === undefined) {
        // Explicitly handle null/undefined - default to empty array
        parsedSelectedServices = [];
      } else if (Array.isArray(quote.selectedServices)) {
        // Already an array - use directly
        parsedSelectedServices = quote.selectedServices;
      } else if (typeof quote.selectedServices === 'string') {
        // String - attempt to parse as JSON
        try {
          const parsed = JSON.parse(quote.selectedServices);
          parsedSelectedServices = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Failed to parse selectedServices, defaulting to empty array:', error);
          parsedSelectedServices = [];
        }
      } else {
        // Any other type - default to empty array
        console.warn('Unexpected selectedServices type, defaulting to empty array:', typeof quote.selectedServices);
        parsedSelectedServices = [];
      }
      
      let parsedLineItems: any = null;
      if (quote.lineItems) {
        if (typeof quote.lineItems === 'string') {
          try {
            parsedLineItems = JSON.parse(quote.lineItems);
          } catch (error) {
            console.error('Failed to parse lineItems, defaulting to null:', error);
            parsedLineItems = null;
          }
        } else {
          parsedLineItems = quote.lineItems;
        }
      }
      
      let parsedServiceData: any = null;
      if (quote.serviceData) {
        if (typeof quote.serviceData === 'string') {
          try {
            parsedServiceData = JSON.parse(quote.serviceData);
          } catch (error) {
            console.error('Failed to parse serviceData, defaulting to null:', error);
            parsedServiceData = null;
          }
        } else {
          parsedServiceData = quote.serviceData;
        }
      }
      
      const leadData: InsertLead = {
        quoteId: quote.id,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        address: quote.address || null,
        city: quote.city,
        propertyType: quote.propertyType,
        serviceType: quote.serviceType,
        selectedServices: parsedSelectedServices,
        frequency: quote.frequency,
        finalQuote: quote.finalQuote,
        lineItems: parsedLineItems as any,
        serviceData: parsedServiceData as any,
        message: quote.message,
        baseLeadPrice,
        currentLeadPrice,
        status: "pending_admin",
      };
      
      const lead = await storage.createLead(leadData);
      
      // Create admin notifications (in-app)
      try {
        const admins = await storage.getAllAdmins();
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "admin_new_quote",
            title: "New Quote Submitted",
            message: `New ${lead.serviceType} lead in ${lead.city}: ${lead.name}`,
            leadId: lead.id,
          });
        }
      } catch (notifyError) {
        console.error("Failed to create admin notifications for new lead:", notifyError);
      }
      
      // Log quote submission
      console.log("New AI-generated quote submission:", {
        id: quote.id,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        serviceType: quote.serviceType,
        city: quote.city,
        finalQuote: quote.finalQuote,
        leadPrice: baseLeadPrice,
        createdAt: quote.createdAt,
      });
      
      // Send email notification (async - don't block response)
      // Use stored (already-normalized) line items; avoid unsafe JSON.parse on JSONB
      const normalizedLineItems = Array.isArray(parsedLineItems)
        ? parsedLineItems
        : normalizeLineItemsForEmail([], SERVICE_NAME_MAP, SERVICE_DATA_MAP);
      
      sendQuoteNotification({
        quoteId: quote.id,
        customerName: quote.name,
        customerEmail: quote.email,
        customerPhone: quote.phone || undefined,
        address: quote.address || '',
        city: quote.city,
        propertySize: quote.propertySize ? parseFloat(quote.propertySize) : undefined,
        propertyType: quote.propertyType,
        serviceType: quote.serviceType,
        frequency: quote.frequency || undefined,
        selectedServices: parsedSelectedServices,
        finalQuote: quote.finalQuote ? parseFloat(quote.finalQuote) : undefined,
        preferredDate: quote.scheduledDate ? quote.scheduledDate.toISOString().split('T')[0] : undefined,
        lineItems: normalizedLineItems,
        serviceData: parsedServiceData || undefined,
      }).catch(err => {
        console.error('Failed to send quote notification email:', err);
        // Don't fail the request if email fails
      });
      
      res.json({
        success: true,
        message: "Quote request received! We'll contact you within 24 hours.",
        quoteId: quote.id,
      });
    } catch (error) {
      console.error("Quote submission error:", error);
      
      if (error instanceof z.ZodError) {
        // Zod validation error - return field-specific errors
        res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to submit quote request",
        });
      }
    }
  });

  // Get all quotes (for testing/admin purposes)
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quotes",
      });
    }
  });

  // Get quote status for customer tracking (maps internal status to customer-facing status)
  app.get("/api/quotes/:id/status", async (req, res) => {
    try {
      const quote = await storage.getQuoteById(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }

      // Get associated lead if it exists
      const allLeads = await storage.getAllLeads();
      const lead = allLeads.find(l => l.quoteId === quote.id);

      // Map internal status to customer-facing status
      let customerStatus: 'received' | 'under_review' | 'contact_soon' | 'quote_ready' = 'received';
      let statusMessage = "We've received your quote request and it's been added to our queue.";

      if (lead) {
        if (lead.status === 'pending_admin') {
          customerStatus = 'under_review';
          statusMessage = "Our team is currently reviewing your quote request and preparing a customized estimate for your property.";
        } else if (lead.status === 'available') {
          customerStatus = 'under_review';
          statusMessage = "Your quote is being reviewed and will be made available to our network of qualified contractors.";
        } else if (lead.status === 'accepted' || lead.status === 'purchased') {
          customerStatus = 'contact_soon';
          statusMessage = "Your quote is being finalized and we'll be reaching out to you shortly to discuss the details and answer any questions.";
        }
      } else if (quote.status === 'accepted') {
        customerStatus = 'quote_ready';
        statusMessage = "Your personalized quote is ready! We'll be contacting you soon to discuss the details and schedule your service.";
      }

      res.json({
        quoteId: quote.id,
        status: customerStatus,
        message: statusMessage,
        quote: {
          name: quote.name,
          serviceType: quote.serviceType,
          city: quote.city,
          finalQuote: quote.finalQuote,
          ...(quote.finalQuote
            ? (() => {
                const { min, max } = calculateQuoteRange(quote.finalQuote, 0.15);
                return { finalQuoteMin: String(min), finalQuoteMax: String(max) };
              })()
            : {}),
          createdAt: quote.createdAt,
        },
        lead: lead ? {
          status: lead.status,
          createdAt: lead.createdAt,
        } : null,
      });
    } catch (error) {
      console.error("Error fetching quote status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quote status",
      });
    }
  });

  // Gallery photo endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const { serviceType } = req.query;
      const photos = serviceType 
        ? await storage.getGalleryPhotosByService(serviceType as string)
        : await storage.getAllGalleryPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ success: false, message: "Failed to fetch gallery photos" });
    }
  });

  // Testimonial endpoints
  app.get("/api/testimonials", async (req, res) => {
    try {
      const { serviceType } = req.query;
      const testimonials = serviceType
        ? await storage.getTestimonialsByService(serviceType as string)
        : await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ success: false, message: "Failed to fetch testimonials" });
    }
  });

  // Blog post endpoints
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ success: false, message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        res.status(404).json({ success: false, message: "Blog post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ success: false, message: "Failed to fetch blog post" });
    }
  });

  // ============================================
  // LEAD MANAGEMENT API ROUTES
  // ============================================

  // Create a new lead from a quote submission
  app.post("/api/leads", async (req, res) => {
    try {
      const { insertLeadSchema } = await import("@shared/schema");
      const leadData = insertLeadSchema.parse(req.body);
      
      // Calculate lead pricing based on quote type
      const { calculateLeadPrice } = await import("./services/leadPricing");
      const { basePrice, currentPrice } = calculateLeadPrice({
        finalQuote: leadData.finalQuote ? parseFloat(leadData.finalQuote) : 0,
        frequency: leadData.frequency || "one-time",
        serviceType: leadData.serviceType,
      });
      
      // Create the lead
      const lead = await storage.createLead({
        ...leadData,
        baseLeadPrice: basePrice.toFixed(2),
        currentLeadPrice: currentPrice.toFixed(2),
        status: "pending_admin",
      });
      
      // Notify admin of new lead
      const admins = await storage.getAllAdmins();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "admin_new_quote",
          title: "New Lead Available",
          message: `New ${leadData.serviceType} lead in ${leadData.city}: ${leadData.name}`,
          leadId: lead.id,
        });
      }
      
      // Send email notification to admin
      try {
        await sendNewLeadNotification({
          id: lead.id,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || "",
          city: leadData.city,
          serviceType: leadData.serviceType,
          finalQuote: lead.finalQuote || "0",
          address: leadData.address || undefined,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the request if email fails
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create lead" });
    }
  });

  // Get all leads (with filters) - requires authentication
  app.get("/api/leads", isAuthenticated, async (req: any, res) => {
    try {
      const { status, city, serviceType, availableOnly } = req.query;
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      // Get requesting user
      const requestingUser = await storage.getUser(userId);
      if (!requestingUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      let leads = await storage.getAllLeads();

      // #region agent log (hypothesis C)
      fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/leads',message:'leads_list_request',data:{role:requestingUser?.role,query:{status:typeof status==="string"?status:null,city:typeof city==="string"?city:null,serviceType:typeof serviceType==="string"?serviceType:null,availableOnly:availableOnly==="true"},totalLeadsBeforeFilter:leads.length},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Apply filters
      if (status && typeof status === "string") {
        leads = leads.filter(l => l.status === status);
      }
      if (city && typeof city === "string") {
        leads = leads.filter(l => l.city === city);
      }
      if (serviceType && typeof serviceType === "string") {
        leads = leads.filter(l => l.serviceType === serviceType);
      }
      if (availableOnly === "true") {
        leads = leads.filter(l => l.status === "available");
      }
      
      // Privacy protection: mask contact info for unpurchased leads
      const maskedLeads = leads.map(lead => {
        // Determine if contact info should be revealed based on authenticated user
        const isAdmin = requestingUser?.role === "admin";
        const isPurchaser = lead.status === "purchased" && lead.purchasedBy === userId;
        
        // Admins should ALWAYS see full contact info, regardless of lead status
        const shouldRevealContactInfo = isAdmin || isPurchaser;
        
        if (shouldRevealContactInfo) {
          return lead; // Return full lead data
        }
        
        // For all other cases, mask sensitive contact information
        // Keep city visible (general location) but hide exact street address
        return {
          ...lead,
          name: "***", // Masked
          email: "***", // Masked
          phone: "***", // Masked
          address: "***", // Hide exact address (city remains visible)
        };
      });

      // #region agent log (hypothesis C)
      fetch('http://127.0.0.1:7248/ingest/3fb51d37-10e0-463b-8f19-2a8c4e34aae8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/routes.ts:/api/leads',message:'leads_list_response',data:{returnedCount:maskedLeads.length,statusCounts:maskedLeads.reduce((acc:any,l:any)=>{const s=l.status||"unknown";acc[s]=(acc[s]||0)+1;return acc;},{}),role:requestingUser?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'baseline',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      res.json(maskedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Get single lead by ID - requires authentication
  app.get("/api/leads/:id", isAuthenticated, async (req: any, res, next) => {
    try {
      // IMPORTANT: Avoid shadowing static sub-routes like `/api/leads/watchlist` and `/api/leads/purchases`.
      // This route is registered before them, so we explicitly fall through.
      if (req.params.id === "watchlist" || req.params.id === "purchases") {
        return next("route");
      }

      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Get requesting user
      const requestingUser = await storage.getUser(userId);
      if (!requestingUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Privacy protection: mask contact info unless user has proper access
      const isAdmin = requestingUser.role === "admin";
      const isPurchaser = lead.status === "purchased" && lead.purchasedBy === userId;
      
      // Admins should ALWAYS see full contact info, regardless of lead status
      const shouldRevealContactInfo = isAdmin || isPurchaser;
      
      if (!shouldRevealContactInfo) {
        // Keep city visible (general location) but hide exact street address
        return res.json({
          ...lead,
          name: "***",
          email: "***",
          phone: "***",
          address: "***",
        });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  // Update lead - requires admin role
  app.patch("/api/leads/:id", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Admin accepts a lead (takes ownership) - requires admin role
  app.post("/api/leads/:id/accept", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const lead = await storage.acceptLead(req.params.id, userId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Send customer status update email
      if (lead.quoteId) {
        try {
          const quote = await storage.getQuoteById(lead.quoteId);
          if (quote) {
            const { sendCustomerStatusUpdate } = await import("./services/emailNotifications");
            await sendCustomerStatusUpdate(quote.email, quote.id, {
              status: 'contact_soon',
              message: "Your quote has been reviewed and we'll be contacting you shortly to discuss the details.",
            });
          }
        } catch (emailError) {
          console.error("Failed to send customer status update email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error accepting lead:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to accept lead" });
    }
  });

  // Admin declines a lead (makes available to subcontractors) - requires admin role
  app.post("/api/leads/:id/decline", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const lead = await storage.declineLead(req.params.id, userId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Notify all subcontractors
      const subcontractors = await storage.getAllSubcontractors();
      for (const sub of subcontractors) {
        await storage.createNotification({
          userId: sub.id,
          type: "new_lead",
          title: "New Lead Available",
          message: `${lead.serviceType} lead in ${lead.city} - $${lead.currentLeadPrice}`,
          leadId: lead.id,
        });
      }
      
      // Send email notification to all subcontractors
      try {
        const { sendContractorNewLeadAvailable } = await import("./services/emailNotifications");
        // Fire-and-forget to avoid request timeouts when many subcontractors exist
        void (async () => {
          for (const sub of subcontractors) {
            const emailEnabled = (sub as any).emailNotificationsEnabled ?? true;
            if (sub.email && emailEnabled) {
              await sendContractorNewLeadAvailable(sub.email, {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || "",
                city: lead.city,
                serviceType: lead.serviceType,
                finalQuote: lead.finalQuote || "0",
                address: lead.address || undefined,
                currentLeadPrice: lead.currentLeadPrice,
                propertyType: lead.propertyType,
                frequency: lead.frequency || undefined,
                selectedServices: (lead.selectedServices as any) ?? undefined,
                lineItems: (lead.lineItems as any) ?? undefined,
                serviceData: (lead.serviceData as any) ?? undefined,
                message: lead.message || undefined,
              });
              // Space out emails to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        })().catch((emailErr) => {
          console.error("Async contractor email notifications failed:", emailErr);
        });
      } catch (emailError) {
        console.error("Failed to send contractor email notifications:", emailError);
        // Don't fail the request if email fails
      }
      
      // Send customer status update email
      if (lead.quoteId) {
        try {
          const quote = await storage.getQuoteById(lead.quoteId);
          if (quote) {
            const { sendCustomerStatusUpdate } = await import("./services/emailNotifications");
            await sendCustomerStatusUpdate(quote.email, quote.id, {
              status: 'under_review',
              message: "Your quote is being reviewed and will be made available to our network of qualified contractors.",
            });
          }
        } catch (emailError) {
          console.error("Failed to send customer status update email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error declining lead:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to decline lead" });
    }
  });

  // Add note to lead - requires admin role
  app.post("/api/leads/:id/notes", isAuthenticated, requireRole(["admin"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const { note } = req.body;
      
      if (!note || typeof note !== 'string' || note.trim().length === 0) {
        return res.status(400).json({ error: "Note text is required" });
      }
      
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Get user info for note
      const user = await storage.getUser(userId);
      const userName =
        user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown"
          : "Unknown";
      
      // Parse existing notes or create new array
      let notes: Array<{text: string; addedBy: string; addedAt: string}> = [];
      if (lead.notes) {
        if (typeof lead.notes === 'string') {
          try {
            notes = JSON.parse(lead.notes);
          } catch (e) {
            notes = [];
          }
        } else if (Array.isArray(lead.notes)) {
          notes = lead.notes as any;
        }
      }
      
      // Add new note
      notes.push({
        text: note.trim(),
        addedBy: userName,
        addedAt: new Date().toISOString(),
      });
      
      // Update lead with new notes
      const updated = await storage.updateLead(lead.id, {
        notes: notes as any,
      });
      
      if (!updated) {
        return res.status(500).json({ error: "Failed to update lead" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to add note" });
    }
  });

  // Subcontractor purchases a lead - requires subcontractor role
  app.post("/api/leads/:id/purchase", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Payments are temporarily unavailable (Stripe not configured)" });
      }

      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent is required" });
      }
      
      // Get authenticated user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Verify agreement accepted
      if (!user.agreementAccepted) {
        return res.status(403).json({ error: "Legal agreement must be accepted first" });
      }
      
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      if (lead.status !== "available") {
        return res.status(400).json({ error: "Lead is not available for purchase" });
      }
      
      // Check if lead already purchased
      const existingPurchase = await storage.getLeadPurchaseByLeadId(lead.id);
      if (existingPurchase) {
        return res.status(400).json({ error: "Lead already purchased" });
      }
      
      // CRITICAL: Verify payment intent with Stripe before processing purchase
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      } catch (stripeError) {
        console.error("Failed to retrieve payment intent:", stripeError);
        return res.status(400).json({ error: "Invalid payment intent" });
      }
      
      // Verify payment succeeded
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ 
          error: `Payment not completed. Status: ${paymentIntent.status}` 
        });
      }
      
      // Verify metadata matches the lead being purchased (prevent replay attacks)
      if (paymentIntent.metadata.leadId !== lead.id) {
        return res.status(400).json({ 
          error: "Payment intent does not match this lead" 
        });
      }
      
      // Verify the user matches (prevent using someone else's payment)
      if (paymentIntent.metadata.userId !== user.id) {
        return res.status(400).json({ 
          error: "Payment intent does not match your account" 
        });
      }
      
      // Check if this payment intent was already used for a purchase (idempotency)
      const existingPurchaseWithIntent = await storage.getLeadPurchaseByPaymentIntentId(paymentIntentId);
      if (existingPurchaseWithIntent) {
        // If the same user already used this intent for the same lead, return success (idempotent)
        if (existingPurchaseWithIntent.leadId === lead.id && existingPurchaseWithIntent.userId === user.id) {
          const existingLead = await storage.getLeadById(lead.id);
          return res.json({ success: true, purchase: existingPurchaseWithIntent, lead: existingLead });
        }
        return res.status(400).json({ error: "This payment has already been used" });
      }
      
      // Process purchase
      const purchase = await storage.createLeadPurchase({
        leadId: lead.id,
        userId: user.id,
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: paymentIntentId,
      });
      
      // Update lead status
      const updatedLead = await storage.updateLead(lead.id, {
        status: "purchased",
        purchasedBy: userId,
        purchasedAt: new Date(),
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: paymentIntentId,
      });
      
      // Send customer status update email
      if (updatedLead && updatedLead.quoteId) {
        try {
          const quote = await storage.getQuoteById(updatedLead.quoteId);
          if (quote) {
            const { sendCustomerStatusUpdate } = await import("./services/emailNotifications");
            await sendCustomerStatusUpdate(quote.email, quote.id, {
              status: 'contact_soon',
              message: "A qualified contractor has been assigned to your project and will be contacting you soon.",
            });
          }
        } catch (emailError) {
          console.error("Failed to send customer status update email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      // Notify admin
      const admins = await storage.getAllAdmins();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "lead_purchased",
          title: "Lead Purchased",
          message: `${user.company || user.firstName} purchased ${lead.serviceType} lead for $${lead.currentLeadPrice}`,
          leadId: lead.id,
        });
      }
      
      // Send email notifications
      try {
        // Notify admin about purchase
        await sendLeadPurchasedNotification(
          {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            city: lead.city,
            serviceType: lead.serviceType,
            finalQuote: lead.finalQuote || "0",
            address: lead.address || undefined,
          },
          {
            name: user.company || user.firstName || "Unknown",
            email: user.email || "no-email@provided.com",
          }
        );
        
        // Send confirmation to purchaser (only if they have an email)
        if (user.email) {
          await sendLeadPurchaseConfirmation(user.email, {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone || "",
            city: lead.city,
            serviceType: lead.serviceType,
            finalQuote: lead.finalQuote || "0",
            address: lead.address || undefined,
          });
        } else {
          console.log(`Skipping purchaser confirmation email - user ${user.id} has no email address`);
        }
      } catch (emailError) {
        console.error("Failed to send email notifications:", emailError);
        // Don't fail the request if email fails
      }
      
      // Return the updated lead (now purchased) so the UI can immediately reveal contact info.
      res.json({ success: true, purchase, lead: updatedLead ?? lead });
    } catch (error) {
      console.error("Error purchasing lead:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to purchase lead" });
    }
  });

  // Get user's purchase history with full lead details - requires authentication
  app.get("/api/leads/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const purchases = await storage.getLeadPurchasesByUser(userId);
      
      // Fetch full lead details for each purchase
      const purchasesWithLeads = await Promise.all(
        purchases.map(async (purchase) => {
          const lead = await storage.getLeadById(purchase.leadId);
          return { purchase, lead };
        })
      );
      
      res.json(purchasesWithLeads);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      res.status(500).json({ error: "Failed to fetch purchase history" });
    }
  });

  // Get user notifications - requires authentication
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read - requires authentication
  app.post("/api/notifications/:id/mark-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const notificationId = req.params.id;

      // Authorization: users may only mark their own notifications as read.
      // Storage layer updates by ID only, so we enforce ownership here.
      const notifications = await storage.getNotificationsByUserId(userId);
      const ownsNotification = notifications.some((n) => n.id === notificationId);
      if (!ownsNotification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      const updated = await storage.markNotificationAsRead(notificationId);
      if (!updated) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Watch/unwatch a lead - requires subcontractor role
  app.post("/api/leads/:id/watch", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      if (lead.status !== "available") {
        return res.status(400).json({ error: "Only available leads can be watched" });
      }

      // Parse watched leads
      let watchedLeads: string[] = [];
      if (user.watchedLeads) {
        if (Array.isArray(user.watchedLeads)) {
          watchedLeads = user.watchedLeads;
        } else if (typeof user.watchedLeads === 'string') {
          try {
            watchedLeads = JSON.parse(user.watchedLeads);
          } catch {
            watchedLeads = [];
          }
        }
      }

      // Add lead ID if not already watched
      if (!watchedLeads.includes(lead.id)) {
        watchedLeads.push(lead.id);
        
        // Update user
        await storage.updateUser(userId, {
          watchedLeads: watchedLeads as any,
        });

        res.json({ success: true, watched: true, leadId: lead.id });
      } else {
        res.json({ success: true, watched: true, leadId: lead.id, message: "Already watching this lead" });
      }
    } catch (error) {
      console.error("Error watching lead:", error);
      res.status(500).json({ error: "Failed to watch lead" });
    }
  });

  app.post("/api/leads/:id/unwatch", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Parse watched leads
      let watchedLeads: string[] = [];
      if (user.watchedLeads) {
        if (Array.isArray(user.watchedLeads)) {
          watchedLeads = user.watchedLeads;
        } else if (typeof user.watchedLeads === 'string') {
          try {
            watchedLeads = JSON.parse(user.watchedLeads);
          } catch {
            watchedLeads = [];
          }
        }
      }

      // Remove lead ID
      watchedLeads = watchedLeads.filter(id => id !== req.params.id);
      
      // Update user
      await storage.updateUser(userId, {
        watchedLeads: watchedLeads as any,
      });

      res.json({ success: true, watched: false, leadId: req.params.id });
    } catch (error) {
      console.error("Error unwatching lead:", error);
      res.status(500).json({ error: "Failed to unwatch lead" });
    }
  });

  // Decline/Pass on a lead - hides it from the subcontractor's view
  app.post("/api/leads/:id/decline", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      // Parse declined leads
      let declinedLeads: string[] = [];
      if (user.declinedLeads) {
        if (Array.isArray(user.declinedLeads)) {
          declinedLeads = user.declinedLeads;
        } else if (typeof user.declinedLeads === 'string') {
          try {
            declinedLeads = JSON.parse(user.declinedLeads);
          } catch {
            declinedLeads = [];
          }
        }
      }

      // Add lead ID if not already declined
      if (!declinedLeads.includes(lead.id)) {
        declinedLeads.push(lead.id);
        
        // Also remove from watchlist if it was watched
        let watchedLeads: string[] = [];
        if (user.watchedLeads) {
          if (Array.isArray(user.watchedLeads)) {
            watchedLeads = user.watchedLeads;
          } else if (typeof user.watchedLeads === 'string') {
            try {
              watchedLeads = JSON.parse(user.watchedLeads);
            } catch {
              watchedLeads = [];
            }
          }
        }
        watchedLeads = watchedLeads.filter(id => id !== lead.id);
        
        // Update user
        await storage.updateUser(userId, {
          declinedLeads: declinedLeads as any,
          watchedLeads: watchedLeads as any,
        });

        res.json({ success: true, declined: true, leadId: lead.id });
      } else {
        res.json({ success: true, declined: true, leadId: lead.id, message: "Already declined this lead" });
      }
    } catch (error) {
      console.error("Error declining lead:", error);
      res.status(500).json({ error: "Failed to decline lead" });
    }
  });

  // Undecline a lead - restore it to the subcontractor's view
  app.post("/api/leads/:id/undecline", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Parse declined leads
      let declinedLeads: string[] = [];
      if (user.declinedLeads) {
        if (Array.isArray(user.declinedLeads)) {
          declinedLeads = user.declinedLeads;
        } else if (typeof user.declinedLeads === 'string') {
          try {
            declinedLeads = JSON.parse(user.declinedLeads);
          } catch {
            declinedLeads = [];
          }
        }
      }

      // Remove lead ID
      declinedLeads = declinedLeads.filter(id => id !== req.params.id);
      
      // Update user
      await storage.updateUser(userId, {
        declinedLeads: declinedLeads as any,
      });

      res.json({ success: true, declined: false, leadId: req.params.id });
    } catch (error) {
      console.error("Error undeclining lead:", error);
      res.status(500).json({ error: "Failed to undecline lead" });
    }
  });

  // Get user's watchlist - requires authentication
  app.get("/api/leads/watchlist", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Parse watched leads
      let watchedLeadIds: string[] = [];
      if (user.watchedLeads) {
        if (Array.isArray(user.watchedLeads)) {
          watchedLeadIds = user.watchedLeads;
        } else if (typeof user.watchedLeads === 'string') {
          try {
            watchedLeadIds = JSON.parse(user.watchedLeads);
          } catch {
            watchedLeadIds = [];
          }
        }
      }

      // Fetch all watched leads
      const watchedLeads = await Promise.all(
        watchedLeadIds.map(async (leadId) => {
          const lead = await storage.getLeadById(leadId);
          return lead;
        })
      );

      // Filter out nulls and only return available leads
      const availableWatchedLeads = watchedLeads.filter(lead => lead && lead.status === "available") as Lead[];

      // Apply masking for subcontractors (contact info hidden until purchase)
      // Note: This endpoint is subcontractor-only, so no admin check needed
      const maskedWatchedLeads = availableWatchedLeads.map(lead => {
        const isPurchaser = lead.status === "purchased" && lead.purchasedBy === userId;
        
        if (isPurchaser) {
          return lead; // Return full lead data for purchased leads
        }
        
        // Mask contact info for unpurchased leads
        return {
          ...lead,
          name: "***",
          email: "***",
          phone: "***",
          address: "***",
        };
      });

      res.json(maskedWatchedLeads);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Get current user - requires authentication
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const claims = req.user?.claims ?? (process.env.NODE_ENV === "development" ? (req as any).session?.passport?.user?.claims : undefined);
      
      let user = await storage.getUser(userId);
      
      // If user doesn't exist, create them from claims with "customer" role (safe default)
      if (!user) {
        console.log("User not found, creating user from claims:", userId);
        user = await storage.upsertUser({
          id: userId,
          email: claims?.email,
          firstName: claims?.first_name,
          lastName: claims?.last_name,
          profileImageUrl: claims?.profile_image_url,
          role: "customer", // Safe default - admin can promote to subcontractor later
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update notification preferences (subcontractors can disable email notifications)
  app.patch("/api/user/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const schema = z.object({
        emailNotificationsEnabled: z.boolean(),
      });

      const body = schema.parse(req.body);
      const updated = await storage.updateUser(userId, {
        emailNotificationsEnabled: body.emailNotificationsEnabled,
      } as any);

      if (!updated) return res.status(404).json({ error: "User not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update preferences" });
    }
  });

  // Accept legal agreement - requires authentication
  app.post("/api/user/accept-agreement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthUserId(req);
      const claims = req.user?.claims ?? (process.env.NODE_ENV === "development" ? (req as any).session?.passport?.user?.claims : undefined);
      
      if (process.env.NODE_ENV === "development") {
        console.log("[accept-agreement] Endpoint called for userId:", userId);
      }
      
      if (!userId) {
        console.error("[accept-agreement] No userId found in claims");
        return res.status(401).json({ error: "User not authenticated properly" });
      }
      
      // First check if user exists
      let user = await storage.getUser(userId);
      if (process.env.NODE_ENV === "development") {
        console.log("[accept-agreement] Existing user found:", !!user);
      }
      
      if (!user) {
        // User doesn't exist yet - create them first using upsertUser with safe "customer" role
        if (process.env.NODE_ENV === "development") {
          console.log("[accept-agreement] Creating new user:", userId);
        }
        user = await storage.upsertUser({
          id: userId,
          email: claims?.email || null,
          firstName: claims?.first_name || null,
          lastName: claims?.last_name || null,
          profileImageUrl: claims?.profile_image_url || null,
          role: "customer", // Safe default - admin can promote to subcontractor later
          agreementAccepted: true,
          agreementAcceptedAt: new Date(),
        });
        if (process.env.NODE_ENV === "development") {
          console.log("[accept-agreement] User created:", !!user);
        }
      } else {
        // User exists - update their agreement status
        if (process.env.NODE_ENV === "development") {
          console.log("[accept-agreement] Updating existing user:", userId);
        }
        user = await storage.updateUser(userId, {
          agreementAccepted: true,
          agreementAcceptedAt: new Date(),
        });
        if (process.env.NODE_ENV === "development") {
          console.log("[accept-agreement] User updated:", !!user);
        }
      }
      
      if (!user) {
        console.error("[accept-agreement] Failed to create/update user");
        return res.status(500).json({ error: "Failed to update user agreement" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("[accept-agreement] Error:", error);
      res.status(500).json({ error: "Failed to accept agreement" });
    }
  });

  // Update lead prices (should run daily via cron)
  app.post("/api/leads/update-prices", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { updateLeadPrices } = await import("./services/leadPricing");
      const updatedLeads = await updateLeadPrices();
      res.json({ success: true, updated: updatedLeads.length });
    } catch (error) {
      console.error("Error updating lead prices:", error);
      res.status(500).json({ error: "Failed to update lead prices" });
    }
  });

  // ============================================
  // END LEAD MANAGEMENT API ROUTES
  // ============================================

  // Sitemap.xml generation - public, indexable pages
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://lawncarekuna.com";
      const currentDate = new Date().toISOString().split('T')[0];

      const urls: Array<{loc: string; lastmod: string; changefreq: string; priority: string}> = [];

      // Homepage
      urls.push({
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '1.0'
      });

      // Main service category pages
      urls.push(
        { loc: `${baseUrl}/services/lawn-care`, lastmod: currentDate, changefreq: 'monthly', priority: '0.9' },
        { loc: `${baseUrl}/services/landscaping`, lastmod: currentDate, changefreq: 'monthly', priority: '0.9' },
        { loc: `${baseUrl}/services/christmas-lights`, lastmod: currentDate, changefreq: 'monthly', priority: '0.9' }
      );

      // All 28 individual service pages
      PRIORITY_SERVICES.forEach(service => {
        urls.push({
          loc: `${baseUrl}/services/${service.slug}`,
          lastmod: currentDate,
          changefreq: 'monthly',
          priority: '0.8'
        });
      });

      // All 168 geo-targeted service pages (28 services × 6 cities)
      PRIORITY_SERVICES.forEach(service => {
        CITIES.forEach(city => {
          urls.push({
            loc: `${baseUrl}/services/${service.slug}/${city.slug}`,
            lastmod: currentDate,
            changefreq: 'monthly',
            priority: city.isPrimary ? '0.9' : '0.7'
          });
        });
      });

      // All 6 area/city landing pages
      CITIES.forEach(city => {
        urls.push({
          loc: `${baseUrl}/areas/${city.slug}`,
          lastmod: currentDate,
          changefreq: 'monthly',
          priority: city.isPrimary ? '0.9' : '0.8'
        });
      });

      // Other important pages
      const staticPages = [
        { path: '/about', priority: '0.8' },
        { path: '/contact', priority: '0.9' },
        { path: '/services', priority: '0.9' },
        { path: '/get-quote', priority: '1.0' },
        { path: '/pricing', priority: '0.8' },
        { path: '/commercial', priority: '0.8' },
        { path: '/commercial/hoa-services', priority: '0.7' },
        { path: '/commercial/municipal-services', priority: '0.7' },
        { path: '/blog', priority: '0.6' },
        { path: '/privacy-policy', priority: '0.3' },
        { path: '/terms-of-service', priority: '0.3' },
        // Service landing pages (manually curated / marketing pages)
        { path: '/services/fence-installation', priority: '0.6' },
        { path: '/services/pond-installation', priority: '0.6' },
        { path: '/services/irrigation-installation', priority: '0.6' },
        // LLM discovery file
        { path: '/llms.txt', priority: '0.2' },
      ];

      staticPages.forEach(page => {
        urls.push({
          loc: `${baseUrl}${page.path}`,
          lastmod: currentDate,
          changefreq: 'monthly',
          priority: page.priority
        });
      });

      // All 92 blog posts
      const { BLOG_POSTS } = await import("@shared/blogContent");
      BLOG_POSTS.forEach(post => {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: currentDate,
          changefreq: 'monthly',
          priority: '0.6'
        });
      });

      // Generate XML
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `# Lawn Care Kuna - Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /subcontractor/
Disallow: /quote-status/

# Sitemap
Sitemap: https://lawncarekuna.com/sitemap.xml
`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
