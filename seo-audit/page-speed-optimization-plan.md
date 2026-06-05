# Page Speed & Core Web Vitals Plan - Boise Cabinet Co

Target: 95+ desktop and mobile where technically feasible, without sacrificing UX/conversions.

## Foundations (good, keep)

- Static SSG + custom WebP variant loader (`lib/images/staticVariantLoader.ts`), immutable cache headers, `compress: true`, `output: 'standalone'`.
- LQIP blur placeholders (`shared/generated/imageBlur.ts`), `next/image` with `fill` + aspect-ratio (low CLS).
- `next/font` with `display: swap`. No third-party analytics scripts.
- Three.js dynamically imported in Design Studio.

## Risks and fixes

| # | Risk | Impact | Fix |
|---|---|---|---|
| 1 | Global client shell: Navigation + React Query + `useAuth` fetch on every page | TBT/INP sitewide | Defer auth fetch (lazy/after idle); keep Navigation light; avoid blocking auth call on public pages |
| 2 | Homepage ships full `EstimateCalculator` wizard (~721 lines + catalog) | LCP/TBT on home | `dynamic()` import below the fold (ssr false or lazy), or load on interaction |
| 3 | Hero LCP preload mismatch: layout preloads base `hero-home.webp` while loader serves `-1280`/`-768` variant; also duplicates `next/image priority` preload | LCP, wasted bytes | Remove manual preload and let `next/image priority` own it, OR preload the actual variant URL |
| 4 | 7+ font weights (Montserrat 4 + Fraunces 3 + italic) | FCP/LCP | Trim to needed weights (e.g. Montserrat 400/500/600; Fraunces 400 italic) |
| 5 | Dead deps: framer-motion, leaflet, react-icons, @next/third-parties | build bloat / accidental bundling | Remove from `package.json` (verify no imports) |
| 6 | `CatalogBrowser`/`/search` import full catalog client-side | INP on catalog | Code-split; load catalog data lazily; server-render where possible |
| 7 | Marketing hero variants cap at 1280px | large-desktop LCP serves original | Add 1920 variant for marketing heroes |
| 8 | `.js` reveal system hides content until JS | minor CLS/INP | Keep noscript fallback; limit Reveal wrappers on long pages |

## LCP plan (homepage)

- Hero image owns LCP: single correct preload (variant-aware) + `priority`.
- Defer estimator + non-critical sections.
- Inline critical above-the-fold; avoid layout shift via reserved aspect ratios (already used).

## INP/TBT plan

- Reduce per-page client JS: defer auth, lazy estimator, code-split catalog browser/search.
- Keep Three.js isolated to `/design-studio` (verify no leakage into shared chunks).

## CLS plan

- Maintain aspect-ratio wrappers; ensure fonts use `swap` (done); reserve space for dynamic sections.

## Measurement

- Lighthouse CI on: `/`, `/cabinets/kitchen`, `/finishes`, `/guides/boise-cabinet-cost-guide`, `/products/base`.
- Track LCP < 2.5s, INP < 200ms, CLS < 0.1 on mobile.

## Notes

- `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` are on (`next.config.js`) - perf/SEO regressions can ship silently; consider tightening in CI (out of scope for this pass unless requested).
- Do not add GA4/tag managers without explicit confirmation (would add main-thread cost).
