# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site powers 500+ SEO-optimized location pages (8 cities × 60+ service combinations) with unique, city-specific metadata designed to rank #1 in local search results for each service area.

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
- **Frontend Framework**: React 18 with TypeScript.
- **Routing**: Wouter for client-side routing, using dynamic `/services/:serviceSlug/:citySlug?` routes with route-level code splitting via React.lazy() and Suspense.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Performance Optimization**: Route-level code splitting dramatically reduces initial JS bundle from ~6-7MB to <1MB for faster mobile performance. All 25+ routes lazy-loaded on demand.
- **Multi-Service Quote System**: A 4-step intelligent wizard (QuoteWizard) supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation.
- **Intelligent Property Calculator**: Production-ready automated property measurement system that replaces manual map drawing. Queries Ada County Assessor parcel database API via schoolsitelocator.com MapServer Layer 131 (ADDCONCAT, CITY, PARCEL fields). Key features:
  - **Address Normalization**: Automatically converts user-friendly addresses to database format (NORTH→N, AVENUE→AVE, etc.) ensuring reliable matches regardless of how users type addresses
  - **Multi-County Support**: Intelligent routing between Ada County (Kuna, Boise, Meridian, Eagle, Star) and Canyon County (Nampa, Caldwell, Middleton) with automatic fallback
  - **Fuzzy City Matching**: Levenshtein distance algorithm (≤2 edits) handles misspellings like "MERIDAN"→"MERIDIAN"
  - **Robust Address Parsing**: Supports 3 formats (comma-separated, space-separated, street-only with wizard context)
  - **Smart LIKE Fallback**: When exact match fails, strips trailing city/ZIP tokens before partial matching
  - **Multiple Property Selection**: RadioGroup UI when addresses are ambiguous
  - **Enhanced Error Messages**: Specific errors with actionable user suggestions
  - **City Context Integration**: Uses wizard-selected city as fallback for street-only inputs
  - **Auto-Population**: Address field automatically fills with user's prior input from quote wizard
  - **Clean State Management**: Dialog backdrop preserves user data, Cancel button resets state
  - **Intelligent Estimation**: Auto-calculates lawn area based on city-specific property characteristics (lot sizes, building footprints)
  - **Manual Adjustment**: Users can override automated measurements
  - **Graceful Degradation**: Canyon County displays helpful error messages (no public API available) suggesting manual entry
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), site-wide internal linking, SEO-optimized headings and FAQs. Includes `robots.txt`, `sitemap.xml`, and `llms.txt`.
  - **City-Specific Metadata**: Every service-in-city page uses unique titles (e.g., "Lawn Mowing in Meridian | Lawn Care Meridian Idaho") and descriptions (e.g., "Meridian's top-rated lawn mowing service...") for maximum local SEO.
  - **URL-Safe Canonicals**: Canonical URLs use city slugs (`/services/lawn-mowing/meridian`) for proper indexing.
  - **Smart Title Generation**: Prevents keyword duplication (e.g., "Idaho Idaho") while staying under 60 characters.
  - **Crawler-Friendly Defaults**: Base index.html includes default meta tags for non-JavaScript crawlers, overridden by React Helmet on each page.
  - **SPA Limitation**: As a Single Page Application, meta tags update client-side via React Helmet. For perfect PageSpeed SEO scores (100/100), server-side rendering or static prerendering would be required.
- **Dynamic Content**: Navigation and footer automatically display all services and service areas fetched from `contentData.ts`.
- **Mobile Navigation**: Sticky bottom navigation with quick access to services, quotes, and scheduling.
- **Site-Wide Search**: Real-time autocomplete search in header for services, areas, and main pages.
- **Lead Distribution System**: A B2B lead marketplace with admin dashboard for review, subcontractor portal for purchasing leads, privacy protection (contact masking), automated lead pricing (10% of quote value, daily reductions), legal agreement flow, and in-app notifications. Integrates with Stripe for payments.

### System Design Choices
- **Backend Framework**: Express.js with TypeScript.
- **API Design**: RESTful endpoints with JSON responses.
- **Data Validation**: Shared Zod schemas for client and server.
- **Storage Layer**: Uses an in-memory `MemStorage` via an `IStorage` interface, designed for future database migration.
- **Content Management**: All service and geographic data centralized in `shared/contentData.ts`.
- **Build System**: Vite for frontend (React plugin, path aliases, lazy-loading), esbuild for backend (Node.js ESM), strict TypeScript.
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