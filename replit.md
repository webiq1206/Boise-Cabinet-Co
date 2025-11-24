# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site powers 500+ SEO-optimized location pages with unique, city-specific metadata designed to rank #1 in local search results for each service area.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### November 24, 2025 - Services Mega Menu Redesign
**Navigation Enhancement**: Transformed the Services dropdown navigation from a plain text-based menu into a beautiful, modern mega menu with enhanced visual hierarchy and interactive elements.

**Key Improvements**:
- **4-Column Card Layout**: Each service category now displayed in a visually distinct card with background, border, and rounded corners
- **Category Icons**: Added lucide-react icons to each category for better visual recognition:
  - Scissors icon for Lawn Care
  - TreeDeciduous icon for Landscaping
  - Sparkles icon for Seasonal services
  - Building2 icon for Commercial services
- **Enhanced Hover Effects**: Service links now show animated arrow icons and color transitions on hover
- **Visual Hierarchy**: Icon badges with primary color backgrounds, bold category headings, and better spacing
- **"View All Services" CTA**: Added prominent call-to-action button at bottom linking to full services page
- **Testing Instrumentation**: All interactive elements include proper data-testid attributes for testing

**Files Updated**:
- Navigation.tsx - Complete mega menu redesign with 4-column card layout and icon system

**Testing**: E2E test confirmed all mega menu functionality including hover effects, navigation to service pages, and "View All Services" CTA works correctly.

### November 24, 2025 - Service Area Finalization
**Service Area Update**: Completed comprehensive removal of Nampa and Caldwell from all user-facing content across the website. The service area is now strictly limited to **6 cities only**: Kuna, Boise, Meridian, Eagle, Star, and Middleton.

**Files Updated** (18 total):
- ServiceAreaMap.tsx - Updated cities array
- AreaTemplate.tsx - Updated city list in template
- ServiceDetailPage.tsx - Removed from service area sections
- QuoteForm.tsx & QuoteWizard - Updated city dropdown options
- NearMeFAQ.tsx - Updated FAQ text
- All service pages (ChristmasLights, LawnMowing, FenceInstallation, IrrigationInstallation, PatioInstallation, PondInstallation)
- About.tsx, Contact.tsx, Services.tsx, TermsOfService.tsx
- HOAServices.tsx - Commercial page update

**Note**: Canyon County Assessor API integration code (lib/assessors/) intentionally preserved as Middleton is located in Canyon County and requires this API access for property measurement features.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, Montserrat font, Primary Forest Green, Light Mint backgrounds, pure white.
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Visuals**: Service-specific hero backgrounds, consistent typography, redesigned mobile navigation with sticky bottom bar.
- **Content Layout**: Clean, modern look with simplified layouts, alternating backgrounds, two-column quote forms, and scannable content sections with proper heading hierarchy.
- **Interactive Elements**: Interactive FAQ accordions, an interactive property measurement tool, and a site-wide search function with autocomplete.
- **Accessibility**: WCAG AA compliant with visible focus states (2px outlines), 4.5:1 color contrast ratios, proper ARIA labels, keyboard navigation support, and semantic HTML throughout.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Routing**: Wouter for client-side routing, using dynamic `/services/:serviceSlug/:citySlug?` routes with route-level code splitting.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Performance Optimization**: Route-level code splitting dramatically reduces initial JS bundle size for faster mobile performance.
- **Multi-Service Quote System**: A 4-step intelligent wizard (QuoteWizard) supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation.
- **Intelligent Property Calculator**: Production-ready automated property measurement system querying Ada County Assessor parcel database API via schoolsitelocator.com MapServer. Features include address normalization, multi-county support, fuzzy city matching, robust address parsing, multiple property selection, enhanced error messages, city context integration, auto-population, clean state management, comprehensive linear measurements, service-specific auto-population, intelligent estimation, and manual adjustment.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), site-wide internal linking, SEO-optimized headings and FAQs. Includes `robots.txt`, `sitemap.xml`, and `llms.txt`. Features city-specific metadata, URL-safe canonicals, smart title generation, and crawler-friendly defaults.
- **Dynamic Content**: Navigation and footer automatically display all services and service areas from `contentData.ts`.
- **Mobile Navigation**: Sticky bottom navigation with quick access to services, quotes, and scheduling.
- **Site-Wide Search**: Real-time autocomplete search in header for services, areas, and main pages.
- **Lead Distribution System**: A B2B lead marketplace with admin dashboard, subcontractor portal, privacy protection, automated lead pricing, legal agreement flow, and in-app notifications. Integrates with Stripe for payments.
- **Blog System**: Implemented with category organization, posts seeded from `shared/blogContent.ts`, and a category-organized blog page UI (client/src/pages/Blog.tsx) with responsive grid and detailed post cards.
- **Customer Email Enhancements**: Comprehensive estimate information display in customer and admin quote emails, including full quote details, brand assets, and detailed breakdowns. Advanced data normalization and service deduplication are implemented for clarity.
- **Professional Email Templates**: Overhauled email templates with actual Lawn Care Kuna logo, production URLs, removed emojis, added complete contact information, and implemented quote value normalization (rounding up to the nearest $5).
- **Popup-Free Quote Flow**: Replaced all toast notifications with inline error alerts for a non-disruptive quote experience. Enhanced quote wizard with per-service pricing dropdowns and comprehensive legal protection and transparency.

### System Design Choices
- **Backend Framework**: Express.js with TypeScript.
- **API Design**: RESTful endpoints with JSON responses.
- **Data Validation**: Shared Zod schemas for client and server.
- **Storage Layer**: Uses an in-memory `MemStorage` via an `IStorage` interface, designed for future database migration.
- **Content Management**: All service and geographic data centralized in `shared/contentData.ts`.
- **Build System**: Vite for frontend, esbuild for backend, strict TypeScript.
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
- **wouter**: Lightweight client-side routing.