# Boise Remodeling Co Design Guidelines

## Design Approach

**Premium, Clear, Trustworthy** — Design-build remodeling with a calm, editorial feel: warm neutrals, confident typography, and generous whitespace.

**Core principles:**
- Clarity over clutter: one primary action per section
- Charcoal primary CTAs; sage accent for heading emphasis only
- Mobile-first conversion (estimator, consult CTA)
- Shared tokens in `app/globals.css` — no one-off page styles

---

## Color Palette

| Role | Token | Use |
|------|-------|-----|
| Canvas | `--background` | Default sections |
| Greige | `--surface-greige` | Alternating sections |
| Card | `--card` | White cards |
| Ink | `--foreground` | Body text (AA) |
| Meta | `--muted-foreground` | Eyebrows, captions only |
| Anchor | `--inverse` | Dark bands, footer |
| Accent | `--accent` (sage) | `.brc-accent` in headings, slider thumb — not filled buttons |

---

## Typography

- **UI & body:** Montserrat (`font-sans`)
- **Accent word:** Fraunces italic via `.brc-accent` (max one word per heading)
- **Numerals:** Fraunces via `.brc-display-num` / `<DisplayNum>`
- **Eyebrows:** `.brc-label` — 11px, uppercase, 0.14em tracking

Living reference: `/style-guide` (noindex).

---

## Buttons & links

1. **Primary:** `Button variant="brand"` (charcoal solid)
2. **Secondary:** `Button variant="brandOutline"`
3. **Tertiary:** `<TextLink href="…">`

Do not use `brandAccent`, `brandGhost`, or `brandInverseOutline` on marketing pages.

---

## Components

- `Section` — variants: `canvas` (default), `greige`, `surface`, `inverse`, `tint`
- `PageHeader` — inner page heroes
- `MarketingCard` / `BlogCard`
- `Hairline` — fullBleed, spaced
- `Chip` — categories and tags

---

## Imagery

- Paths: `shared/siteImages.ts`, `shared/serviceBackgrounds.ts`, `shared/blogImages.ts`
- Class: `.img-brand-grade` on all `next/image` marketing photos
- Replace placeholder files in `public/images/` before launch

---

## Contact config

Single source: `shared/siteConfig.ts` (env: `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_SITE_URL`).
