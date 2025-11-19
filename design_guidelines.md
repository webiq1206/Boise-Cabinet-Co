# Lawn Care Kuna Design Guidelines

## Design Approach

**Clean, Modern, Approachable** - Professional lawn care and landscaping services with a fresh, trustworthy aesthetic inspired by the actual lawncarekuna.com brand.

**Core Principles:**
- Fresh, clean design with approachable professionalism
- Generous whitespace and modern layouts
- Trust-building through straightforward presentation
- Easy navigation through extensive service catalog
- Bright, optimistic feel that conveys quality care

---

## Color Palette

### Brand Colors (from lawncarekuna.com)

**Primary Green:** `hsl(145, 50%, 35%)` - Forest green for buttons, accents, CTAs
- Hex: #2D6B3F
- Usage: Primary buttons, links, accents, logo accent
- Conveys: Growth, nature, trust, professionalism

**Light Mint Background:** `hsl(145, 40%, 95%)` - Pale seafoam for section backgrounds
- Hex: #E5F5EC
- Usage: Alternating sections, subtle backgrounds, cards
- Conveys: Freshness, cleanliness, breathing room

**Dark Forest Green:** `hsl(145, 50%, 18%)` - Deep green for overlays, dark cards
- Hex: #1A3E2C
- Usage: Hero overlays, dark sections, footer backgrounds
- Conveys: Depth, sophistication, stability

**Neutrals:**
- Background: Pure white `hsl(0, 0%, 100%)`
- Foreground: Near black `hsl(0, 0%, 8%)`
- Borders: Light gray `hsl(0, 0%, 88%)`
- Muted text: Medium gray `hsl(0, 0%, 40%)`

---

## Typography System

**Font Stack:** Google Fonts
- **Primary (Headings):** Playfair Display - Elegant serif for headlines
- **Secondary (Body/UI):** Inter - Clean, professional sans-serif

**Hierarchy:**
- H1: text-5xl md:text-6xl lg:text-7xl, font-serif, tracking-tight
- H2: text-4xl md:text-5xl, font-serif, tracking-tight
- H3: text-2xl md:text-3xl, font-serif, font-medium
- H4: text-xl md:text-2xl, font-sans, font-semibold
- Body Large: text-lg md:text-xl, font-sans, leading-relaxed
- Body: text-base, font-sans, leading-relaxed
- Small: text-sm, font-sans

---

## Layout System

**Spacing Primitives:** Tailwind units
- Section spacing: py-24 md:py-32 lg:py-40 (generous editorial spacing)
- Component padding: p-8 to p-12
- Container: max-w-7xl with px-8 md:px-12
- Content: max-w-3xl to max-w-4xl for text sections
- Grid gaps: gap-8 md:gap-12

**Grid Systems:**
- 2-column for service cards (desktop)
- 3-column for trust indicators
- 4-column for service grids
- Single column mobile-first

---

## Brand Assets

### Logo
- **Primary Logo:** Horizontal logo with tree icon + "lawncare KUNA" wordmark
- **Icon:** Simple tree icon in forest green
- **Usage:** 
  - Navigation: h-10 w-auto
  - Footer: h-12 w-auto
  - Favicon: Tree icon only

**File:** `attached_assets/Lawn Care Kuna Logo_1763512021933.png`

---

## Component Library

### Navigation
- **Desktop:** Clean header with mega-dropdown navigation
- Sticky header with subtle border separator
- Logo on left (actual brand logo image)
- Services mega-menu with organized categories
- Phone CTA: (208) 352-2011
- Primary CTA: "Free Consultation"
- **Mobile:** Sheet overlay with organized service categories

### Hero Section
- **Cinematic hero:** 85vh on desktop, 70vh mobile
- Dark overlay (bg-black/60) on hero images for text contrast
- White text over dark overlay for maximum readability
- Playfair Display headlines with generous tracking
- Dual CTAs: Primary "Get Free Quote" + Secondary "Call Now"
- Service area badges below CTAs

### Service Cards
- **2-column grid** on desktop, stacked mobile
- Clean white cards with subtle borders
- Forest green icon containers with light backgrounds
- Hover elevation effect for interactivity
- "Learn More" links in brand green

### Trust Indicators
- **3-4 column layout** with icon + text
- Outlined icons in brand green
- Minimal styling, maximum clarity
- Light borders on cards
- Centered presentation

### Quote Forms
- Clean white cards with subtle borders
- Generous field spacing
- Forest green submit buttons
- Trust messaging in small text
- Mobile-optimized inputs

### Before/After Gallery
- Slider component with interactive handle
- Professional project photography
- Text overlays for labels
- Clean, modern controls

### Testimonials
- Star ratings in complementary color
- Clean card layout
- Customer name + service type
- Quote-style presentation

### Footer
- Dark forest green background
- 4-column layout on desktop
- Service links organized by category
- Contact information prominent
- Legal/copyright in small text

---

## Page Layouts

### Homepage Sections
1. Cinematic hero with dual CTAs
2. Trust indicators (4-column grid)
3. Editorial introduction (centered, max-w-3xl)
4. Main services (2-column grid)
5. Before/After gallery showcase
6. Customer testimonials
7. Service areas
8. Final CTA section
9. Footer

### Service Landing Pages  
1. Hero section (70vh) with service imagery
2. Introduction paragraph
3. Service grid (2-column)
4. Benefits section
5. Process/approach section
6. Related services
7. CTA section

### Service Detail Pages
1. Hero section
2. Service overview
3. Detailed description
4. Benefits list
5. FAQ section
6. Related services
7. Quote form sidebar (desktop)

---

## Photography Treatment

### Style Direction
- Professional, high-quality lawn and landscape photography
- Natural color (not desaturated - show the green!)
- Well-lit, optimistic imagery
- Hero images use dark overlays for text readability
- Before/after photos show real results

### Required Images
1. **Homepage Hero:** Beautiful maintained lawn, Idaho setting
2. **Lawn Care:** Professional lawn mowing in action
3. **Landscaping:** Finished hardscape/patio project
4. **Christmas Lights:** Home decorated with lights at night
5. **Commercial:** HOA property or commercial landscape
6. **Before/After:** Real project transformations

---

## CTA Strategy

**Primary CTA:** "Get Free Quote" - Forest green button, prominent
**Secondary CTA:** "(208) 352-2011" - Click-to-call phone link
**Tertiary:** "Learn More" links throughout

**Button Styling:**
- Primary: bg-primary (forest green), white text
- Outline: border-primary, green text, transparent bg
- Sizes: Use Button size prop (sm, default, lg)
- Hover: Automatic elevation via hover-elevate utility
- Icons: Phone icon for call buttons

---

## Accessibility & UX

- Clean, readable color contrast
- Large, tappable mobile buttons
- Clear focus states
- Click-to-call phone functionality
- Mobile-optimized forms
- Fast page loads
- Clear navigation hierarchy
- Breadcrumbs on deep pages

---

## SEO Guidelines

- Every page unique title: "[Service] - Lawn Care Kuna"
- Meta descriptions for all pages
- Service area pages: "[Service] in [City], Idaho"
- H1 on every page
- Structured navigation
- Internal linking between services
- Contact info in footer
- Local business schema (future)

---

## Mobile-First Approach

- All layouts stack cleanly on mobile
- Navigation collapses to hamburger menu
- Touch-friendly buttons (min 44px height)
- Optimized images for mobile
- Fast, responsive experience
- Sticky header with logo
- Easy access to phone/quote CTAs

---

## Design Aesthetic Summary

**Think:** Clean, professional, approachable lawn care company
**NOT:** Luxury landscaping firm or ultra-premium service

The design should feel:
- **Trustworthy** - Professional but not stuffy
- **Fresh** - Clean, modern, optimistic
- **Accessible** - Easy to navigate and understand
- **Local** - Idaho-focused, community-oriented
- **Quality** - Well-crafted without being pretentious

The brand green conveys growth, nature, and care. The light mint backgrounds add freshness and breathing room. The overall feel is "the lawn care company you can trust" - professional expertise with friendly, approachable service.
