# Completed Updates - Boise Cabinet Co

Live log of implemented changes. Populated as each phase ships. Before/after where meaningful. Outstanding client TODOs (real data) listed at the end.

Status legend: DONE / IN PROGRESS / PENDING

## Phase 0 - Audit deliverables
- DONE: Authored 18 `/seo-audit/*.md` documents.

## Phase 1 - Critical technical SEO + schema
- DONE: `lib/page-metadata.ts` + `lib/catalog-metadata.ts` now support a `noindex` option (emits `robots: index:false, follow:true`).
- DONE: Fixed `hasOfferCatalog` offer URLs - added `url` field to `ServiceData`/`SERVICES` (`shared/contentData.ts`) pointing to real `/cabinets/*` and `/collections/custom` routes; `lib/schema.ts` now uses `s.url` (was dead `/services/{slug}`).
- DONE: `/products/[category]` rewrite - added `generateMetadata` (unique title/description/canonical per category), `CollectionPage` + `BreadcrumbList` JSON-LD, and unique per-category intro copy. (Before: NO metadata, NO schema.)
- DONE: NOINDEX applied to `/finder`, `/dealer`, `/installer`, `/estimate` (via `catalogMetadata noindex`), `/design-studio` (layout robots), plus new `app/search/layout.tsx` and `app/login/layout.tsx` with noindex + canonical.
- DONE: Sitemap - removed `/search` + `/design-studio`; added `/catalog` + `/warranty` + 9 `/products/[category]` pages; excluded product SKU detail pages (noindex). `/estimate` intentionally NOT added (now noindex).
- DONE: `app/robots.ts` disallow expanded (`/portal/`, `/partner/`, `/login`, `/dealer`, `/installer`, `/search`).
- DONE: `FAQPage` schema added to `/collections/[slug]` (uses existing `getCollectionFaqs`).
- DONE: Legal page canonicals now use `buildCanonical` (was hardcoded https URL).
- DONE: Fixed broken/404 guide-slug links in `shared/content/wave1/locationGuides.ts` (4 topic links -> canonical slugs; removed self-referential city/neighborhood 301 links), `shared/resourcePdfContent.ts`, and `app/resources/ada-canyon-permit-flow/page.tsx`.

## Phase 2 - Programmatic value + doorway remediation
- DONE: New `lib/catalog/indexation.ts` policy helper. Cabinet SKUs never indexed; finishes indexable = matte + gloss + curated woodgrain looks + base variant of any colliding name. Result: 193 indexable finishes (from 299), 106 noindex,follow; product SKUs all noindex,follow.
- DONE: Product SKU pages (`/products/[category]/[slug]`) now `noindex,follow`, unique title incl. dimensions, richer description, plus a category use-note paragraph. Removed from sitemap (Phase 1).
- DONE: New `lib/catalog/finishContent.ts` generates attribute-driven, finish-specific copy (intro, "where it works", door-style pairings, care notes) + 3-4 unique FAQs per finish.
- DONE: Finish detail pages (`/finishes/[category]/[slug]`) rewritten: enriched content blocks + visible FAQs, `Product` + `BreadcrumbList` + `FAQPage` JSON-LD (was NONE), unique `{name} Cabinet Finish` title, and policy-driven noindex. (Before: ~40-80 words, no schema, formulaic meta.)
- DONE: Sitemap now lists only the 193 indexable finishes (was all 299).
- DONE: Finish category grid now links to detail pages (`showLinks`); room cabinet grid cards now link to product pages (`components/catalog/OptionsSelector.tsx` CabinetCard).

## Phase 3 - E-E-A-T, trust & conversion
- DONE: Fixed finish count 108 -> 299 (`shared/siteContent.ts` HERO_STATS). No other stale 108 references.
- DONE: Env-driven trust config in `shared/siteConfig.ts` (`trust.licenseNumber`, `gbpUrl`, `houzzUrl`, `bbbUrl`, `yelpUrl`, `ratingValue`, `reviewCount`) with flagged TODOs; `BUSINESS_INFO` (`lib/seo.ts`) now consumes them (license line, rating/reviewCount, sameAs filtered for empties).
- DONE: `aggregateRating` already self-guards on reviewCount>0, so it auto-emits once `NEXT_PUBLIC_REVIEW_COUNT/RATING` are set. Added `LocalBusiness` schema to `/testimonials` (carries aggregateRating); deliberately did NOT fabricate individual Review objects (flagged TODO for verified review feed).
- DONE: Team scaffold (`TEAM` in `shared/siteContent.ts`) with clearly-flagged placeholder founder/designer/installer bios; rendered a Team section on `/about`; Person schema emitted only for confirmed (non-placeholder) members. About license paragraph now shows real license # when env set.
- DONE: Footer now shows full street address (`<address>`) and license # when set (`components/Footer.tsx`).
- DONE: Added Contact to primary nav (`shared/cabinetNav.ts`).
- DONE: Hero secondary CTA aligned to funnel - "Get a project estimate" -> `/estimate` (was "Explore collections" -> `/collections`).
- DONE: Reduced consult-form friction - property address is now optional (dropped strict house-number requirement); ZIP still required for service-area routing. Updated client schema (`ConsultationForm.tsx`), confirm step, label, and API (`app/api/consultation/route.ts`) + email template + nullable DB insert.

### Remaining client TODOs surfaced this phase
- Set `NEXT_PUBLIC_PHONE` / `NEXT_PUBLIC_PHONE_TEL` (real phone).
- Set `NEXT_PUBLIC_LICENSE_NUMBER`, `NEXT_PUBLIC_GBP_URL`, `NEXT_PUBLIC_HOUZZ_URL`, `NEXT_PUBLIC_BBB_URL`, `NEXT_PUBLIC_YELP_URL`.
- Set `NEXT_PUBLIC_REVIEW_RATING` + `NEXT_PUBLIC_REVIEW_COUNT` (enables ratings in schema).
- Replace `TEAM` placeholder names/bios and set `isPlaceholder: false`.

## Phase 4 - Content, GEO, AEO, local & internal linking
- DONE: Added homepage `data-speakable="summary"` target (sr-only, names 8 cities + key facts) so the existing Speakable schema resolves.
- DONE: Strengthened Organization schema (`lib/schema.ts`) with `slogan`, `knowsAbout`, and `areaServed` (8 cities).
- DONE: Fixed `GuidePageLayout` cluster links to use canonical `slug` (was `replacesSlug`, which 301-hopped).
- DONE: Blog post breadcrumb schema now includes the hub tier (Home > Blog > {Hub} > Post).
- DONE: Rewrote `public/llms.txt` with accurate catalog facts (13 rooms, 1 custom collection, 6 door styles, 299 finishes, 9 product categories), tools, content hubs, NAP, and service area.
- DONE: Unique per-cluster FAQs - `contentFactory.ts` now generates cluster-specific FAQs (from title/quick answer/takeaways) + a rotated slice of hub FAQs, ending the identical-6-FAQ duplication across each hub. All 66 content pieces still pass QA with 8 FAQs each.
- DONE: Weave local signals - homepage summary, finish pages (Boise/Meridian/Eagle/Treasure Valley), product category intros, and llms.txt now carry local context (complementing already city-rich guides/room pages). No standalone city pages added.
- DONE: Resolved all 38 weak-link pages - hardened `scripts/internal-links/lib.ts` (raised manifest targetLimit, added repeated floor sweeps that avoid creating new violations) and regenerated `data/internal-links.json`. Audit now reports 0 weak/orphan pages, avg 8.23 incoming (was 6.23 with 38 weak).
- DONE: Updated `verify-content.ts` to flag stale "108 finishes" copy and corrected the catalog-copy log label to 299.

## Phase 5 - Performance
- DONE: Homepage estimator is now lazy - `components/estimate/LazyEstimateCalculator.tsx` dynamically imports the wizard (`ssr: false`) and only mounts it via IntersectionObserver when the section nears the viewport, with a fixed-height placeholder to avoid CLS. Keeps the heavy client island out of the initial homepage JS.
- DONE: Deferred the global auth fetch - added a readable `brc_auth` hint cookie (set in `establishSession`, cleared on logout / 401 in `lib/auth.ts` + auth routes); `useAuth` now gates its `/api/auth/user` query on that hint, so anonymous marketing visitors no longer fire an auth request on every page load.
- DONE: Fixed hero LCP preload mismatch - removed the manual `<link rel="preload" href="/images/marketing/hero-home.webp">` (the custom variant loader serves `-{width}.webp`, so the raw preload was a wasted duplicate download); the hero `<Image priority>` now owns the correctly-matched preload.
- DONE: Trimmed Fraunces font weights from [300,400,500]x[normal,italic] (6 files) to [300,400] (4 files); weight 500 was unused in the design system.
- DONE: Removed dead dependencies (15 packages): `framer-motion`, `react-icons`, `@next/third-parties`, `leaflet` (+`-draw`/`-geometryutil`/`-geosearch`), `react-leaflet`, `@types/leaflet`. None were imported anywhere.
- DONE: Verified Three.js (`three`, `@react-three/fiber`, `@react-three/drei`) is route-isolated to Design Studio components (`components/design-studio/*`, `lib/design/*`); not referenced by the global shell.

## Phase 6 - Verification
- DONE: `npm run verify:content` - PASS (catalog copy now reports 299 finishes / 6 door styles; all guide/blog embeds present).
- DONE: `npm run verify:no-em-dash` - PASS (no em dashes introduced).
- DONE: `npm run verify:images` - PASS (1 pre-existing warning: legacy `door-styles/shaker.webp` swatch, unrelated to this work).
- DONE: `npm run links:generate` + `npm run audit:links` - regenerated manifest (86 pages, 708 links); audit reports 0 weak, 0 orphan, 0 broken links, avg 8.23 incoming.
- DONE: `npx tsc --noEmit` - the type errors I introduced (extra `getCabinetProductsByCategory` arg in `/products/[category]`, optional-address `value` typing in `ConsultationForm`) are fixed. Remaining errors are all pre-existing and unrelated (build runs with `typescript.ignoreBuildErrors: true`).
- DONE: `npx next build` - PASS. 9 `/products/[category]` pages prerender as money pages; 320 SKU + curated finish detail pages build (SKUs/duplicate finishes noindexed); homepage stays fully static with the estimator split into its own lazy chunk.

### Net result vs. audit defects
- Schema `hasOfferCatalog` now points to real `/cabinets/*` routes (was non-existent `/services/*`).
- 320 product SKUs + 106 low-value/duplicate finishes set to `noindex,follow`; 9 category pages + 193 curated finishes are the indexable, content-rich surface (was 619 thin/doorway pages all sitemapped).
- Finish count reconciled to 299 sitewide (was 108 vs 299 conflict).
- Internal linking: 0 weak/orphan pages (was 38 weak).
- Performance: homepage estimator lazy-loaded, anonymous auth fetch eliminated, hero preload mismatch removed, Fraunces trimmed to 4 files, 15 dead packages removed.

---

## Outstanding client data TODOs (placeholders to replace before launch)
- Real phone number (set `NEXT_PUBLIC_PHONE` + `NEXT_PUBLIC_PHONE_TEL`).
- Verify HQ street address.
- Idaho contractor license number, bond amount, insurance carrier.
- Real Google review count + average rating (enables AggregateRating/Review schema).
- Google Business Profile URL + Houzz/BBB/Yelp profiles (for `sameAs`).
- Named team/founder bios + photos + titles.
- Confirm top 3-5 local competitors for live SERP comparison.
