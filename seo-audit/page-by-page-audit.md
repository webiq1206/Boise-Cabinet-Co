# Page-by-Page Audit - Boise Cabinet Co (DEPTH=standard sample)

Deep-audited: all top-level pages + >=3 per multi-instance template (rooms: kitchen/bathroom/laundry; finishes: matte/gloss/woodgrain samples; blog: 4; city guides: 3; products: category + detail). Metadata/canonical/H1/schema/indexability were mechanically checked on every template. Disposition per page: keep / improve / rewrite / consolidate / noindex / remove.

| Page | Type | Intent | Disposition | Key notes |
|---|---|---|---|---|
| `/` | home | commercial | **keep/improve** | Strong; add live trust bar + real founder/reviews; shorten. |
| `/about` | about | nav/trust | **improve** | Name the team (0 Person entities); add FAQ. |
| `/contact` | contact | transactional | keep | Strong multi-channel; drop duplicate CTAs; show email. |
| `/testimonials` | proof | nav | **improve** | Real photos + sourced/dated reviews + aggregateRating; give case studies routes. |
| `/warranty` | trust | info | keep | Best trust asset; lead with a one-line promise. |
| `/construction` | service | info | keep | Service schema added; reconcile the material-claim contradiction. |
| `/cabinets` | hub | commercial | keep | Fix "12 vs 13" copy; 4-up grid. |
| `/cabinets/[room]` | service | commercial | **improve** | Make it the cluster hub (blog/finishes/doors/projects/sibling/city links); paginate 485KB list. |
| `/catalog` | hub | commercial | keep | Consistent tile treatment; real door imagery. |
| `/collections` | index | commercial | **improve** | Single-collection hollow index; route to detail or design single-item state. |
| `/collections/[slug]` | detail | commercial | keep | Remove empty "Other collections"; add door thumbnails. |
| `/finishes` | index | commercial | improve | One filter system; real material swatches. |
| `/finishes/[c]/[s]` | detail | commercial | **improve / consolidate woodgrains** | H1 added; 90 woodgrains near-duplicate -> gallery + ~15 unique; real in-room photo. |
| `/door-styles` | index | commercial | improve | Real door photos; comparison table. |
| `/door-styles/[slug]` | detail | commercial | **improve** | H1 + answer added; add FAQ + FAQPage. |
| `/products` `/products/[c]` | index/category | commercial | improve | Human labels before SKU; paginate 162-item category. |
| `/products/[c]/[s]` | detail | commercial | **keep noindex** | ~2-5% unique; correctly noindex; consolidate to configurator later. |
| `/hardware` | catalog | commercial | keep | Best photos; add card CTAs; de-jargon. |
| `/accessories` | catalog | commercial | keep | Strong; replace 1 placeholder tile. |
| `/estimate` | tool | transactional | keep | Excellent; fix fake-input step title; fill empty column. |
| `/design-studio` | tool | transactional | keep | Strongest tool; fix fake-input title + truncated steps. |
| `/blog` | index | info | **improve** | Add filter/search/pagination; per-post images. |
| `/blog/[slug]` | article | info | **rewrite for depth** | Great scaffold, median 217 words; dedup applied; add named author. |
| `/guides` | index | info | keep | Fix "2 min read" vs "in-depth". |
| `/guides/[slug]` (pillar) | guide | info | keep | Best long-form; expand-by-default sections. |
| `/guides/[city]` | location | commercial | keep | Model local pages; add local proof (Kuna/Star/Caldwell/Middleton). |
| `/resources` | hub | info | improve | Sparse; add resources + optional lead capture. |
| `/resources/ada-canyon-permit-flow` | flow | info | improve | Add the referenced (missing) map; connectors/icons. |
| `/privacy` `/terms` | legal | nav | improve | Refresh "Jan 2024" date; add TOC. |
| `/compare` | tool | commercial | **improve** | One column = nothing to compare; reframe or add targets; add FAQ. |
| `/finder` | tool | commercial | keep | Good; fix mobile nav overlap. |
| `/search` | utility | nav | keep noindex | Multi-column desktop; count/sort. |
| `/dealer` `/installer` | B2B | nav | **improve/consolidate** | noindex; near-duplicates; give a real trade action; add breadcrumbs. |
| `/404` | system | - | keep | Helpful; fix mobile blank-button. |
| `/login` `/admin` | auth | - | keep | Add forgot-password. |
| `/style-guide` | internal | - | **noindex/gate** | Currently public + indexable. |

Cross-cutting per-page themes (imagery, CTA vocabulary, empty states, mobile) are detailed in the companion UX/design audit.
