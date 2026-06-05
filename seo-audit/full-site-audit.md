# Full Site Audit - Boise Cabinet Co

Domain: boisecabinet.co
Stack: Next.js 14.2 App Router, React 18, TypeScript, Tailwind, shadcn/ui
Rendering: Static (SSG) for all public pages; custom static WebP image loader
Audit date: 2026-06-05

## 1. Business identity (single source of truth)

| Field | Value | Status |
|---|---|---|
| Name | Boise Cabinet Co | OK |
| Legal | Boise Cabinet Co LLC | OK |
| Phone | (208) 555-0100 | PLACEHOLDER - replace before launch |
| Email | hello@boisecabinet.co | OK |
| Address | 2283 N Coopers Hawk Ave, Kuna, ID 83634 | Verify |
| Founded | 2017 | OK |
| Service area | Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell | OK |
| Rating / reviews | 0 / 0 | MISSING - no aggregateRating emitted |
| License # | "available upon request" | PLACEHOLDER |
| sameAs | Facebook, Instagram (guessed) | Verify; add GBP/Houzz/BBB |

Config lives in `shared/siteConfig.ts`, `lib/seo.ts` (`BUSINESS_INFO`, `CITY_SEO_DATA`).

## 2. Stale documentation warning

`SEO-AUDIT-CONTEXT.md`, `SEO-AUDIT-INVENTORY.md`, `SEO-AUDIT-SUMMARY.md`, `SEO-AUDIT-LOG.md`, and `replit.md` describe a former "Boise Remodeling Co" business with 168 city-service pages and `/services/[slug]/[city]` routes that **no longer exist**. The live site is a catalog-driven cabinet company. Those docs are superseded by this `/seo-audit/` set.

## 3. Route inventory (live)

### Indexable marketing
- `/` (home)
- `/about`, `/contact`, `/testimonials`, `/warranty`
- `/cabinets` + 13 `/cabinets/[room]`
- `/collections` + 1 `/collections/[slug]`
- `/finishes` + 3 `/finishes/[category]` + ~299 `/finishes/[category]/[slug]`
- `/door-styles` + 6 `/door-styles/[slug]`
- `/products` + 9 `/products/[category]` + ~320 `/products/[category]/[slug]`
- `/accessories`, `/hardware`, `/construction`, `/compare`, `/catalog`
- `/guides` + 10 `/guides/[slug]`
- `/blog` + 56 `/blog/[slug]` + indexable `/blog/category/[hubSlug]`
- `/resources` + `/resources/ada-canyon-permit-flow`
- `/privacy-policy`, `/terms-of-service`

### Should be non-indexable (tools / utilities / B2B)
- `/design-studio`, `/estimate`, `/finder`, `/search`, `/login`, `/dealer`, `/installer`

### Correctly noindexed
- `/admin/*`, `/subcontractor/*`, `/partner/*`, `/portal/*`, `/style-guide`, 404, thin blog hubs

## 4. Severity-ranked findings

Scale: CRITICAL > HIGH > MEDIUM > LOW

| # | Sev | Area | Finding | File |
|---|---|---|---|---|
| 1 | CRITICAL | Programmatic | 299 finish detail pages: no prose, no JSON-LD, templated meta, all sitemapped | `app/finishes/[category]/[slug]/page.tsx` |
| 2 | CRITICAL | Programmatic | 320 product SKU pages: 9 shared descriptions, 22 duplicate title groups (100 pages titled "Wall Cabinet"), all sitemapped | `app/products/[category]/[slug]/page.tsx`, `scripts/catalog/codegen-catalog.mjs` |
| 3 | HIGH | Schema | `hasOfferCatalog` emits `/services/{slug}` URLs; no `/services` route (legacy redirects) | `lib/schema.ts` L75-86 |
| 4 | HIGH | Indexation | `/products/[category]` has NO metadata export (inherits site default title/desc, no canonical) | `app/products/[category]/page.tsx` |
| 5 | HIGH | E-E-A-T | rating 0 / reviewCount 0; no aggregateRating; Review schema generator exists but unused | `lib/seo.ts` L425-426, `lib/schema.ts` L202 |
| 6 | HIGH | Entity | Finish count conflict: 108 (hero stat) vs 299 (FAQs/about/catalog truth) | `shared/siteContent.ts` L19 |
| 7 | HIGH | Content | Broken guide-slug links (likely 404) | `shared/content/wave1/locationGuides.ts` L54-60 |
| 8 | MEDIUM | Indexation | `/search`, `/design-studio` in sitemap; `/login` indexable; `/finder`,`/dealer`,`/installer` ambiguous + no canonical | `app/sitemap.ts`, `app/robots.ts` |
| 9 | MEDIUM | Indexation | Sitemap omits `/catalog`, `/warranty`, `/estimate` | `app/sitemap.ts` |
| 10 | MEDIUM | NAP | Placeholder phone `(208) 555-0100`; footer missing street address | `shared/siteConfig.ts`, `components/Footer.tsx` |
| 11 | MEDIUM | AEO | Homepage emits Speakable schema with no `data-speakable` DOM target | `components/seo/HomePageSchema.tsx` |
| 12 | MEDIUM | AEO | Cluster posts reuse first 6 hub FAQs (duplicate FAQ content) | `shared/content/contentFactory.ts` L98-101 |
| 13 | MEDIUM | CRO | Hero CTA pushes Design Studio/collections, not consult; mismatch with nav | `components/sections/HeroSection.tsx` |
| 14 | MEDIUM | E-E-A-T | No team/founder bios, no license/insurance/bond specifics | `app/about/page.tsx` |
| 15 | MEDIUM | Internal links | 38 pages below 5 incoming links | `data/internal-links.json` (audit) |
| 16 | MEDIUM | Perf | Global client shell (Navigation + React Query + useAuth fetch) every page | `app/layout.tsx`, `components/Navigation.tsx` |
| 17 | MEDIUM | Perf | Homepage ships full EstimateCalculator wizard | `app/page.tsx` L49 |
| 18 | MEDIUM | Perf | Hero LCP preload mismatches variant loader output | `app/layout.tsx` L77-82 |
| 19 | LOW | GEO | `public/llms.txt` stale (3 door styles vs 6, no finish count) | `public/llms.txt` |
| 20 | LOW | Perf | Dead deps: framer-motion, leaflet, react-icons, @next/third-parties | `package.json` |
| 21 | LOW | Content | `GuidePageLayout` links via `replacesSlug` not `slug` | `components/marketing/GuidePageLayout.tsx` L123 |
| 22 | LOW | Tech | Hardcoded canonicals on legal pages bypass `NEXT_PUBLIC_SITE_URL` | `app/privacy-policy/page.tsx`, `app/terms-of-service/page.tsx` |

## 5. Strengths to preserve

- Static SSG + custom WebP variant pipeline + immutable cache headers + LQIP blur placeholders.
- Strong topical hub-and-spoke content system (8 hubs, 10 guides, 56 clusters) with automated internal-link graph + content QA gates.
- Per-page schema helpers (Article, FAQ, Breadcrumb, Speakable, WebPage, Product, CollectionPage) in `lib/schema.ts`.
- Sophisticated conversion tooling (estimator, Design Studio, modal CTAs, consult form with smart handoffs).
- `next/font` with `display: swap`; no third-party analytics scripts (good TBT).

## 6. Overall scores (sitewide, 0-100)

| Dimension | Score | Notes |
|---|---|---|
| Technical SEO | 72 | Strong SSG; schema URL + indexation defects |
| Local SEO | 58 | NAP placeholders, no reviews, local signals thin |
| GEO | 64 | Good entity helpers; stale llms.txt, count conflicts |
| AEO | 66 | FAQ/Speakable present; homepage gap, duplicate FAQs |
| E-E-A-T | 52 | No reviews, no bios, vague credentials |
| Content quality | 70 | Deep cost pillar; thin factory clusters + programmatic pages |
| Conversion | 71 | Great tooling; hero/funnel misalignment |
| Performance | 68 | Good pipeline; global client shell + homepage estimator |
| Doorway risk | HIGH | 619 templated detail pages indexed |

See `implementation-roadmap.md` for sequencing and `completed-updates.md` for what was shipped.
