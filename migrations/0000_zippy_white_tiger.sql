CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"seo_title" text,
	"meta_description" text,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"admin_id" varchar,
	"lead_purchase_id" varchar,
	"balance_after" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_type" text NOT NULL,
	"city" text NOT NULL,
	"before_image_url" text NOT NULL,
	"after_image_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" text NOT NULL,
	"stripe_charge_id" text,
	"credits_used" numeric(10, 2) DEFAULT '0' NOT NULL,
	"refunded" boolean DEFAULT false,
	"refund_reason" text,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lead_purchases_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" varchar,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"city" text NOT NULL,
	"property_type" text NOT NULL,
	"service_type" text NOT NULL,
	"selected_services" text[],
	"frequency" text,
	"final_quote" numeric(10, 2),
	"line_items" jsonb,
	"service_data" jsonb,
	"message" text,
	"notes" jsonb,
	"base_lead_price" numeric(10, 2) NOT NULL,
	"current_lead_price" numeric(10, 2) NOT NULL,
	"price_reduction_rate" numeric(5, 2) DEFAULT '1.50',
	"last_price_update" timestamp DEFAULT now(),
	"status" text DEFAULT 'pending_admin' NOT NULL,
	"admin_reviewed_by" varchar,
	"admin_reviewed_at" timestamp,
	"admin_declined" boolean DEFAULT false,
	"priority" text DEFAULT 'normal',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"purchased_by" varchar,
	"purchased_at" timestamp,
	"purchase_price" numeric(10, 2),
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"lead_id" varchar,
	"read" boolean DEFAULT false,
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"city" text NOT NULL,
	"property_type" text NOT NULL,
	"property_size" numeric(10, 2),
	"service_type" text NOT NULL,
	"frequency" text,
	"selected_services" text[],
	"service_data" jsonb,
	"ai_analysis" jsonb,
	"complexity_score" numeric(3, 2),
	"base_cost" numeric(10, 2),
	"adjusted_cost" numeric(10, 2),
	"final_quote" numeric(10, 2),
	"line_items" jsonb,
	"status" text DEFAULT 'pending',
	"accepted_at" timestamp,
	"scheduled_date" timestamp,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" text NOT NULL,
	"service_type" text NOT NULL,
	"city" text NOT NULL,
	"rating" text NOT NULL,
	"testimonial" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"phone" text,
	"role" text DEFAULT 'subcontractor' NOT NULL,
	"company" text,
	"license_number" text,
	"insurance_expiry" timestamp,
	"agreement_accepted" boolean DEFAULT false,
	"agreement_accepted_at" timestamp,
	"agreement_signature" text,
	"agreement_signature_ip" text,
	"agreement_signature_user_agent" text,
	"agreement_version" text,
	"stripe_customer_id" text,
	"credit_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"watched_leads" jsonb DEFAULT '[]'::jsonb,
	"declined_leads" jsonb DEFAULT '[]'::jsonb,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_lead_purchase_id_lead_purchases_id_fk" FOREIGN KEY ("lead_purchase_id") REFERENCES "public"."lead_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_purchases" ADD CONSTRAINT "lead_purchases_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_purchases" ADD CONSTRAINT "lead_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_admin_reviewed_by_users_id_fk" FOREIGN KEY ("admin_reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_purchased_by_users_id_fk" FOREIGN KEY ("purchased_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_user_id_idx" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lead_purchases_user_id_idx" ON "lead_purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_city_idx" ON "leads" USING btree ("city");--> statement-breakpoint
CREATE INDEX "leads_service_type_idx" ON "leads" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "leads_status_city_idx" ON "leads" USING btree ("status","city");--> statement-breakpoint
CREATE INDEX "leads_current_price_idx" ON "leads" USING btree ("current_lead_price");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");