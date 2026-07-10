# Local SEO & Geographic Authority Plan - Boise Cabinet Co

Service-area cabinet business, Meridian/Boise ID, Treasure Valley. City coverage is delivered via `/guides/[city]` location guides (no dedicated `/locations` routes).

## Verdict
The **city-page architecture is healthy** - 8 differentiated city guides + a Treasure Valley hub with real neighborhood specifics and clean internal linking. **Doorway risk: LOW.** The gaps are trust/data-side.

## NAP (consistent, real text)
Name **Boise Cabinet Co**, phone **(208) 477-1169**, email **hello@boisecabinet.co**, address **Meridian, ID** (city only, no street - service-area choice). Identical across siteConfig, footer, contact, schema, llms.txt. Nothing baked into images.

## Priority fixes
1. **[HIGH/DATA] Google Business Profile** - claim/verify, set `NEXT_PUBLIC_GBP_URL`, add to `sameAs` + LocalBusiness `@id`/`sameAs`. The strongest local signal, currently absent. Confirm the hardcoded FB/IG handles resolve.
2. **[HIGH/DATA] License #** - `NEXT_PUBLIC_LICENSE_NUMBER` (Idaho RCE) -> footer + schema populate.
3. **[HIGH/DATA] Reviews/aggregateRating** - real GBP data + on-page dated, sourced reviews; then set `NEXT_PUBLIC_REVIEW_*`.
4. **[MEDIUM/FIXED] Geo/locality** - default to Meridian coords (was Kuna/Boise mismatch).
5. **[MEDIUM/FIXED] Subtype** - dropped FurnitureStore.
6. **[MEDIUM/CODE] Local proof on city pages** - render city-matched case studies + testimonials in `GuidePageLayout`; add >=1 project + review for **Kuna, Star, Caldwell, Middleton** (currently zero proof) and a project for Nampa.
7. **[MEDIUM/CODE] Garden City** - it's in schema `areaServed`/`serviceArea` but has no page. Build one or remove from areaServed so claims match published pages.
8. **[LOW] Differentiate the repeated cost section/FAQ** across city guides (the one templated, near-duplicated block).

## Geographic authority map
| City | Page | Local FAQs | Review on-page | Project | Gap |
|---|:--:|:--:|:--:|:--:|---|
| Boise | Y | 8 | (agg only) | Y | reviews not on-page |
| Meridian | Y | 6 | - | Y | reviews not on-page |
| Eagle | Y | 6 | - | Y | reviews not on-page |
| Nampa | Y | 6 | Y* | N | no project |
| Kuna | Y | 6 | N | N | **no proof** |
| Star | Y | 6 | N | N | **no proof** |
| Caldwell | Y | 6 | N | N | **no proof** |
| Middleton | Y | 6 | N | N | **no proof** |
| Treasure Valley | Y (hub) | 14 | home only | home only | hub |
| Garden City | **N** | - | - | - | **in schema, no page** |
