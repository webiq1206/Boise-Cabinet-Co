# Programmatic / Doorway Analysis - Boise Cabinet Co

**Verdict: no site-wide doorway problem.** The two page sets most at risk are already remediated; the residual exposure is narrow.

| Template | Pages | Indexable | Uniqueness | Similarity | Disposition |
|---|--:|--:|---|---|---|
| Product config `/products/[c]/[s]` | 382 | 0 (noindex) | ~2-5% (only SKU + config integers differ; shared box images) | >=95% | **Handled** (noindex,follow + sitemap-excluded). Next: collapse to category + client configurator. |
| Finish detail `/finishes/[c]/[s]` | 299 | 193 | woodgrain ~10-15%, matte/gloss ~20-30% | woodgrain >=90%, matte/gloss >=70-80% | 106 dupes handled; **90 indexable woodgrains share 100% prose -> merge/reduce**; matte/gloss keep but differentiate. |
| City guides | 10 | 10 | ~70-85% | low | **KEEP - model pattern.** Only the cost paragraph/FAQ repeats. |
| Blog posts | 56 | 56 | topic-unique but **median 217 words**; 4/7 H2s boilerplate | default-fallback posts >=70% | **Thin-content risk -> rewrite for depth**; dedup applied. |
| Guides | 17 | 17 | substantive | - | Keep. |
| Index/category pages | ~5 | ~5 | legit hubs | - | Keep + add 100-150w intro + 2-3 FAQs. |

## The two real actions
1. **Woodgrain finishes (90 indexable, 100%-identical prose):** collapse into a filterable woodgrain gallery; index only ~15 with genuine standalone demand (walnut, oak, hickory...) **and** rewritten unique copy. To justify an index slot each needs: real in-room photography, finish-specific pairings (named counter/floor/hardware), specific care notes, ideally a project photo.
2. **Blog (56 thin posts):** expand to 700-1,200 words with first-hand specifics (anonymized line-item quotes, named subdivisions, before/after photos, install-day detail); merge the 3 overlapping outdoor posts. Fix the machine-templating tells (`cabinetss` [DONE], generic default sections).

## What each near-duplicate page would need to justify existing
- **Finish:** unique in-room photo + named pairings + specific care + a real project using it.
- **Product SKU:** a real per-SKU rendering + a price + SKU-specific use guidance - none exist, so keeping them noindex is correct.
