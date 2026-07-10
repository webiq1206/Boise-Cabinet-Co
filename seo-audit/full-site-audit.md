# Full Site Audit - Boise Cabinet Co

**Target:** https://boisecabinet.co (production) - **Date:** 2026-07-10
**Mode:** LOCAL - **Depth:** standard - **Source access:** yes (Next.js 14 app-router codebase)
**Method:** full source review + live infra spot-checks (curl headers/robots/sitemap/schema on 12+ URLs) + 7 parallel specialist analyses.

> **Deploy note:** at audit time the live site was still serving the **pre-redesign build** (no `dark` class live; `s-maxage=31536000` CDN cache). The redesign is visual only - **all SEO substance (routes, metadata, schema, content, links) is identical to source**, so this audit is valid from source. Infra findings (headers, robots, sitemap, DNS) are live-current.

---

## Executive summary

Boise Cabinet Co is a **technically strong, well-engineered site with a best-in-class chassis and an empty trust tank.** The programmatic architecture that usually sinks catalog sites (382 SKU pages, 299 finishes, city pages) is **handled correctly** - the 382 product configs and 106 duplicate finishes are `noindex,follow` + sitemap-excluded, and the 8 city guides are genuinely locally unique (not doorway). SSR ships real content in raw HTML (great for AI), `llms.txt` exists, canonicals/meta/robots/sitemap all pass, and there are no soft-404s.

What holds the site back is **not code quality - it is missing trust data and content depth**:
- **No Google Business Profile link, no published license number, and zero live reviews/aggregateRating** - the three strongest local + E-E-A-T signals are all absent (env-driven slots exist but are unpopulated).
- **The team is anonymous** (role labels, no names/photos) so the site emits **zero Person entities**; blog/guides have no named author.
- **Imagery reads as generic/AI stock** on the highest-intent pages (real project photography is pending).
- **56 blog posts are thin** (median 217 words) with above-the-fold self-duplication.
- A handful of **technical gaps** (missing H1s on indexable detail pages, no `logo`/priceless-`Offer` in schema, a collection title bug) - **now fixed** (see `completed-updates.md`).

**Competitive read:** the strongest Boise competitors (Sweetwood - 45 yrs, named team, 46+ reviews) win trust the old-fashioned way but have weaker digital experience and thinner content. If BCC populates the trust data it has already engineered slots for, it pairs incumbent-level trust with a best-in-class site and can out-rank all of them.

---

## Scorecard (LOCAL weight profile)

Scores are 0-10, as-audited. Weighted overall uses the LOCAL profile.

| Dimension | Weight | Score | Grade | Basis |
|---|---:|---:|:--:|---|
| SEO (technical, on-page, indexation, schema, internal linking) | 20 | 8.0 | B | Canonicals/meta/robots/sitemap/soft-404/noindex-handling all pass; docked for missing H1s, schema logo/offers, collection title bug (all now fixed -> ~8.7) |
| Local SEO & geographic authority | 20 | 5.5 | D+ | City pages excellent + NAP consistent, but no GBP link, no license #, no reviews, geo/locality mismatch (fixed), thin proof on 4 cities |
| Content quality & topical authority (incl. E-E-A-T) | 15 | 5.0 | D | Strong hub/cluster scaffolding + llms.txt; thin blog, anonymous team (0 Person entities), no reviews, stock imagery |
| UX & conversion | 13 | 7.0 | B- | Best-in-class tools (estimator, Design Studio, finder); placeholder imagery, CTA fragmentation, fake-input steps (see UX audit) |
| GEO (entity clarity, AI readability) | 12 | 8.0 | B | SSR raw HTML strong, llms.txt present, entity clarity high; catalog detail lacks quotable numbers |
| AEO (answer extraction) | 8 | 6.5 | C | Blog is the model; door-style/finish/about/compare answer + FAQ gaps (door-style H1+answer now added) |
| Performance & Core Web Vitals | 7 | 7.0 | B- | TTFB ~0.22s, strong image pipeline; large HTML payloads (485KB room page); Lighthouse Not Verified (PSI quota) |
| UI, trust & branding | 5 | 6.0 | C | Cohesive premium dark brand; live trust signals near-empty |

**Weighted overall: 6.6 / 10 -> Grade C.** No dimension is capped by a Blocker (indexation is correct; the two Criticals were schema-validity, now fixed). With the data-dependent fixes (GBP, reviews, named team, real photos, license) this profile moves to a projected **B+/A-**.

---

## Findings by severity

### Blockers
- None. (Indexation, canonicals, and status codes are correct on production.)

### Critical (schema validity) - FIXED
- **No `logo` on Organization/LocalBusiness** -> blocked logo/knowledge-panel rich results. *Fixed.*
- **`Product` schema shipped a priceless `Offer`** on 382 products + finishes -> invalid Product rich result. *Fixed (Offer removed - custom/quote-only).*

### High
- **Local trust data absent (DATA - needs you):** no `NEXT_PUBLIC_GBP_URL`, no `NEXT_PUBLIC_LICENSE_NUMBER`, no `NEXT_PUBLIC_REVIEW_*`. The strongest local + trust signals are unpopulated.
- **E-E-A-T Expertise 2/10 (DATA - needs you):** team is 100% placeholders (name == role), so **zero Person entities**; no named author on any blog/guide.
- **Missing H1** on indexable finish-detail and door-style-detail templates. *Fixed.*
- **Two unlinked business entities** (Organization + LocalBusiness, no `@id`). *Fixed (stable `@id` + publisher-by-reference).*
- **Blog thin + self-duplicating** (median 217 words; excerpt + Quick Answer repeated in an "About" section across 56 posts). *Duplication removed; depth expansion is roadmapped.*
- **Internal-linking system governs only 92 of ~329 URLs** - finishes/doors/static pages are outside it; catalog templates never render their computed related-links. *Roadmapped.*
- **Deliverability:** DMARC `p=none` (monitor-only) and **no SPF record** (DNS - needs you).

### Medium
- Geo/locality mismatch (Meridian locality vs Boise/Kuna coordinates). *Fixed.*
- `FurnitureStore` subtype contradicts "no showroom." *Fixed (HomeAndConstructionBusiness + GeneralContractor).*
- `/construction` missing Service schema. *Fixed.*
- Collection title double-"Cabinets" bug. *Fixed.*
- 90 indexable woodgrain finishes share 100%-identical prose (still doorway-shaped). *Roadmapped (consolidate to gallery + ~15 with unique copy).*
- Door-style detail / About / Compare lack FAQ + FAQPage. *Roadmapped.*
- Catalog detail pages lack quotable numbers (lead time, warranty, price band). *Roadmapped.*
- No `/projects/[slug]` route - case studies (the best first-hand content) only render on the homepage. *Roadmapped.*
- Local proof missing on 4 city pages (Kuna, Star, Caldwell, Middleton). *Roadmapped.*
- Garden City in schema `areaServed` but no page. *Roadmapped.*
- Blog/guide titles lack a 60-char guard before the brand suffix. *Roadmapped.*
- Large HTML payloads (485KB `/cabinets/kitchen`) tie to the "large lists, no pagination" UX finding.

### Low
- `"cabinetss"` machine-templating typo. *Fixed.* Fake `(208) 555-0000` form placeholder. *Fixed.*
- www.boisecabinet.co does not resolve; `http->https` redirects with an explicit `:443`.
- Dead code: `generateReviewSchema`, `lib/landing-schema.ts` (unused); dead `type==="service"` internal-link audit check.
- Stale `SEO-AUDIT-INVENTORY.md` documents a defunct remodeling architecture.
- Breadcrumbs missing on `/dealer`, `/installer`.
- No `SearchAction` on WebSite (optional; `/search` is disallowed).

---

## Site-wide consistency report

- **Titles:** unique + templated per type; one bug (collection double-"Cabinets", fixed); product-detail titles >60 chars (mitigated by noindex); no blog/guide length guard.
- **Descriptions:** unique + benefit-led on every template. Pass.
- **Canonicals:** self-referencing absolute on every page. Pass.
- **H1:** was missing on finish-detail + door-style-detail (fixed); product-detail still H3 (noindex, low value). One H1 elsewhere.
- **Indexation:** exemplary - 382 products + 106 finish dupes `noindex,follow` + sitemap-excluded; utility/B2B pages both disallowed and noindexed.
- **Schema:** valid JSON across all templates; breadcrumbs everywhere; FAQ matches visible Q&A; fixes applied for logo/offers/@id/geo/subtype/construction.
- **Orphans:** none inside the 92-node manifest; finishes/doors are near-orphans outside it (roadmapped).
- **Broken links/images:** none found by the internal-link audit; no soft-404s.
- **NAP:** identical across siteConfig, footer, contact, schema, llms.txt (real text, not images).
- **Thin/duplicate:** blog (thin) and 90 woodgrain finishes (near-duplicate) are the two real exposures; city guides are exemplary.

See the companion files for detail: `page-quality-scorecard.md`, `metadata-map.md`, `schema-map.md`, `local-seo-plan.md`, `entity-map.md`, `internal-linking-plan.md`, `topical-authority-analysis.md`, `content-gap-analysis.md`, `programmatic-seo-analysis.md`, `geo-optimization-plan.md`, `aeo-optimization-plan.md`, `trust-signal-map.md`, `competitor-gap-analysis.md`, `keyword-map.md`, `implementation-roadmap.md`, `completed-updates.md`.
