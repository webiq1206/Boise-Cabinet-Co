# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site powers 500+ SEO-optimized location pages (8 cities × 60+ service combinations) with unique, city-specific metadata designed to rank #1 in local search results for each service area.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**November 23, 2025 - Comprehensive Customer Email Enhancements**
- **Complete estimate information display**:
  - All customer and admin quote emails now include 100% of quote details
  - Icon (lawn-care-kuna-icon.png) + Logo (lawn-care-kuna-logo.png) displayed side-by-side in header
  - "Your Request Summary" section: primary service, additional services (deduplicated), location, property size/type, frequency, preferred date, contact phone
  - "Property Measurements & Details" section: ALL service-specific measurements with proper units (sq ft, linear feet, zones, etc.)
  - "Detailed Quote Breakdown" section: ALL line items with service names, descriptions, and rounded prices
  - "Total Estimated Investment": Always visible with actual amount OR "Pending Property Assessment" fallback
- **Advanced data normalization (server/email.ts)**:
  - Created `flattenServiceDataWithUnits()` to properly handle nested serviceData structure
  - Automatically looks up field labels and units from SERVICE_FIELD_CONFIGS
  - Numeric values formatted with commas and appropriate units
  - Empty/null values automatically filtered to prevent blank rows
  - Measurements grouped by service for clarity
- **Service deduplication**:
  - Created `deduplicateServices()` with SERVICE_NAME_TO_SLUG mapping
  - Converts human-readable serviceType to slug before comparison
  - Prevents primary service from appearing twice (once as primary, once in additional services)
- **Robust edge case handling**:
  - Property size/type use explicit null/undefined checks (not truthiness) to prevent blank rows with 0 or empty values
  - Service sections only render when measurements exist (no empty headings)
  - Line items display ALL selected services regardless of serviceData availability
  - Graceful fallback messaging when finalQuote is pending/undefined
- **Admin email parity**:
  - Admin notifications now include identical comprehensive details as customer emails
  - Complete quote dataset preserved for business records
  - Fulfills requirement: "absolutely all information from the estimate"

**November 23, 2025 - Professional Email Templates with Brand Assets & Quote Normalization**
- **Complete email template overhaul**:
  - Replaced all generic branding with actual Lawn Care Kuna logo (lawn-care-kuna-logo.png)
  - Updated all URLs to production site (https://lawncarekuna.com) instead of development domains
  - Removed ALL emoji characters from subjects and body content for brand compliance
  - Added complete contact information (phone, address, email, website) to all email footers
- **Quote value normalization (shared/utils.ts)**:
  - Created helper functions to enforce ALL estimates round UP to nearest $5 (roundUpToNearest5, parseAndRoundQuote, formatQuoteForDisplay)
  - All quote totals now stored and displayed as properly rounded numeric values (no strings, no NaN)
  - Defensive "Pending" display instead of $0 when quote values are unavailable in lead notifications
- **Line item transformation for email display**:
  - Built normalizeLineItemsForEmail helper to convert technical format ({serviceId, basePrice, multiplier}) to customer-friendly format ({service, description, price})
  - Service names fetched from SERVICE_RATES (e.g., "lawn-mowing" → "Lawn Mowing")
  - Service descriptions pulled from PRIORITY_SERVICES contentData for consistency
  - All line item prices round UP to nearest $5
  - Line items persisted in normalized format for accurate email breakdowns
- **Server-side quote normalization (server/routes.ts)**:
  - POST /api/quotes route now normalizes finalQuote using parseAndRoundQuote before persistence
  - Line items transformed to email-friendly format before storage
  - Ensures all stored quote data is clean, rounded, and ready for email display
- **Consistent email formatting across ALL senders**:
  - Customer quote emails (sendQuoteNotification): Use formatQuoteForDisplay for proper rounding
  - Admin quote emails: Use formatQuoteForDisplay for consistent formatting
  - Lead notifications (sendNewLeadNotification): Use formatQuoteForDisplay with "Pending" fallback
  - Lead purchase emails (sendLeadPurchaseNotification, sendLeadPurchaseConfirmation): Use formatQuoteForDisplay
- Email system with rate limit protection:
  - 2-second delay between admin and customer quote emails
  - 4-second delay before sending lead notification
  - Prevents Resend "Too many requests" errors (max 2 requests/second)

**November 23, 2025 - Popup-Free Quote Flow & Per-Service Pricing Guidance**
- **Completely popup-free quote experience**:
  - Disabled ALL toast notifications (success AND error) during quote flow
  - Replaced with inline error alerts at top of form (red banner with descriptive message)
  - Users can now complete quotes without any disruptive popups
- Enhanced quote wizard user experience:
  - Fixed scroll behavior: Pages load at top, only scroll to form when clicking "Next"
  - **Per-service pricing dropdowns**: Each service in Step 2 now shows a "Typical Pricing" collapsible dropdown (collapsed by default) with pricing guidance directly from contentData
  - Collapsible calculation explanations: "How is this calculated?" dropdowns under each line item (collapsed by default)
- Added comprehensive legal protection and transparency:
  - "Estimated Total" label with professional disclaimer
  - 30-day quote validity period
  - "Not a contract" disclaimer
  - Detailed "What's Included" section (labor, trimming, disposal, materials)
  - "Potential Additional Costs" section (overgrowth, terrain, utilities, weather)
  - Clear next steps (24-hour contact, free site assessment)
- Calculation transparency:
  - Hedge trimming: Shows "estimated as 40% of lot perimeter"
  - Christmas lights: Shows "roofline with overhang"
  - Fence installation: Shows "lot perimeter"
  - Lawn edging: Shows "lawn perimeter (75% of lot perimeter)"
- All pricing continues to round UP to nearest $5

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
  - **Comprehensive Linear Measurements**: Calculates 4 distinct linear footage metrics (lot perimeter, lawn perimeter, roofline with overhang, estimated hedge length) for accurate pricing of fence, edging, Christmas lights, and hedge trimming services
  - **Service-Specific Auto-Population**: Intelligent measurement mapping ensures each service receives the correct linear footage (fence→lot perimeter, Christmas lights→roofline, hedge trimming→hedge estimate, edging→lawn perimeter)
  - **Intelligent Estimation**: Auto-calculates lawn area and linear features based on city-specific property characteristics (lot sizes, building footprints)
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