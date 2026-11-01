# Blog merge map (proposal, needs owner approval)

Status: merges EXECUTED on 2026-11-01, guarded by Search Console data. The owner's rule: merge only a post with under 15 impressions and 0 clicks (1 June to 29 October 2026). 34 of the 36 merges below passed and now 301 to their destination; the list, the guard and the folded sections live in `shared/content/blogMerges.ts`. Two did not pass and keep their URLs:

- `/blog/bathroom-vanity-layout-guide`: 19 impressions, position 11.7.
- `/blog/cabinet-consultation-process`: 15 impressions, position 12.4 (not under 15).

What shipped: each merged post left `BLOG_POSTS` and `CONTENT_MANIFEST` (so its page, sitemap entry and hub cards went), got one 301 straight to its destination, and every source link to it was rewritten to the destination (`npm run verify:redirect-collisions` passes). Legacy redirects that pointed at a merged post now go straight to the merge destination. Where a merged post had a useful section its destination did not already cover, that section was folded in, in the post's own words (`FOLDED_SECTIONS`; the garage and closet posts became one FAQ each on `/cabinets/garage` and `/cabinets/closet`). Nothing was folded from the four remodel-era cost posts, `what-makes-great-cabinet-company` (it promises a dedicated project manager, which is not a stated cabinet fact), `custom-vs-reserve-cabinets` (/compare already covers it), `custom-cabinet-design-process`, `multi-room-cabinet-planning` (the whole-home guide already covers it) or `cabinet-warranty-guide` (/warranty already states the terms). After the merges `cabinet-project-process` (0 posts) and `cabinet-roi` (2 posts) fall under `CATEGORY_HUB_MIN_POSTS` and turn noindex,follow; both URLs stay.

The 14 "improve in place" rewrites (1,000+ words each) were not done in that release: they need new content and figures the business facts do not yet cover. `kitchen-island-design-guide` was retitled around island cabinets instead (docs/kitchen-overlap.md).

Original proposal follows.

Generated on 2026-10-31 from `shared/blogContent.ts`. A post is thin when its body (`content`, excluding FAQs) is under 700 words by `countWords` in `lib/content-utils.ts`: 50 of 78 posts today. The audit counted 48 with a different word counter; this table lists every post under the line by the counter above, so none is missed. Dispositions follow `seo-notes-cabinet.md` section 3.

Search Console (1 June to 29 October 2026, per page): only 2 of these 50 posts appear at all (`bathroom-vanity-layout-guide` 19 / 0 / 11.7; `cabinet-consultation-process` 15 / 0 / 12.4); none earned a click. "none listed" means the page is not in the export. Move the best section of any listed post into its destination before its redirect ships.

Summary: 36 merge into an existing page, 14 improve in place. Every destination exists today.

## Rules for the release that executes this

1. One 301 per merged URL, straight to its destination, in `shared/contentRedirects.ts` (one hop; `npm run verify:redirect-collisions` must pass, and no destination may itself redirect).
2. Move the merged post's unique FAQs and any unique paragraph into the destination before the redirect ships; drop duplicates.
3. Update internal links that pointed at a merged URL (`npm run links:generate` then `npm run audit:links`), and remove the post from `CONTENT_MANIFEST` in `shared/contentHubs.ts` so the sitemap drops it.
4. Check hub counts: `CATEGORY_HUB_MIN_POSTS` is 3. After these merges cabinet-project-process and cabinet-roi fall below it and turn noindex,follow automatically; keep both hub URLs (no redirect).
5. Do not merge a post that Search Console shows earning clicks without moving the query to the destination first. The figures below are the 1 June to 29 October 2026 export; re-check them on the day the release is approved.

## Posts to merge (36)

| Post | Body words | Search Console impr. / clicks / position | Hub | Action | Destination | Reason |
|---|---|---|---|---|---|---|
| `/blog/bathroom-vanity-layout-guide` | 188 | 19 / 0 / 11.7 | Bathroom Vanities | Merge | `/blog/bathroom-vanity-buying-guide` | Layout and sizes are already covered in the 1,600-word buying guide. |
| `/blog/luxury-bathroom-vanity-guide` | 192 | none listed | Bathroom Vanities | Merge | `/guides/boise-bathroom-vanity-guide` | Primary-suite vanities are a section of the vanity pillar. |
| `/blog/luxury-custom-cabinet-cost-boise` | 229 | none listed | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | A luxury tier is a section of the cost pillar, not its own page. |
| `/blog/whole-home-cabinet-cost-boise` | 242 | none listed | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Whole-home cost belongs in the cost pillar's whole-home section. |
| `/blog/how-to-budget-cabinets-boise` | 248 | none listed | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Budgeting steps belong in the pillar's budgeting section. |
| `/blog/what-impacts-cabinet-costs-boise` | 256 | none listed | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Cost drivers duplicate the pillar's 'what changes your price' section. |
| `/blog/kitchen-cabinet-cost-boise` | 534 | none listed | Boise Cabinet Costs | Merge | `/blog/custom-kitchen-cabinet-cost` | Same cost query as the 1,600-word post; keep the survivor and add Boise to its title. |
| `/blog/garage-storage-cabinet-systems` | 165 | none listed | Built-In Storage | Merge | `/cabinets/garage` | Restates the garage room page; move its unique FAQs there. |
| `/blog/primary-suite-closet-cabinets` | 181 | none listed | Built-In Storage | Merge | `/cabinets/closet` | Restates the closet room page; move its two useful FAQs there. |
| `/blog/multi-room-cabinet-planning` | 189 | none listed | Built-In Storage | Merge | `/guides/whole-home-cabinetry-guide` | Multi-room planning is the whole-home pillar's subject (its sequencing section now covers it). |
| `/blog/outdoor-bar-cabinet-storage` | 243 | none listed | Built-In Storage | Merge | `/blog/outdoor-kitchen-cabinets-boise` | Third thin outdoor post on the same topic. |
| `/blog/premium-outdoor-cabinetry` | 243 | none listed | Built-In Storage | Merge | `/blog/outdoor-kitchen-cabinets-boise` | Third thin outdoor post on the same topic. |
| `/blog/cabinet-installation-punch-list` | 191 | none listed | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Closeout is the last step of the process pillar. |
| `/blog/cabinet-fabrication-installation` | 198 | none listed | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Fabrication and install are steps of the process pillar. |
| `/blog/cabinet-finishes-door-styles-guide` | 200 | none listed | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Selections are a step of the process pillar. |
| `/blog/cabinet-design-development` | 201 | none listed | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Shop drawings are a step of the process pillar. |
| `/blog/cabinet-measurement-design-phase` | 207 | none listed | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Measure and design are steps of the process pillar. |
| `/blog/cabinet-warranty-guide` | 301 | none listed | Cabinet Project Process | Merge | `/warranty` | Restates the warranty page; move its FAQs there with FAQPage schema. |
| `/blog/outdoor-cabinet-roi` | 164 | none listed | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/built-in-storage-roi` | 170 | none listed | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/bathroom-vanity-roi-boise` | 191 | none listed | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/cabinets-for-long-term-living` | 204 | none listed | Cabinet ROI & Home Value | Merge | `/blog/cabinet-upgrades-before-selling` | Opposite side of the same sell-or-stay decision. |
| `/blog/what-makes-great-cabinet-company` | 202 | none listed | Choosing a Cabinet Company | Merge | `/guides/choose-cabinet-company-boise` | Restates the choosing pillar. |
| `/blog/why-cabinet-quotes-vary` | 204 | none listed | Choosing a Cabinet Company | Merge | `/blog/how-to-compare-cabinet-quotes` | Same quote-comparison intent. |
| `/blog/fixed-price-vs-cost-plus` | 206 | none listed | Choosing a Cabinet Company | Merge | `/blog/how-to-compare-cabinet-quotes` | Same slug on boiseremodeling.co, which owns the contract-type query; the cabinet angle fits the quotes post. |
| `/blog/cabinet-consultation-process` | 207 | 15 / 0 / 12.4 | Choosing a Cabinet Company | Merge | `/guides/cabinet-project-process-guide` | The consultation is step one of the process pillar. |
| `/blog/custom-vs-reserve-cabinets` | 218 | none listed | Choosing a Cabinet Company | Merge | `/compare` | Describes the one collection; /compare now compares it with stock and semi-custom. |
| `/blog/cabinet-company-red-flags` | 228 | none listed | Choosing a Cabinet Company | Merge | `/blog/questions-to-ask-cabinet-company` | Red flags are the other side of the questions post. |
| `/blog/custom-cabinet-shop-vs-big-box` | 326 | none listed | Choosing a Cabinet Company | Merge | `/blog/stock-vs-custom-cabinets-boise` | Shop vs big box is the stock vs custom decision. |
| `/blog/open-kitchen-cabinet-storage` | 196 | none listed | Kitchen Cabinets | Merge | `/blog/kitchen-cabinet-organization-ideas` | Open-plan storage is a section of the 1,600-word organization post. |
| `/blog/walk-in-pantry-design-guide` | 258 | none listed | Kitchen Cabinets | Merge | `/blog/pantry-cabinet-ideas` | Identical title on boiseremodeling.co; the cabinet content fits the long pantry post. |
| `/blog/kitchen-layout-ideas-boise-homes` | 260 | none listed | Kitchen Cabinets | Merge | `/guides/boise-kitchen-cabinet-guide` | Same slug and near-identical title on boiseremodeling.co, which owns kitchen layout; the cabinet angle fits the kitchen pillar. |
| `/blog/cabinet-project-planning-guide` | 202 | none listed | Whole-Home Cabinetry | Merge | `/blog/cabinet-planning-checklist` | Same planning checklist intent; keep one. |
| `/blog/whole-home-cabinet-timeline` | 222 | none listed | Whole-Home Cabinetry | Merge | `/guides/whole-home-cabinetry-guide` | Timeline is now a section of the whole-home pillar. |
| `/blog/cabinet-refresh-vs-replace-vs-moving` | 224 | none listed | Whole-Home Cabinetry | Merge | `/blog/cabinet-refacing-vs-refinishing-vs-replacing` | Same decision as the 1,600-word refacing post. |
| `/blog/custom-cabinet-design-process` | 226 | none listed | Whole-Home Cabinetry | Merge | `/guides/cabinet-project-process-guide` | Design steps belong in the process pillar. |

## Posts to improve in place (14)

Each keeps its URL and gets a direct answer block, real dated numbers only where the business facts support them, 1,000+ words, and real FAQs in place of the templated eight.

| Post | Body words | Search Console impr. / clicks / position | Hub | Action | Destination | Reason |
|---|---|---|---|---|---|---|
| `/blog/small-bathroom-vanity-ideas` | 167 | none listed | Bathroom Vanities | Improve in place | keep URL | Distinct small-bath query; rewrite to 1,000+ words. |
| `/blog/accessible-bathroom-vanity-guide` | 209 | none listed | Bathroom Vanities | Improve in place | keep URL | Distinct accessibility query; keep it vanity-only and rewrite to 1,000+ words. |
| `/blog/bathroom-vanity-cost-boise` | 289 | none listed | Boise Cabinet Costs | Improve in place | keep URL | Distinct, unowned query (vanity cost in Boise); rewrite to 1,000+ words with a direct answer and real FAQs. |
| `/blog/outdoor-kitchen-cabinets-boise` | 284 | none listed | Built-In Storage | Improve in place | keep URL | Survivor for the three outdoor posts; rewrite as one informational post that links /cabinets/outdoor. |
| `/blog/cabinet-upgrades-before-selling` | 194 | none listed | Cabinet ROI & Home Value | Improve in place | keep URL | Survivor for the long-term-living post; rewrite to 1,000+ words. |
| `/blog/kitchen-cabinet-roi-boise` | 314 | none listed | Cabinet ROI & Home Value | Improve in place | keep URL | Distinct ROI query; rewrite with dated, sourced figures only. |
| `/blog/how-to-compare-cabinet-quotes` | 355 | none listed | Choosing a Cabinet Company | Improve in place | keep URL | Survivor for the quote posts; rewrite to 1,000+ words. |
| `/blog/questions-to-ask-cabinet-company` | 414 | none listed | Choosing a Cabinet Company | Improve in place | keep URL | Survivor for red flags; rewrite to 1,000+ words. |
| `/blog/kitchen-cabinet-trends` | 242 | none listed | Kitchen Cabinets | Improve in place | keep URL | Cabinets are this brand's topic; rewrite as the family owner and ask Remodeling to consolidate its two trend posts (docs/kitchen-overlap.md). |
| `/blog/kitchen-island-design-guide` | 249 | none listed | Kitchen Cabinets | Improve in place | keep URL | Same slug on boiseremodeling.co; rewrite around island cabinets (base runs, seating overhang, storage) so the two are distinct. |
| `/blog/kitchen-cabinet-timeline-boise` | 446 | none listed | Kitchen Cabinets | Improve in place | keep URL | Distinct timeline query; rewrite to 1,000+ words with phase-by-phase dates from the process steps. |
| `/blog/cabinet-planning-checklist` | 194 | none listed | Whole-Home Cabinetry | Improve in place | keep URL | Survivor for the two planning posts; rewrite and link the /resources checklist PDF. |
| `/blog/cabinet-buying-mistakes` | 206 | none listed | Whole-Home Cabinetry | Improve in place | keep URL | Distinct mistakes query; rewrite to 1,000+ words. |
| `/blog/living-through-cabinet-installation` | 244 | none listed | Whole-Home Cabinetry | Improve in place | keep URL | Distinct during-install query; rewrite to 1,000+ words. |
