# Kitchen overlap with Boise Remodeling Co (proposal, no changes made)

Status: proposal for the owner. Phase 4 changes none of these URLs, titles or redirects on either site. Written 2026-10-31 by comparing `shared/blogContent.ts` and `shared/guideContent.ts` in this repo with the same files in `boise-remodeling-co` (main at `3ec53592`), plus `seo-notes-cabinet.md` section 2.

## The rule that decides ownership

- Boise Cabinet Co owns **cabinets**: the boxes, doors, finishes, hardware, cabinet layouts and cabinet cost, plus the commercial query "kitchen cabinets boise" (owner page `/cabinets/kitchen`).
- Boise Remodeling Co owns **the remodel**: the whole kitchen project, layout changes that move walls or plumbing, countertops, contract types and whole-kitchen cost (owner page `boiseremodeling.co/services/kitchen-remodel` and its city pages).
- Where a slug exists on both sites, one site keeps it and the other 301s to it (or rewrites its post so the two answer different questions). Two near-identical pages split the family's ranking for the same query.

## Same slug on both sites

| Slug | Boise Cabinet Co title | Boise Remodeling Co title | Recommended owner | What the other site does |
|---|---|---|---|---|
| `/blog/kitchen-cabinet-trends` | Kitchen Cabinet Trends (220 body words) | Kitchen Cabinet Trends (same title) | **Cabinet** | Remodeling 301s both `/blog/kitchen-cabinet-trends` and `/blog/kitchen-cabinet-trends-boise` to `boisecabinet.co/blog/kitchen-cabinet-trends`, or sets a cross-domain canonical there. Cabinet rewrites its post to 1,000+ words first (merge map: improve in place). |
| `/blog/kitchen-layout-ideas-boise-homes` | Kitchen Layout Ideas for Boise Homes (260) | Kitchen Layout Ideas for Boise Homes: Which One Fits Yours? | **Remodeling** | Cabinet moves the cabinet angle into `/guides/boise-kitchen-cabinet-guide` and 301s its post there (merge map). |
| `/blog/walk-in-pantry-design-guide` | Walk-In Pantry Design Guide (258) | Walk-In Pantry Design Guide (same title) | **Remodeling** (walk-in room design) | Cabinet merges its post into `/blog/pantry-cabinet-ideas` and 301s (merge map); pantry cabinets stay on `/cabinets/pantry`. |
| `/blog/kitchen-island-design-guide` | Kitchen Island Design Guide (249) | Kitchen Island Design Guide: Size, Seating, and Function | **Split by angle** | Cabinet rewrites its post around island cabinets (base runs, seating overhang, storage) and links `/cabinets/kitchen`; Remodeling keeps island layout and function. If Cabinet does not rewrite it, 301 Cabinet's post to `/guides/boise-kitchen-cabinet-guide`. |
| `/blog/fixed-price-vs-cost-plus` | Fixed Price vs Cost Plus Cabinet Quotes (184) | Fixed-Price vs. Cost-Plus Remodeling Contracts: Which Is Better? | **Remodeling** (contract types) | Cabinet merges its post into `/blog/how-to-compare-cabinet-quotes` and 301s (merge map). |

## Same topic, different slugs

| Boise Cabinet Co page | Boise Remodeling Co page | Recommended owner | Action |
|---|---|---|---|
| `/blog/kitchen-cabinet-trends` | `/blog/kitchen-cabinet-trends-boise` (Kitchen Cabinet Trends for Boise Homes: What Lasts, What Fades) | **Cabinet** | Covered by the first row above: Remodeling consolidates both trend posts into the Cabinet post. |
| `/blog/kitchen-cabinet-cost-boise`, `/blog/custom-kitchen-cabinet-cost` | `/blog/kitchen-remodel-cost-boise` (Kitchen Remodel Cost in Boise: 2026 Planning Ranges) | **Both, by scope** | Cabinet owns cabinet cost (`custom-kitchen-cabinet-cost` survives the merge map); Remodeling owns whole-kitchen remodel cost. Each links the other with explicit anchors ("kitchen cabinet cost" vs "kitchen remodel cost"). |
| `/blog/kitchen-cabinet-timeline-boise` | `/blog/kitchen-remodel-timeline-boise` | **Both, by scope** | Cabinet: design approval to cabinet install (4 to 8 weeks of lead time). Remodeling: the whole project. Cross-link. |
| `/blog/open-kitchen-cabinet-storage` | `/blog/open-concept-kitchen-remodeling` | **Remodeling** for opening walls | Cabinet merges its post into `/blog/kitchen-cabinet-organization-ideas` (merge map), keeping only the storage angle. |
| `/blog/kitchen-cabinet-roi-boise` | `/blog/kitchen-remodel-roi` | **Both, by scope** | Cabinet keeps cabinet-only ROI; Remodeling keeps whole-kitchen ROI. Cross-link. |
| `/blog/outdoor-kitchen-cabinets-boise`, `/cabinets/outdoor` | `/blog/outdoor-kitchens-boise` | **Both, by scope** | Cabinets vs the whole outdoor kitchen; already distinct. Add a cross-link only. |
| `/guides/boise-kitchen-cabinet-guide`, `/cabinets/kitchen` | `/guides/boise-kitchen-remodeling-guide`, `/services/kitchen-remodel` and its 8 city pages | **Both, by scope** | Different intent (cabinets vs remodel). Each links the other with explicit anchors ("kitchen cabinets" vs "kitchen remodel"). |

## Needs the owner

1. Approve the owner per slug above. The Cabinet-side merges are already listed in `docs/blog-merge-map.md` and wait for that approval.
2. The Remodeling-side 301s (trend posts) are a change in `boise-remodeling-co`, made in that repo.
3. Check Search Console for each pair before any 301: if the page that should lose is the one earning clicks, move its best section to the owner first.
