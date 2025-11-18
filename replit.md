# Lawn Care Kuna Website

## Overview

A professional lawn care and landscaping services website for Lawn Care Kuna, a local Idaho business serving the Treasure Valley since 2017. The site provides information about lawn care, landscaping, and Christmas light installation services across Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle. Built with React, TypeScript, Express, and Tailwind CSS, featuring a comprehensive service catalog, quote request system, and SEO-optimized pages for local service areas.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, single-page application using Wouter for client-side routing

**Component Library**: shadcn/ui (Radix UI primitives) with custom Tailwind CSS styling following a trust-first design approach inspired by professional home service providers

**Design System**:
- Typography: Inter font family for all text (Google Fonts)
- Color scheme: Green primary theme (142° hue, 65% saturation, 35% lightness) representing lawn care
- Component styling: "new-york" style variant with CSS variables for theming
- Responsive breakpoints: Mobile-first with md/lg breakpoints
- Spacing: Tailwind utility scale (2, 4, 8, 12, 16, 20, 24, 32)

**State Management**: 
- TanStack Query (React Query) for server state with custom query client configuration
- React Hook Form with Zod validation for form handling
- Local component state with React hooks

**Routing Structure**:
- Core pages: Home, About, Contact
- Service landing pages: Lawn Care, Landscaping, Christmas Lights
- Individual service pages: Lawn Mowing, Patio Installation, Pond Installation, Fence Installation (extendable to 50+ services)
- Commercial pages: HOA Services, Property Management, Municipal Services
- Geographic SEO pages structure (implied by requirements but routes not yet implemented)

**Key Design Decisions**:
- Privacy-first: No team photos, owner names, or personal information displayed
- Trust-building through company history (since 2017), service quality messaging
- Prominent contact information: Phone (208) 352-2011 sticky in navigation
- Free quote CTA throughout site
- Mega-dropdown navigation for extensive service catalog organization
- Mobile hamburger menu with expandable categories

### Backend Architecture

**Server Framework**: Express.js with TypeScript, ES modules

**API Design**: RESTful endpoints with JSON responses
- POST `/api/quotes` - Quote submission endpoint with validation

**Request Processing**:
- JSON body parsing with raw body preservation for potential webhook verification
- Request logging middleware tracking API calls with duration and response capture
- Error handling with Zod validation errors vs server errors

**Development vs Production**:
- Vite dev server middleware in development with HMR
- Static file serving in production from dist/public
- Replit-specific plugins for development environment

**Storage Layer**: 
- Current: In-memory storage using Map data structure (MemStorage class)
- Interface-based design (IStorage) allows easy swap to database implementation
- Methods: createQuote, getAllQuotes, getQuoteById

**Data Validation**: 
- Shared schema between client/server using Drizzle-Zod
- Type-safe quote submission with email, phone, service type validation
- Automatic TypeScript inference from schema

### Build System

**Bundler**: Vite for frontend build
- React plugin with Fast Refresh
- Path aliases: @/ for client/src, @shared/ for shared, @assets/ for attached_assets
- Production build outputs to dist/public

**Server Bundling**: esbuild for backend
- Platform: node
- Format: ESM
- External packages (not bundled)
- Output to dist/

**Type Checking**: TypeScript strict mode
- Shared types between client/server via @shared path alias
- No emit (bundlers handle compilation)
- Module resolution: bundler strategy

### Database Schema (Prepared but Not Active)

**ORM**: Drizzle ORM configured for PostgreSQL dialect via Neon serverless driver

**Schema Definition** (shared/schema.ts):
- quotes table with fields: id (UUID), name, email, phone, serviceType, propertyType, propertySize, city, message, createdAt
- Zod validation schema with email/phone/required field rules
- TypeScript type inference for insert/select operations

**Migration Strategy**: Drizzle Kit configured for schema push to DATABASE_URL

**Current State**: Schema defined but using in-memory storage - database connection ready when DATABASE_URL provided

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless accessible components (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip)
- **class-variance-authority**: Component variant management
- **cmdk**: Command menu component
- **embla-carousel-react**: Carousel functionality
- **lucide-react**: Icon library

### Form Management
- **react-hook-form**: Form state and validation
- **@hookform/resolvers**: Zod resolver integration

### Data Fetching
- **@tanstack/react-query**: Server state management, caching, and synchronization

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **tailwind-merge & clsx**: Class name merging utilities
- **PostCSS & Autoprefixer**: CSS processing

### Database & Validation
- **@neondatabase/serverless**: PostgreSQL client for serverless environments (configured but not actively used)
- **drizzle-orm & drizzle-zod**: ORM and schema validation
- **zod**: Schema validation library
- **connect-pg-simple**: PostgreSQL session store (installed but not configured)

### Utilities
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation
- **wouter**: Lightweight client-side routing

### Development Tools
- **Replit-specific**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner for development environment integration
- **Vite & esbuild**: Build tools
- **TypeScript**: Type checking and compilation

### Key Architectural Trade-offs

**In-memory vs Database Storage**: Currently using in-memory Map for quote storage to enable quick development/testing without database setup. Production would require switching to actual PostgreSQL database - the IStorage interface pattern makes this swap straightforward.

**Client-side Routing**: Wouter chosen over React Router for smaller bundle size suitable for marketing site with moderate routing complexity.

**Form Validation**: Dual validation (client with React Hook Form + Zod, server with Zod) ensures security while providing immediate user feedback.

**Component Library Choice**: shadcn/ui provides copy-paste components rather than npm dependencies, allowing full customization while maintaining accessibility through Radix UI primitives.