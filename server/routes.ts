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

  // DEV ONLY: Test authentication bypass for E2E testing
  if (process.env.NODE_ENV === "development") {
    app.post("/api/auth/test-login", async (req, res) => {
      try {
        const { userId } = req.body;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
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
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
        aiAnalysis: validatedData.aiAnalysis || null,
        
        // Pricing (normalize to decimal strings with validation)
        complexityScore: validatedData.complexityScore 
          ? (() => {
              const num = typeof validatedData.complexityScore === 'number'
                ? validatedData.complexityScore
                : parseFloat(String(validatedData.complexityScore));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        baseCost: validatedData.baseCost
          ? (() => {
              const num = typeof validatedData.baseCost === 'number'
                ? validatedData.baseCost
                : parseFloat(String(validatedData.baseCost));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        adjustedCost: validatedData.adjustedCost
          ? (() => {
              const num = typeof validatedData.adjustedCost === 'number'
                ? validatedData.adjustedCost
                : parseFloat(String(validatedData.adjustedCost));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        finalQuote: validatedData.finalQuote
          ? (() => {
              // Parse and round quote using shared utility (rounds UP to nearest $5)
              const rounded = parseAndRoundQuote(validatedData.finalQuote);
              return rounded > 0 ? String(rounded) : null;
            })()
          : null,
        lineItems: validatedData.lineItems && Array.isArray(validatedData.lineItems)
          ? (() => {
              // Normalize line items for email-friendly format with proper service names
              const normalized = normalizeLineItemsForEmail(
                validatedData.lineItems,
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
      const userId = req.user.claims.sub;
      
      // Get requesting user
      const requestingUser = await storage.getUser(userId);
      if (!requestingUser) {
        return res.status(401).json({ error: "User not found" });
      }
      
      let leads = await storage.getAllLeads();
      
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
      
      res.json(maskedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Get single lead by ID - requires authentication
  app.get("/api/leads/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
            if (sub.email) {
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Get user's watchlist - requires authentication
  app.get("/api/leads/watchlist", isAuthenticated, requireRole(["subcontractor"]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Accept legal agreement - requires authentication
  app.post("/api/user/accept-agreement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const user = await storage.updateUser(userId, {
        agreementAccepted: true,
        agreementAcceptedAt: new Date(),
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error accepting agreement:", error);
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

  // Sitemap.xml generation - all 306 pages (28 services × 6 cities + 92 blog posts + core pages)
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
        { path: '/get-quote', priority: '1.0' },
        { path: '/pricing', priority: '0.8' },
        { path: '/commercial', priority: '0.8' },
        { path: '/commercial/hoa-services', priority: '0.7' },
        { path: '/commercial/municipal-services', priority: '0.7' },
        { path: '/blog', priority: '0.6' }
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

# Sitemap
Sitemap: https://lawncarekuna.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
