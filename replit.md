# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is an online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its main purpose is to provide service information, facilitate quote requests, and enhance local SEO. Key features include an AI-powered quoting system, an interactive property measurement tool, a lead distribution platform, and a comprehensive content management system for services, project galleries, testimonials, and blogs. The site includes 500+ SEO-optimized location pages designed for top rankings in local search results.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, Montserrat font, specific color palette (Forest Green, Mint, White).
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Visuals**: Service-specific hero backgrounds, consistent typography, redesigned mobile navigation.
- **Content Layout**: Clean, modern layouts with alternating backgrounds, two-column quote forms, and scannable content.
- **Interactive Elements**: FAQ accordions, property measurement tool, site-wide search with autocomplete.
- **Accessibility**: WCAG AA compliant with visible focus states, 4.5:1 color contrast, ARIA labels, keyboard navigation, and semantic HTML.

### Technical Implementations
- **Frontend Framework**: Next.js 14 (App Router) with React 18 and TypeScript.
- **Routing**: Next.js file-based routing with dynamic segments.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Performance Optimization**: Route-level code splitting.
- **Multi-Service Quote System**: A 4-step intelligent wizard supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation, filtered by Idaho Treasure Valley seasonality. Recurring-eligible services have per-service frequency selection.
- **Service Seasonality System**: Configurable season windows and recurring eligibility for services based on Idaho USDA Zone 6b-7a climate. The quote wizard dynamically filters service displays by season.
- **Server-Side Lead Pricing**: Quote API calculates per-service prices from measurement data using defined rates, not client-sent totals. Lead prices are 10% of total estimate (midpoint of range), with a $5 min/$50 max, rounded to nearest $5, and apply a daily price decay of 1.5% with a 20% floor.
- **Intelligent Property Calculator**: Automated property measurement system querying Ada County Assessor parcel data, including address normalization, multi-county support, and intelligent estimation.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), comprehensive internal linking, SEO-optimized headings and FAQs, `robots.txt`, `sitemap.xml`, and `llms.txt`. Includes city-specific metadata, URL-safe canonicals, smart title generation, and Google Analytics 4 integration. AI-friendly `llms.txt` and SpeakableSpecification JSON-LD for voice search.
- **Dynamic Content**: Navigation and footer automatically display services and service areas from `contentData.ts`.
- **Mega Menu Navigation**: Organized into 4 service columns with category icons for desktop and collapsible categories for mobile.
- **Mobile Navigation**: Sticky bottom navigation for quick access.
- **Site-Wide Search**: Real-time autocomplete search for services, areas, and main pages.
- **Lead Distribution System**: B2B lead marketplace with admin dashboard, subcontractor portal, privacy protection, automated lead pricing, legal agreement flow, and in-app notifications. Integrates with Stripe for payments and supports an account credits system. Features lead purchase exclusivity and auto-archival for unpurchased leads older than 7 days.
- **Testimonials System**: Scrolling marquee component with branded gradient cards, pause on hover, and fade edge overlays, displaying 60 sample reviews across cities and services.
- **Blog System**: Category-organized blog with seeded posts and a responsive grid UI.
- **Customer Email Enhancements**: Comprehensive estimate information display in customer and admin quote emails, including detailed breakdowns, brand assets, and per-service frequency displays.
- **Professional Email Templates**: Overhauled email templates with brand logo, production URLs, contact information, and quote value normalization.
- **Popup-Free Quote Flow**: Replaced toast notifications with inline error alerts and enhanced quote wizard with per-service pricing dropdowns.
- **Duplicate Lead Prevention**: Server-side deduplication with HMAC-SHA256 edit tokens and 7-day TTL. Wizard renders inline alerts for existing quotes allowing updates or contact. Subcontractor portal and admin dashboard show badges for possible duplicates and updated leads.
- **Lead Display Titles**: Lead card titles in admin and subcontractor portals display the most expensive service first, showing multi-service leads concisely (e.g., "Lawn Renovation + 4 more").
- **Subcontractor Lead Email Urgency**: New-lead notifications emphasize urgency, exclusivity, and time sensitivity with a "Claim This Lead" CTA.

### System Design Choices
- **Backend Framework**: Next.js API routes.
- **API Design**: RESTful endpoints with JSON responses.
- **Data Validation**: Shared Zod schemas for client and server.
- **Content Management**: All service and geographic data centralized in `shared/contentData.ts`.
- **Build System**: Next.js with TypeScript.
- **Database Schema**: Drizzle ORM for PostgreSQL via Neon serverless driver, with a `quotes` table schema defined in `shared/schema.ts`.

## External Dependencies

### UI/UX & Components
- **Radix UI**: Headless accessible components.
- **class-variance-authority**: Component variant management.
- **embla-carousel-react**: Carousel functionality.
- **lucide-react**: Icon library.

### Form & State Management
- **react-hook-form**: Form state and validation.
- **@hookform/resolvers**: Zod resolver for React Hook Form.
- **@tanstack/react-query**: Server state management.

### Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **tailwind-merge & clsx**: CSS class merging.

### Data & Validation
- **zod**: Schema validation.
- **@neondatabase/serverless**: PostgreSQL client.
- **drizzle-orm & drizzle-zod**: ORM and schema validation.

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **@next/third-parties**: Google Analytics integration for Next.js.