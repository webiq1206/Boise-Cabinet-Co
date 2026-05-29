# Boise Remodeling Co Design Guidelines

## Design Approach

**Premium, Clear, Trustworthy** — Design-build remodeling with a calm, editorial feel: warm neutrals, confident typography, and enough whitespace that planning content feels approachable, not salesy.

**Core principles:**
- Clarity over clutter: one primary action per section
- Trust through process and copy, not hype
- Mobile-first: key conversion elements (estimate range, consult CTA) stay visible
- Consistent design tokens across marketing and portal surfaces

---

## Color Palette

Brand tokens live in `app/globals.css` and Tailwind theme extensions.

**Primary (warm brown):** `--primary` — CTAs, key actions  
**Accent (copper):** `--accent` — highlights, selected states, detail meter  
**Inverse (charcoal):** `--inverse` — estimate result panel, premium contrast blocks  
**Background / surface:** warm off-white and card surfaces for section rhythm

Use `bg-inverse` + `text-inverse-foreground` for the planning range card, not ad-hoc hex values.

---

## Typography

- **Default (headlines, body, UI):** Montserrat (`font-sans`)
- **Decorative accent only:** Fraunces via `.brc-accent` on italic emphasis phrases (e.g. hero “clarity”, statement band “outlast the guarantee”, logo “Remodeling”)
- **Decorative numerals:** Fraunces via `.brc-display-num` or `<DisplayNum>` (stats, prices, step markers, KPI counts)
- **Labels:** `.brc-label`, uppercase, tracked, muted (Montserrat)

Section titles use `.text-section-title` scale; avoid one-off font sizes on marketing pages.

---

## Components

Prefer shared marketing primitives:

- `Section` — page sections with optional divider
- `MarketingCard` — bordered cards on light backgrounds
- `EstimateResultPanel` — dark planning range card (desktop sticky + mobile)
- `EstimateCalculator` — unified quick + refine estimator

Match existing border radius (`rounded-sm`), spacing (`section-y`), and hover patterns.

---

## Imagery

- Real project photography where available; no stock “generic contractor” clichés
- Hero and service imagery should reinforce **design-build** (finished spaces, detail shots)
- Optional 3D renderings are positioned as upgrades, not the default promise

---

## Copy & SEO

- Site name: **Boise Remodeling Co**
- Domain: **boiseremodeling.co**
- Title template: `%s | Boise Remodeling Co`
- Position estimates as **planning ranges**, not bids or line-item quotes
- No em dashes in customer-facing copy

---

## Accessibility

- Interactive toggles: `aria-pressed`, `aria-expanded` where applicable
- Live estimate updates: `aria-live="polite"` on the range
- Sufficient contrast on inverse panels; don’t rely on color alone for state
