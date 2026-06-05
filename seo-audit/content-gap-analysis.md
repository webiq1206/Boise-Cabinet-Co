# Content Gap Analysis - Boise Cabinet Co

Current: 8 topic hubs + local-guides, 10 guides (1 deep cost pillar + 7 thin hub pillars + master + location), 56 blog clusters. Content QA passes (`scripts/verify-content.ts`).

## Strengths

- Cost hub anchored by 1,644-word pillar with tables, question H2s, 15 FAQs.
- Full hub-and-spoke (pillar -> clusters -> category hub) with automated internal links.
- Quick Answer + Key Takeaways blocks on guides/blog (AEO-friendly).

## Gaps and weaknesses

| Gap | Detail | Action |
|---|---|---|
| Thin hub pillars | 7 of 8 pillars are 274-358 words vs 1,644-word cost anchor | Deepen to true pillar depth OR explicitly position as curated indexes |
| Thin factory clusters | ~43 clusters at ~133-150 words | Expand high-intent clusters (choosing-company, process, cost) |
| Duplicate cluster FAQs | All clusters in a hub reuse first 6 hub FAQs | Author unique FAQs per cluster |
| Stale remodeling vocabulary | ADU/addition/load-bearing language in cost + layout copy | Reframe to cabinetry |
| Broken guide links | Plural `-cabinets-guide` slugs in `locationGuides.ts` etc. | Fix hrefs or add 301s |
| Missing definitions | Few "What is X" definition blocks | Add glossary-style answer blocks |
| Unused fields | `featuredSnippetTargets` defined but unused on factory posts | Populate for high-intent posts |
| Local depth | Local intent concentrated in 2 guides | Weave local signals across hubs/rooms (no doorway pages) |

## Missing topics to reach local authority

Cabinet-scoped, high-value topics not yet covered (or covered thinly):

- Cabinet materials: plywood vs MDF vs particleboard boxes; thermofoil vs paint vs stain; door material durability in dry climate.
- Frameless (Euro) vs framed cabinets explainer (link `/construction`).
- Cabinet finish care + cleaning in Idaho's dry/freeze-thaw climate.
- Soft-close hardware, drawer organization, pull-out systems (link `/hardware`, `/accessories`).
- Cabinet lead times + what to expect during install (link `/guides/cabinet-project-process-guide`).
- Financing options for cabinet projects.
- "Cabinet refacing vs replacement" decision guide.
- Permits/HOA for kitchen work in Ada vs Canyon County (link permit resource).
- Color trend guides tied to actual finishes (white, greige, navy, two-tone) - links into curated finish pages.

## Pruning candidates

- Dormant remodeling city content (`shared/content/locationCityContent.ts`) - keep redirect-only; do not publish as-is.
- Near-duplicate factory clusters with overlapping intent - consider merging thin pairs.

## Content quality rules (enforced)

Per `.cursor/rules/treasure-valley-content.mdc`: no em dashes; register in `contentHubs.ts`; pillars vs clusters word/H2/FAQ minimums; 8+ internal links on pillars; name all 8 cities where relevant; question-form H2s; visible FAQs.

## Priority order

1. Fix broken links + reframe stale vocabulary (correctness).
2. Unique per-cluster FAQs + deepen highest-intent clusters.
3. Deepen or reposition the 7 thin pillars.
4. Add missing materials/care/financing topics.
5. Weave local signals throughout.
