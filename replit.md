# Boise Cabinet Co Website

## Overview
The Boise Cabinet Co website is a marketing and lead-generation platform for a Boise, Idaho custom cabinetry company. The site serves homeowners, builders, and contractors in the Treasure Valley (Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell) planning custom kitchen cabinets, bathroom vanities, and built-in storage (laundry, mudroom, office, closets, garage, entertainment centers). Key features include an instant estimate calculator (project type + finish level + size → animated price range), a browsable product catalog with a downloadable branded catalog PDF, a consultation request form, a blog and guide library, and a B2B lead distribution marketplace for trade partners.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, permanently dark. Montserrat (`font-sans`) for all headings and body text; the serif (Libre Baskerville, `font-serif`) is reserved exclusively for decorative accents: italic emphasis words via `.brc-accent` and display numerals via `.brc-display-num`. Do not apply `font-serif` to heading elements. Text is capped at weight 400.
- **Color Palette**: Charcoal ground (`#1C1F1E`), bone headings (`#F7F5F3`) and text (`#E6E3DE`), teal accent (`#7AAAAA`) used for heading emphasis and rules only (never filled buttons). Primary CTAs are bone-on-charcoal. See `design_guidelines.md` and `app/globals.css` for the authoritative tokens.
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Homepage**: 12-section single-page marketing layout: Hero → Trust Strip → Founder Note → Inspiration Gallery → Estimate Calculator → Below-Calculator Cards → How We Build → Principles → Financing/Guarantee → Founding Clients → FAQ Accordion → Consultation Form.
- **Founding Spots**: `FOUNDING_SPOTS_REMAINING` constant in `shared/contentData.ts` — update manually as spots fill.
- **Mobile Navigation**: Sticky bottom bar with "Call" and "Begin a conversation" links. Desktop nav has logo, anchor links, phone with pulsing green dot, and "Book a free visit" CTA.

### Technical Implementations
- **Frontend Framework**: Next.js 14 (App Router) with React 18 and TypeScript.
- **Instant Estimate Calculator**: Client component (`EstimateCalculator.tsx`) — project type cards + finish level cards + size preset → animated price range, typically-included list, ROI, and disclaimer. Saves estimate to sessionStorage for form pre-fill.
- **Consultation Form**: Client component (`ConsultationForm.tsx`) — reads sessionStorage estimate, collects name/phone/email/zip/project/message, posts to `/api/consultation`, sends admin notification + customer confirmation via Resend.
- **FAQ Section**: Client component (`FAQSection.tsx`) — Radix Accordion with 9 Q&As.
- **Lead Distribution System**: B2B lead marketplace with admin dashboard, subcontractor portal, privacy protection, automated lead pricing, legal agreement flow, and in-app notifications. Integrates with Stripe for payments and supports an account credits system.
- **Blog System**: Infrastructure kept but no posts yet — `shared/blogContent.ts` has empty `BLOG_POSTS` array.
- **Email**: Resend integration, `hello@boisecabinet.co` as from/reply-to address and the sole admin recipient/account for the site and all portals.
- **Outreach deliverability webhook**: `app/api/outreach/webhook/route.ts` receives Resend events, verifies the Svix signature with the `RESEND_WEBHOOK_SECRET` secret (global; covers dev + deploy), and on `email.bounced`/`email.complained` adds the address to `outreachSuppressions` (reason `bounce`/`complaint`) and marks the matching prospect `bounced`/`unsubscribed` so it leaves the send queue. Configure the Resend webhook to point at the APP domain (`https://boisecabinet.co/api/outreach/webhook`), NOT the `outreach.boisecabinet.co` email subdomain — that subdomain only has Resend email (MX/sending) DNS, has no web record, so HTTPS webhook calls to it fail and Resend auto-disables the endpoint. Subscribe it to those two events; the signing secret (`whsec_...`) is the `RESEND_WEBHOOK_SECRET` value.
- **Service Areas**: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell (Ada + Canyon County).
- **Services**: Custom cabinetry for kitchens, bathrooms/vanities, laundry, mudroom/entry, home office, closets/storage, garage/utility, entertainment centers/built-ins, and whole-home cabinet programs, plus builder and contractor cabinet supply.

### System Design Choices
- **Backend Framework**: Next.js API routes.
- **Database Schema**: Drizzle ORM for PostgreSQL via Neon serverless driver. Tables: `quotes`, `leads`, `users`, `sessions`, `leadPurchases`, `creditTransactions`, `notifications`, `siteSettings`, `consultationRequests`, `blogPosts`, `galleryPhotos`, `testimonials`.
- **Content Management**: Services and cities centralized in `shared/contentData.ts`. `FOUNDING_SPOTS_REMAINING` constant also lives there.
- **Build System**: Next.js with TypeScript.

## Image performance & compression
- **Static image variants (no runtime optimizer)**: Catalog/marketing images are pre-rendered into fixed-width WebP variants by `scripts/images/build-image-variants.mjs` (manifest: `shared/generated/imageVariants.ts`) and served by a custom `next/image` loader (`lib/images/staticVariantLoader.ts`, wired via `images.loaderFile` in `next.config.js`). This bypasses Next's on-demand optimizer, whose cache is per-instance/ephemeral on autoscale and caused slow image loads after each deploy. Regenerated automatically in `catalog:build` and `prebuild`.
- **Instant placeholders**: Non-hero catalog photos use tiny base64 LQIP blur placeholders (`scripts/images/build-blur-manifest.mjs` -> `shared/generated/imageBlur.ts`, applied in `CatalogImage`). Heroes render real pixels with `priority` and no blur; finish swatches paint their hex color instantly.
- **Compression**: `compress: true` in `next.config.js` makes the standalone Node server gzip text responses (HTML/JS/CSS/JSON and the SVG cabinet/door diagrams in `public/generated`). This does NOT shrink already-compressed WebP/PNG/JPEG. For better text compression, enable **brotli at the Replit autoscale edge** if available; gzip is the in-app floor. Static images carry long-lived `Cache-Control: public, max-age=31536000, immutable` via `headers()`.

## External Dependencies
- **Radix UI**: Headless accessible components (via shadcn/ui).
- **react-hook-form** + **@hookform/resolvers**: Form state and Zod validation.
- **@tanstack/react-query**: Server state management.
- **Tailwind CSS**: Utility-first CSS framework.
- **zod**: Schema validation.
- **@neondatabase/serverless** + **drizzle-orm**: Database ORM.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **Resend**: Transactional email.
- **Stripe**: Payments for the lead marketplace.
- **Montserrat** + **Libre Baskerville** (italic accent only): Google Fonts (loaded via `next/font/google`).

## Publish checklist (database diff)

Replit's Republish compares the development database with the production
database and proposes a migration for the difference. Production tables that
this app creates for itself at runtime (for example `estimator_sessions`)
exist in production but not in a development database that has never run the
app, so Replit proposes `DROP TABLE` for them. Never approve a DROP.

After every `git pull`, before Republish, sync the development database to the
schema in shared/schema.ts (drizzle):

    npm run db:push

Then Republish. The migration step should report no changes, or only the
additive changes you expect.
