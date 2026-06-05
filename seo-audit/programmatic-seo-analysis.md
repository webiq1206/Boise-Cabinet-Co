# Programmatic SEO Analysis - Boise Cabinet Co

Focus: the two large template-generated surfaces and whether they provide standalone value.

## Surfaces

| Template | Pages | Data source |
|---|---|---|
| `/finishes/[category]/[slug]` | 299 (55 matte, 53 gloss, 191 woodgrain) | `shared/catalog/generated/finishes.ts` |
| `/products/[category]/[slug]` | 320 (9 categories) | `shared/catalog/generated/cabinetProducts.ts` |

## Uniqueness analysis

### Finishes (299)
- Data has NO `description` field on any finish (0 matches). Differentiators: `name`, `slug`, `hexColor`, `category`, `sheen`, `colorFamily`, `priceTierMarker`, compatibility arrays, `imagePath`.
- 293 unique names; 6 collisions (Black-Matte x3, Black-Gloss x2, Bianco-Gloss x3, Black-Woodgrain x2).
- Page body: ~40-80 visible words (labels/chips/links). No prose, no FAQ, no JSON-LD.
- Meta: `"{name} {category} cabinet finish from Boise Cabinet Co."` (formulaic).

Content uniqueness score: ~30/100. Search-intent uniqueness: low-medium (some colors have real demand). Local value: low. User value: medium (visual swatch + compatibility is useful).

### Products (320)
- `description` is category-templated in codegen -> only 9 unique strings (e.g. 136x "Custom wall cabinet built to fit your space.").
- 25 unique `name` values but 22 title groups repeat (100 pages titled "Wall Cabinet").
- Real per-SKU differentiation: `slug`, `dimensions`, `configuration` chips, diagram image.
- Page body: ~70-120 words. Product + Breadcrumb schema (with the thin shared description).

Content uniqueness score: ~25/100. Search-intent uniqueness: very low (dimensions only). Local value: none. User value: medium (spec/configurator).

## "Would this page exist if search engines didn't?" test

- Product SKU pages: YES for users (spec/config inside Design Studio), but NOT as standalone indexable search targets. -> noindex, keep usable.
- Finish pages: YES for users browsing colors; SOME have standalone search value (named popular colors). -> curate an indexable subset; noindex the long tail.

## Similarity flags

| Group | Similarity | Pages |
|---|---|---|
| Product SKUs within a category | 90%+ | ~320 (body copy identical bar dimensions) |
| Woodgrain finishes | 80-90% | 191 |
| Matte/gloss finishes | 70-85% | 108 |
| 6 duplicate-name finishes | ~100% title | 6 |

## Recommendations (encoded as indexation policy)

### Products
- `robots: noindex, follow`, self-canonical, remove from sitemap.
- Promote `/products/[category]` (9) to indexable money pages: add metadata + `CollectionPage` schema + unique intro copy + "common sizes/uses" + FAQ.
- Optionally add unique per-SKU copy later from `configuration`/`dimensions` to reconsider indexing.

### Finishes
- Build an indexation policy: keep indexable the finishes with genuine demand + uniqueness (named, distinct colors); `noindex,follow` + canonical-to-category for near-duplicate long-tail (esp. woodgrain SKU-like variants).
- For the indexable subset: generate unique attribute-driven content (color family, sheen, undertone, recommended rooms, pairing door styles/collections, in-room imagery), add `Product`/`FAQPage` schema, and disambiguate the 6 name collisions.
- Remove noindexed finishes from sitemap.

## Codegen change

`scripts/catalog/codegen-catalog.mjs` L300 generates the shared product description. Add richer, attribute-derived descriptions (category + size class + configuration) so even kept pages differ. Document in `completed-updates.md`.

## Net effect

- Index shrinks from ~619 thin templated URLs to a curated, genuinely-useful indexable set.
- Crawl budget concentrates on hubs, categories, guides, and high-value finishes.
- Doorway risk drops from HIGH to LOW while preserving full UX.
