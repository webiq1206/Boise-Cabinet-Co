# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site powers 500+ SEO-optimized location pages with unique, city-specific metadata designed to rank #1 in local search results for each service area.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, Montserrat font, Primary Forest Green, Light Mint backgrounds, pure white.
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Visuals**: Service-specific hero backgrounds, consistent typography, redesigned mobile navigation with sticky bottom bar.
- **Content Layout**: Clean, modern look with simplified layouts, alternating backgrounds, two-column quote forms, and scannable content sections with proper heading hierarchy.
- **Interactive Elements**: Interactive FAQ accordions, an interactive property measurement tool, and a site-wide search function with autocomplete.
- **Accessibility**: WCAG AA compliant with visible focus states (2px outlines), 4.5:1 color contrast ratios, proper ARIA labels, keyboard navigation support, and semantic HTML throughout.

### Technical Implementations
- **Frontend Framework**: Next.js 14 (App Router) with React 18 and TypeScript, migrated from Vite/Express SPA.
- **Routing**: Next.js file-based routing with dynamic `[slug]` segments for services, areas, and blog posts.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Performance Optimization**: Route-level code splitting dramatically reduces initial JS bundle size for faster mobile performance.
- **Multi-Service Quote System**: A 4-step intelligent wizard supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation. Services are filtered by Idaho Treasure Valley seasonality. Frequency selection is per-service inline (not global): recurring-eligible services show their own frequency buttons (weekly/bi-weekly/monthly/one-time), while one-time services have no frequency selector. Per-service frequencies are sent to the server via `serviceFrequencies` record and `serviceData[].frequency`.
- **Service Seasonality System**: Shared configuration in `shared/serviceSeasonality.ts` defines season windows, near-season buffers, and recurring eligibility for all services based on Idaho USDA Zone 6b-7a climate. Only lawn-mowing, lawn-maintenance, hedge-trimming, and weed-control are recurring-eligible. The quote wizard dynamically filters all service displays by season: intent cards hide out-of-season categories (snow removal in spring, Christmas lights in summer), the cleanup intent swaps between Spring Cleanup and Fall Cleanup based on date, the irrigation intent shows in-season primary services, upsell suggestions are season-filtered, and the manual "Add more services" list separates available services from muted out-of-season entries with season labels. Both the Next.js (`components/SimpleQuoteWizard.tsx`) and Vite (`client/src/components/SimpleQuoteWizard.tsx`) wizards use `getSeasonalIntents()` for this.
- **Server-Side Lead Pricing**: Quote API (`app/api/quotes/route.ts`) calculates per-service prices from measurement data (property size, linear feet, zones, etc.) using SERVICE_PRICING_RATES, rather than relying on client-sent totals. Lead prices are always 10% of the total per-visit estimate (midpoint of quote range), with a $5 minimum and $50 maximum, rounded to nearest $5. Daily price decay of 1.5%/day with 20% floor.
- **Intelligent Property Calculator**: Automated property measurement system querying Ada County Assessor parcel database API. Features include address normalization, multi-county support, fuzzy city matching, multiple property selection, enhanced error messages, comprehensive linear measurements, and intelligent estimation with manual adjustment.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), comprehensive bidirectional internal linking, SEO-optimized headings and FAQs. Includes `robots.txt`, `sitemap.xml`, and `llms.txt`. Features city-specific metadata, URL-safe canonicals, smart title generation, and crawler-friendly defaults. No `keywords` meta tags (dead signal removed). AggregateRating schema on organization JSON-LD. AI-friendly `llms.txt` with business summary, services, and citation guidelines. Dedicated `/faq` hub page aggregating FAQs by category with FAQPage schema. `/seasonal-guide` with month-by-month lawn care calendar and HowTo schema for Idaho Zone 6b-7a. `generateSpeakableSchema()` helper in `lib/schema.ts` for AI voice search. All key page templates (home, service, area, city-service, FAQ, seasonal guide) include `data-speakable="summary"` AI-friendly paragraphs with SpeakableSpecification JSON-LD. Cross-linking sections on service and area pages link to FAQ, seasonal guide, pricing, and blog. Google Analytics 4 (GA4) integrated via `@next/third-parties/google` `GoogleAnalytics` component in `app/layout.tsx` using `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var (defaults to G-1HD7RT8PKJ). Canonical tags (`alternates.canonical`) on all public pages. Email obfuscation via `ObfuscatedEmail` client component (splits user/domain, uses `&#64;` entity, JS-only mailto). Facebook and Instagram social links in footer with `sameAs` in organization JSON-LD schema. Title template in root layout (`%s | Lawn Care Kuna`) - page titles must NOT include "Lawn Care Kuna" to avoid duplication. All OG URLs are absolute (`https://lawncarekuna.com/...`). All Twitter card tags added. Meta descriptions kept under 160 characters with CTA and phone number. H1/H2/H3 headings keyword-optimized with local intent (city names, service keywords). Internal link anchor text includes descriptive, keyword-rich phrases. All public-facing pages are server-rendered (no `"use client"` on public pages); only admin/subcontractor/quote-status pages use client rendering.
- **Dynamic Content**: Navigation and footer automatically display all services and service areas from `contentData.ts`.
- **Mega Menu Navigation**: Organized into 4 balanced service columns (Lawn Care, Landscaping, Seasonal & Specialty, Irrigation & Lighting) with category icons for desktop and collapsible categories for mobile.
- **Mobile Navigation**: Sticky bottom navigation with quick access to services, quotes, and scheduling.
- **Site-Wide Search**: Real-time autocomplete search in header for services, areas, and main pages.
- **Lead Distribution System**: A B2B lead marketplace with admin dashboard, subcontractor portal, privacy protection, automated lead pricing, legal agreement flow, and in-app notifications. Integrates with Stripe for payments. Lead cards are collapsible on mobile with key info visible at a glance. Admins can permanently delete leads via confirmation dialog. Admin recovery endpoint (`/api/admin/resolve-payment`) supports both POST (with leadId/userId body) and GET (auto-resolves known unresolved purchases) for fixing failed purchase confirmations where Stripe charged but the backend did not record the purchase. Next.js instrumentation hook (`instrumentation.ts`) runs on production startup to auto-resolve known broken purchases. Purchased leads in the "My Purchases" tab reveal full contact info (name, phone, email, address) with clickable tel/mailto links, hide purchase controls/checkbox/watchlist, and show a "Purchased" badge with purchase date.
- **Testimonials System**: Scrolling marquee component (`components/Testimonials.tsx`) with branded gradient cards, pause on hover, and fade edge overlays. 60 sample reviews covering all 6 cities and diverse services in `app/api/testimonials/route.ts`. Displayed on: home, get-quote, pricing, about, commercial, all 8 specific service pages, and dynamic service/area pages.
- **Blog System**: Implemented with category organization, posts seeded from `shared/blogContent.ts`, and a category-organized blog page UI with responsive grid and detailed post cards.
- **Customer Email Enhancements**: Comprehensive estimate information display in customer and admin quote emails, including full quote details, brand assets, detailed breakdowns, advanced data normalization, and service deduplication. Frequency display is per-service when mixed (e.g., Lawn Mowing: Monthly, Fertilization: One-time) instead of a single misleading top-level frequency. All three email paths and both portal/admin dashboards use per-service frequency from `serviceData[sid].frequency`, showing "Mixed (N recurring)" for mixed-frequency quotes instead of a single misleading top-level frequency. Per-service badges in quote breakdowns use actual per-service frequency rather than the lead-level frequency.
- **Professional Email Templates**: Overhauled email templates with actual Lawn Care Kuna logo, production URLs, complete contact information, and quote value normalization. Per-service frequency breakdown in all three email paths: server/email.ts, lib/resend.ts, and server/services/emailNotifications.ts.
- **Popup-Free Quote Flow**: Replaced all toast notifications with inline error alerts. Enhanced quote wizard with per-service pricing dropdowns and comprehensive legal protection and transparency.
- **Lead Display Titles**: Lead card titles in admin dashboard and subcontractor portal show the most expensive service (from lineItems) first. Multi-service leads show "Lawn Renovation + 4 more" or "Lawn Renovation & Hedge Trimming" instead of just the primary serviceType. Helper function `getLeadDisplayTitle()` in both portal files and `getEmailLeadDisplayTitle()` in emailNotifications.ts.
- **Subcontractor Lead Email Urgency**: The new-lead notification email to subcontractors uses an urgency-driven subject line (service name, city, price, "first come first served") and body copy emphasizing exclusivity, time sensitivity, and a "Claim This Lead" CTA. Project value shown before lead cost to anchor value.

### System Design Choices
- **Backend Framework**: Next.js API routes (migrated from Express.js). Legacy server/ directory retains only shared modules still imported by API routes: `server/storage.ts`, `server/db.ts`, `server/resend.ts`, `server/services/emailNotifications.ts`.
- **API Design**: RESTful endpoints with JSON responses via Next.js App Router API routes.
- **Data Validation**: Shared Zod schemas for client and server.
- **Content Management**: All service and geographic data centralized in `shared/contentData.ts`.
- **Build System**: Next.js with TypeScript.
- **Database Schema**: Drizzle ORM configured for PostgreSQL via Neon serverless driver, schema defined in `shared/schema.ts` for a `quotes` table.

## External Dependencies

### UI/UX & Components
- **Radix UI**: Headless accessible components (via shadcn/ui).
- **class-variance-authority**: For component variant management.
- **embla-carousel-react**: Carousel functionality.
- **lucide-react**: Icon library.

### Form & State Management
- **react-hook-form**: Form state and validation.
- **@hookform/resolvers**: Zod resolver for React Hook Form.
- **@tanstack/react-query**: Server state management.

### Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **tailwind-merge & clsx**: For merging CSS classes.

### Data & Validation
- **zod**: Schema validation library.
- **@neondatabase/serverless**: PostgreSQL client.
- **drizzle-orm & drizzle-zod**: ORM and schema validation.

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **@next/third-parties**: Google Analytics integration for Next.js.