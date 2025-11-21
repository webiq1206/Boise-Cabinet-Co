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
  serviceData: jsonb("service_data"), // service-specific measurements {serviceId: {linearFeet: 200, zones: 6, etc.}}
  
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

// Schema for quote submissions from the wizard (includes AI-generated fields)
export const quoteSubmissionSchema = insertQuoteSchema.extend({
  // Make AI-generated fields optional with proper types
  aiAnalysis: z.any().optional(),
  complexityScore: z.union([z.string(), z.number()]).optional(),
  baseCost: z.union([z.string(), z.number()]).optional(),
  adjustedCost: z.union([z.string(), z.number()]).optional(),
  finalQuote: z.union([z.string(), z.number()]).optional(),
  lineItems: z.any().optional(),
  serviceData: z.any().optional(), // service-specific measurements
  status: z.string().optional(),
  scheduledDate: z.union([z.string(), z.date()]).optional(),
  frequency: z.string().optional(),
  selectedServices: z.array(z.string()).optional(),
  address: z.string().optional(),
  message: z.string().optional(),
  // Allow propertySize as string or number (will be normalized)
  propertySize: z.union([z.string(), z.number()]).optional(),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;
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

// Users/Subcontractors Schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("subcontractor"), // admin or subcontractor
  company: text("company"),
  licenseNumber: text("license_number"),
  insuranceExpiry: timestamp("insurance_expiry"),
  
  // Agreement acceptance
  agreementAccepted: boolean("agreement_accepted").default(false),
  agreementAcceptedAt: timestamp("agreement_accepted_at"),
  
  // Stripe
  stripeCustomerId: text("stripe_customer_id"),
  
  // Status
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  agreementAcceptedAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  passwordHash: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Please enter your full name"),
  role: z.enum(["admin", "subcontractor"]).default("subcontractor"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Leads Schema (extends quotes)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Link to original quote
  quoteId: varchar("quote_id").references(() => quotes.id),
  
  // Lead details (copied from quote for denormalization)
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  propertyType: text("property_type").notNull(),
  serviceType: text("service_type").notNull(),
  selectedServices: text("selected_services").array(),
  frequency: text("frequency"), // one-time or recurring
  finalQuote: decimal("final_quote", { precision: 10, scale: 2 }),
  lineItems: jsonb("line_items"),
  serviceData: jsonb("service_data"),
  message: text("message"),
  
  // Lead pricing
  baseLeadPrice: decimal("base_lead_price", { precision: 10, scale: 2 }).notNull(),
  currentLeadPrice: decimal("current_lead_price", { precision: 10, scale: 2 }).notNull(),
  priceReductionRate: decimal("price_reduction_rate", { precision: 5, scale: 2 }).default("1.50"), // 1.5% daily
  lastPriceUpdate: timestamp("last_price_update").defaultNow(),
  
  // Lead status
  status: text("status").notNull().default("pending_admin"), // pending_admin, available, purchased, declined_admin
  adminReviewedBy: varchar("admin_reviewed_by").references(() => users.id),
  adminReviewedAt: timestamp("admin_reviewed_at"),
  adminDeclined: boolean("admin_declined").default(false),
  
  // Purchase tracking
  purchasedBy: varchar("purchased_by").references(() => users.id),
  purchasedAt: timestamp("purchased_at"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPriceUpdate: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Lead Purchases Schema (transaction history)
export const leadPurchases = pgTable("lead_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  stripeChargeId: text("stripe_charge_id"),
  
  // Refund tracking (for no-refund policy enforcement)
  refunded: boolean("refunded").default(false),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadPurchaseSchema = createInsertSchema(leadPurchases).omit({
  id: true,
  createdAt: true,
});

export type LeadPurchase = typeof leadPurchases.$inferSelect;
export type InsertLeadPurchase = z.infer<typeof insertLeadPurchaseSchema>;

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // new_lead, lead_purchased, lead_price_drop, admin_new_quote
  title: text("title").notNull(),
  message: text("message").notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  
  // Status
  read: boolean("read").default(false),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
