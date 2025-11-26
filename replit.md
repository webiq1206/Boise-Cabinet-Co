# Lawn Care Kuna Website

## Overview
The Lawn Care Kuna website is a professional online platform for a local Idaho business offering lawn care, landscaping, and Christmas light installation services. Its primary goal is to provide comprehensive service information, facilitate quote requests, and enhance local SEO. Key capabilities include an AI-powered intelligent quoting system, an interactive property measurement tool, a complete lead distribution platform, and a rich content management system for service details, project galleries, testimonials, and educational blogs. The site powers 500+ SEO-optimized location pages with unique, city-specific metadata designed to rank #1 in local search results for each service area.

## Recent Changes
- **2025-11-26**: Made quote form completely frictionless - property calculation now automatically triggers when users enter address in Step 1 and select services requiring measurements. Manual "Calculate Property Size" button changed to "Adjust Property Measurements" for fine-tuning after auto-calculation.
- **2025-11-26**: Enhanced favicon and SEO implementation - updated favicon with new tree logo icon, added comprehensive favicon sizes (48x48, 192x192, 512x512, apple-touch-icon), implemented unique SEO-optimized og:image:alt and twitter:image:alt tags on every page using generateLogoAltTag() function.
- **2025-11-25**: Fixed email logo display - copied logo assets to public/email/ folder for email templates. Fixed critical lead distribution bug - quotes now automatically create corresponding Lead records for admin dashboard. Fixed layout centering issue - configured Tailwind container with responsive max-widths (640px-1400px breakpoints) and auto-centering margins. Lead pricing set at 10% of final quote (minimum $10).
- **2025-11-25**: Added 2 new irrigation-focused blog posts (sprinkler blowout timing guide, spring startup guide), bringing total to 42 comprehensive SEO-optimized articles. Updated sitemap.xml (252 total URLs), llms.txt, and documentation.
- **2025-11-24**: Expanded blog content system from 23 to 40 comprehensive articles. Added 17 new SEO-optimized blog posts (1500-2000 words each) covering landscaping topics (patio installation, retaining walls, rock gardens, landscape lighting), irrigation (smart controllers), tree services, lawn care best practices (sod vs overseeding, lawn diseases, clay soil improvement, edging, mulching), sustainable practices (xeriscaping, pet-friendly, organic), and expert guides (myths debunked, lawn renovation, Christmas lights). Updated sitemap.xml, llms.txt, and replit.md. All new posts include 6-10 internal service links and 5-6 detailed FAQs.
- **2025-11-24**: Corrected comprehensive SEO file configuration with accurate service counts. Updated sitemap.xml, llms.txt, and robots.txt to reflect all 28 services (including snow-removal and sprinkler-repair), 168 city+service combinations (28 services × 6 cities). Removed non-existent "fence" service references. Service areas strictly limited to: Kuna, Boise, Meridian, Eagle, Star, Middleton (Nampa and Caldwell completely removed). Fixed blog post sticky sidebar positioning issue.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Routing**: Wouter for client-side routing, using dynamic `/services/:serviceSlug/:citySlug?` routes with route-level code splitting.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Performance Optimization**: Route-level code splitting dramatically reduces initial JS bundle size for faster mobile performance.
- **Multi-Service Quote System**: A 4-step intelligent wizard supporting multiple service selections, service-aware field rendering, itemized pricing, and robust validation.
- **Intelligent Property Calculator**: Production-ready automated property measurement system querying Ada County Assessor parcel database API via schoolsitelocator.com MapServer. Features include address normalization, multi-county support, fuzzy city matching, robust address parsing, multiple property selection, enhanced error messages, city context integration, auto-population, clean state management, comprehensive linear measurements, service-specific auto-population, intelligent estimation, and manual adjustment.
- **SEO Optimization**: E-E-A-T optimized, city-specific pages (2000+ words), comprehensive bidirectional internal linking, SEO-optimized headings and FAQs. Includes `robots.txt`, `sitemap.xml`, and `llms.txt`. Features city-specific metadata, URL-safe canonicals, smart title generation, and crawler-friendly defaults.
  - **Bidirectional Internal Linking**: Service pages link to relevant blog posts via RelatedBlogPosts component, while blog posts contain extensive contextual links to service pages. This creates comprehensive internal linking throughout the site for improved SEO and user experience.
- **Dynamic Content**: Navigation and footer automatically display all services and service areas from `contentData.ts`.
- **Mega Menu Navigation**: Organized into 4 balanced service columns using MENU_GROUPS configuration:
  1. **Lawn Care**: 8 services including mowing, aeration, fertilization, weed control
  2. **Landscaping**: 6 services including patio installation, retaining walls, hedge trimming
  3. **Seasonal & Specialty**: 7 services including spring/fall cleanup, snow removal, Christmas lights, tree services
  4. **Irrigation & Lighting**: 6 services including sprinkler systems, irrigation repair/maintenance, landscape lighting
  - Desktop: 4-column grid mega menu (900px wide) with category icons
  - Mobile: Same grouping structure with collapsible categories
  - Icons: Scissors (Lawn Care), TreeDeciduous (Landscaping), Snowflake (Seasonal), Droplets (Irrigation)
- **Mobile Navigation**: Sticky bottom navigation with quick access to services, quotes, and scheduling.
- **Site-Wide Search**: Real-time autocomplete search in header for services, areas, and main pages.
- **Lead Distribution System**: A B2B lead marketplace with admin dashboard, subcontractor portal, privacy protection, automated lead pricing, legal agreement flow, and in-app notifications. Integrates with Stripe for payments.
- **Blog System**: Implemented with category organization, posts seeded from `shared/blogContent.ts`, and a category-organized blog page UI with responsive grid and detailed post cards.
- **Customer Email Enhancements**: Comprehensive estimate information display in customer and admin quote emails, including full quote details, brand assets, and detailed breakdowns. Advanced data normalization and service deduplication are implemented for clarity.
- **Professional Email Templates**: Overhauled email templates with actual Lawn Care Kuna logo, production URLs, removed emojis, added complete contact information, and implemented quote value normalization (rounding up to the nearest $5).
- **Popup-Free Quote Flow**: Replaced all toast notifications with inline error alerts for a non-disruptive quote experience. Enhanced quote wizard with per-service pricing dropdowns and comprehensive legal protection and transparency.

### System Design Choices
- **Backend Framework**: Express.js with TypeScript.
- **API Design**: RESTful endpoints with JSON responses.
- **Data Validation**: Shared Zod schemas for client and server.
- **Storage Layer**: Uses an in-memory `MemStorage` via an `IStorage` interface, designed for future database migration.
- **Content Management**: All service and geographic data centralized in `shared/contentData.ts`.
- **Build System**: Vite for frontend, esbuild for backend, strict TypeScript.
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