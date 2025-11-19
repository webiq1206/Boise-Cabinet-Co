import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Detailed quote requests with AI analysis
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Customer info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  
  // Property details
  address: text("address"),
  city: text("city").notNull(),
  propertyType: text("property_type").notNull(),
  propertySize: decimal("property_size", { precision: 10, scale: 2 }), // sq ft
  
  // Service details
  serviceType: text("service_type").notNull(),
  frequency: text("frequency"), // one-time, weekly, bi-weekly, monthly
  selectedServices: text("selected_services").array(), // array of service IDs
  
  // AI Analysis
  aiAnalysis: jsonb("ai_analysis"), // terrain, obstacles, complexity assessment
  complexityScore: decimal("complexity_score", { precision: 3, scale: 2 }), // 1.0-2.0 multiplier
  
  // Pricing
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }),
  adjustedCost: decimal("adjusted_cost", { precision: 10, scale: 2 }), // after complexity
  finalQuote: decimal("final_quote", { precision: 10, scale: 2 }), // with margin
  lineItems: jsonb("line_items"), // detailed breakdown
  
  // Status
  status: text("status").default("pending"), // pending, accepted, declined, completed
  acceptedAt: timestamp("accepted_at"),
  scheduledDate: timestamp("scheduled_date"),
  
  // Additional
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  name: z.string().min(2, "Please enter your full name"),
  serviceType: z.string().min(1, "Please select a service type"),
  propertyType: z.string().min(1, "Please select a property type"),
  city: z.string().min(1, "Please select your city"),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Gallery Photos Schema
export const galleryPhotos = pgTable("gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceType: text("service_type").notNull(),
  city: text("city").notNull(),
  beforeImageUrl: text("before_image_url").notNull(),
  afterImageUrl: text("after_image_url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({
  id: true,
  createdAt: true,
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;

// Testimonials Schema
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  serviceType: text("service_type").notNull(),
  city: text("city").notNull(),
  rating: text("rating").notNull(), // 1-5
  testimonial: text("testimonial").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Blog Posts Schema
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
