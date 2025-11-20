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
- **Interactive Property Measurement Tool**: Utilizes Leaflet and OpenStreetMap for map-based property area calculation, supporting polygon/rectangle drawing, auto-geocoding, and real-time area conversion, integrated into the quote form.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words) with detailed service features and local expertise, and site-wide internal linking for improved SEO, crawlability, and user engagement.
- **Mobile Experience**: Redesigned mobile navigation with wider sheets, a sticky bottom navigation bar with key CTAs, and comprehensive mobile optimization across all pages including professional hero sections and proper spacing.
- **Content**: Includes Before/After Gallery, Customer Testimonials, an interactive Pricing Calculator, and a Blog Section.
- **Template Redesign**: ServiceDetailPage and GeoServicePage templates have been completely overhauled for a clean, modern look with simplified layouts, alternating backgrounds, and a two-column quote form.

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