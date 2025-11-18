# Lawn Care Kuna Premium Design Guidelines

## Design Approach

**Reference-Based Approach** inspired by luxury landscaping firms (Yardzen, KLC Landscaping) and high-end home service providers. Editorial sophistication meets functional service navigation.

**Core Principles:**
- Premium positioning through restrained elegance
- Editorial layouts with generous whitespace
- Cinematic photography with dark overlays
- Trust through understated professionalism
- Effortless navigation through extensive service catalog

---

## Typography System

**Font Stack:** Google Fonts
- **Primary (Headings):** Playfair Display - elegant serif conveying sophistication
- **Secondary (Body/UI):** Inter - clean, professional sans-serif

**Hierarchy:**
- H1: text-5xl md:text-6xl lg:text-7xl, font-serif
- H2: text-4xl md:text-5xl, font-serif
- H3: text-2xl md:text-3xl, font-serif, font-medium
- H4: text-xl md:text-2xl, font-sans, font-semibold
- Body Large: text-lg, font-sans, leading-relaxed
- Body: text-base, font-sans, leading-relaxed
- Small: text-sm, font-sans

---

## Layout System

**Spacing Primitives:** Tailwind units 4, 8, 12, 16, 24, 32, 40, 48
- Generous section spacing: py-24 md:py-32 lg:py-48
- Component padding: p-8 to p-12
- Container: max-w-7xl with px-8 md:px-12
- Content: max-w-4xl for text-heavy sections
- Grid gaps: gap-8 md:gap-12 lg:gap-16

---

## Component Library

### Navigation
- **Desktop:** Minimal header with refined mega-dropdown, subtle divider lines between categories
- Sticky header with elegant underline separator
- **Mobile:** Full-screen overlay menu with generous spacing
- Phone: (208) 352-2011 displayed with subtle sophistication
- CTA: "Request Consultation" in understated styling

### Hero Section (Homepage)
- **Cinematic full-width hero**: 85vh on desktop, 70vh mobile
- Dark overlay (bg-black/60) over monochrome/desaturated photography
- Centered content with maximum breathing room
- Refined backdrop blur on text container
- H1 with generous letter-spacing
- Single refined CTA below headline
- Subtle service area badges with delicate borders

### Service Cards
- **Masonry-inspired grid:** 2 columns desktop, single column mobile
- Elegant border treatment (border with subtle shadow)
- Monochrome service imagery with hover opacity shift
- Icon integration using outline Heroicons
- Ample internal padding (p-8 to p-12)
- "Explore Service" link in understated typography

### Trust Indicators
- **3-column layout** with generous spacing
- Refined iconography with delicate line weights
- Understated presentation focusing on substance
- Minimal visual treatment, maximum readability

### Service Detail Pages
- **Editorial two-column layout:** 60% content, 40% sidebar with quote form
- Large leading paragraph in Body Large typography
- Service benefits presented as elegant list with subtle checkmarks
- Monochrome before/after comparison sliders
- Related services in refined 2-column grid
- Breadcrumbs with minimal styling

### Quote Form Component
- **Elevated sidebar design** with subtle border and soft shadow
- Generous field spacing (space-y-6)
- Refined input styling with delicate borders
- Large, elegant submit button with subtle hover state
- Trust statement in refined small typography

### Commercial Services Section
- **Premium presentation** emphasizing scale and expertise
- Segmented by client type with refined tab navigation
- Portfolio presented in editorial masonry layout
- Cinematic project photography
- "Schedule Consultation" CTA

### Footer
- **Editorial 4-column layout** with generous vertical spacing
- Refined typography hierarchy
- Delicate divider lines between sections
- Legal disclaimer in subtle small text
- Minimal visual treatment, maximum clarity

---

## Images Strategy

### Photography Treatment
- **Monochrome or heavily desaturated** color palette
- Professional, editorial quality only
- Cinematic compositions with dramatic lighting
- Dark overlays (bg-black/50 to bg-black/60) on all hero images

### Required Images
1. **Homepage Hero:** Wide-angle estate lawn at golden hour, cinematic depth
2. **Lawn Care Landing:** Professional crew on pristine property, desaturated treatment
3. **Landscaping Landing:** Elegant hardscape with sophisticated plantings, twilight
4. **Christmas Lights Landing:** Upscale home illuminated at night, refined aesthetic
5. **Commercial Landing:** Premium office complex or HOA property, aerial perspective
6. **Service Pages:** Editorial-style service photography, monochrome treatment

### Implementation
- Hero images: Full-width, 85vh homepage, 70vh service pages
- Service cards: 4:3 aspect ratio with elegant borders
- Before/after: Side-by-side sliders with refined controls
- All images: `<!-- IMAGE: [Description with cinematic, upscale direction] -->`

---

## Page Layouts

### Homepage Sections
1. Cinematic hero with dark overlay, single CTA
2. Introduction paragraph (centered, max-w-3xl, editorial spacing)
3. Core services masonry grid (2-column)
4. Trust indicators (3-column, refined presentation)
5. Service areas (elegant map integration or refined list)
6. Portfolio showcase (4-image masonry grid, monochrome)
7. Testimonial editorial cards (2-column, generous quotes)
8. Final consultation CTA with cinematic background image
9. Refined footer

### Service Landing Pages
1. Cinematic hero (70vh) with service-specific monochrome imagery
2. Editorial introduction (centered, generous line-height)
3. Service categories in refined 2-column grid
4. Benefits section with elegant checkmark list
5. Process timeline with sophisticated stepped layout
6. Portfolio examples (masonry grid)
7. Related services (2-column refined cards)
8. Consultation CTA section

### Service Detail Pages
1. Minimal breadcrumb navigation
2. Two-column editorial layout (content + sidebar form)
3. Large opening paragraph
4. Detailed service description with elegant typography
5. Benefits list with refined styling
6. FAQ accordion with subtle animations
7. Related services grid
8. Consultation CTA

---

## Navigation Structure

**Services Mega Menu (4 columns with refined dividers):**
- Lawn Care Services (8 top offerings)
- Landscaping Services (8 top offerings)
- Specialty Services (Christmas Lights + seasonal)
- Commercial Solutions (HOA, Property Management, Municipal)

Footer link: "View Complete Services" in refined typography

---

## CTA Strategy

**Primary:** "Request Consultation" - elegant, understated
**Secondary:** Phone number with refined presentation
**Tertiary:** "Learn More" links in subtle styling

**Button Treatment:**
- Refined proportions: px-8 py-4
- Delicate borders with soft shadows
- Over images: backdrop-blur-md with semi-transparent background
- No heavy rounding: rounded-md
- Sophisticated hover states (subtle opacity/shadow shifts)

---

## Accessibility & UX

- WCAG 2.1 AA compliance with refined color treatments
- Generous focus states (ring-2 with elegant offset)
- Mobile-optimized with maintained sophistication
- Click-to-call functionality
- Optimized image loading with maintained quality
- Clear hierarchy across 50+ service pages
- Breadcrumb navigation with minimal styling
- Restrained animations (subtle fades, no bounces)