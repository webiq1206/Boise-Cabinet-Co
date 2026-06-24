import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, decimal, boolean, index, integer, uniqueIndex } from "drizzle-orm/pg-core";
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
  propertyProfile: jsonb("property_profile").$type<import("@/shared/propertyProfile").PropertyProfile>(),
  propertyType: text("property_type").notNull(),
  propertySize: decimal("property_size", { precision: 10, scale: 2 }), // sq ft
  
  // Service details
  serviceType: text("service_type").notNull(),
  frequency: text("frequency"), // legacy column; remodel projects are one-time
  selectedServices: text("selected_services").array(), // array of service IDs
  serviceData: jsonb("service_data"), // service-specific measurements {serviceId: {propertySize: 2000}}
  
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
  seoTitle: text("seo_title"),
  metaDescription: text("meta_description"),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  faqs: jsonb("faqs").$type<Array<{ question: string; answer: string }>>().notNull().default(sql`'[]'::jsonb`),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table (extends Replit Auth with lead distribution fields)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: text("password_hash"),
  
  // Lead distribution specific fields
  phone: text("phone"),
  role: text("role").notNull().default("subcontractor"), // admin or subcontractor
  company: text("company"),
  licenseNumber: text("license_number"),
  insuranceExpiry: timestamp("insurance_expiry"),
  
  // Agreement acceptance and e-signature
  agreementAccepted: boolean("agreement_accepted").default(false),
  agreementAcceptedAt: timestamp("agreement_accepted_at"),
  agreementSignature: text("agreement_signature"), // Typed name as signature
  agreementSignatureIp: text("agreement_signature_ip"), // IP address when signing
  agreementSignatureUserAgent: text("agreement_signature_user_agent"), // Browser info
  agreementVersion: text("agreement_version"), // Version of agreement signed
  
  // Stripe
  stripeCustomerId: text("stripe_customer_id"),
  
  // Account credits
  creditBalance: decimal("credit_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Watchlist for contractors
  watchedLeads: jsonb("watched_leads").$type<string[]>().default(sql`'[]'::jsonb`), // Array of lead IDs
  
  // Declined/Passed leads - hidden from this contractor's view
  declinedLeads: jsonb("declined_leads").$type<string[]>().default(sql`'[]'::jsonb`), // Array of lead IDs

  // Notification preferences
  // Subcontractors can disable email notifications from the portal.
  emailNotificationsEnabled: boolean("email_notifications_enabled").notNull().default(true),
  complianceNotificationsEnabled: boolean("compliance_notifications_enabled").notNull().default(true),
  notificationPreferences: jsonb("notification_preferences").$type<{
    coiReminders?: boolean;
    w9Reminders?: boolean;
    contractReminders?: boolean;
    leadEmails?: boolean;
    notifyPriceDrops?: boolean;
  }>().default(sql`'{"coiReminders":true,"w9Reminders":true,"contractReminders":true,"leadEmails":true,"notifyPriceDrops":true}'::jsonb`),

  // Cached compliance status (updated on doc changes)
  complianceStatus: text("compliance_status").default("non_compliant"), // compliant, non_compliant, expiring_soon
  
  // Status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Leads Schema (extends quotes)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Link to original quote
  quoteId: varchar("quote_id").references(() => quotes.id),

  // homeowner = inbound quote/estimate leads; business = imported contractors/partners.
  leadType: text("lead_type").notNull().default("homeowner"),
  // Derived: true only when a valid email is present and the lead is not unsubscribed/failed.
  emailable: boolean("emailable").notNull().default(false),

  // Lead details (copied from quote for denormalization). Nullable so business
  // leads (company only, often no email/phone/name) and no-email imports are valid.
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  companyName: text("company_name"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  // Structured address parts (mainly from business imports)
  street: text("street"),
  serviceArea: text("service_area"), // one of the eight Treasure Valley cities when matched
  state: text("state"),
  zip: text("zip"),
  county: text("county"),
  fullAddress: text("full_address"),
  propertyProfile: jsonb("property_profile").$type<import("@/shared/propertyProfile").PropertyProfile>(),
  propertyType: text("property_type"),
  serviceType: text("service_type"),
  selectedServices: text("selected_services").array(),
  frequency: text("frequency"), // legacy column; remodel projects are one-time
  finalQuote: decimal("final_quote", { precision: 10, scale: 2 }),
  lineItems: jsonb("line_items"),
  serviceData: jsonb("service_data"),
  message: text("message"),
  notes: jsonb("notes"), // Array of {text: string, addedBy: string, addedAt: Date}[]

  // Business-lead context (from imported listings)
  businessCategory: text("business_category"),
  leadGroup: text("lead_group"),
  categoriesMatched: text("categories_matched"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count"),
  googleMapsUrl: text("google_maps_url"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  distanceMi: decimal("distance_mi", { precision: 8, scale: 2 }),

  // Email engagement vs sales pipeline (kept as separate concerns)
  emailStatus: text("email_status").notNull().default("new"), // new, contacted, failed, unsubscribed
  pipelineStage: text("pipeline_stage").notNull().default("new"), // new, consultation_booked, quoted, won, lost, on_hold

  // One-click opt-out token for outreach emails
  unsubscribeToken: varchar("unsubscribe_token").notNull().default(sql`gen_random_uuid()`),
  lastContactedAt: timestamp("last_contacted_at"),
  
  // Lead pricing (legacy marketplace fields; nullable since the subcontractor
  // marketplace was removed and consultation-sourced leads carry no resale price).
  baseLeadPrice: decimal("base_lead_price", { precision: 10, scale: 2 }),
  currentLeadPrice: decimal("current_lead_price", { precision: 10, scale: 2 }),
  priceReductionRate: decimal("price_reduction_rate", { precision: 5, scale: 2 }).default("1.50"),
  lastPriceUpdate: timestamp("last_price_update").defaultNow(),
  
  // Where the lead originated: consultation, estimate_form, contact_form,
  // estimator, lead_magnet, meta_ad, manual, csv.
  source: text("source").default("consultation"),
  // Campaign, page slug, or import filename (free text).
  sourceDetail: text("source_detail"),

  // Lead status: pending_admin, accepted, archived (converted leads carry projectId)
  status: text("status").notNull().default("pending_admin"),
  adminReviewedBy: varchar("admin_reviewed_by").references(() => users.id),
  adminReviewedAt: timestamp("admin_reviewed_at"),
  adminDeclined: boolean("admin_declined").default(false),
  
  // Priority and tags
  priority: text("priority").default("normal"), // low, normal, high, urgent
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`), // Array of tag strings
  
  // Purchase tracking
  purchasedBy: varchar("purchased_by").references(() => users.id),
  purchasedAt: timestamp("purchased_at"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),

  // Set true when the customer's saved address has no leading house number.
  // Surfaced in admin/sub portals so the buyer knows to call the customer
  // before driving out. Defaults to false; backfill script may set true on
  // historical rows.
  addressMissingHouseNumber: boolean("address_missing_house_number")
    .notNull()
    .default(false),

  // Project conversion
  projectId: varchar("project_id"),
  convertedToProjectAt: timestamp("converted_to_project_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("leads_status_idx").on(table.status),
  cityIdx: index("leads_city_idx").on(table.city),
  serviceTypeIdx: index("leads_service_type_idx").on(table.serviceType),
  statusCityIdx: index("leads_status_city_idx").on(table.status, table.city),
  priceIdx: index("leads_current_price_idx").on(table.currentLeadPrice),
  leadTypeIdx: index("leads_lead_type_idx").on(table.leadType),
  emailStatusIdx: index("leads_email_status_idx").on(table.emailStatus),
  pipelineStageIdx: index("leads_pipeline_stage_idx").on(table.pipelineStage),
  emailableIdx: index("leads_emailable_idx").on(table.emailable),
  leadGroupIdx: index("leads_lead_group_idx").on(table.leadGroup),
  unsubTokenIdx: uniqueIndex("leads_unsubscribe_token_idx").on(table.unsubscribeToken),
}));

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastPriceUpdate: true,
}).extend({
  // Make pricing fields optional since backend calculates them
  baseLeadPrice: z.string().optional(),
  currentLeadPrice: z.string().optional(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Lead Activities Schema (unified CRM timeline)
// One row per event on a lead: notes, contact attempts, status changes, admin
// actions (accepted, converted), price overrides, and outbound emails. The
// timeline is built from these rows plus a synthetic "created" event derived
// from the lead's createdAt.
export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  // note | contact_attempt | status_change | accepted | converted |
  // price_change | email_sent | purchased
  type: text("type").notNull(),
  // Human-readable summary shown in the timeline.
  message: text("message").notNull(),
  // Structured extras: { from, to } for status, { channel } for contact attempts,
  // { subject, to } for emails, { from, to } for price changes.
  detail: jsonb("detail").$type<Record<string, unknown>>(),
  // Who performed the action. actorName is denormalized for display.
  actorId: varchar("actor_id").references(() => users.id),
  actorName: text("actor_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  leadIdIdx: index("lead_activities_lead_id_idx").on(table.leadId),
  leadCreatedIdx: index("lead_activities_lead_created_idx").on(table.leadId, table.createdAt),
}));

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;

// Lead Purchases Schema (transaction history)
export const leadPurchases = pgTable("lead_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().unique().references(() => leads.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  stripeChargeId: text("stripe_charge_id"),
  creditsUsed: decimal("credits_used", { precision: 10, scale: 2 }).notNull().default("0"),
  
  refunded: boolean("refunded").default(false),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("lead_purchases_user_id_idx").on(table.userId),
}));

export const insertLeadPurchaseSchema = createInsertSchema(leadPurchases).omit({
  id: true,
  createdAt: true,
});

export type LeadPurchase = typeof leadPurchases.$inferSelect;
export type InsertLeadPurchase = z.infer<typeof insertLeadPurchaseSchema>;

// Credit Transactions Schema (audit trail for credit changes)
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  description: text("description"),
  adminId: varchar("admin_id").references(() => users.id),
  leadPurchaseId: varchar("lead_purchase_id").references(() => leadPurchases.id),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("credit_transactions_user_id_idx").on(table.userId),
}));

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;

// Notifications Schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // new_lead, lead_purchased, lead_price_drop, admin_new_quote
  title: text("title").notNull(),
  message: text("message").notNull(),
  leadId: varchar("lead_id").references(() => leads.id),
  projectId: varchar("project_id"),
  contractId: varchar("contract_id"),
  complianceDocumentId: varchar("compliance_document_id"),
  
  // Status
  read: boolean("read").default(false),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  userIdReadIdx: index("notifications_user_id_read_idx").on(table.userId, table.read),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const siteSettings = pgTable("site_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by"),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// Consultation Requests Schema (new contacts from the homepage form)
export const consultationRequests = pgTable("consultation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  zip: text("zip").notNull(),
  address: text("address"),
  city: text("city"),
  propertyProfile: jsonb("property_profile").$type<import("@/shared/propertyProfile").PropertyProfile>(),
  projectType: text("project_type").notNull(),
  message: text("message"),
  // Calculator estimate (optional; populated when user used the estimate tool)
  estimateProject: text("estimate_project"),
  estimateFinish: text("estimate_finish"),
  estimateLow: decimal("estimate_low", { precision: 10, scale: 2 }),
  estimateHigh: decimal("estimate_high", { precision: 10, scale: 2 }),
  // Status
  status: text("status").notNull().default("new"), // new, contacted, converted, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsultationRequestSchema = createInsertSchema(consultationRequests).omit({
  id: true,
  createdAt: true,
});

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
export type InsertConsultationRequest = z.infer<typeof insertConsultationRequestSchema>;

// --- Compliance & Project Management ---

export type ComplianceDocType = "coi" | "w9";
export type ComplianceDocStatus = "pending_review" | "approved" | "rejected" | "expired";
export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";
export type ContractStatus = "draft" | "sent" | "signed" | "void";
export type ChangeOrderStatus = "draft" | "pending_signature" | "approved" | "rejected";

export const complianceDocuments = pgTable("compliance_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // coi | w9
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("pending_review"),
  expiresAt: timestamp("expires_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  version: integer("version").notNull().default(1),
  isCurrent: boolean("is_current").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("compliance_documents_user_id_idx").on(table.userId),
  userTypeCurrentIdx: index("compliance_documents_user_type_current_idx").on(table.userId, table.type, table.isCurrent),
}));

export const insertComplianceDocumentSchema = createInsertSchema(complianceDocuments).omit({
  id: true,
  createdAt: true,
  uploadedAt: true,
});

export type ComplianceDocument = typeof complianceDocuments.$inferSelect;
export type InsertComplianceDocument = z.infer<typeof insertComplianceDocumentSchema>;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").unique().references(() => leads.id),
  quoteId: varchar("quote_id").references(() => quotes.id),
  title: text("title").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  propertyProfile: jsonb("property_profile").$type<import("@/shared/propertyProfile").PropertyProfile>(),
  propertyType: text("property_type").notNull(),
  serviceType: text("service_type").notNull(),
  selectedServices: text("selected_services").array(),
  lineItems: jsonb("line_items"),
  serviceData: jsonb("service_data"),
  message: text("message"),
  scopeOfWork: text("scope_of_work"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  contractAmount: decimal("contract_amount", { precision: 10, scale: 2 }),
  paymentTerms: text("payment_terms"),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  status: text("status").notNull().default("draft"),
  currentStage: text("current_stage").default("consultation"),
  customerUserId: varchar("customer_user_id").references(() => users.id),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  estimatedInstallDate: timestamp("estimated_install_date"),
  designId: varchar("design_id"),
  selectionsJson: jsonb("selections_json").$type<Record<string, unknown>>(),
  internalNotes: jsonb("internal_notes").$type<Array<{ text: string; addedBy: string; addedAt: string; type?: string }>>().default(sql`'[]'::jsonb`),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
  createdBy: varchar("created_by").references(() => users.id),
  convertedFromLeadAt: timestamp("converted_from_lead_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("projects_status_idx").on(table.status),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export const projectAssignments = pgTable("project_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  subcontractorId: varchar("subcontractor_id").notNull().references(() => users.id),
  role: text("role").notNull().default("primary"), // primary | sub
  status: text("status").notNull().default("assigned"), // assigned | active | completed | removed
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  projectIdx: index("project_assignments_project_idx").on(table.projectId),
  subIdx: index("project_assignments_sub_idx").on(table.subcontractorId),
}));

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({
  id: true,
  assignedAt: true,
});

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;

export const changeOrders = pgTable("change_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amountDelta: decimal("amount_delta", { precision: 10, scale: 2 }).notNull().default("0"),
  scopeDelta: text("scope_delta"),
  status: text("status").notNull().default("draft"),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("change_orders_project_idx").on(table.projectId),
}));

export const insertChangeOrderSchema = createInsertSchema(changeOrders).omit({
  id: true,
  createdAt: true,
});

export type ChangeOrder = typeof changeOrders.$inferSelect;
export type InsertChangeOrder = z.infer<typeof insertChangeOrderSchema>;

export const contractTemplates = pgTable("contract_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  bodyHtml: text("body_html").notNull(),
  version: text("version").notNull().default("1.0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  subcontractorId: varchar("subcontractor_id").notNull().references(() => users.id),
  templateId: varchar("template_id").references(() => contractTemplates.id),
  title: text("title").notNull(),
  bodyHtml: text("body_html").notNull(),
  status: text("status").notNull().default("draft"),
  mergeData: jsonb("merge_data").$type<Record<string, string>>(),
  signature: text("signature"),
  signedAt: timestamp("signed_at"),
  signatureIp: text("signature_ip"),
  signatureUserAgent: text("signature_user_agent"),
  signedPdfUrl: text("signed_pdf_url"),
  sentAt: timestamp("sent_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdx: index("contracts_project_idx").on(table.projectId),
  subIdx: index("contracts_sub_idx").on(table.subcontractorId),
  statusIdx: index("contracts_status_idx").on(table.status),
}));

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export const entityDocuments = pgTable("entity_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // lead | project | contract
  entityId: varchar("entity_id").notNull(),
  category: text("category").notNull().default("attachment"), // photo | attachment | signed_contract | other
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_documents_entity_idx").on(table.entityType, table.entityId),
}));

export const insertEntityDocumentSchema = createInsertSchema(entityDocuments).omit({
  id: true,
  createdAt: true,
});

export type EntityDocument = typeof entityDocuments.$inferSelect;
export type InsertEntityDocument = z.infer<typeof insertEntityDocumentSchema>;

export const complianceReminderLog = pgTable("compliance_reminder_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: text("document_type").notNull(),
  reminderType: text("reminder_type").notNull(), // missing | expiring_30 | expiring_14 | expiring_7 | expired
  sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => ({
  dedupeIdx: index("compliance_reminder_log_dedupe_idx").on(table.userId, table.documentType, table.reminderType, table.sentAt),
}));

// ─── Boise Cabinet Co Platform Extensions ───────────────────────────────────

export const cabinetDesigns = pgTable("cabinet_designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  userEmail: text("user_email"),
  projectId: varchar("project_id").references(() => projects.id),
  versionGroupId: varchar("version_group_id"),
  roomType: text("room_type").notNull(),
  collectionId: text("collection_id").notNull(),
  layoutJson: jsonb("layout_json").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
  styleJson: jsonb("style_json").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
  photoUrl: text("photo_url"),
  shareToken: varchar("share_token").unique(),
  status: text("status").notNull().default("draft"), // draft | submitted | approved
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CabinetDesign = typeof cabinetDesigns.$inferSelect;

export const designPricingRequests = pgTable("design_pricing_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  designId: varchar("design_id").references(() => cabinetDesigns.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DesignPricingRequest = typeof designPricingRequests.$inferSelect;

// Exported AR models (GLB + USDZ) hosted so native device AR viewers can fetch
// them over HTTPS. Bytes stored base64-encoded; rows are short-lived previews.
export const arModels = pgTable("ar_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  glb: text("glb"), // base64-encoded GLB (Android Scene Viewer)
  usdz: text("usdz"), // base64-encoded USDZ (iOS Quick Look)
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Short-lived previews: rows past this time are treated as gone and purged.
  expiresAt: timestamp("expires_at")
    .notNull()
    .default(sql`now() + interval '1 hour'`),
});

export const insertArModelSchema = createInsertSchema(arModels).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

export type InsertArModel = z.infer<typeof insertArModelSchema>;
export type ArModel = typeof arModels.$inferSelect;

export const projectOrders = pgTable("project_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull().default("pending"), // pending | fabrication | shipped | delivered
  itemsJson: jsonb("items_json").$type<Record<string, unknown>[]>(),
  estimatedShipDate: timestamp("estimated_ship_date"),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectOrder = typeof projectOrders.$inferSelect;

export const projectInvoices = pgTable("project_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  stripeInvoiceId: text("stripe_invoice_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // draft | sent | paid | overdue
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  lineItemsJson: jsonb("line_items_json").$type<Record<string, unknown>[]>(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectInvoice = typeof projectInvoices.$inferSelect;

export const projectPayments = pgTable("project_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => projectInvoices.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectPayment = typeof projectPayments.$inferSelect;

export const projectMessages = pgTable("project_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  senderUserId: varchar("sender_user_id").references(() => users.id),
  senderRole: text("sender_role").notNull(), // customer | admin | partner
  body: text("body").notNull(),
  attachmentsJson: jsonb("attachments_json").$type<Array<{ url: string; name: string }>>(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectMessage = typeof projectMessages.$inferSelect;

export const changeRequests = pgTable("change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  customerUserId: varchar("customer_user_id").references(() => users.id),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending | reviewing | approved | declined
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChangeRequest = typeof changeRequests.$inferSelect;

export const projectAppointments = pgTable("project_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  type: text("type").notNull(), // consultation | measure | install | walkthrough
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProjectAppointment = typeof projectAppointments.$inferSelect;

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  customerUserId: varchar("customer_user_id").references(() => users.id),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;

export const customerContracts = pgTable("customer_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  templateId: varchar("template_id"),
  status: text("status").notNull().default("draft"), // draft | sent | signed
  signedAt: timestamp("signed_at"),
  signedPdfUrl: text("signed_pdf_url"),
  signatureName: text("signature_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Contractor Outreach System (admin-only B2B cold outreach) ---
// Discovers general contractors via the official Google Places API, stores only
// publicly-listed emails scraped from each contractor's own website (never
// guessed or fabricated), and sends throttled, CAN-SPAM-compliant outreach.
export const outreachProspects = pgTable("outreach_prospects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Stable identifier from Google Places so re-running discovery dedupes.
  googlePlaceId: varchar("google_place_id").notNull(),
  businessName: text("business_name").notNull(),
  // Service-area city used for the discovery query (e.g. "Boise").
  city: text("city").notNull(),
  website: text("website"),
  phone: text("phone"),
  formattedAddress: text("formatted_address"),
  // The single publicly-listed email we will contact. Null until scraped.
  email: text("email"),
  // The exact page URL the email was published on (audit trail; proves it was
  // public and not fabricated).
  emailSourceUrl: text("email_source_url"),
  // discovered -> needs_email | ready -> approved -> sent | replied | bounced |
  // skipped | unsubscribed
  status: text("status").notNull().default("discovered"),
  // Short human note used to personalize the opener (e.g. a service they list).
  personalizationNote: text("personalization_note"),
  // Optional per-prospect template/voice override. Null falls back to the
  // batch-wide default template chosen in the outreach config.
  templateKey: text("template_key"),
  // Per-prospect token embedded in the unsubscribe link.
  unsubscribeToken: varchar("unsubscribe_token").notNull().default(sql`gen_random_uuid()`),
  // Sending bookkeeping for throttling + auditing.
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  providerMessageId: text("provider_message_id"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  bouncedAt: timestamp("bounced_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  placeIdx: uniqueIndex("outreach_prospects_place_id_idx").on(table.googlePlaceId),
  statusIdx: index("outreach_prospects_status_idx").on(table.status),
  tokenIdx: index("outreach_prospects_token_idx").on(table.unsubscribeToken),
}));

export const insertOutreachProspectSchema = createInsertSchema(outreachProspects).omit({
  id: true,
  unsubscribeToken: true,
  createdAt: true,
  updatedAt: true,
});

export type OutreachProspect = typeof outreachProspects.$inferSelect;
export type InsertOutreachProspect = z.infer<typeof insertOutreachProspectSchema>;

// Permanent do-not-email list. Populated by unsubscribes, bounces, complaints,
// or manual admin entry. Checked before every send so we never re-contact.
export const outreachSuppressions = pgTable("outreach_suppressions", {
  email: varchar("email").primaryKey(),
  reason: text("reason").notNull().default("unsubscribe"), // unsubscribe | bounce | complaint | manual
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OutreachSuppression = typeof outreachSuppressions.$inferSelect;

// --- Unified Lead CRM (submissions, quotes, templates, sequences, sending) ---

// Immutable raw record of each public form submission, tied to a lead, so the
// operator always sees exactly what was sent.
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  formType: text("form_type").notNull(), // contact, estimate, consultation, design_pricing
  rawPayload: jsonb("raw_payload").notNull(),
  sourcePage: text("source_page"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => ({
  leadIdx: index("submissions_lead_id_idx").on(table.leadId),
}));

export type Submission = typeof submissions.$inferSelect;

// Estimator output or any planning range given to a lead. Named lead_quotes to
// avoid colliding with the legacy `quotes` wizard table.
export const leadQuotes = pgTable("lead_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  projectType: text("project_type"),
  sizeOrScope: text("size_or_scope"),
  doorStyle: text("door_style"),
  finish: text("finish"),
  planningRangeLow: decimal("planning_range_low", { precision: 10, scale: 2 }),
  planningRangeHigh: decimal("planning_range_high", { precision: 10, scale: 2 }),
  estimatorInputs: jsonb("estimator_inputs"),
  status: text("status").notNull().default("sent"), // draft, sent, viewed, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  leadIdx: index("lead_quotes_lead_id_idx").on(table.leadId),
}));

export type LeadQuote = typeof leadQuotes.$inferSelect;

// Reusable email templates. Structured "personal note" fields (opening/main/
// closing) assemble into body at send time; a plain body is also supported.
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey(), // slug
  name: text("name").notNull(),
  audience: text("audience").notNull().default("homeowner"), // homeowner, business, any
  subject: text("subject").notNull(),
  openingLine: text("opening_line"),
  mainMessage: text("main_message"),
  closingLine: text("closing_line"),
  body: text("body"), // assembled or plain body
  signerName: text("signer_name"),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  secondaryCtaLabel: text("secondary_cta_label"),
  secondaryCtaUrl: text("secondary_cta_url"),
  seedManaged: boolean("seed_managed").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;

// A named, ordered drip sequence.
export const sequences = pgTable("sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  audience: text("audience").notNull().default("homeowner"), // homeowner, business, any
  seedKey: text("seed_key"), // stable identifier for seeded sequences
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Sequence = typeof sequences.$inferSelect;

export const sequenceSteps = pgTable("sequence_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id),
  templateId: varchar("template_id").notNull().references(() => emailTemplates.id),
  stepOrder: integer("step_order").notNull(),
  delayHours: integer("delay_hours").notNull().default(0),
}, (table) => ({
  seqIdx: index("sequence_steps_sequence_id_idx").on(table.sequenceId),
}));

export type SequenceStep = typeof sequenceSteps.$inferSelect;

export const sequenceEnrollments = pgTable("sequence_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  status: text("status").notNull().default("active"), // active, completed, stopped
  currentStep: integer("current_step").notNull().default(0),
  nextDueAt: timestamp("next_due_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueEnrollment: uniqueIndex("sequence_enrollments_seq_lead_idx").on(table.sequenceId, table.leadId),
  dueIdx: index("sequence_enrollments_next_due_idx").on(table.status, table.nextDueAt),
}));

export type SequenceEnrollment = typeof sequenceEnrollments.$inferSelect;

// A one-off batch blast.
export const outreachRuns = pgTable("outreach_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => emailTemplates.id),
  subjectOverride: text("subject_override"),
  targetFilter: jsonb("target_filter"), // full audience selection snapshot
  batchSize: integer("batch_size").notNull().default(10),
  dailyCap: integer("daily_cap").notNull().default(50),
  delaySeconds: integer("delay_seconds").notNull().default(60),
  status: text("status").notNull().default("active"), // active, paused, completed
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OutreachRun = typeof outreachRuns.$inferSelect;

// Per-send audit log, linked to either a run or a sequence enrollment.
export const outreachSends = pgTable("outreach_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  runId: varchar("run_id").references(() => outreachRuns.id),
  enrollmentId: varchar("enrollment_id").references(() => sequenceEnrollments.id),
  stepId: varchar("step_id").references(() => sequenceSteps.id),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  trackingToken: varchar("tracking_token").notNull().default(sql`gen_random_uuid()`),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  openCount: integer("open_count").notNull().default(0),
  firstClickedAt: timestamp("first_clicked_at"),
  clickCount: integer("click_count").notNull().default(0),
  status: text("status").notNull().default("sent"), // sent, failed
  errorDetail: text("error_detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  leadIdx: index("outreach_sends_lead_id_idx").on(table.leadId),
  runIdx: index("outreach_sends_run_id_idx").on(table.runId),
  tokenIdx: uniqueIndex("outreach_sends_tracking_token_idx").on(table.trackingToken),
}));

export type OutreachSend = typeof outreachSends.$inferSelect;

// Follow-up reminders on a lead.
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  title: text("title").notNull(),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  leadIdx: index("tasks_lead_id_idx").on(table.leadId),
  dueIdx: index("tasks_due_at_idx").on(table.dueAt),
}));

export type Task = typeof tasks.$inferSelect;
