# Doorway Page Analysis - Boise Cabinet Co

Evaluated against Google's doorway page guidelines: pages created primarily for search engines that funnel users to the same destination, with little unique value.

## Google doorway signals checked

1. Multiple pages targeting similar queries to funnel users to one place.
2. Pages generated to rank for many variants (city/keyword swaps).
3. Thin, near-duplicate pages with no standalone value.
4. Pages users would not seek out if not for search.

## Findings

### Product SKU pages (320) - DOORWAY RISK: HIGH
- 9 shared descriptions, 22 duplicate title groups, body differs only by dimensions.
- All funnel to Design Studio / consult.
- Verdict: doorway-like at scale. Action: NOINDEX, follow + self-canonical + remove from sitemap. Keep for UX.

### Finish detail pages (299) - DOORWAY RISK: HIGH
- No prose, no schema, formulaic meta, near-duplicate especially across 191 woodgrains.
- Verdict: doorway-like in aggregate. Action: curate indexable subset with genuine unique content + schema; NOINDEX the long-tail to category. Fix 6 duplicate titles.

### Catalog hubs / categories - DOORWAY RISK: LOW
- `/cabinets`, `/finishes`, `/door-styles`, `/collections`, `/products`, `/catalog`, `/compare` are legitimate navigation/filter/comparison pages. Keep.

### Content (guides/blog) - DOORWAY RISK: LOW
- Hub-and-spoke with distinct intents. Thin factory clusters are a quality issue, not doorway (each targets a distinct sub-topic). Deepen rather than remove.

### No city doorway pages exist
- The former remodeling site's 168 city-service pages are gone. We will NOT recreate them. Local handled via weaving + GBP (see `local-seo-plan.md`).

## "Unique info required to justify indexing" (per page type)

| Page type | Minimum unique info to keep indexable |
|---|---|
| Product SKU | Unique use-cases, when-to-use, pairing, real dimensions narrative, install notes. (Not met -> noindex) |
| Finish (kept) | Undertone, color family, recommended rooms/styles, pairing door styles, in-room visualization, care notes. (To be added) |
| Room page | Already has unique room copy; add product cross-links + local + FAQ |
| Door style | Already unique-ish; add FAQ + pairing |
| Product category | Add intro copy, size/use guidance, FAQ, schema (rewrite) |

## Indexation policy (to implement)

```
isFinishIndexable(finish):
  - false if name collides with another finish (until disambiguated)
  - false if category == 'woodgrain' AND not in curated-allowlist
  - false if flagged low-demand SKU-style variant
  - else true (and must carry enriched content + schema)

isProductSkuIndexable(product): false (noindex, follow, self-canonical)
```

Noindexed pages: `robots: { index:false, follow:true }`, self-canonical, excluded from sitemap, still internally linked for UX/crawl.

## Outcome

- Eliminates doorway exposure on 320 product SKUs and the finish long-tail.
- Retains a defensible, genuinely-useful indexable catalog.
- Aligns with "quality over page count" objective.
