# P5 family design system (shared rules and permitted brand variation)

The four brand sites share one editorial layer, `app/family.css`, kept byte-identical across repositories (`md5 -q app/family.css` on each repo must match). It carries no brand colour: every hue resolves from the site's own tokens (`--background`, `--foreground`, `--heading`, `--primary`, `--accent`, `--accent-legible`, `--accent-on-light`, `--muted-foreground`, `--border`, `--inverse`). The reference is p5homeco.com's own stylesheet.

## Shared rules (do not vary per brand)
- Measure: `ed-shell` = min(100% - 48px, 1380px); narrow 1080px; prose 720px. Breakpoints 1100 / 820 / 560.
- Rhythm: `Section` with `spacing="default" | "sm" | "lg" | "xl"` (fluid clamp paddings) and `surface="dark" | "deep" | "bone" | "muted" | "gradient"`. Dark-dominant pages with several light (`bone`) bands spaced apart; closing asks are gradient statement bands, never cards.
- Type: Cormorant Garamond display/headings and Manrope body follow the approved family role table below. `ed-h2` is an editorial section display, `ed-h2-sm` is a compact feature title, and article/legal H2 stays an ordinary content heading. Statement measures live on the heading (`ed-statement*`), never on a wrapper.
- Layout primitives: `ed-split` (1.35fr/.65fr, `-even`, `-narrow`, `-end`, `-center`), `ed-matrix` (hairline grid; column count via `--ed-cols`, collapses to 2 columns under 1100px and 1 under 560px by track list, so an inline `--ed-cols` cannot override it), `ed-panel` (57/43 image + copy, `-reverse`), `ed-rail` (horizontal scroller), `ed-inset`, `ed-card`, `ed-steps`/`ed-step`/`ed-step-n`, `ed-link` + `ed-arrow`.
- Buttons: `brand` (58px, uppercase, 11px/700, tracked), `brandOutline`, `heroOutline` (same format in inverse colours over photography). CTA pairs stack full width under 640px. `heroGhost` is wizard chrome only.
- Motion: `ed-rise` reveal and `ed-zoom` 850ms on the shared curve; everything respects `prefers-reduced-motion`.
- Light bands re-point the semantic tokens for their subtree (including `--heading`, `--primary` and `--primary-foreground` so `brand` buttons are ink on bone) and leave `--inverse` alone so photo badges stay dark.
- Estimators: `/estimate` is a fixed one-screen `AppFrame` (Cabinet: `GuidedFlowShell fitViewport`) with the step body between a compact header and a pinned footer; every step fits 390x844 without page scroll. Dialogs render above the frame (`z-[210]/[220]`).
- Mobile: hero stat cards become a three-cell strip; trust strips are left-aligned rows with an inline dot; phone layouts are checked by `scripts/verify-mobile-layout.mjs` and contrast by `npm run verify:contrast`.

## Permitted brand variation
- Colour tokens and accent (Remodeling sage, Construction ochre, Handyman blue, Cabinet teal), logos and wordmarks, photography, copy, service data, section order per page, and which sections a page uses. Header and footer structure follow the same pattern with brand-specific links.
- Nothing else: type scale, spacing, primitives, button formats and estimator chrome stay shared so the sites read as one family.

## Grid balance (2026-09-08)

A row that ends with one lonely cell reads as unfinished, so every grid picks
its shape from its item count instead of a fixed column number.

- `.ed-matrix`: five items lay out as three then two, seven as four then three
  (span rules in `family.css`, desktop only). In the two-column range
  (561 to 1100 px) an odd last item takes the full row.
- `.ed-cards-3`: the card grid for posts, guides, projects and services. One
  column on phones, two on tablets (an odd last card is centred), three on
  laptops and up (a lone last card is centred, a pair widens to halves).
  Use it instead of `grid sm:grid-cols-2 lg:grid-cols-3`.
- `.ed-grid-balance`: opt-in for one or two column Tailwind grids (option
  cards, checklists, contact channels): the last odd item spans the row.
- Fixed counts: nine cities use three columns; four benefits use four.
- Two-column sections never leave a column empty. The long-form prose measure
  carries a sticky "In this guide" index; a lone local note or timeline is a
  split with the heading on the left; "what sets us apart" carries a photo
  under its sticky intro.

The section audit that found these lives at `scripts/_section-audit.mjs` in
the Remodeling repo (Playwright; nine viewports; flags orphans, one-sided
sections, sparse bands, text-only sections, overflow) with `scripts/section-sheets.py` for
contact sheets.

## Header clearance (2026-09-08)

The header is fixed and transparent over the page. `family.css` gives the first
section of every route `padding-top: var(--ed-hero-top)` (header height plus
48px) so breadcrumbs and eyebrows never sit under the menu. A hero that must
run flush to the top (image first) opts out with `pt-0`; the fixed estimator
frame is excluded. `scripts/_hero-gap.mjs` in the Remodeling repo measures the
gap on every template at 1440, 834 and 390 and lists anything under 32px.

## Approved family typography roles (2026-11-04)

Source: current master Website Design Quality 2.3, `styles/family-tokens.css`, and the owner's family comparison decision. The comparison found matching child-homepage scales; Cabinet is not being reduced in isolation. Canonical shared files stay under the manifest owner. This brand-owned record does not claim rollout or visual acceptance on other sites.

| Role | Phone | Tablet | Desktop | Line height / tracking |
| --- | --- | --- | --- | --- |
| Shared photo hero | Existing fluid 42–56 | Existing fluid 56–80 | Existing fluid 68–116 | Existing shared hero rule |
| Editorial section display | 36 | 52 | 64 | 1.05 / -0.02em |
| Interior H1 / feature title | 32 | 44 | 52 | 1.1 / -0.02em |
| Ordinary article/legal H2 | 28 | 36 | 40 | 1.15 / -0.01em |
| Content/card H3 | 22 | 26 | 28 | 1.2 / -0.01em |
| H4 | 18 | 20 | 20 | 1.3 / 0 |
| Body | 17 | 18 | 18 | 1.6 / 0 |
| Caption | 14 | 15 | 15 | 1.5 / 0 |
| Eyebrow | 13 | 13 | 13 | 1.3 / +0.06em |
| Navigation / button | 15 / 16 | 15 / 16 | 15 / 16 | 1 / 0 |

Phone is below 640px; tablet 640–1023px; desktop 1024px and above. Use the existing `--fs-*`, `--lh-*`, tracking, `--stack-heading` and `--stack-cta` tokens. Cabinet's site-owned presentation rules map marketing and content roles; estimator/application input geometry and the shared hero scale remain outside those selectors. Keep the two fonts, teal accent, approved imagery, full-head treatment, content and workflows.

Final rendered role equality, fonts, wrapping, enlarged text, hero/action clearance, relevant input states and independent review remain required before release. This profile update and source checks alone do not establish those passes.
