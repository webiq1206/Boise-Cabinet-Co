# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, Montserrat font (weight 400 for headings, 500 for body), Primary Forest Green, Light Mint backgrounds, pure white.
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Visuals**: Service-specific hero backgrounds with intelligent fallback, consistent typography hierarchy, redesigned mobile navigation with sticky bottom bar.
- **Content Layout**: Clean, modern look with simplified layouts, alternating backgrounds, two-column quote forms, and scannable content sections with proper heading hierarchy.
- **Interactive Elements**: Interactive FAQ accordions, an interactive property measurement tool, and a site-wide search function with autocomplete.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Routing**: Wouter for client-side routing, using a dynamic `/services/:serviceSlug/:citySlug?` route for efficient scaling. Dedicated `/services` page serves as comprehensive service directory.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Multi-Service Quote System**: A 4-step intelligent wizard (QuoteWizard) at `/get-quote`, `/contact`, and commercial pages supporting multiple service selections, service-aware field rendering (e.g., square footage for lawn, linear footage for lights), itemized pricing, and robust validation. Responsive mobile design with single-column Property Type layout to prevent text overflow on mobile devices.
- **Interactive Property Measurement Tool**: Dual-mode (Area and Linear) measurement using Leaflet and OpenStreetMap with auto-calculation feature. Queries OpenStreetMap Overpass API for building footprints and auto-generates measurements (lawn area in sq ft, roofline in linear ft). Uses tagged layer architecture: green polygons for lawn area, orange dashed polylines for rooflines. Allows independent editing of each measurement type. Includes satellite imagery, manual drawing tools, and fallback estimates for properties without building data.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), site-wide internal linking, and SEO-optimized headings and FAQs. Comprehensive `/services` directory page optimized for service discovery.
- **Dynamic Content**: Navigation and footer automatically display all services and service areas fetched from `contentData.ts`. Service directory page dynamically pulls from PRIORITY_SERVICES.
- **Unified Quote Form Design**: All quote forms site-wide use `QuoteWizard`, a 4-step multi-service wizard with city and service preselection, comprehensive field validation, and integrated AI quoting. QuoteForm has been fully deprecated in favor of the unified QuoteWizard experience.
- **Mobile Navigation**: Sticky bottom navigation on mobile with Services button linking to comprehensive service directory, Get Quote, and Schedule buttons for quick access.
- **Site-Wide Search**: Real-time autocomplete search in header (desktop and mobile) that searches all services, service areas, and main pages. Shows up to 8 results with icons, descriptions, and type labels. Keyboard accessible with Escape to close and click-outside dismissal.

### System Design Choices
- **Backend Framework**: Express.js with TypeScript.
- **API Design**: RESTful endpoints with JSON responses, including a POST `/api/quotes` endpoint.
- **Data Validation**: Shared Zod schemas for client and server.
- **Storage Layer**: Uses an in-memory `MemStorage` via an `IStorage` interface, designed for future database migration.
- **Content Management**: All service and geographic data is centralized in `shared/contentData.ts`, enabling automatic generation of service and geo-targeted pages.

### Build System
- **Frontend Bundler**: Vite (React plugin, path aliases, lazy-loading).
- **Backend Bundler**: esbuild (targeting Node.js ESM).
- **Type Checking**: Strict TypeScript.

### Database Schema
- **ORM**: Drizzle ORM configured for PostgreSQL via Neon serverless driver.
- **Schema**: Defined in `shared/schema.ts` for a `quotes` table, with Zod validation and TypeScript inference (currently using in-memory storage).

## External Dependencies

### UI/UX & Components
- **Radix UI**: Headless accessible components (via shadcn/ui).
- **class-variance-authority**: For component variant management.
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

### Data & Validation
- **zod**: Schema validation library.
- **@neondatabase/serverless**: PostgreSQL client (configured).
- **drizzle-orm & drizzle-zod**: ORM and schema validation (configured).

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **wouter**: Lightweight client-side routing.