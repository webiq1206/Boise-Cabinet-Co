# Implementation Roadmap - Boise Cabinet Co

Sequenced execution. Phases 1-5 map to plan todos. Each item notes files and risk. Track completion in `completed-updates.md`.

## Phase 1 - Critical technical SEO + schema (low risk)

| # | Task | Files |
|---|---|---|
| 1.1 | Fix `hasOfferCatalog` URLs to `/cabinets/*`; reconcile `SERVICES` names/slugs | `lib/schema.ts`, `shared/contentData.ts` |
| 1.2 | Add `generateMetadata` + canonical + `CollectionPage` schema + intro to `/products/[category]` | `app/products/[category]/page.tsx` |
| 1.3 | NOINDEX tools/B2B: `/design-studio`, `/estimate`, `/finder`, `/search`, `/login`, `/dealer`, `/installer`; add canonicals | respective `page.tsx`/`layout.tsx` |
| 1.4 | Sitemap: remove `/search` + `/design-studio`; add `/catalog`, `/warranty`, `/estimate`; apply finish/product policy | `app/sitemap.ts` |
| 1.5 | Expand `robots.ts` disallow (`/portal/`, `/partner/`, `/login`, `/dealer`, `/installer`, `/search`) | `app/robots.ts` |
| 1.6 | Add `FAQPage` schema to collection pages | `app/collections/[slug]/page.tsx` / template |
| 1.7 | Replace hardcoded legal canonicals with `buildCanonical` | `app/privacy-policy/page.tsx`, `app/terms-of-service/page.tsx` |
| 1.8 | Fix broken guide-slug links + add 301s | `shared/content/wave1/locationGuides.ts`, `shared/resourcePdfContent.ts`, `app/resources/ada-canyon-permit-flow/page.tsx`, `shared/contentRedirects.ts` or `next.config.js` |

## Phase 2 - Programmatic value + doorway remediation (medium risk)

| # | Task | Files |
|---|---|---|
| 2.1 | Indexation policy helper (`isFinishIndexable`, product SKU noindex) | new `lib/catalog/indexation.ts` (or similar) |
| 2.2 | Apply noindex/canonical to product SKU template; remove from sitemap | `app/products/[category]/[slug]/page.tsx`, `app/sitemap.ts` |
| 2.3 | Enrich product description codegen + richer SKU body | `scripts/catalog/codegen-catalog.mjs`, product components |
| 2.4 | Enrich finish detail template: attribute-driven content, cross-links, `Product`/`FAQPage` schema; fix 6 title collisions; apply policy | `app/finishes/[category]/[slug]/page.tsx`, finish components |
| 2.5 | Enable detail links on finish category grid; link room cabinet grids to products | finish/room components |

## Phase 3 - E-E-A-T, trust & conversion (medium risk)

| # | Task | Files |
|---|---|---|
| 3.1 | Env-driven NAP; flagged placeholders; align phone everywhere | `shared/siteConfig.ts`, `lib/seo.ts` |
| 3.2 | Fix finish count 108 -> 299 sitewide | `shared/siteContent.ts` |
| 3.3 | Team/founder bios + credentials scaffold; license/insurance/bond (flagged); Person schema | `app/about/page.tsx`, `shared/siteContent.ts`, `lib/schema.ts` |
| 3.4 | Wire `Review`/`aggregateRating` (guarded by real data); add to testimonials + home | `app/testimonials/page.tsx`, `components/seo/HomePageSchema.tsx`, `lib/schema.ts` |
| 3.5 | Footer full NAP (street address); add `sameAs` profile slots | `components/Footer.tsx`, `lib/seo.ts` |
| 3.6 | Add Contact to primary nav | `shared/cabinetNav.ts` |
| 3.7 | Align hero CTA with consult/estimate; reduce consult-form friction | `components/sections/HeroSection.tsx`, `components/ConsultationForm.tsx` |

## Phase 4 - Content, GEO, AEO, local & internal linking (medium risk)

| # | Task | Files |
|---|---|---|
| 4.1 | Add homepage `data-speakable="summary"` target | `app/page.tsx` / hero/about-summary component |
| 4.2 | Weave local signals into hubs/rooms/about/contact | content + page files |
| 4.3 | Unique per-cluster FAQs; deepen highest-intent clusters | `shared/content/contentFactory.ts`, hub content |
| 4.4 | Blog hub-tier breadcrumbs; populate `featuredSnippetTargets` | `app/blog/[slug]/page.tsx`, content |
| 4.5 | Rewrite `public/llms.txt` (6 door styles, 299 finishes, hub URLs, NAP) | `public/llms.txt` |
| 4.6 | Strengthen Organization entity (`knowsAbout`, founder, sameAs) | `lib/schema.ts` |
| 4.7 | Fix `GuidePageLayout` `replacesSlug`->`slug`; add room/finish FAQs | `components/marketing/GuidePageLayout.tsx`, catalog templates |
| 4.8 | Resolve 38 weak-link pages; regenerate links | content `relatedLinks`, `npm run links:generate` |

## Phase 5 - Performance (medium risk)

| # | Task | Files |
|---|---|---|
| 5.1 | Lazy-load homepage estimator | `app/page.tsx` |
| 5.2 | Defer `useAuth` fetch / lighten Navigation on public pages | `components/Navigation.tsx`, `hooks/useAuth.ts` |
| 5.3 | Fix hero preload mismatch | `app/layout.tsx` |
| 5.4 | Trim font weights | `app/layout.tsx` |
| 5.5 | Remove dead deps | `package.json` |
| 5.6 | Verify Three.js route isolation | design-studio components |

## Phase 6 - Verify & document

- Run: `verify:content`, `verify:no-em-dash`, `verify:images`, `links:generate`, `audit:links`, typecheck/build.
- Populate `completed-updates.md` with before/after + remaining client TODOs.

## Risk controls

- No slug changes without 301s. Keep NAP env-driven and placeholders clearly flagged. No new external tags without confirmation. Respect content rules (no em dashes).
