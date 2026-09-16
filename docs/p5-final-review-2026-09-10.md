# Boise Cabinet Co: final Git handoff

September 10, 2026. Release branch: `codex/p5-visual-final-20260910`.

This handoff preserves the newer main-branch application and audit evidence at `c1fcc2effcdfda4314c116c2a5e5f351caab6e40`. The full change description is in [the visual audit](p5-visual-audit-2026-09-10.md); exact tested revisions are recorded per row in [the route verification CSV](p5-route-verification-2026-09-10.csv), with detailed results in [the interaction record](p5-interaction-verification-2026-09-10.json).

## Verified coverage

- 1,251 passing route/viewport checks across 139 recorded routes at 320, 390, 430, 600, 768, 1024, 1366, 1440 and 1920 CSS pixels.
- Production builds and component/estimator browser workflows passed at the source revisions identified in those records. The full route sweep and subsequent targeted reruns are distinguished from later component checks; they are not represented as one unchanged application revision.
- Downloaded route artifacts were compared with every recorded route/width result. Earlier failed checks remain documented, and affected routes have passing reruns. Internal-link batches recorded no unresolved failures.
- Manual review covered shared templates and selected changed sections, including mobile navigation, forms, footer actions, comparison images and article sidebars. Cabinet's 17 corrected article/topic image placements were reviewed at phone, tablet and laptop widths, alongside the sidebar, catalog, accessory cards and scope-intake entry page. The replacement source images were also inspected.

The component workflow passed 297 checks, nine assistant/form checks, nine catalog scenarios and nine product-search scenarios. [Scope run 34526070978](https://github.com/webiq1206/Boise-Cabinet-Co/actions/runs/34526070978) rebuilt the unchanged application and passed nine scope-intake workflows, adding 600- and 1366-pixel interaction coverage at test revision `1642588d8743da412b67075730e6aa428e1603a5`. External services were simulated.

## Integration

The newer main branches include additional article-sidebars, compact related-resource links and service-specific image corrections. They retain the visual and interaction repairs already pushed from this audit. Remodeling uses targeted direct delivery of small compressed images; the broader temporary optimizer setting from an earlier release candidate is superseded by that tested main-branch implementation.

The family inventory contains 692 public routes. Its 6,228 route/viewport results were checked against the downloaded workflow artifacts and all have a passing final result. Earlier failures and reruns remain traceable in the records.

## Remaining limits and publication

This is not an exhaustive manual approval of every section on all 692 routes at every width. Legacy image provenance, exact property/geographic attribution and all visible clothing branding have not been independently certified. Generated comparison imagery is labeled as illustrative design imagery, not completed customer work.

Browser checks use viewport/touch emulation and simulated external services. Live email/SMS/CRM delivery, authenticated staff/customer operations and physical-device browser controls/safe areas were not exercised. Scope intake must be rechecked on the public HTTPS domains after republishing; the HTTP preview lacks the secure-context UUID API used by that workflow.

No Replit agent or credits were used. Pull the final Git changes into the matching Replit project and republish before expecting the public domain to display them.
