# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Mobile-first responsive design, Montserrat font, Primary Forest Green, Light Mint backgrounds, pure white.
- **Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS.
- **Visuals**: Service-specific hero backgrounds, consistent typography, redesigned mobile navigation with sticky bottom bar.
- **Content Layout**: Clean, modern look with simplified layouts, alternating backgrounds, two-column quote forms, and scannable content sections with proper heading hierarchy.
- **Interactive Elements**: Interactive FAQ accordions, an interactive property measurement tool, and a site-wide search function with autocomplete.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Routing**: Wouter for client-side routing, using dynamic `/services/:serviceSlug/:citySlug?` routes.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Multi-Service Quote System**: A 4-step intelligent wizard (QuoteWizard) supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation.
- **Interactive Property Measurement Tool**: Dual-mode (Area and Linear) measurement using Leaflet and OpenStreetMap with auto-calculation, satellite imagery, and manual drawing tools. Queries OpenStreetMap Overpass API for building footprints.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), site-wide internal linking, SEO-optimized headings and FAQs. Includes `robots.txt`, `sitemap.xml`, and `llms.txt`.
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
- **@neondatabase/serverless**: PostgreSQL client.
- **drizzle-orm & drizzle-zod**: ORM and schema validation.

### Utilities
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **wouter**: Lightweight client-side routing.