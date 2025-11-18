import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quote submission endpoint
  app.post("/api/quotes", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertQuoteSchema.parse(req.body);
      
      // Store quote
      const quote = await storage.createQuote(validatedData);
      
      // Log quote submission (in production, this would send email)
      console.log("New quote submission:", {
        id: quote.id,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        serviceType: quote.serviceType,
        city: quote.city,
        createdAt: quote.createdAt,
      });
      
      // In a real application, we would send an email here
      // For now, we'll just log it and return success
      
      res.json({
        success: true,
        message: "Quote request received! We'll contact you within 24 hours.",
        quoteId: quote.id,
      });
    } catch (error) {
      console.error("Quote submission error:", error);
      
      if (error instanceof Error && 'issues' in error) {
        // Zod validation error
        res.status(400).json({
          success: false,
          message: "Invalid form data",
          errors: error,
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

  const httpServer = createServer(app);
  return httpServer;
}
