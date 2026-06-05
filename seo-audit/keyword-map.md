# Keyword Map - Boise Cabinet Co

Maps target keywords to canonical pages, with intent and cannibalization notes. Cities: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell (Treasure Valley).

Intent key: I = informational, C = commercial, T = transactional, N = navigational.

## Primary money pages

| Page | Primary keyword | Secondary / long-tail | Intent |
|---|---|---|---|
| `/` | custom cabinets boise | treasure valley cabinet company, cabinet maker boise idaho | C/N |
| `/cabinets/kitchen` | custom kitchen cabinets boise | kitchen cabinet company boise, frameless kitchen cabinets idaho | C |
| `/cabinets/bathroom` | bathroom vanity cabinets boise | custom bathroom vanities treasure valley | C |
| `/cabinets/laundry` | laundry room cabinets boise | mudroom cabinets idaho | C |
| `/cabinets/office` | home office cabinets boise | built-in office cabinetry | C |
| `/cabinets/[room]` (13) | [room] cabinets boise | [room] storage cabinets treasure valley | C |
| `/collections/custom` | custom cabinets idaho | built-to-order cabinets boise | C |
| `/door-styles/shaker` | shaker cabinet doors boise | shaker style kitchen cabinets idaho | C |
| `/door-styles/[slug]` (6) | [style] cabinet doors | [style] door cabinets idaho | C |
| `/finishes` | cabinet finishes / colors | matte/gloss/woodgrain cabinet finishes | C |
| `/products/[category]` (9) | [category] cabinets | base/wall/tall cabinets boise | C |
| `/compare` | cabinet collection comparison | custom vs stock cabinets | C/I |
| `/construction` | frameless cabinet construction | euro cabinet box quality | I/C |
| `/hardware` | cabinet hardware options | soft-close hinges drawer slides | I/C |

## Content hubs (informational -> commercial funnel)

| Pillar guide | Hub keyword | Cluster long-tails |
|---|---|---|
| `boise-cabinet-cost-guide` | cabinet cost boise / treasure valley | kitchen/bath/whole-home cabinet cost, cost per linear foot, cost drivers |
| `boise-kitchen-cabinet-guide` | kitchen cabinets boise guide | layouts, trends, island, pantry, door styles, finishes, hardware |
| `boise-bathroom-vanity-guide` | bathroom vanity boise | small/luxury/accessible vanity, vanity layout |
| `built-in-cabinet-guide` | built-in cabinets boise | closets, garage, multi-room, outdoor |
| `whole-home-cabinetry-guide` | whole-home cabinetry | planning, timeline, mistakes, refresh vs replace |
| `choose-cabinet-company-boise` | best cabinet company boise | questions to ask, red flags, quotes, shop vs big box, custom vs stock |
| `cabinet-project-process-guide` | cabinet process | measure, design, fabrication, install, punch list, warranty |
| `cabinet-roi-guide-boise` | cabinet ROI home value | kitchen/bath/built-in ROI, pre-sale |

## Local keyword strategy (woven, not doorway pages)

Per locked decision, NO standalone city pages. Local keywords are targeted via:
- City mentions + Ada/Canyon County + climate context within hubs, guides, room pages, About/Contact.
- The `treasure-valley-cabinet-guide` (master) + `boise-cabinet-guide` (location) cover local intent.
- GBP + citations carry "cabinets near me" / map-pack intent.

Long-tail local examples to weave (not isolate): "kitchen cabinets meridian id", "custom cabinets eagle idaho", "cabinet company nampa".

## Cannibalization / overlap risks

| Risk | Pages | Resolution |
|---|---|---|
| 100 product SKUs share title "Wall Cabinet" | `/products/wall/*` | NOINDEX SKUs; category page targets "wall cabinets" |
| 191 woodgrain finish pages near-identical | `/finishes/woodgrain/*` | Curate indexable subset; NOINDEX rest -> category |
| Cost guide vs cost clusters | pillar + 6-7 clusters | Pillar = overview/index; clusters = specific scenarios (already structured) |
| Kitchen guide (pillar) vs kitchen room page | `/guides/...` vs `/cabinets/kitchen` | Guide = informational; room = commercial. Cross-link, distinct intent |
| 6 duplicate finish names (Black-Matte x3, etc.) | finishes | Disambiguate titles or NOINDEX duplicates |

## Notes

- Branded: "boise cabinet co" -> `/` (ensure Organization/sameAs consistency).
- "near me" intent depends on GBP, not on-site pages.
- Avoid creating new keyword-swapped pages; deepen existing pages instead.
