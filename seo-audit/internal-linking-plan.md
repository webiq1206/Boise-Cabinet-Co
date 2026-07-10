# Internal Linking Plan - Boise Cabinet Co

The linking system is **auto-generated** (`scripts/internal-links/*` -> `data/internal-links.json`, run in prebuild), uses **descriptive anchors** (page titles/phrases, no "click here"), and the audit reports zero orphans/weak/broken. Two caveats behind the clean bill:

- **[HIGH] It governs only 92 of ~329 indexable URLs.** It ingests blog (56), guides (17), and catalog hubs/rooms/collections (19). The **299 finishes, 6 door styles, static pages** are outside the system entirely; a `minIncomingFloor=5` guarantees "no orphans" only inside that island.
- **[HIGH] Computed catalog links are never rendered.** `RelatedPostCards` (which reads the manifest) is mounted only in blog + guide layouts. Room/collection/finish/door pages have 8 computed outbound links each, all discarded at render.
- **[MED] The `type==="service"` audit check is dead code** (`PageType` never includes "service") - the service-equity guardrail does nothing.

## Real orphan/weak risk (outside the manifest)
| Group | Count | Inbound | Verdict |
|---|--:|---|---|
| Finish details (indexable) | 193 | browse + breadcrumb only | **near-orphan** |
| Door styles | 6 | browse + breadcrumb only | weak |
| Products (noindex) | 382 | room/door/browse | OK (intentional) |
| Static (warranty/compare/finder) | ~6 | footer/nav | thin but reachable |
| Case studies | 3 | no route | entities with no page |

## Plan (descriptive anchors, no page ships orphaned)
1. **Render `<RelatedPostCards>` on `/cabinets/[room]`, `/collections/[slug]`, `/finishes`, `/door-styles`** - unlocks already-computed equity. *Biggest lever, lowest effort.*
2. **Render finish<->door<->collection<->room contextual links** (helpers exist): "Pairs with the [door] door style", "See [finish] in a [room]", "Part of the [collection] collection".
3. **Register finishes + doors into `buildPages()`** (add `finish`/`door` node types) so the 193 indexable finishes earn contextual inbound links; **fix the dead `type==="service"` check.**
4. **Make rooms true cluster hubs:** add "Guides & articles for [room]", "Finishes/Door styles for [room]", "See [room] projects", and sibling-room links.
5. **Service x location links** - "kitchen cabinets in Meridian" from city guides -> room pages (converts schema-only geo into crawlable links).
6. **Nav/footer:** expose all 13 rooms in nav (only 8 today); add a top-level "Guides"; add breadcrumbs to `/dealer`,`/installer`.
