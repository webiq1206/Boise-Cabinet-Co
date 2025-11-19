# Lawn Care Kuna Website

## Overview

The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences

Preferred communication style: Simple, everyday language.

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