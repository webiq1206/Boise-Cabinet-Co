import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { quoteSubmissionSchema, type InsertQuote } from "@shared/schema";
import { calculateIntelligentQuote } from "./services/pricing";
import { sendQuoteNotification } from "./email";
import { z } from "zod";
import { quoteCacheMiddleware } from "./middleware/quoteCache";
import { quoteCalculationRateLimit } from "./middleware/rateLimit";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validation schema for quote calculation (flexible - only require essential fields)
  const calculateQuoteSchema = z.object({
    address: z.string().optional(),
    city: z.string().min(1, "City is required"),
    propertySize: z.coerce.number().positive("Property size must be a positive number").optional(),
    propertyType: z.enum(["residential", "commercial", "hoa", "property-management"]).optional(),
    serviceType: z.string().min(1, "Service type is required"),
    frequency: z.enum(["one-time", "weekly", "bi-weekly", "monthly"]).optional(),
    selectedServices: z.array(z.string()).optional(),
  });

  // Calculate intelligent quote with AI (with caching and rate limiting)
  app.post("/api/quotes/calculate", quoteCalculationRateLimit, quoteCacheMiddleware, async (req, res) => {
    try {
      // Validate request
      const validatedData = calculateQuoteSchema.parse(req.body);
      
      // Provide defaults for optional fields
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
        
        const { SERVICE_RATES, PROPERTY_MULTIPLIERS, FREQUENCY_DISCOUNTS, PROFIT_MARGIN } = await import("./services/pricing");
        
        // Helper to calculate base cost per service with correct unit handling
        const calculateServiceBase = (serviceId: string, propertySize: number) => {
          const service = SERVICE_RATES[serviceId as keyof typeof SERVICE_RATES];
          if (!service) return 0;
          
          if (service.unit === "project") {
            // Project-based: use baseRate directly
            return service.baseRate;
          } else if (service.unit === "linear_ft") {
            // Estimate perimeter: sqrt(sqft) * 4 * 0.6 for typical property shape
            const estimatedPerimeter = Math.sqrt(propertySize) * 4 * 0.6;
            return estimatedPerimeter * service.baseRate;
          } else {
            // Square footage: standard calculation
            return propertySize * service.baseRate;
          }
        };
        
        // Calculate main service
        let baseCost = calculateServiceBase(dataWithDefaults.serviceType, dataWithDefaults.propertySize);
        const mainService = SERVICE_RATES[dataWithDefaults.serviceType as keyof typeof SERVICE_RATES];
        
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
              description: SERVICE_RATES[serviceId as keyof typeof SERVICE_RATES]?.name || serviceId,
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
        
        // Update line items with multipliers
        lineItems.forEach(item => {
          item.adjustedPrice = item.basePrice * propertyMultiplier * complexityScore;
        });
        
        // Apply frequency discount
        const discount = FREQUENCY_DISCOUNTS[dataWithDefaults.frequency as keyof typeof FREQUENCY_DISCOUNTS] || 0;
        const afterDiscount = adjustedCost * (1 - discount);
        
        // Add profit margin (45%)
        const finalQuote = afterDiscount * (1 + PROFIT_MARGIN);
        
        // Return fallback quote with proper margins
        res.json({
          baseCost: Math.round(baseCost * 100) / 100,
          adjustedCost: Math.round(adjustedCost * 100) / 100,
          finalQuote: Math.round(finalQuote * 100) / 100,
          lineItems: lineItems.map(item => ({
            ...item,
            basePrice: Math.round(item.basePrice * 100) / 100,
            adjustedPrice: Math.round(item.adjustedPrice * 100) / 100,
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
            laborCost: Math.round(afterDiscount * 0.35 * 100) / 100,
            materialsCost: Math.round(afterDiscount * 0.15 * 100) / 100,
            overhead: Math.round(afterDiscount * 0.20 * 100) / 100,
            profit: Math.round((finalQuote - afterDiscount) * 100) / 100,
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
              const num = typeof validatedData.finalQuote === 'number'
                ? validatedData.finalQuote
                : parseFloat(String(validatedData.finalQuote));
              return isNaN(num) ? null : String(num);
            })()
          : null,
        lineItems: validatedData.lineItems || null,
        
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
      
      // Log quote submission
      console.log("New AI-generated quote submission:", {
        id: quote.id,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        serviceType: quote.serviceType,
        city: quote.city,
        finalQuote: quote.finalQuote,
        createdAt: quote.createdAt,
      });
      
      // Send email notification (async - don't block response)
      sendQuoteNotification({
        customerName: quote.name,
        customerEmail: quote.email,
        customerPhone: quote.phone || undefined,
        address: quote.address || '',
        city: quote.city,
        propertySize: quote.propertySize ? parseFloat(quote.propertySize) : undefined,
        propertyType: quote.propertyType,
        serviceType: quote.serviceType,
        frequency: quote.frequency || undefined,
        selectedServices: quote.selectedServices || undefined,
        finalQuote: quote.finalQuote ? parseFloat(quote.finalQuote) : undefined,
        preferredDate: quote.scheduledDate ? quote.scheduledDate.toISOString().split('T')[0] : undefined,
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

  const httpServer = createServer(app);
  return httpServer;
}
