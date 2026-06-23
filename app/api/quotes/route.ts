import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quotes, leads, users, notifications, siteSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { sendQuoteConfirmationEmail, sendAdminNotificationEmail } from "@/lib/resend";
import { findActiveDuplicate, signEditToken, type DedupeCandidate } from "@/lib/leadDedupe";
import { HOUSE_NUMBER_REGEX, HOUSE_NUMBER_ERROR_MESSAGE } from "@/shared/addressValidation";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { enrichPropertyFromFormattedAddress } from "@/server/services/propertyEnrichment";
import type { PropertyProfile } from "@/shared/propertyProfile";

const quoteSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  address: z
    .string()
    .min(5, "Please enter a valid address")
    .refine(
      (val) => HOUSE_NUMBER_REGEX.test(val.trim()),
      HOUSE_NUMBER_ERROR_MESSAGE
    ),
  city: z.string().min(2, "Please enter a valid city"),
  propertyType: z.enum(["residential", "commercial"]).optional(),
  propertySize: z.number().optional(),
  serviceType: z.string().optional(),
  services: z.array(z.string()).optional(),
  selectedServices: z.array(z.string()).optional(),
  estimatedTotal: z.number().optional(),
  serviceData: z.record(z.string(), z.object({
    propertySize: z.number().optional(),
  })).optional(),
  propertyProfile: z.record(z.unknown()).optional(),
});

function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

function roundToNearestDollar(price: number): number {
  return Math.round(price);
}

const SERVICE_PRICING_RATES: Record<string, { lowRate: number; highRate: number; unit: string; minimum: number }> = {
  "kitchen-remodel": { lowRate: 25000, highRate: 75000, unit: "base_project", minimum: 15000 },
  "bathroom-remodel": { lowRate: 8000, highRate: 35000, unit: "base_project", minimum: 5000 },
  "whole-home-remodel": { lowRate: 80000, highRate: 300000, unit: "base_project", minimum: 50000 },
  "room-addition": { lowRate: 50000, highRate: 150000, unit: "base_project", minimum: 30000 },
  "basement-finish": { lowRate: 30, highRate: 65, unit: "sqft", minimum: 10000 },
  "outdoor-living": { lowRate: 15000, highRate: 60000, unit: "base_project", minimum: 8000 },
};

const PROPERTY_MULTIPLIERS: Record<string, number> = {
  residential: 1.0,
  commercial: 1.3,
};

function calculateServicePrice(
  serviceId: string,
  serviceData: { propertySize?: number } | undefined,
  fallbackSqFt: number,
  propertyMultiplier: number
): number {
  const config = SERVICE_PRICING_RATES[serviceId];
  if (!config) return 200;

  const typicalRate = (config.lowRate + config.highRate) / 2;
  const sqft = serviceData?.propertySize || fallbackSqFt || 2000;

  let cost = 0;
  switch (config.unit) {
    case "sqft":
      cost = sqft * typicalRate;
      break;
    case "base_project":
    default:
      cost = typicalRate;
  }

  cost = Math.max(config.minimum, cost);
  cost *= propertyMultiplier;
  return roundToNearestFive(cost);
}

function calculateLeadPrice(params: {
  finalQuote: number;
}): { basePrice: number; currentPrice: number } {
  let basePrice = params.finalQuote * 0.10;
  basePrice = Math.max(10, basePrice);
  basePrice = Math.min(100, basePrice);
  basePrice = roundToNearestDollar(basePrice);

  return {
    basePrice,
    currentPrice: basePrice,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = quoteSubmissionSchema.parse(body);

    const services = validatedData.selectedServices || validatedData.services || [];
    const primaryService = validatedData.serviceType || services[0] || "kitchen-remodel";
    const propertyType = validatedData.propertyType || "residential";

    let propertyProfile: PropertyProfile | null =
      (validatedData.propertyProfile as PropertyProfile | undefined) ?? null;
    if (!propertyProfile && validatedData.address && validatedData.city) {
      try {
        propertyProfile = await enrichPropertyFromFormattedAddress(
          `${validatedData.address}, ${validatedData.city}, ID`
        );
      } catch (e) {
        console.warn("[QUOTE] Property enrichment skipped:", e);
      }
    }

    const enrichedPropertySize =
      validatedData.propertySize ??
      propertyProfile?.squareFootage ??
      propertyProfile?.measurementBundle?.interiorSqFt;

    console.log("[QUOTE] Quote submission received:", {
      name: validatedData.name,
      email: validatedData.email,
      city: validatedData.city,
      services,
      primaryService,
    });

    let quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let leadId: string | null = null;

    if (db) {
      try {
        // Scan all leads (not just recent) so historical purchased/open
        // leads with the same email + address are still treated as
        // duplicates. findActiveDuplicate already filters out
        // archived/declined statuses.
        const allLeadRows = await db
          .select({
            id: leads.id,
            quoteId: leads.quoteId,
            email: leads.email,
            address: leads.address,
            status: leads.status,
            createdAt: leads.createdAt,
            purchasedBy: leads.purchasedBy,
          })
          .from(leads);

        const candidates: DedupeCandidate[] = allLeadRows.map((l) => ({
          id: l.id,
          quoteId: l.quoteId ?? null,
          email: l.email,
          address: l.address ?? null,
          status: l.status,
          createdAt: l.createdAt ?? new Date(),
          purchasedBy: l.purchasedBy ?? null,
        }));

        const dup = findActiveDuplicate(
          candidates,
          validatedData.email,
          validatedData.address
        );

        if (dup) {
          if (dup.type === "in_progress") {
            console.log("[QUOTE] Duplicate (purchased) blocked:", dup.lead.id);
            return NextResponse.json({
              success: false,
              duplicate: true,
              status: "in_progress",
              message:
                `We already have your request and a contractor is handling it. Please call ${SITE_CONFIG.phone} or email ${SITE_CONFIG.email} to make changes.`,
              existingLeadId: dup.lead.id,
              existingQuoteId: dup.lead.quoteId,
            });
          }
          if (!dup.lead.quoteId) {
            console.log("[QUOTE] Duplicate (open, no quoteId) blocked:", dup.lead.id);
            return NextResponse.json({
              success: false,
              duplicate: true,
              status: "open",
              message:
                `We already received a quote request from you for this property. Please call ${SITE_CONFIG.phone} or email ${SITE_CONFIG.email} to make changes.`,
              existingLeadId: dup.lead.id,
              existingQuoteId: null,
            });
          }
          const editToken = signEditToken({
            quoteId: dup.lead.quoteId,
            leadId: dup.lead.id,
          });
          console.log("[QUOTE] Duplicate (open) blocked:", dup.lead.id);
          return NextResponse.json({
            success: false,
            duplicate: true,
            status: "open",
            message:
              "We already received a quote request from you for this property. You can update your existing quote instead.",
            existingLeadId: dup.lead.id,
            existingQuoteId: dup.lead.quoteId,
            editToken,
          });
        }

        const [savedQuote] = await db.insert(quotes).values({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || "Not provided",
          address: validatedData.address,
          city: validatedData.city,
          propertyProfile,
          propertyType,
          propertySize: enrichedPropertySize?.toString(),
          serviceType: primaryService,
          selectedServices: services,
          serviceData: validatedData.serviceData || null,
          message: validatedData.message || null,
          status: "pending",
        }).returning();

        quoteId = savedQuote.id;
        console.log("[QUOTE] Quote saved to database:", quoteId);

        const propertyMultiplier = PROPERTY_MULTIPLIERS[propertyType] || 1.0;
        const fallbackSqFt = enrichedPropertySize || 2000;
        const svcData = validatedData.serviceData || {};

        const serviceList = services.length > 0 ? services : [primaryService];
        const enrichedLineItems = serviceList.map(sid => {
          const price = calculateServicePrice(sid, svcData[sid], fallbackSqFt, propertyMultiplier);
          return {
            serviceId: sid,
            serviceName: sid.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            price,
          };
        });

        const estimatedTotal = enrichedLineItems.reduce((sum, item) => sum + item.price, 0);
        const clientEstimate = validatedData.estimatedTotal;
        if (clientEstimate) {
          console.log("[QUOTE] Client estimate:", clientEstimate.toFixed(2), "Server estimate:", estimatedTotal.toFixed(2));
        }
        console.log("[QUOTE] Per-service prices:", enrichedLineItems.map(i => `${i.serviceId}: $${i.price}`).join(", "));

        const { basePrice, currentPrice } = calculateLeadPrice({
          finalQuote: estimatedTotal,
        });

        let autoRelease = false;
        try {
          const setting = await db.select().from(siteSettings).where(eq(siteSettings.key, "auto_release_leads"));
          autoRelease = setting[0]?.value === "true";
        } catch (e) {
          console.error("[QUOTE] Failed to check auto_release setting:", e);
        }

        const leadStatus = autoRelease ? "available" : "pending_admin";
        console.log("[QUOTE] Auto-release:", autoRelease, "Lead status:", leadStatus);

        const [savedLead] = await db.insert(leads).values({
          quoteId: savedQuote.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || "Not provided",
          address: validatedData.address || null,
          city: validatedData.city,
          propertyProfile,
          propertyType,
          serviceType: primaryService,
          selectedServices: services,
          finalQuote: estimatedTotal.toFixed(2),
          lineItems: enrichedLineItems,
          serviceData: validatedData.serviceData || null,
          message: validatedData.message || null,
          baseLeadPrice: basePrice.toFixed(2),
          currentLeadPrice: currentPrice.toFixed(2),
          status: leadStatus,
          ...(autoRelease ? {
            adminDeclined: false,
            adminReviewedAt: new Date(),
            lastPriceUpdate: new Date(),
          } : {}),
        }).returning();

        leadId = savedLead.id;
        console.log("[QUOTE] Lead created:", leadId, "price:", basePrice.toFixed(2));

        try {
          const admins = await db.select().from(users).where(eq(users.role, "admin"));
          for (const admin of admins) {
            await db.insert(notifications).values({
              userId: admin.id,
              type: "admin_new_quote",
              title: autoRelease ? "New Lead Auto-Released" : "New Quote Submitted",
              message: `New ${primaryService} lead in ${validatedData.city}: ${validatedData.name}${autoRelease ? " (auto-released to marketplace)" : ""}`,
              leadId: savedLead.id,
            });
          }
          console.log("[QUOTE] Admin notifications created for", admins.length, "admins");

          if (autoRelease) {
            const subs = await db.select().from(users).where(eq(users.role, "subcontractor"));
            for (const sub of subs) {
              await db.insert(notifications).values({
                userId: sub.id,
                type: "new_lead",
                title: "New Lead Available",
                message: `A new ${primaryService} lead in ${validatedData.city} is now available.`,
                leadId: savedLead.id,
              });

              if (sub.email && sub.emailNotificationsEnabled !== false) {
                try {
                  const { sendContractorNewLeadAvailable } = await import("@/server/services/emailNotifications");
                  sendContractorNewLeadAvailable(sub.email, savedLead as any).catch(() => {});
                } catch {}
              }
            }
            console.log("[QUOTE] Subcontractor notifications sent for auto-released lead");
          }
        } catch (notifyError) {
          console.error("[QUOTE] Failed to create notifications:", notifyError);
        }
      } catch (dbError) {
        console.error("[QUOTE] Database error saving quote/lead:", dbError);
      }
    } else {
      console.warn("[QUOTE] Database not available - quote not saved to DB");
    }

    let customerEmailSent = false;
    let adminEmailSent = false;

    try {
      console.log("[QUOTE] Sending customer confirmation email to:", validatedData.email);
      await sendQuoteConfirmationEmail({
        to: validatedData.email,
        customerName: validatedData.name,
        quoteId,
        address: validatedData.address,
        city: validatedData.city,
        services,
      });
      customerEmailSent = true;
      console.log("[QUOTE] Customer email sent successfully");
    } catch (emailError: any) {
      console.error("[QUOTE] FAILED to send customer email:", emailError?.message || emailError);
      console.error("[QUOTE] Customer email error details:", JSON.stringify(emailError, null, 2));
    }

    await new Promise(r => setTimeout(r, 700));

    try {
      console.log("[QUOTE] Sending admin notification email");
      await sendAdminNotificationEmail({
        customerName: validatedData.name,
        customerEmail: validatedData.email,
        customerPhone: validatedData.phone || "Not provided",
        quoteId,
        address: validatedData.address,
        city: validatedData.city,
        services,
        message: validatedData.message,
        propertySize: validatedData.propertySize,
      });
      adminEmailSent = true;
      console.log("[QUOTE] Admin email sent successfully");
    } catch (emailError: any) {
      console.error("[QUOTE] FAILED to send admin email:", emailError?.message || emailError);
      console.error("[QUOTE] Admin email error details:", JSON.stringify(emailError, null, 2));
    }

    console.log("[QUOTE] Quote processing complete:", {
      quoteId,
      leadId,
      customerEmailSent,
      adminEmailSent,
    });

    return NextResponse.json({
      success: true,
      quoteId,
      id: quoteId,
      message: "Thank you! We've received your quote request and will contact you within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[QUOTE] Validation error:", error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: error.errors[0]?.message || "Validation error",
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error("[QUOTE] Unexpected error processing quote:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get("id");

  if (!quoteId) {
    return NextResponse.json(
      { error: "Quote ID required" },
      { status: 400 }
    );
  }

  if (db) {
    try {
      const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId));
      if (quote) {
        const [lead] = await db.select().from(leads).where(eq(leads.quoteId, quoteId));
        return NextResponse.json({
          id: quote.id,
          status: quote.status || "pending",
          message: "Your quote is being processed",
          lead: lead ? { status: lead.status, createdAt: lead.createdAt } : null,
        });
      }
    } catch (dbError) {
      console.error("[QUOTE] Error fetching quote status:", dbError);
    }
  }

  return NextResponse.json({
    id: quoteId,
    status: "pending",
    message: "Your quote is being processed",
  });
}
