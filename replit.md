# Lawn Care Kuna Website

## Overview

The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services across the Treasure Valley. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site aims to streamline operations, improve customer engagement, and expand market reach within its service areas.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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

**Framework & Routing**: React 18 with TypeScript, using Wouter for client-side routing.
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

### Build System

**Frontend**: Vite for bundling, with React plugin, path aliases, and production output to `dist/public`.
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