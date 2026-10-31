# Blog merge map (proposal, needs owner approval)

Status: proposal only. Nothing in this file has been executed. Phase 4 deliberately deletes and redirects no posts; it improves the thin posts' metadata and internal links in place (shared/content/thinPostSupport.ts) so they keep earning while the owner decides.

Generated on 2026-10-31 from `shared/blogContent.ts`. A post is thin when its body (`content`, excluding FAQs) is under 700 words by `countWords` in `lib/content-utils.ts`: 50 of 78 posts today. The audit counted 48 with a different word counter; this table lists every post under the line by the counter above, so none is missed. Dispositions follow `seo-notes-cabinet.md` section 3.

Summary: 36 merge into an existing page, 14 improve in place. Every destination exists today.

## Rules for the release that executes this

1. One 301 per merged URL, straight to its destination, in `shared/contentRedirects.ts` (one hop; `npm run verify:redirect-collisions` must pass, and no destination may itself redirect).
2. Move the merged post's unique FAQs and any unique paragraph into the destination before the redirect ships; drop duplicates.
3. Update internal links that pointed at a merged URL (`npm run links:generate` then `npm run audit:links`), and remove the post from `CONTENT_MANIFEST` in `shared/contentHubs.ts` so the sitemap drops it.
4. Check hub counts: `CATEGORY_HUB_MIN_POSTS` is 3. After these merges cabinet-project-process and cabinet-roi fall below it and turn noindex,follow automatically; keep both hub URLs (no redirect).
5. Do not merge a post that Search Console shows earning clicks without moving the query to the destination first. Search Console data was not available when this was written; check it per URL before approving.

## Posts to merge (36)

| Post | Body words | Hub | Action | Destination | Reason |
|---|---|---|---|---|---|
| `/blog/bathroom-vanity-layout-guide` | 188 | Bathroom Vanities | Merge | `/blog/bathroom-vanity-buying-guide` | Layout and sizes are already covered in the 1,600-word buying guide. |
| `/blog/luxury-bathroom-vanity-guide` | 192 | Bathroom Vanities | Merge | `/guides/boise-bathroom-vanity-guide` | Primary-suite vanities are a section of the vanity pillar. |
| `/blog/luxury-custom-cabinet-cost-boise` | 229 | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | A luxury tier is a section of the cost pillar, not its own page. |
| `/blog/whole-home-cabinet-cost-boise` | 242 | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Whole-home cost belongs in the cost pillar's whole-home section. |
| `/blog/how-to-budget-cabinets-boise` | 248 | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Budgeting steps belong in the pillar's budgeting section. |
| `/blog/what-impacts-cabinet-costs-boise` | 256 | Boise Cabinet Costs | Merge | `/guides/boise-cabinet-cost-guide` | Cost drivers duplicate the pillar's 'what changes your price' section. |
| `/blog/kitchen-cabinet-cost-boise` | 534 | Boise Cabinet Costs | Merge | `/blog/custom-kitchen-cabinet-cost` | Same cost query as the 1,600-word post; keep the survivor and add Boise to its title. |
| `/blog/garage-storage-cabinet-systems` | 165 | Built-In Storage | Merge | `/cabinets/garage` | Restates the garage room page; move its unique FAQs there. |
| `/blog/primary-suite-closet-cabinets` | 181 | Built-In Storage | Merge | `/cabinets/closet` | Restates the closet room page; move its two useful FAQs there. |
| `/blog/multi-room-cabinet-planning` | 189 | Built-In Storage | Merge | `/guides/whole-home-cabinetry-guide` | Multi-room planning is the whole-home pillar's subject (its sequencing section now covers it). |
| `/blog/outdoor-bar-cabinet-storage` | 243 | Built-In Storage | Merge | `/blog/outdoor-kitchen-cabinets-boise` | Third thin outdoor post on the same topic. |
| `/blog/premium-outdoor-cabinetry` | 243 | Built-In Storage | Merge | `/blog/outdoor-kitchen-cabinets-boise` | Third thin outdoor post on the same topic. |
| `/blog/cabinet-installation-punch-list` | 191 | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Closeout is the last step of the process pillar. |
| `/blog/cabinet-fabrication-installation` | 198 | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Fabrication and install are steps of the process pillar. |
| `/blog/cabinet-finishes-door-styles-guide` | 200 | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Selections are a step of the process pillar. |
| `/blog/cabinet-design-development` | 201 | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Shop drawings are a step of the process pillar. |
| `/blog/cabinet-measurement-design-phase` | 207 | Cabinet Project Process | Merge | `/guides/cabinet-project-process-guide` | Measure and design are steps of the process pillar. |
| `/blog/cabinet-warranty-guide` | 301 | Cabinet Project Process | Merge | `/warranty` | Restates the warranty page; move its FAQs there with FAQPage schema. |
| `/blog/outdoor-cabinet-roi` | 164 | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/built-in-storage-roi` | 170 | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/bathroom-vanity-roi-boise` | 191 | Cabinet ROI & Home Value | Merge | `/guides/cabinet-roi-guide-boise` | A section of the ROI pillar. |
| `/blog/cabinets-for-long-term-living` | 204 | Cabinet ROI & Home Value | Merge | `/blog/cabinet-upgrades-before-selling` | Opposite side of the same sell-or-stay decision. |
| `/blog/what-makes-great-cabinet-company` | 202 | Choosing a Cabinet Company | Merge | `/guides/choose-cabinet-company-boise` | Restates the choosing pillar. |
| `/blog/why-cabinet-quotes-vary` | 204 | Choosing a Cabinet Company | Merge | `/blog/how-to-compare-cabinet-quotes` | Same quote-comparison intent. |
| `/blog/fixed-price-vs-cost-plus` | 206 | Choosing a Cabinet Company | Merge | `/blog/how-to-compare-cabinet-quotes` | Same slug on boiseremodeling.co, which owns the contract-type query; the cabinet angle fits the quotes post. |
| `/blog/cabinet-consultation-process` | 207 | Choosing a Cabinet Company | Merge | `/guides/cabinet-project-process-guide` | The consultation is step one of the process pillar. |
| `/blog/custom-vs-reserve-cabinets` | 218 | Choosing a Cabinet Company | Merge | `/compare` | Describes the one collection; /compare now compares it with stock and semi-custom. |
| `/blog/cabinet-company-red-flags` | 228 | Choosing a Cabinet Company | Merge | `/blog/questions-to-ask-cabinet-company` | Red flags are the other side of the questions post. |
| `/blog/custom-cabinet-shop-vs-big-box` | 326 | Choosing a Cabinet Company | Merge | `/blog/stock-vs-custom-cabinets-boise` | Shop vs big box is the stock vs custom decision. |
| `/blog/open-kitchen-cabinet-storage` | 196 | Kitchen Cabinets | Merge | `/blog/kitchen-cabinet-organization-ideas` | Open-plan storage is a section of the 1,600-word organization post. |
| `/blog/walk-in-pantry-design-guide` | 258 | Kitchen Cabinets | Merge | `/blog/pantry-cabinet-ideas` | Identical title on boiseremodeling.co; the cabinet content fits the long pantry post. |
| `/blog/kitchen-layout-ideas-boise-homes` | 260 | Kitchen Cabinets | Merge | `/guides/boise-kitchen-cabinet-guide` | Same slug and near-identical title on boiseremodeling.co, which owns kitchen layout; the cabinet angle fits the kitchen pillar. |
| `/blog/cabinet-project-planning-guide` | 202 | Whole-Home Cabinetry | Merge | `/blog/cabinet-planning-checklist` | Same planning checklist intent; keep one. |
| `/blog/whole-home-cabinet-timeline` | 222 | Whole-Home Cabinetry | Merge | `/guides/whole-home-cabinetry-guide` | Timeline is now a section of the whole-home pillar. |
| `/blog/cabinet-refresh-vs-replace-vs-moving` | 224 | Whole-Home Cabinetry | Merge | `/blog/cabinet-refacing-vs-refinishing-vs-replacing` | Same decision as the 1,600-word refacing post. |
| `/blog/custom-cabinet-design-process` | 226 | Whole-Home Cabinetry | Merge | `/guides/cabinet-project-process-guide` | Design steps belong in the process pillar. |

## Posts to improve in place (14)

Each keeps its URL and gets a direct answer block, real dated numbers only where the business facts support them, 1,000+ words, and real FAQs in place of the templated eight.

| Post | Body words | Hub | Action | Destination | Reason |
|---|---|---|---|---|---|
| `/blog/small-bathroom-vanity-ideas` | 167 | Bathroom Vanities | Improve in place | keep URL | Distinct small-bath query; rewrite to 1,000+ words. |
| `/blog/accessible-bathroom-vanity-guide` | 209 | Bathroom Vanities | Improve in place | keep URL | Distinct accessibility query; keep it vanity-only and rewrite to 1,000+ words. |
| `/blog/bathroom-vanity-cost-boise` | 289 | Boise Cabinet Costs | Improve in place | keep URL | Distinct, unowned query (vanity cost in Boise); rewrite to 1,000+ words with a direct answer and real FAQs. |
| `/blog/outdoor-kitchen-cabinets-boise` | 284 | Built-In Storage | Improve in place | keep URL | Survivor for the three outdoor posts; rewrite as one informational post that links /cabinets/outdoor. |
| `/blog/cabinet-upgrades-before-selling` | 194 | Cabinet ROI & Home Value | Improve in place | keep URL | Survivor for the long-term-living post; rewrite to 1,000+ words. |
| `/blog/kitchen-cabinet-roi-boise` | 314 | Cabinet ROI & Home Value | Improve in place | keep URL | Distinct ROI query; rewrite with dated, sourced figures only. |
| `/blog/how-to-compare-cabinet-quotes` | 355 | Choosing a Cabinet Company | Improve in place | keep URL | Survivor for the quote posts; rewrite to 1,000+ words. |
| `/blog/questions-to-ask-cabinet-company` | 414 | Choosing a Cabinet Company | Improve in place | keep URL | Survivor for red flags; rewrite to 1,000+ words. |
| `/blog/kitchen-cabinet-trends` | 242 | Kitchen Cabinets | Improve in place | keep URL | Cabinets are this brand's topic; rewrite as the family owner and ask Remodeling to consolidate its two trend posts (docs/kitchen-overlap.md). |
| `/blog/kitchen-island-design-guide` | 249 | Kitchen Cabinets | Improve in place | keep URL | Same slug on boiseremodeling.co; rewrite around island cabinets (base runs, seating overhang, storage) so the two are distinct. |
| `/blog/kitchen-cabinet-timeline-boise` | 446 | Kitchen Cabinets | Improve in place | keep URL | Distinct timeline query; rewrite to 1,000+ words with phase-by-phase dates from the process steps. |
| `/blog/cabinet-planning-checklist` | 194 | Whole-Home Cabinetry | Improve in place | keep URL | Survivor for the two planning posts; rewrite and link the /resources checklist PDF. |
| `/blog/cabinet-buying-mistakes` | 206 | Whole-Home Cabinetry | Improve in place | keep URL | Distinct mistakes query; rewrite to 1,000+ words. |
| `/blog/living-through-cabinet-installation` | 244 | Whole-Home Cabinetry | Improve in place | keep URL | Distinct during-install query; rewrite to 1,000+ words. |
