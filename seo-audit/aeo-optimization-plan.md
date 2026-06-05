# AEO (Answer Engine Optimization) Plan - Boise Cabinet Co

Goal: win featured snippets, voice answers, and AI direct-answers via question-based structure, concise answers, and clean schema.

## Current state

- Quick Answer + Key Takeaways blocks on guides/blog with `data-speakable="summary"` (good).
- FAQ accordions render on-page (guides, blog, home) + FAQPage schema.
- Cost pillar uses question-form H2s.

## Gaps

| Gap | Detail | Action |
|---|---|---|
| Homepage Speakable target | Schema present, no `data-speakable` DOM element | Add visible/sr-only summary |
| Duplicate cluster FAQs | First 6 hub FAQs reused on all clusters | Unique FAQs per cluster |
| Generic pillar H2s | Factory pillars use template H2s | Convert to specific buyer questions |
| Blog breadcrumb depth | No hub tier | Add Home > Blog > {Hub} > Post |
| Missing definition blocks | Few "What is X" answers | Add definitions |
| Unused snippet targets | `featuredSnippetTargets` field unused | Populate high-intent posts |
| Catalog pages lack FAQ | Rooms/categories/collections have no FAQ schema | Add FAQ where valuable |

## Answer patterns to implement

1. Question-form H2s ("How much do custom cabinets cost in Boise?", "How long does a cabinet project take?").
2. 40-60 word direct answer immediately under each question (snippet-sized).
3. Step lists for processes (measure -> design -> fabricate -> install -> punch list).
4. Definition blocks for key terms (frameless, overlay, soft-close, dovetail).
5. Comparison tables (custom vs stock, collections, door styles, finish tiers - `/compare` already strong).
6. Cost tables with $/linear-foot ranges.
7. "What to expect" sections for consultation + install.

## Page-level AEO additions

- Homepage: speakable summary + ensure top FAQ answers are concise.
- Room pages: add 3-5 unique FAQs each (e.g. "What cabinets work best in a Boise laundry room?") + FAQPage schema.
- Collection page: add FAQPage schema (visible FAQ already exists).
- Product category pages: add a short "common sizes/uses" answer block.
- Guides/clusters: unique FAQs + populated `featuredSnippetTargets`.

## Voice search

- Speakable on home/guides/blog (fix homepage target).
- Natural-language Q&A phrasing in FAQs.
- Click-to-call + concise NAP for "call the cabinet company in Boise" intents.

## Verification

- FAQPage + Speakable validate in Rich Results Test.
- No duplicate FAQ blocks across cluster URLs.
- Each money/content page has at least one snippet-sized direct answer near the top.
