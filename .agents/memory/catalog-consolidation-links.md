---
name: Catalog consolidation link hygiene
description: Six old catalog routes 301 to /catalog; how to keep internal links from pointing at them.
---

**Rule:** `/finishes`, `/door-styles`, `/products`, `/collections`, `/finder`, AND `/hardware` (easy to forget) all 301 to `/catalog` (next.config.js `catalogConsolidation`). No internal link may point at any of them.

**Why:** Semrush flags every internal link to a 3XX target; the July 2026 audit fix required sweeping dozens of them.

**How to apply:** Links come from BOTH content data (shared/content/*, contentData, llmsTxt) and runtime link generators (lib/catalog-routes, lib/catalog/selectionDisplay, CatalogBrowser, explore-strip/showcase components, portal pages). A source grep alone misses generator output — always also sweep rendered HTML: curl key pages and grep for `href="/(finishes|door-styles|products|collections|finder|hardware)`. Image paths like `/images/catalog/collections/*` and `/generated/door-styles/*.svg` are NOT links — leave them. `npm run audit:links` follows redirects, so it passes even with 3XX links; it is not sufficient proof.
