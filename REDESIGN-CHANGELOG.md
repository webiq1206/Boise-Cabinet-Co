# Dark Brand Redesign — Changelog

Full visual redesign of boisecabinet.co into the single, cohesive **dark** Boise
Cabinet Co brand identity (charcoal ground · bone ink · restrained sage accent ·
Montserrat + Fraunces italic). No content, routes, CMS wiring, forms, analytics,
or integrations were changed — styling and brand assets only.

## Why this was a low-risk conversion
The site was **already built on this brand system**: Montserrat + Fraunces were
already wired, a charcoal+sage `.dark` token set already existed, and the
component layer was almost entirely token-based (`bg-background`, `text-foreground`,
`bg-card`, `border-border`, `bg-primary`, …) with **zero** gray/black literals in
shared components. The redesign therefore centered on committing to dark and
retuning the tokens to the exact brand hex values, rather than restyling pages
one by one.

## Design tokens & theme (single source of truth)
- **`app/globals.css`**
  - Retuned `:root` **and** `.dark` to the exact brand palette (both carry the
    same values so there is no light flash and no unreachable state):
    bg `#1C1F1E` · bg-2 `#222624` · surface `#262B29` · hairline `#39403D` ·
    bone `#F7F5F3` (headings) · text `#E6E3DE` · mist `#9AA098` · faint `#6E756F`
    · sage `#93A386` · danger `#C77B6B`.
  - `--primary` is now **bone** with charcoal foreground, so every primary CTA
    inverts to the elegant bone-on-dark button automatically (no per-button edits).
  - Added `--heading` (bone) applied to `h1–h6`.
  - **Hard brand rule enforced:** capped all text at weight 400 (`.font-medium/
    .font-semibold/.font-bold/b/strong/th → 400`, `font-synthesis-weight: none`);
    updated blog-content `h4/strong/th` off 500/600.
- **`app/layout.tsx`**
  - Forced dark permanently: `<html class="dark" style="color-scheme:dark">`
    (there was no theme toggle to remove).
  - Trimmed Montserrat to weights 300/400 (nothing bold), dropping two font files.
  - `viewport.themeColor` → `#1C1F1E`, added `colorScheme: 'dark'`.
  - Icon metadata now references the SVG favicon + 16/32 PNGs; OG dimensions
    corrected to 1200×630.

## Brand assets (copied from the kit → referenced from the site)
- **`public/brand/`** (new): `…-wordmark-reverse.svg`, `…-logo-primary-reverse.svg`,
  `…-seal-dark.svg`, `…-emblem-light.svg`, `…-emblem-dark.svg`.
- **Favicon / PWA / apple icons — all regenerated from the Maker's Seal**
  (`…-seal-dark.svg`): `public/favicon.svg`, `public/favicon-16.png`,
  `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/icon-192.png`,
  `public/icon-512.png`, and the App-Router auto-icons `app/favicon.ico`
  (16/32/48), `app/icon.png`, `app/apple-icon.png`.
- **OG image** rebuilt at 1200×630 on `#1C1F1E` (reverse lockup + sage hairline
  frame + seal badge): `public/images/marketing/og-default.webp` (+ `-1280`,
  `-768` variants + a `.png`).
- **`public/site.webmanifest`**: `theme_color`/`background_color` → `#1C1F1E`;
  icons marked `any maskable`.

## Logos in the UI (reverse/white on the dark ground)
- **`components/Navigation.tsx`** — nav wordmark is now
  `boise-cabinet-co-wordmark-reverse.svg` (was a text lockup).
- **`components/Footer.tsx`** — footer logo is now
  `boise-cabinet-co-logo-primary-reverse.svg`; added a small **emblem-light**
  badge in the bottom bar.
- **`app/not-found.tsx`** — 404 now leads with the **emblem-light** badge.

## Targeted contrast fixes for the dark ground
- **`components/admin/AdminProjectPortalPanel.tsx`** — "Linked" badge off
  `text-green-700/border-green-200` onto the dark-safe success tone.
- **`components/design-studio/CabinetPreview3D.tsx`** — 3D viewport backdrop
  gradient darkened (`#262B29 → #1C1F1E`).

## Verified (local `next dev`, headless Chrome screenshots)
Home, Cabinets index + `cabinets/[room]`, Blog index, Contact, Finishes,
Estimate wizard/forms, 404, Login/auth, Admin access gate — all render dark and
on-brand with correct wordmark / seal / emblem usage. All favicon/PWA/OG/brand
asset endpoints return 200. No compile errors.

> The full admin dashboard and customer portal require a database + auth session,
> so they were not rendered live here; they inherit the same retuned sidebar,
> card, table, and status-pill tokens and are dark by construction.
