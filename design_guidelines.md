# Lawn Care Kuna Website Design Guidelines

## Design Approach

**Reference-Based Approach** inspired by professional home service providers (HomeAdvisor, Angi, local service leaders) combined with clean utility patterns for ease of navigation across 50+ service pages.

**Core Principles:**
- Trust-first design with prominent contact information
- Service clarity over visual flourish
- Quick access to quotes and contact
- Professional credibility without team photos
- Effortless navigation through extensive service catalog

---

## Typography System

**Font Stack:** Google Fonts
- **Primary:** Inter (headings, navigation, CTAs)
- **Secondary:** Inter (body text, service descriptions)

**Hierarchy:**
- H1: text-4xl md:text-5xl lg:text-6xl, font-bold
- H2: text-3xl md:text-4xl, font-bold
- H3: text-2xl md:text-3xl, font-semibold
- H4: text-xl md:text-2xl, font-semibold
- Body Large: text-lg, font-normal
- Body: text-base, font-normal
- Small: text-sm, font-normal

---

## Layout System

**Spacing Primitives:** Use Tailwind units 2, 4, 8, 12, 16, 20, 24, 32
- Component padding: p-4 to p-8
- Section spacing: py-16 md:py-24 lg:py-32
- Container max-width: max-w-7xl
- Content max-width: max-w-4xl
- Grid gaps: gap-6 md:gap-8 lg:gap-12

---

## Component Library

### Navigation
- **Desktop:** Full horizontal navigation with mega-dropdown for services (organized by category: Lawn Care, Landscaping, Christmas Lights, Commercial)
- **Sticky header** with phone number and "Get Free Quote" CTA always visible
- **Mobile:** Hamburger menu with expandable service categories
- Phone: (208) 352-2011 - click-to-call enabled
- CTA Button: "Get Free Quote" - prominent, high contrast

### Hero Section (Homepage)
- **Full-width hero** with background image (lawn transformation, professional crew at work)
- Height: 70vh on desktop, 60vh on tablet, 50vh on mobile
- **Centered content overlay** with semi-transparent backdrop blur
- H1: "Most Trusted Lawn Care Services In Kuna"
- Subheading highlighting key value props
- Dual CTAs: Primary "Get Free Quote", Secondary "Call (208) 352-2011"
- Service area badges below CTAs (Kuna • Boise • Meridian • Nampa • Caldwell • Eagle)

### Service Cards
- **Grid Layout:** 3 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Card structure: Icon/image at top, service name (H3), brief description, "Learn More" link
- Hover state: Subtle elevation (shadow-lg on hover)
- Consistent card height with flexbox

### Trust Indicators Section
- **4-column grid** on desktop (grid-cols-2 lg:grid-cols-4)
- Icons: Since 2017, Licensed & Insured, Free Quotes, Local Experts
- Icon + Heading + Description format
- Icons from Heroicons (outline style)

### Service Detail Pages
- **Breadcrumb navigation** at top
- Hero section with service-specific image (h-64 md:h-96)
- Two-column layout: Service description (66% width) + Quote form sidebar (33% width) on desktop
- Service benefits list with checkmark icons
- "Related Services" section at bottom (3-column grid)
- Geo-targeted content sections for each service area

### Quote Form Component
- **Sticky sidebar** on service pages (stays visible on scroll)
- Fields: Name, Email, Phone, Service Type (dropdown), Property Size, Message
- Large, high-contrast submit button
- Trust badge: "Free, No-Obligation Quote"
- Form validation with inline error messages

### Commercial Services Section
- **Dedicated layout** emphasizing scale and professionalism
- Client type tabs: HOA, Property Management, Municipal, Commercial
- Service grid with expandable details
- Portfolio gallery (if images available) in masonry layout
- "Request Commercial Quote" CTA

### Footer
- **4-column layout** on desktop, stacked on mobile
  - Column 1: Logo, tagline, contact info
  - Column 2: Quick Links (Services, About, Contact, Service Areas)
  - Column 3: Service Categories (with 3-4 top services each)
  - Column 4: Service Areas list
- Legal disclaimer: "Lawn Care Kuna reserves the right to subcontract services as needed to ensure quality service delivery."
- Copyright and business info

---

## Images Strategy

### Required Images
1. **Homepage Hero:** Professional crew working on pristine lawn, wide-angle shot showing transformation
2. **Lawn Care Landing:** Before/after lawn comparison or mowing action shot
3. **Landscaping Landing:** Completed hardscape project (patio, retaining wall, or water feature)
4. **Christmas Lights Landing:** Beautifully lit home at twilight/night
5. **Commercial Services:** Large property (HOA common area, office building)
6. **Service Detail Pages:** Service-specific action shots or completed work

### Image Treatment
- All hero images: Subtle overlay (bg-black/40) for text readability
- Service cards: 16:9 aspect ratio
- Before/after sections: Side-by-side comparison sliders
- Use placeholder comments for custom imagery: `<!-- IMAGE: Professional lawn mowing crew, bright sunny day, Kuna Idaho home -->`

---

## Page-Specific Layouts

### Homepage Sections (in order)
1. Hero with dual CTAs
2. Core Services Overview (3x2 grid, 6 main services)
3. Trust Indicators (4-column)
4. Service Areas Map/List
5. Why Choose Us (2-column: benefits list + image)
6. Latest Projects/Transformations (3-column gallery)
7. Testimonials (if available) (2-column cards)
8. Final CTA section with quote form
9. Footer

### Service Landing Pages
1. Service-specific hero (h-96)
2. Service overview paragraph
3. Service categories grid (for Lawn Care: Mowing, Aeration, Fertilization, etc.)
4. Benefits section
5. Service process (numbered steps)
6. Pricing guidance (if applicable)
7. Related services
8. CTA section

### Individual Service Detail Pages
1. Breadcrumb navigation
2. Service hero with sidebar quote form
3. Detailed service description
4. Benefits/Features list
5. Service process steps
6. FAQ section (3-4 questions)
7. Geo-targeted sections (appears on location-specific pages)
8. Related services grid
9. CTA section

---

## Navigation Mega Menu Structure

**Services Dropdown (organized in 4 columns):**
- Column 1: Lawn Care (top 8 services)
- Column 2: Landscaping (top 8 services)
- Column 3: Christmas Lights + Specialty
- Column 4: Commercial Services (HOA, Property Mgmt, Municipal)

**Bottom of mega menu:** "View All Services" link

---

## Call-to-Action Strategy

**Primary CTA:** "Get Free Quote" - appears in header, hero, service pages, footer
**Secondary CTA:** Phone number - always visible in header
**Tertiary CTAs:** Service-specific "Learn More" links

**CTA Button Styling:**
- Large touch targets: px-8 py-4
- Bold, clear text: font-semibold text-lg
- Rounded corners: rounded-lg
- Buttons over images: backdrop-blur-sm with semi-transparent background

---

## Accessibility & UX

- Maintain WCAG 2.1 AA contrast ratios throughout
- Focus states visible on all interactive elements (ring-2 ring-offset-2)
- Mobile-first responsive design
- Click-to-call phone links on mobile
- Fast-loading images (lazy loading after fold)
- Clear visual hierarchy on service pages with 50+ individual pages
- Breadcrumb navigation on all interior pages
- Skip-to-content link for screen readers