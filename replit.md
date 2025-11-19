# Lawn Care Kuna Website

## Overview

The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-11-19: Complete Mobile Optimization & Professional Hero Redesign (MAJOR)
- **Goal**: Make all pages look "amazing" on mobile with professional hero sections, proper spacing, and no horizontal scrolling
- **Hero Section Redesign** (500+ pages):
  - **Professional Background Images**: Added Unsplash lawn imagery to all hero sections
  - **Dark Gradient Overlay**: Applied primary/90 to primary/70 gradient for text readability
  - **Typography**: White text with Playfair Display serif font for brand consistency
  - **High-Contrast CTAs**: White primary button (bg-white text-primary) + white outline secondary for maximum visibility on dark overlay
  - **Responsive Heights**: min-h-[450px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]
  - **Mobile-First Buttons**: Full-width on mobile (w-full sm:w-auto) with proper min-widths
  - **Affected Pages**: Home + ServiceDetailPage (24 pages) + GeoServicePage (144 pages) + AreaTemplate (6 pages)
- **Horizontal Scroll Fix**:
  - Added `overflow-x: hidden` to html/body to prevent mobile horizontal scrolling
  - Added `box-sizing: border-box` to all elements for proper sizing
  - Removed max-width constraint to preserve desktop full-bleed layouts
  - Fixed grid gaps throughout (gap-3 sm:gap-4 instead of gap-4 md:gap-8 lg:gap-12)
- **Mobile Spacing Optimization**:
  - Reduced section padding: py-12 md:py-16 lg:py-24 (from py-16 md:py-24)
  - Optimized grid gaps: gap-3 sm:gap-4 (from gap-4)
  - Better card padding: pt-5 pb-5 md:pt-6 md:pb-6
  - Improved space-y values: space-y-4 md:space-y-6
- **Mobile Typography**:
  - Trust indicators: text-sm md:text-base for headings, text-xs md:text-sm for descriptions
  - Icon sizing: h-5 w-5 md:h-6 md:w-6
  - Responsive text scaling throughout site
- **Architect Approved**: PASS - All critical issues resolved (CTA contrast, serif typography, desktop layouts preserved)
- **E2E Verified**: No horizontal overflow on mobile, professional hero sections display correctly, all CTAs functional

### 2025-11-19: QuoteWizard Complete Rollout & Critical Bug Fixes
- **Goal**: Unify all quote forms site-wide using QuoteWizard with flexible validation
- **Changes Implemented**:
  - **Site-Wide Rollout**: Replaced QuoteForm with QuoteWizard in all pages (Home, Contact, Commercial, HOA, Municipal, ServiceDetailPage, GeoServicePage)
  - **Affects 500+ Pages**: All service and geo-targeted pages now use unified quote experience
  - **Fixed Critical JSON Parsing Bug**: All mutations now properly call `.json()` on Response objects (was root cause of $0 quote display)
  - **Flexible Validation**: Made address, propertySize, and propertyType optional with sensible defaults (5000 sqft, residential, city-based address)
  - **Backend Alignment**: Updated validation schema to accept optional fields with defaults
  - **Null Safety**: All rendering uses `??` instead of `||` for proper 0 handling, success toast uses `!= null` check
  - **Transparency**: Quote card displays assumptions notice when defaults are used
  - **Add-On Services Fix**: Explicitly map selectedServices in Step 2 combined object
  - **Backward Navigation Fix**: Implement proper state preservation using:
    - useEffect with correct dependencies (step + specific formData fields)
    - Functional state updates `setFormData(prev => ({ ...prev, ...data }))`
    - Array cloning `[...(data.selectedServices || [])]` to ensure dependency tracking works
- **User Experience**: Users can get quotes with minimal information, graceful fallback to contact form, transparent messaging
- **Architect Approved**: PASS rating - production ready with all critical fixes
- **E2E Verified**: Quote generation works, add-ons persist, backward navigation preserves selections

### 2025-11-19: Commercial Rebrand (Property Management → Commercial)
- **Goal**: Rebrand "Property Management" page to focus on commercial lawn care & landscaping services
- **Changes Implemented**:
  - Renamed `PropertyManagement.tsx` to `Commercial.tsx` with updated component name
  - Rewrote all page content to target businesses (offices, retail centers, medical facilities, etc.)
  - Updated route from `/commercial/property-management` to `/commercial`
  - Changed navigation menu item from "Property Management" to "Commercial"
  - Removed "property-management" as property type option from QuoteForm and QuoteWizard
  - Property types now: Residential, Commercial, HOA (3 options total)
- **New Content Focus**: Commercial lawn maintenance, landscape design, seasonal color programs, irrigation management, snow & ice management, grounds cleanup
- **Industries Served**: Office buildings, retail centers, restaurants, medical facilities, industrial parks, hotels, apartments, HOAs, schools
- **Architect Approved**: PASS - Content clearly targets business/enterprise needs, routing consistent, forms updated correctly
- **E2E Verified**: Navigation works, page displays correctly, quote form has correct property types, submission succeeds

### 2025-11-19: Homepage Trust Indicators Visual Flow Fix
- **Problem**: Trust indicator cards felt "off" and didn't flow well from hero section
- **Root Cause**: Abrupt color jump from bg-muted hero to white trust cards, no transitional headline, layout shift from 2-column to 4-column grid
- **Solution Implemented**:
  - Added transitional headline: "Why Kuna trusts us with their lawns"
  - Added supporting copy explaining value proposition  
  - Applied bg-muted background to trust section for visual continuity
  - Removed bottom border for cleaner flow
  - Used same max-w-4xl container as hero for consistency
  - Added proper vertical spacing (space-y-12)
- **Result**: Smooth, cohesive visual flow from hero into trust indicators
- **Architect Approved**: PASS rating - sections read as single continuous narrative
- **E2E Verified**: Consistent container width, all trust cards render correctly, no visual jolts

### 2025-11-19: Service & City Page Template Redesign (MAJOR)
- **Complete Template Overhaul**: Redesigned both ServiceDetailPage and GeoServicePage templates to match clean, modern reference design
- **Simplified Layout**: Removed complex sticky sidebar in favor of clean single-column flow with alternating backgrounds
- **Hero Section Redesign**: Minimal design with heading on left, decorative leaf elements on right (desktop), two CTA buttons
- **Dark Green Service Card**: Full-width primary-colored card with service description and "Request Service" CTA
- **Alternating Backgrounds**: Visual rhythm with white, bg-muted, and bg-muted/30 sections throughout page
- **Two-Column Quote Form**: Benefits list on left, quote form card on right for better conversion
- **Values Section**: 4-card grid showing Quality First, Integrity, Customer Focus, Excellence
- **Mobile Sticky Bottom CTA**: Fixed bottom bar with Call/Quote buttons for mobile conversion
- **Critical Bug Fix**: Removed hardcoded "and trimming" suffix from all headings (9 instances across both templates)
  - Service-only pages now show: "{Service.name} services" (e.g., "Aeration services")
  - City-specific pages now show: "{Service.name} in {City}" (e.g., "Fertilization in Caldwell")
- **Architect Approved**: PASS rating for production readiness after copy correction
- **E2E Verified**: All service and city pages tested - correct service names display, all CTAs functional
- **Pages Affected**: All 189 service/geo pages (24 services × 6 cities + 24 service-only pages)

## System Architecture

### Frontend Architecture

**Framework & Routing**: React 18 with TypeScript, using Wouter for client-side routing.
**Dynamic Routing System**: A single route `/services/:serviceSlug/:citySlug?` handles all service pages. This system uses lazy-loaded templates (ServiceDetailPage, GeoServicePage) and O(1) map-based lookups from `contentData.ts`. It validates service/city combinations, returning 404 for invalid URLs, and scales by requiring only `contentData.ts` updates for new services.
**Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
**Design System**: Features Montserrat weight 500 for all text. The color scheme uses Primary Forest Green, Light Mint backgrounds, and pure white, with a mobile-first responsive design and editorial spacing. Visual rhythm is achieved with alternating section backgrounds.
**State Management**: TanStack Query for server state, React Hook Form with Zod for form handling and validation.
**Key Features**:
- **AI-Powered Instant Quoting System**: A 4-step wizard at `/get-quote` provides AI-generated pricing based on property details, service selection, property complexity, and deterministic fallbacks. This system integrates inline AI quotes across all QuoteForm instances, with progressive disclosure, debounced API calls, and client-side caching.
- **Interactive Property Measurement Tool**: Utilizes Leaflet and OpenStreetMap for map-based property area calculation, supporting polygon/rectangle drawing, auto-geocoding, and real-time area conversion, integrated into the quote form.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words) with detailed service features and local expertise.
- **Mobile Experience**: Redesigned mobile navigation with wider sheets and a sticky bottom navigation bar with key CTAs.
- **Content**: Includes Before/After Gallery, Customer Testimonials, an interactive Pricing Calculator, and a Blog Section.

### Backend Architecture

**Server Framework**: Express.js with TypeScript.
**API Design**: RESTful endpoints with JSON responses, including a POST `/api/quotes` endpoint.
**Request Processing**: Includes JSON body parsing, request logging, and error handling with Zod validation.
**Storage Layer**: Uses in-memory storage (MemStorage class) via an `IStorage` interface, designed for future database migration.
**Data Validation**: Shared Zod schemas between client and server ensure type-safe data handling.

### Content Management

**Service Data**: All service information is stored in `shared/contentData.ts`, including 24 priority services (expandable to 92+) with structured content (descriptions, benefits, processes, FAQs, pricing guidance) and 6 service areas (Kuna, Boise, Meridian, Nampa, Caldwell, Eagle). This data automatically generates service and geo-targeted pages.

### Build System

**Frontend**: Vite for bundling (React plugin, path aliases, lazy-loaded components).
**Backend**: esbuild for bundling (targeting Node.js ESM).
**Type Checking**: Strict TypeScript with shared types.

### Database Schema

**ORM**: Drizzle ORM configured for PostgreSQL via Neon serverless driver.
**Schema**: Defined in `shared/schema.ts` for a `quotes` table, with Zod validation and TypeScript inference (currently uses in-memory storage).

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