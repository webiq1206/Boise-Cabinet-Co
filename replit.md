# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Framework & Routing**: React 18 with TypeScript, using Wouter for client-side routing.
**Dynamic Routing System**: A single route `/services/:serviceSlug/:citySlug?` handles all service pages using lazy-loaded templates and O(1) map-based lookups from `contentData.ts`. It validates service/city combinations and scales efficiently.
**Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
**Design System**: Montserrat weight 500, Primary Forest Green, Light Mint backgrounds, pure white, mobile-first responsive design, and editorial spacing with alternating section backgrounds.
**State Management**: TanStack Query for server state, React Hook Form with Zod for form handling and validation.
**Key Features**:
- **Multi-Service Quote System (PRODUCTION READY)**: A 4-step intelligent wizard at `/get-quote` supports multiple service selection with service-specific measurement collection and itemized pricing. Features include:
  - Service-aware field rendering: Lawn services collect property size (sq ft), Christmas lights collect linear footage, irrigation collects zones, patios collect dimensions + materials
  - Multi-service selection via checkboxes with dynamic field visibility based on selected services
  - Robust number validation using Number.isFinite() to prevent serialization bugs
  - Service-specific pricing calculations: sqft, linear_ft, per_zone, per_tree, per_fixture, per_stump, per_sqft, base_service, base_project
  - Itemized quote breakdown showing individual line items with descriptions and grand total
  - Conditional propertySize inclusion (only sent when valid finite number exists)
  - Backend reads measurements from serviceData[serviceId] for each service independently
  - Comprehensive validation and error handling with console warnings for debugging
  - End-to-end tested with mixed service types (lawn + lights + irrigation) and regression tested for non-property-size services
- **Interactive Property Measurement Tool (ENHANCED)**: Dual-mode measurement system utilizing Leaflet and OpenStreetMap integrated into the quote form:
  - **Area Mode** (default): Polygon/rectangle drawing for property size calculations with real-time sq ft conversion to acres. Used for lawn care, landscaping, and similar services.
  - **Linear Mode**: Polyline drawing for measuring fence lines, roof perimeters, driveway edges, and other linear features with real-time feet conversion to miles. Used for fence installation, Christmas lights, and similar services.
  - Features: Auto-geocoding, satellite imagery, street overlay, edit/delete tools, and context-aware UI that adapts based on measurement type.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words) with detailed service features and local expertise, and site-wide internal linking for improved SEO, crawlability, and user engagement.
- **Hero Background Images (PRODUCTION READY)**: Service-specific hero backgrounds with intelligent fallback system:
  - **Architecture**: Centralized mapping in `shared/serviceBackgrounds.ts` maps service slugs to custom background images with default fallback
  - **Custom Backgrounds**: Service-specific images for aeration, fertilization, hedge-trimming, christmas-lights, seasonal-cleanup, sprinkler-blowout, and snow-removal
  - **Dynamic Implementation**: HeroQuoteSection accepts optional `backgroundImage` prop and conditionally wraps content with background container
  - **Template Integration**: ServiceDetailPage and GeoServicePage templates use `getServiceBackground(serviceSlug)` to automatically apply correct backgrounds
  - **Scalability**: New service backgrounds can be added by simply adding entries to SERVICE_BACKGROUNDS map and importing the image asset
  - **Default Fallback**: Services without custom backgrounds use the light mint illustrated background (`Lawn Care Kuna Background Image_1763675543303.png`)
  - **Responsive Design**: Background images use `object-cover` for proper scaling on desktop and mobile devices
  - **Accessibility**: Each background includes SEO-optimized alt text dynamically generated from service/city data
  - Hero sections use `relative` positioning with `absolute` background images, `z-0` for image layer, and dark text on `z-10` content layer
  - Desktop layout: Side-by-side two-column grid with heading content on left and white quote form card on right
- **Typography Hierarchy (PRODUCTION READY)**: Implemented proper font hierarchy aligned with design guidelines:
  - H1, H2, H3, H4, H5, H6: Montserrat weight 400 - consistent professional headings
  - Body text: Montserrat weight 500 - consistent brand voice
  - CSS implementation: All heading rules in `index.css` use `var(--font-headings)` (Montserrat) with `!important` to maintain consistency across the site
  - Design change (Nov 20, 2025): Changed from split Playfair Display/Montserrat system to unified Montserrat for all headers per user preference
- **Mobile Experience**: Redesigned mobile navigation with wider sheets, a sticky bottom navigation bar with key CTAs, and comprehensive mobile optimization across all pages including professional hero sections and proper spacing.
- **Content**: Includes Before/After Gallery, Customer Testimonials, an interactive Pricing Calculator, and a Blog Section.
- **Template Redesign**: ServiceDetailPage and GeoServicePage templates have been completely overhauled for a clean, modern look with simplified layouts, alternating backgrounds, and a two-column quote form.
- **Content Layout Redesign (PRODUCTION READY)**: Service page content restructured for better readability and scannability while preserving all SEO value:
  - **Dark Green Header Section**: Clean, centered introduction with service heading, short description, and single CTA button (no text walls)
  - **Detailed Description Section**: Long-form content intelligently broken into 3 digestible paragraphs instead of single massive block
  - **Highlighted Information Boxes**: Service coverage area and local expertise displayed in visually distinct boxes with proper spacing
  - **Visual Hierarchy**: Proper H2/H3/H4 structure with subheadings to break up content and improve scannability
  - **SEO Preservation**: All original content preserved - text is reorganized, not removed, maintaining 2000+ word count for SEO
  - **Improved Mobile Experience**: Better text chunking and spacing makes content easier to consume on smaller screens
- **SEO-Optimized Headings & Interactive FAQs (PRODUCTION READY)**: Fixed nonsensical headings and redesigned FAQ sections for better UX:
  - **Corrected Headings**: Replaced awkward headings like "Lawn care feels in Kuna ID" with SEO-optimized versions like "[Service] Pricing in [City], Idaho"
  - **Professional Values Section**: Changed "Lawn Care [City] Values" to "Our Commitment to [City] Customers" for clearer messaging
  - **Interactive FAQ Accordions**: Replaced static Card-based FAQs with collapsible Accordion components for better engagement
  - **SEO-Friendly FAQ Headings**: "[Service] Questions in [City]" and "[Service] Questions & Answers" with location keywords
  - **Improved UX**: FAQs collapsed by default reduce visual clutter; click to expand individual questions
  - **Professional Design**: Rounded borders, hover effects, proper spacing, and left-aligned questions with bold typography
  - **SEO Schema Preserved**: All FAQ JSON-LD structured data maintained for search engine optimization
- **Unified Quote Form Design (PRODUCTION READY)**: All quote forms across the site now use the same QuoteForm component for consistent user experience:
  - **HeroQuoteSection**: Updated to embed full QuoteForm component (replacing previous simple card design)
  - **City Preselection**: Automatic lowercase normalization converts title-case city names (e.g., "Kuna") to Select-compatible values ("kuna") for proper city preselection on geo-targeted pages
  - **Service Preselection**: Both general service pages and geo-targeted pages automatically preselect the appropriate service
  - **Consistent Fields**: All forms display the same comprehensive field set: Full Name, Property Address, Email, Phone, Service Type, Property Type, Property Size (with map measurement), City, Additional Details
  - **Benefits**: Free Quote and No Hidden Fees badges, 24-hour response promise, and integrated AI quoting across all entry points
  - **Template Integration**: Home page, ServiceDetailPage, and GeoServicePage all render identical QuoteForm instances with context-aware preselection
- **Dynamic Navigation & Footer (PRODUCTION READY)**: Navigation and footer automatically display all services from contentData.ts:
  - **Footer Logo**: Replaced text "Lawn Care Kuna" with professional logo image
  - **Navigation**: Desktop mega-menu and mobile sheet dynamically pull all services by category (12 lawn care, 14 landscaping, 1 seasonal, 3 commercial)
  - **Footer Services**: Displays all 27 priority services plus HOA Services link (28 total)
  - **Service Areas**: Dynamically pulls all 6 cities from CITIES array
  - **Maintainability**: Adding/removing services in contentData.ts automatically updates navigation and footer
  - **Category Filtering**: Uses category-based filtering (lawn-care, landscaping-*, christmas-lights, commercial)
  - **No Hardcoding**: Removed outdated hardcoded service lists that were missing 21+ services

### Backend Architecture
**Server Framework**: Express.js with TypeScript.
**API Design**: RESTful endpoints with JSON responses, including a POST `/api/quotes` endpoint.
**Request Processing**: Includes JSON body parsing, request logging, and error handling with Zod validation.
**Storage Layer**: Uses in-memory storage (MemStorage class) via an `IStorage` interface, designed for future database migration.
**Data Validation**: Shared Zod schemas between client and server ensure type-safe data handling.

### Content Management
**Service Data**: All service information is stored in `shared/contentData.ts`, including 24 priority services (expandable to 92+) with structured content and 6 service areas. This data automatically generates service and geo-targeted pages.

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