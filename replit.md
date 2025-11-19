# Lawn Care Kuna Website

## Overview

The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services across the Treasure Valley. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-01-19: "Absolutely Perfect" Design & UX Completion (MAJOR - Tasks 1-8 ✅)
- **Comprehensive Redesign**: Completed 8-phase redesign bringing all 189 service/geo pages to "absolutely perfect" standard
- **Phase 1 - Design System Foundation**: Editorial spacing (py-16 sections), wide containers (max-w-7xl), responsive typography, 44px mobile touch targets
- **Phase 2 - Brand Color Integration**: Alternating mint/white section backgrounds for visual rhythm across all pages
- **Phase 3 - Desktop Two-Column Layout**: Sticky sidebar with functional CTAs (lg:sticky lg:top-24) for consistent conversion opportunities
- **Phase 4 - Mobile Sticky Bottom CTA**: Fixed bottom bar with Call/Schedule CTAs on all mobile viewports (z-index 50, safe-area-inset)
- **Phase 5 - Hero Section Redesign**: Two-column layout matching reference image with decorative SVG elements, functional CTA card
- **Phase 6 - Conversion Optimization**: 8-touchpoint funnel (hero CTA, trust bar, sidebar CTAs, mid-content CTAs, mobile sticky, FAQ links)
- **Phase 7 - Complete Instrumentation**: Added data-testid attributes to ALL interactive elements (CTAs, links, breadcrumbs, service cards)
- **Phase 8 - Design System Compliance**: Removed ALL manual hover overrides (hover:bg-*, hover:text-*), rely on Shadcn built-in behaviors and hover-elevate utility
- **Breadcrumb Fix**: Refactored breadcrumbs to use hover-elevate instead of manual hover:text-foreground override
- **Architect Verification**: Multiple review cycles with PASS rating confirming production readiness
- **Pages Affected**: All 27 service pages + 162 geo-targeted pages = 189 total pages "absolutely perfect"

### 2025-01-19: Dynamic Service Routing Architecture (MAJOR)
- **Scalable Data-Driven Routing**: Implemented hybrid dynamic routing system replacing 70+ manual imports/routes
- **DynamicServiceRoute Component**: Single component handles all service pages via `/services/:serviceSlug/:citySlug?` pattern
- **O(1) Lookups**: Added SERVICE_SLUG_MAP and CITY_SLUG_MAP to contentData.ts for instant lookups
- **Lazy Loading**: Templates (ServiceDetailPage, GeoServicePage) lazy-loaded with Suspense for optimal code splitting
- **Validation System**: getCityServiceCombo() validates service/city combinations, returns 404 for invalid URLs
- **Content Expansion**: Added 4 new services (christmas-light-installation, lawn-renovation, tree-removal, stump-grinding)
- **Total Reach**: 24 services × 6 cities = 168 total pages via dynamic routing (was 44 manual pages)
- **Scalability Proven**: Adding new services now requires ONLY updating contentData.ts - zero routing changes
- **Testing Verified**: All dynamic routes working, 404s correct, SEO preserved, performance improved via code splitting
- **Architect Approved**: Implementation received PASS rating for production readiness

### 2025-01-19: Typography & Navigation Fixes
- **Montserrat Font Migration**: Updated ALL text (headings, body, buttons, labels) to use Montserrat font family with weight 500
- **Font Import**: Added Google Fonts import for Montserrat weight 500 in client/index.html
- **CSS Override**: Applied !important flags globally to ensure Montserrat weight 500 overrides all other font specifications
- **Universal Application**: Used CSS universal selector (*) to apply Montserrat 500 to every text element site-wide
- **Navigation Bug Fixes**: Eliminated all nested anchor tag warnings by refactoring Link components
  - Navigation.tsx: Changed "Free Consultation" buttons from Button+Link nesting to standalone Button with onClick navigation
  - Service pages (Landscaping, PatioInstallation, LawnMowing, PondInstallation): Replaced Link > <a> patterns with Link > <span> for related services and category links
- **Testing**: Verified all text uses Montserrat 500 and all navigation works correctly without console warnings

### 2025-01-19: Site-Wide AI Quote Integration
- **Inline AI Quotes Across All Pages**: Integrated AI-powered instant quotes into all QuoteForm instances (city pages, service pages, contact page) for maximum conversion with zero navigation friction
- **Progressive Disclosure**: AI quotes display inline as users fill forms - show instant pricing while entering property details (service type, property type, size, city) with no submission required
- **Debounced Calculation**: 1.5-second debounce on AI quote API calls to reduce redundant requests as users type
- **Client-Side Caching**: LRU cache (10-minute TTL, v2 keyed with `ai-quote-v2:` prefix) reduces API costs by caching identical quote parameters
- **Backend Safeguards**: Quote caching middleware and rate limiting (5 requests/min per IP, 20/min global) to control OpenAI spend
- **Feature Flag**: Global AI quote toggle (`VITE_ENABLE_AI_QUOTES`) with graceful fallback to basic estimation
- **Critical Bug Fix**: Fixed API response parsing - apiRequest returns Response object requiring `.json()` call before caching
- **Cache Versioning**: Added `ai-quote-v2` prefix to bust old cached structures after response format changes
- **User Flow**: Quote displays BEFORE form submission (inline during filling) to reduce friction and maximize conversions

## System Architecture

### Frontend Architecture

**Framework & Routing**: React 18 with TypeScript, using Wouter for client-side routing with dynamic data-driven service pages.

**Dynamic Routing System**: 
- **Pattern**: Single route `/services/:serviceSlug/:citySlug?` handles all service pages
- **Components**: DynamicServiceRoute component with lazy-loaded templates (ServiceDetailPage, GeoServicePage)
- **Lookup System**: O(1) Map-based lookups via SERVICE_SLUG_MAP and CITY_SLUG_MAP from contentData.ts
- **Validation**: getCityServiceCombo() validates combinations, returns 404 for invalid service/city pairs
- **Scalability**: Adding services requires only updating contentData.ts - zero code changes to routing
- **Current Reach**: 24 services × 6 cities = 168 total pages automatically generated
**Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS for styling.
**Design System**: Features Montserrat weight 500 for ALL text (headings, body, buttons, labels). The color scheme aligns with the actual Lawn Care Kuna brand: Primary Forest Green (#2D6B3F), Light Mint backgrounds (#E5F5EC), and pure white. It uses a mobile-first responsive design with editorial spacing.
**State Management**: TanStack Query for server state, React Hook Form with Zod for form handling and validation, and React hooks for local component state.
**Key Features**:
- **AI-Powered Instant Quoting System**: A 4-step wizard at `/get-quote` includes property details, service selection, AI-generated pricing (with AI analysis of property complexity and deterministic fallbacks), and booking. Pricing is based on industry standards, property type, and service frequency, targeting 40-50% profit margins.
- **Interactive Property Measurement Tool**: Utilizes Leaflet and OpenStreetMap for free, map-based property area calculation, supporting polygon and rectangle drawing, auto-geocoding, and real-time area conversion. Integrates seamlessly into the quote form.
- **SEO Optimization**: Comprehensive, E-E-A-T optimized city-specific pages (2000+ words per city) with detailed service features and local expertise.
- **Mobile Experience**: Redesigned mobile navigation with professional styling, wider sheets, and a sticky bottom navigation bar with key CTAs (Services, Call, Schedule).
- **Visual Polish**: Alternating section backgrounds for visual rhythm and a redesigned homepage hero section with a clean, approachable aesthetic.
- **Enhanced Content**: Before/After Gallery, Customer Testimonials with star ratings, an interactive Pricing Calculator, and a Blog Section with relevant guides.

### Backend Architecture

**Server Framework**: Express.js with TypeScript.
**API Design**: RESTful endpoints with JSON responses, including a POST `/api/quotes` endpoint for quote submissions.
**Request Processing**: Includes JSON body parsing, request logging, and robust error handling with Zod validation.
**Storage Layer**: Currently uses in-memory storage (MemStorage class) via an `IStorage` interface, designed for easy future migration to a database.
**Data Validation**: Shared Zod schemas between client and server ensure type-safe data handling and validation.

### Content Management

**Service Data**: All service information stored in `shared/contentData.ts`:
- **24 Priority Services**: Currently includes lawn care (mowing, aeration, fertilization, etc.), landscaping (patios, retaining walls, fire pits, etc.), irrigation, tree services, and Christmas lights
- **Structured Content**: Each service has 900-1000 words including longDescription, 8 benefits, 6-step process, 5-6 FAQs, pricing guidance, and seasonality
- **Target**: Expand to 92+ services for comprehensive coverage
- **6 Service Areas**: Kuna (primary), Boise, Meridian, Nampa, Caldwell, Eagle
- **Automatic Page Generation**: Dynamic routing creates service pages and geo pages automatically for all service/city combinations

### Build System

**Frontend**: Vite for bundling, with React plugin, path aliases, lazy-loaded components via React.lazy(), and production output to `dist/public`.
**Backend**: esbuild for bundling, targeting Node.js ESM, with output to `dist/`.
**Type Checking**: Strict TypeScript with shared types via path aliases.

### Database Schema (Prepared)

**ORM**: Drizzle ORM configured for PostgreSQL via Neon serverless driver.
**Schema**: Defined in `shared/schema.ts` for a `quotes` table (id, name, email, phone, serviceType, propertyType, propertySize, city, message, createdAt), with Zod validation and TypeScript inference. The schema is defined but currently uses in-memory storage.

## External Dependencies

### UI/UX & Components
- **Radix UI**: Headless accessible components (via shadcn/ui).
- **class-variance-authority**: For component variant management.
- **cmdk**: Command menu component.
- **embla-carousel-react**: Carousel functionality.
- **lucide-react**: Icon library.
- **leaflet, react-leaflet, leaflet-draw, leaflet-geosearch**: For map-based property measurement.

### Form & State Management
- **react-hook-form**: Form state and validation.
- **@hookform/resolvers**: Zod resolver for React Hook Form.
- **@tanstack/react-query**: Server state management.

### Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **tailwind-merge & clsx**: For merging CSS classes.
- **PostCSS & Autoprefixer**: CSS processing.

### Data & Validation
- **zod**: Schema validation library.
- **@neondatabase/serverless**: PostgreSQL client (configured, not active).
- **drizzle-orm & drizzle-zod**: ORM and schema validation (configured, not active).

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **wouter**: Lightweight client-side routing.

### Development Tools
- **Vite & esbuild**: Build tools.
- **TypeScript**: Type checking and compilation.
- **Replit-specific plugins**: `vite-plugin-runtime-error-modal`, `vite-plugin-cartographer`, `vite-plugin-dev-banner`.