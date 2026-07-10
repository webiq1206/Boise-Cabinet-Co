# Implementation Roadmap - Boise Cabinet Co

Sequenced by leverage: indexing-critical first, then structural work that scales across templates, then per-page polish. Tags: **Impact** (H/M/L), **Effort** (S/M/L), **Dimensions**, **Type** (Quick win / Strategic). Items marked **[DONE]** are in `completed-updates.md`; **[DATA]** needs your input; **[CODE]** is ready to implement on approval.

## Phase 0 - Already shipped [DONE]
Schema logo, priceless-Offer removal, entity `@id` linking, geo/locality fix, subtype fix, construction Service schema, finish + door-style H1s, collection title bug, blog above-the-fold dedup, `cabinetss` typo, phone placeholder. *Impact H/M, Effort S, moves SEO/GEO/AEO. Quick wins.*

## Phase 1 - Trust data (highest local + E-E-A-T leverage) [DATA]
These are the single biggest levers and are pure data - the code slots exist.
1. **Claim + verify Google Business Profile**, set `NEXT_PUBLIC_GBP_URL`. *H / S / Local+GEO / Strategic.* Start review collection (target 25+; Sweetwood ~46 is the bar).
2. **Publish the Idaho contractor/RCE license #** via `NEXT_PUBLIC_LICENSE_NUMBER`. *H / S / Local+Trust.*
3. **Name the team** - replace 3 `TEAM` placeholders with real people + photos + credentials, set `isPlaceholder:false` (activates Person schema); add named authors to blog/guides. *H / M / E-E-A-T+GEO / Strategic.*
4. **Wire real, dated, sourced reviews** and set `NEXT_PUBLIC_REVIEW_*` (only once on-page reviews render - avoid the aggregateRating policy risk). *H / M / Local+Trust.*
5. **Real project photography** on gallery, case studies, finish "in-room," room tiles (pending Drive). *H / M / UX+E-E-A-T / Strategic.*
6. **DNS:** add SPF; move DMARC toward `p=quarantine`. *M / S / Security/deliverability.*

## Phase 2 - Structural (scales across templates) [CODE]
7. **Render related links on catalog templates** - add `<RelatedPostCards>` to `/cabinets/[room]`, `/collections/[slug]`, `/finishes`, `/door-styles`. The manifest already computes them; they're discarded at render. *H / S / SEO / Quick win.*
8. **Render the finish<->door<->collection<->room links that already exist in data** (`getDoorStylesForFinish`, `getCollectionsForFinish`, ...) as real anchors on finish/door detail pages. *H / M / SEO+UX.*
9. **Register finishes + door styles into the internal-link system** (`buildPages()` node types) so the 193 indexable finishes stop being near-orphans; fix the dead `type==="service"` audit check. *M / M / SEO.*
10. **Build `/projects/[slug]` routes** for the case studies (currently homepage-only) linking project -> room -> city -> finish. *H / M / E-E-A-T+content / Strategic.*
11. **Surface local proof on city guide pages** - city-matched case studies + testimonials + reviews inside `GuidePageLayout`; add proof for Kuna/Star/Caldwell/Middleton. *M / M / Local.*
12. **Add FAQ + FAQPage** to door-style detail, `/about`, `/compare`. *M / M / AEO.*
13. **Expand nav to all 13 rooms; add a "Guides" top-level entry.** *M / S / SEO+UX.*

## Phase 3 - Content depth & doorway remediation [CODE + content]
14. **Blog depth pass** - expand the 56 thin posts (median 217 words) to 700-1,200 words with first-hand specifics (anonymized line-item quotes, named subdivisions, before/after photos); merge the 3 overlapping outdoor posts. *H / L / Content+AEO / Strategic.*
15. **Woodgrain finish consolidation** - the 90 indexable woodgrains share 100% prose; collapse to a filterable gallery, index only ~15 with real demand + unique copy. *M / M / SEO (doorway).*
16. **Inject quotable numbers** (lead time, warranty term, starting band) into finish/room/door intros + FAQs. *M / M / GEO+AEO.*
17. **Add comparison pages** - custom vs stock/big-box, frameless vs framed, refacing vs replacement; a door-style comparison table. *H / M / AEO+conversion / Strategic.*
18. **Build out the thin bathroom-vanities cluster** (~8 clusters). *M / M / Topical authority.*

## Phase 4 - Polish [CODE]
19. Blog/guide title 60-char guard; product-detail title trim; product-detail H1 (noindex, low). Breadcrumbs on `/dealer`/`/installer`. Remove dead code (`generateReviewSchema` until wired, `lib/landing-schema.ts`). Update/delete the stale `SEO-AUDIT-INVENTORY.md`. Paginate/lazy-load large lists (`/products/[cat]` 162 items, blog index) - also a performance + UX win. *L-M / S-M.*

## Also see the UX/design audit
The earlier UX report (CTA vocabulary unification, placeholder imagery, fake-input step titles, mobile sticky-bar overlaps, empty states) overlaps with several items here and should be sequenced alongside Phase 2-3.
