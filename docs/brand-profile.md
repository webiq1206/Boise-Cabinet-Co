## Brand: Boise Cabinet Co

Profile version: 1.2 | Recorded: 2026-11-05 | Last approved: no separate approval date established for this consolidated profile | Source of truth: this file and its source register below.

This is Cabinet’s authoritative Website Design Quality 2.3 E1 profile. It consolidates existing identity and current owner directions; it does not approve a new identity or certify existing CSS, final visual acceptance, deployment or live verification. Read the complete Website Design Quality 2.3 master, implementation rules and review record, plus Organic and AI Search Visibility 1.0.2 and applicable references. Latest explicit owner instructions and functional, accessibility and factual protections take precedence. Do not infer new permission from this document.

### Audience, positioning, and page goals

Local homeowners planning kitchen cabinets, bathroom vanities and built-in storage in Boise and the Treasure Valley; builders, remodelers and designers also have a project-package journey through `/builders`. Cabinet is a DBA of P5 Home Co LLC, not a separately claimed Cabinet LLC. Source positioning is made-to-order cabinetry, coordinated layout/finish/hardware selections and installation. Do not convert that positioning into unsupported manufacturing, customer or project-history claims. [S1, S2, S7]

Primary marketing action: **Request a quote** → `/estimate`. Catalog/room pages support product comparison and planning; guides/resources answer planning questions; `/contact` offers consultation/direct contact. `/estimate` is a task page with the quote request first, not a photo-led marketing hero. Preserve useful navigation and distinct secondary actions. [S1, S10]

Canonical site: `https://boisecabinet.co`; repository: `webiq1206/Boise-Cabinet-Co`. Contact defaults: `(208) 477-1169`, `tel:+12084771169`, `sms:+12084771169`, `hello@boisecabinet.co`. Hours: Mon–Fri 9 AM–6 PM, Sat 9 AM–4 PM, Mountain. Named source cities: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton and Caldwell. Preserve actual geography; do not invent offices or extend areas from keywords. Staging overrides are not automatically production facts. [S1, S2]

### Intended visual character and impression

Warm, architectural, editorial: cabinetry photography, visible materials/hardware, restrained serif statements, readable sans-serif explanation, paper/bone surfaces, charcoal framing and Cabinet teal. Preserve the image-led homepage, room exploration, finish comparison, process, founder and planning range. Judge adjacent sections together; a long text-only sequence needs relevant photography or purposeful split composition, not a decorative color stripe. Shared sizing/spacing does not transfer sibling identity. [S3, S6, S7, S12]

### Logos

Use the complete outlined October 28 lockups, preserving artwork, embedded spacing, endorsement and aspect ratio. No rebuilt live-text logo, separate duplicate subtitle, extra icon or recolored paths. [S1, S4, S5]

| Use | File | Verified SHA256 |
| --- | --- | --- |
| Light surface | `public/brand/approved-lockup-dark.svg` | `c427b8281284d96530f19ac7e38cc29163ddeeaa76effd2dc3693f64bdac21ef` |
| Charcoal header/menu/footer | `public/brand/approved-lockup-light.svg` | `70f21a18cbd695c9f4946b047700c6c6f4716bc5393aa3d763b90c763f2adf3e` |

ViewBox approximately 339.147 × 50; configured artwork 339 × 50. Current shared header/menu maximum image height is 28px phone, 32px from 640px; footer maximum is 32px. Below360px the canonical header preserves the complete approved SVG in its own44px row above the contact/menu row, rather than a live-text replacement. These are observed responsive rules, not an invented universal logo minimum. No separate approved numerical minimum or external clear-space rule for this compound lockup was located: preserve its viewBox/current container clearance and review optical legibility. [S1, S4, S5]

The older seal kit’s 8%-of-diameter clearance and 160px minimum apply to those archived seals. Its B-cap-height wordmark clearance, 600px minimum, `#7AAAAA` accent and disc-over-photo advice are historical artwork guidance, not instructions to resize/recolor the current website lockup. Keep original assets. The kit’s `../../BRAND-SYSTEM.md` is absent in this checkout and is not treated as loaded authority. [S6]

### Colors: exact roles

Use semantic roles. Brand roots override the shared fallback accent through `FAMILY_BRAND` and `app/family-adoption.css`. [S1, S3, S5]

| Role | Exact value and use |
| --- | --- |
| `--color-bg` | `#FBFAF6`, paper marketing ground |
| `--color-bg-alt` | `#F1EDE4`, bone alternate ground |
| `--color-surface` | `#FBFAF6`, canonical light panel |
| `--color-border` | `rgba(32,35,31,0.15)`, light hairline |
| `--color-text` | `#20231F`, canonical ink |
| `--color-text-muted` | `#343934`, canonical secondary ink |
| `--color-primary` | `#383837`, owner-selected primary dark control/brand ground |
| `--color-accent` | `#659B9A`, Cabinet teal detail/interaction |
| `--color-accent-ink` | `#356463`, ordinary light-ground teal text/focus |
| `--color-heading-accent` | `#659B9A`, exact approved logo/icon fill for heading emphasis |
| Secondary accent | None appointed; no competing brand accent |
| `--color-success` / warning / error | `#3F6B4A` / `#8A6A1F` / `#A33A2C`, status only |
| `--color-chrome` | `#383837`, owner-selected header/menu/footer charcoal |
| On-dark text / muted / border | `#FBFAF6` / `rgba(251,250,246,.8)` / `rgba(251,250,246,.18)` |

Current editorial aliases use charcoal ink `#383837`, muted ink `#62645F`, paper `#FBFAF6`, bone `#F1EDE4`. These are recorded source values, not permission for arbitrary shades. Canonical primary buttons use dark fill/paper text with teal leading detail; hero buttons reverse to paper/dark text with that detail. Do not force teal fill onto approved neutral controls. No sibling blue, ochre, sage or terracotta becomes Cabinet teal. Verify actual text contrast (4.5:1 normal, 3:1 large); old kit contrast claims do not establish new combinations. [S3, S5, S6]

The later owner direction to finish and merge the charcoal requests selects `#383837` for existing brand-charcoal surfaces. It supersedes the earlier `#1C1F1E` chrome choice; Cabinet teal and the approved role scale remain. The canonical family source owns shared token changes.

### Typography: families, roles, weights, measures

Self-hosted Cormorant Garamond for display/headings; Manrope for body/UI. `app/layout.tsx` loads `cormorant-garamond-variable.woff2` (300–700) and `manrope-variable.woff2` (200–800) with `display:swap`. Outlined mark lettering and PDF/OG assets are not extra live website font families. [S8]

Use the current owner-selected role map. Values are CSS px; phone <640, tablet 640–1023, desktop ≥1024. Display/headings use 400, ordinary copy 400, labels/buttons 600, navigation 500; retain meaningful inline emphasis. Headings stay within their owning column, with narrower existing statement measures retained; never truncate to manufacture fit. [S3, S5, S12]

| Role | Phone | Tablet | Desktop | Line height | Tracking | Maximum measure |
| --- | --- | --- | --- | --- | --- | --- |
| Shared photo hero | `clamp(44px,13.333vw,56px)` | `clamp(56px,8.5vw,80px)` | `clamp(68px,7vw,116px)` | 1.02 / 1.02 / .98 | -.03em | Copy 36rem; support 30em |
| Editorial section display (including semantic H2) | 36 | 52 | 64 | 1.05 | -.02em | Owning column |
| Page H1 | 40 | 44 | 52 | 1.1 | -.02em | Owning column |
| Compact feature | 32 | 44 | 52 | 1.1 | -.02em | Owning column |
| Ordinary article/legal H2 | 28 | 36 | 40 | 1.15 | -.01em | Content column |
| Content/card H3 | 22 | 26 | 28 | 1.2 | -.01em | Card/content column |
| H4 | 18 | 20 | 20 | 1.3 | 0 | Content column |
| Body | 17 | 18 | 18 | 1.6 | 0 | 65ch for long copy |
| Small/caption | 14 | 15 | 15 | 1.5 | 0 | Owning figure/column |
| Uppercase eyebrow | 13 | 13 | 13 | 1.3 | +.06em | Heading column |
| Navigation / button | 15 / 16 | 15 / 16 | 15 / 16 | 1 | 0 | Control; allow growth |

`ed-h2` is editorial display; `ed-h2-sm` uses the ordinary H2 role, matching the sibling SectionHeader component; named request/room feature titles retain the H1/feature role. Article/legal headings keep their content role. Use `--fs-*`, `--lh-*`, weight/tracking tokens; replace conflicting declarations instead of universal `!important` floors. Marketing rules must not leak into estimator/admin/portal/application inputs. The shared fluid hero is an explicit retained role decision. Legacy oversized clamps are implementation debt, not exceptions. Actual loaded fonts, wrapping, 200% text and equivalent-role equality require rendered checks. [S3, S5, S12]

### Spacing and layout

Base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px. Approved fluid endpoints and one scale-step optical correction are allowed; stacked arbitrary offsets are not. [S3]

| Token/use | Phone | Tablet | Desktop |
| --- | --- | --- | --- |
| Gutter | 20; 16 below 360 | 32 | 48 |
| Content maximum / long-copy measure | 1280 / 65ch | 1280 / 65ch | 1280 / 65ch |
| Standard / compact / feature section | 64 / 32 / 80 | 80 / 48 / 96 | 96 / 48 / 128 |
| Card padding / grid gap | 24 / 20 | 24 / 24 | 32 / 32 |
| Heading-to-copy / copy-to-CTA | 16 / 24 | 16 / 24 | 20 / 32 |

Button gap 12, field gap 20, label/icon/list gaps 8, inline gap 4px. Paragraph rhythm follows body line height using an approved step or `1lh`. Wide layouts start at 1280px. Cabinet navigation expands at **1180px**, a component threshold, not a different type tier. [S1, S3]

Align header, hero, headings, grids and footer; photos may bleed. Existing split/panel/matrix/card primitives are tools, not mandatory templates. Four comparable items: four across, 2×2 or single column; never accidental 3+1. Six: 3×2, 2×3 or single column. Preserve reading order and intentional final rows. Sticky desktop introductions are optional, section-bounded, 20px below the actual header, with static fallback when stacked or short. Hero/task screens use their measured budgets rather than ordinary section padding. Historical shells/queries are not new approved overrides. [S3, S9]

### Shape and surface

Canonical radii: 0px buttons/cards, 4px inputs/choices, full for genuine pills. Thin purposeful borders, flat photography and minimal elevation. Button teal inset: 3px resting, 6px hover. Where new elevation is needed, master defaults are small `0 1px 2px rgba(0,0,0,.06)`, medium `0 4px 12px rgba(0,0,0,.08)`, large `0 12px 32px rgba(0,0,0,.12)`. Existing application-specific shadows/radii are protected implementation, not silently restyled by marketing documentation. [S3, S5]

### Photography, illustration, approved assets, and cropping

Use natural cabinetry interiors, woodgrain, door profiles, finish samples, hardware and storage details. Preserve material color and architecture. Prefer authentic rights-cleared product/team/project images where available. Realistic generated design imagery is welcome when authentic pictures are unavailable, without routine visible concept/illustration disclaimers. Surrounding copy, placement, alt and schema stay truthful: no invented completed job, local installation, company employee/customer, testimonial or before/after claim. Preserve applicable platform-required metadata/disclosure. [S6, S7, S12; Organic 1.0.2 page standards §11]

Homepage assets include `/images/approved/hero-p5-v2.webp` (1672×941; desktop 62% 50%, phone 60% 50%), six `/family/drive/` room/detail images, `/images/approved/drawer-oak.webp`, finish samples and `/images/about/perkins-family-meridian-idaho.webp`. These are sourced display choices, not project-history proof. The family portrait’s contain/4:3 treatment is deliberate. Catalog/SITE_IMAGES registries supply interior assets. [S7, S11]

Preserve every visible person’s complete head, hair, headwear, face and chin with breathing room; no UI covers a face. Replace an already-cut source. Keep descriptive alt detail without unsupported staff/customer/place assertions; decorative images use empty alt. Preserve dimensions, variants, reserved space and LCP loading. Check final crops with actual images loaded on phone/tablet/desktop. [S5, S7, S11]

### Buttons, forms, navigation, and icons

Manrope/control role sizes, square canonical faces, one primary per group. Minimum rendered heights and horizontal padding: large 48/24px; medium 44/20; small 36/16 only with non-overlapping 44×44 touch area; inputs 48/16; choices at least 56/20. Grow for valid wrapping/enlarged text. [S3, S5]

Header/menu/footer use `#383837`, shared unboxed Call/Text/Chat icons and clear labels. Call/Text use sourced destinations; Chat dispatches `p5:assistant-open`. Omit unavailable Chat on `/admin*`, `/portal*`, `/design-studio*`, `/estimate*`, `/kitchen-cabinets`. Use canonical ContactActions/Icons in chrome and the existing Lucide vocabulary in content; do not substitute unrelated SMS/chat symbols. [S1, S5]

Header targets: 64px phone, 76px tablet/desktop, plus safe area; measure actual grown height. Mobile bar: 48px actions, 12px vertical padding plus safe area; reserve actual height through page end. It yields to menus/dialogs/keyboard/chat/active task controls. `/estimate/*` uses task navigation; existing body flags also yield during input/final-request states. Keep focus and footer links clear. [S1, S3, S5]

### Interaction states and motion

Fast 200ms; panels/menus/accordions/steps 300ms. Curves: `cubic-bezier(.2,.7,.2,1)` and `cubic-bezier(.45,0,.25,1)`. Reduced motion means none or opacity-only. Actions never wait on animation. Preserve visible focus, labels, logical keyboard order, selected states beyond color and hover/active/disabled/loading/empty/success/error behavior; restore focus appropriately after chat/menu dismissal. No new automatic popup or overlay is authorized. [S3, S5]

### Writing style and approved terminology

Natural, specific customer prose: kitchen cabinets, bathroom vanities, built-ins, cabinet door profiles, finishes, in-home design consultation, planning range, Request a quote. Nick Perkins may appear naturally as founder in the existing biography. Preserve **P5 Home Co LLC, Idaho Registered Contractor #8381215**, useful phone/hours/geography and substantive safety/legal/pricing/scope/sample/warranty qualifications. No em dashes or double hyphens in customer prose. [S1, S2, S7]

Do not publish the private street address/home coordinates, administrative contact explanations, concept-image labels, first-project/new-brand status or reference-availability pitches in visible content, attributes, metadata/schema, maps, vCards, discovery text or downloads. Use service areas and useful contacts. Public schema is not private verification storage. Preserve correct private verification/GBP records with the existing owner; a public parent-profile link does not prove owner-only GBP settings. [S1, S2, S12]

### Proof elements available

| Resource | What it supports; limits |
| --- | --- |
| Generated FINISHES/DOOR_STYLES | Current 299 finishes, six door styles; inventory, not completed jobs |
| Claims/registration sources | Sourced registration, warranty handling and 2-year installation workmanship wording; no expanded lifetime/bonded promise |
| KitchenPlanningRange | Ungated base-run slider and Matte/Woodgrain/Gloss choices, immediate modeled installed-cabinet range from shared `calculateEstimate`; not a firm bid or achieved result |
| Samples/planning downloads | Product/source and planning artifacts; verify authenticity/content before new claims |
| Founder biography/photo | Existing natural team story; does not authenticate other generic people scenes |

Homepage range upper run is roughly .75× base run, rounded/clamped to configured steps/limits, with shared defaults. Preserve assumptions, units, exclusions and “not a firm bid.” Validate changed/boundary inputs and C10 states; source presence is not a fit pass. Do not enable seed review/founding-year/lifetime flags or present six internal design records as completed projects. No authenticated customer-result portfolio was established in this task. Real process-artifact acceptance remains a C14 check. [S2, S7, S10, S11]

Four public PDFs: `/downloads/boise-cabinet-catalog.pdf`, `/downloads/cabinet-budget-worksheet.pdf`, `/downloads/kitchen-bath-planning-checklist.pdf`, `/downloads/ada-canyon-permit-guide.pdf`. [S10]

### Wizard flows in use

| Entry / purpose | Source sequence and output | Destination / preservation |
| --- | --- | --- |
| `/estimate`, room/builder quote entries | Quote request or callback first; optional success-screen preparation details/files; request receipt, not confirmed price/installation | QuoteRequestForm → `/api/consultation`; preserve identity/routing, consent, uploads, session draft, deduped events |
| Optional `/estimate` planning wizard | Project; per-room size, quality, conditional layout, style; combined result; contact/visit when enabled | EstimateCalculatorWizard → existing consultation pipeline; result before contact, all rooms/answers across Back/refresh |
| `/contact` consultation | Existing request/callback flow, attaching validated prior multi-room/legacy planning work | ConsultationForm → QuoteRequestForm → `/api/consultation`; preserve all rooms/estimate record |
| `/estimate/scope`, `/estimate/p5-preview` | P5 Project → Details → Estimate/review, intake variants, saved drafts/files/revisions/PDF | Existing `/api/p5-estimator/*`; protected provider, durable recovery, consent and delivery behavior |
| `/design-studio` source tool | Room → Layout → Cabinet style → Finish & color → Finishing touches → Review & estimate | Existing save/share/pricing handoff; audited deployed baseline returned 404, so public availability is not asserted |

These describe source behavior, not fit or delivery passes. Apply C10/D2 to all affected normal/validation/loading/error/review states: one decision or at most four related fields, at most six choices, progress, valid Back/Next, editable review, persistent state. Split overflow before compressing text/controls. Measure actual keyboard-visible space; no inner scrollbar or two bottom bars. Existing quote intake does not waive C10. Record exact permitted 320×568 or enlarged-text conditions; do not import hero exceptions into input tasks. [S10]

### Accepted design screenshots

No versioned screenshot acceptance set for this consolidated profile was established in the repo. The [approved handoff](approved-design-handoff.md) records historical September 24 implementation/review claims, not a new final pass. The current private baseline covers Cabinet at 390×844, 768×1024 and 1440×900; root inspected the owner’s eight actual reference images. Those identify requested corrections, not acceptance of the final integrated version. Final exact-revision before/after and independent F4 records remain in existing private evidence. [S6, S12]

### Rejected patterns and reasons

- [Older design-system guidance](design-system.md): sibling blue, dark-dominant bands, 11px uppercase buttons, forced sticky layouts and universal fit claims conflict with Cabinet’s current identity/standards; explicitly superseded.
- Owner header references: boxed Call and inconsistent SMS/chat symbols obscured common actions; canonical unboxed controls retain actual capability/destinations.
- Owner section references: adjacent text-heavy pale sections lacked architectural variation; decoration alone does not repair the sequence.
- Administrative/address/status copy and hypothetical portfolio histories: unnecessary explanation or unsupported proof; remove labels and false implication while retaining useful facts.
- Independent type clamps/conflicting overrides: equivalent roles drifted; use the chosen role map and inspect actual cascade, without automatically shrinking Cabinet alone. [S9, S12]

### Protected functionality and integrations

Preserve stable routes/redirects, metadata/canonicals/indexing, entity IDs/schema, crawlable links, sitemap/image sitemap/RSS/llms, downloads/vCard; catalog/filter/compare/search; consultation/callback routing; uploads/calculations/drafts/versions/PDF delivery; design handoff; authentication/admin/portal boundaries; analytics/attribution/consent/deduplication. Keep noindex/tools separate from intended search pages. This profile authorizes no provider operation, real test lead, external communication, credential/security change, spend or indexing/distribution submission. UI success does not prove delivery. [S1, S8, S10]

### Approved page-specific exceptions

No new Part C exception is granted. Retain sourced task arrangements: `/estimate` has its own in-flow brand heading/task controls; marketing wrapper/assistant/promotional bar is excluded or yielded on documented task/admin/portal routes. Fluid hero and 1180px navigation are explicit component/role decisions, not fit waivers. Other palette/type/logo, pricing/claim/geography, indexing, rollout or new-overlay changes retain A3/current owner gates. Existing explicit directions cover the coordinated typography/contact/chrome cleanup; do not seek the same exact authorization again. [S1, S5, S10, S12]

### Relationship to parent and sibling brands

Cabinet owns its name, teal, cabinetry imagery/products/copy and service journeys. Shared: Manrope/Cormorant, role/spacing/control standards, common charcoal chrome and contact/hero/accessibility engineering. The 17 family files/manifest are canonically owned by `boise-remodeling-co`; verify with `scripts/verify-family-chrome.mjs`. Brand facts belong in `lib/familyBrand.ts`. Do not transfer sibling identity, bypass the estimator manifest or broadly sync engine files. Preserve concurrent Cursor work. Jared owns Git import/publication; a profile or commit is not deployment. [S1, S3, S5, S12]

### Factual source register and verification limits

| ID | Source and checked purpose |
| --- | --- |
| S1 | [Family brand](../lib/familyBrand.ts): identity, lockups, accent, CTA/navigation, contacts, suppression and footer |
| S2 | [Site config](../shared/siteConfig.ts), [claims](../shared/claims.ts), [content data](../shared/contentData.ts): entity, phone/hours/eight cities and factual gates |
| S3 | [Family tokens](../styles/family-tokens.css), [adoption](../app/family-adoption.css): exact B2–B7 values and Cabinet overrides |
| S4 | [Asset manifest](branding-20261028.json), both `public/brand/approved-lockup-*.svg`: bytes/dimensions/fills and SHA256 matched |
| S5 | [Chrome CSS](../styles/family-chrome.css), [ContactActions](../components/family/ContactActions.tsx), [types](../lib/family/types.ts), [manifest](../lib/family/manifest.json): component rules/ownership |
| S6 | [Approved handoff](approved-design-handoff.md), [older kit](brand/BRAND.md), [archive HTML](brand/brand-kit.html): historical direction/conflicts and missing external reference |
| S7 | [Homepage](../components/approved/ApprovedHome.tsx), [Cabinet content](../components/approved/cabinet-content.ts), [approved system](../app/approved-system.css): composition/paths/proof/editorial palette |
| S8 | [Root layout](../app/layout.tsx): font sources, CSS consumers, analytics entry points |
| S9 | [Adoption note](design-system.md), [interior mapping](../app/approved-interiors.css), [Cabinet CSS](../app/approved-cabinet.css): intended role map/legacy debt |
| S10 | [Estimate entry](../app/estimate/page.tsx), [range](../components/approved/KitchenPlanningRange.tsx), [quote form](../components/quote/QuoteRequestForm.tsx), [planning wizard](../components/estimate/EstimateCalculatorWizard.tsx), [consultation](../components/ConsultationForm.tsx), [P5 estimator](../components/P5Estimator.tsx), [design steps](../lib/design/designSteps.ts), [resources](../shared/guideResources.ts), [catalog](../app/catalog/page.tsx): flows/destinations/downloads |
| S11 | [Finishes](../shared/catalog/generated/finishes.ts), [door styles](../shared/catalog/generated/doorStyles.ts), [project source](../data/projects.json), [site images](../shared/siteImages.ts): inventory/media provenance, not automatic authenticity |
| S12 | Current owner directions, actual reference inspections and role decision in existing private task evidence: `portfolio-six-site-authority.md`, `reference-image-observations.md`, `portfolio-typography-decision.md`, `portfolio-labels/cabinet*.{json,md}`. These are not publicly served assets or final acceptance. |

Complete Website Design Quality 2.3 resources and Organic 1.0.2/all six current references were loaded for this consolidation; cached Organic 1.0.0 guidance is superseded. Documentation alone does not pass the exact-revision normal build, rendered route/state/keyboard, independent review or live gates. Reuse the existing inventory/recovery records; no competing generic audit or assumed analytics/search access.


### November4 narrow-header and menu implementation record

Canonical source `boise-remodeling-co` revision `fa720a579b696af92861fb571fa0aff043e734b0` restores the complete approved SVG below360px in a logo row above the unboxed contact/menu controls. Normal320px prototype height is89px including the border; use the actual measured header/safe-area height, not a fixed clearance. Enlarged text may grow it. Normal360px-and-up header geometry is unchanged. Mobile-menu Call/Text/Chat contact controls are transparent and borderless at rest, retain visible focus and existing destinations/capability, and use the same icons as header/footer. This records the owner-requested consistency repair, not a new identity or approval exception. The independently reviewed prototype is narrower evidence than each final built site; retain exact-head rendering and functional gates.

The homepage uses the existing viewport-fit HeroPhoto composition. Its support keeps the cabinetry scope; the unchanged free in-home design-consultation sentence follows in the next cabinetry-section intro. Primary/secondary destinations, reassurance, image, H1 and approved type/padding remain. `/kitchen-cabinets` now uses the common family footer; Chat remains omitted there under its existing capability policy. The `/estimate` task-footer exclusion is unchanged.

### November 4 heading accent alignment

The latest explicit owner direction requires each site’s heading pop to match its approved logo/icon. Cabinet uses exact `#659B9A`, verified from both approved lockups and both P5 family icons against `docs/branding-20261028.json`. `--color-heading-accent` is separate from the ordinary text/focus inks `#356463` and `#356363`; headings no longer substitute these inks, legacy brown, HSL text tints or paper-mixed teal. Existing inline heading `--ed-accent`/`--f-accent` consumers inherit the exact heading role. Canonical shared hero transport must use this role without a tint.

Exact teal is 2.997:1 on paper and 2.679:1 on bone, so those combinations cannot be rounded into a large-text pass. On the existing `#383837` charcoal the ratio is 3.750:1. The November 4 implementation used a one-pixel neutral context for H1/H2 accent glyphs while preserving fill, fonts, sizes, line boxes and page flow. The later November 5 direction below removes it from H1 and retains H2 treatment. Light paper/bone compositions use the white already present on form cards, so the thin serif retains its painted weight; dark compositions retain charcoal. The exact teal has more than 3:1 contrast on either context. Independent review rejected the earlier dark outline on light surfaces as visually too heavy. This is the scoped neutral-context prototype authorized for this correction; it adds no heading container or section background. Source inspection found current accented H1/H2 text at least 24px and no accented H3–H6 text; the small H3 icon in RoomScanPanel retains its UI text-accent role. Do not generalize the surround to body/UI text, change weights or assume it establishes a pass for future smaller accented headings.

The surround follows the neutral-context approach documented in WCAG G18 (https://www.w3.org/WAI/WCAG22/Techniques/general/G18.html). Actual loaded thin-serif edges, photography, mobile wrapping, focus and all affected template/route states still require exact-revision rendering and independent review. This source implementation is not a visual, contrast, all-page, build, deployment or live acceptance record.

Existing small FAQ question open states and related-post title hover states retain neutral
text with underline/chevron affordances. Their font roles/weights are unchanged; the
large-heading glyph-context prototype is not a contrast pass for these small titles.

### November 5 mobile heading direction

The latest owner direction removes the H1 glyph surround, enlarges mobile H1s
and preserves intentional mobile alignment while restoring only demonstrated
recent centering changes. It supersedes the H1 portion of the November 4 surround
record above. Existing H2 glyph treatment remains; H1 and the home photo-hero
accent have no surround. Exact Cabinet teal `#659B9A`, typography families and
400 display weight remain. Exact teal still fails the large-text threshold on
paper and bone. H1-emphasis marketing hero introductions and the catalog header
therefore use the existing charcoal surface and paper text/action roles. The
Design Studio heading introduction and the internal typography specimen use that
same surface without changing their own font sizes or task controls. The context
selection requires an H1 with emphasis; other H1 contexts retain their surfaces.
The full section context replaces the removed glyph surround and preserves the
original geometry, photographs and reading alignment. Exact teal against charcoal
is 3.750:1, appropriate only where the actual loaded text qualifies as large.
The Studio's authored task scale stays unchanged. Separate documented local-enabled
fixtures observed actual 25px phone and 31px tablet/desktop H1s with loaded custom
fonts in both loaded and loading states. Default-mode Studio remains intentionally
404; these heading observations establish no production availability or general
workflow, contrast or release acceptance.

Actual November 5 development checks found the home photo behind exact-teal
H1 emphasis insufficient after removal of the glyph surround. Its accent line
therefore begins a continuous existing-charcoal copy field, preserving all line
boxes, padding, imagery and contact geometry. The photograph remains visible
above it and on the desktop's right side. A 32px transparent-to-charcoal transition
keeps the white heading edge over a readable context. Below 1024px, the existing
photograph uses a 50% media height and bottom focal position so visible cabinetry
and island details remain recognizable above the copy field; no source image or
layout line box changes. The existing inner photo gradient reaches its first
dark stop at 64px so the 13px eyebrow also has a readable context; viewport-fit
padding remains controlled independently by the section token. Actual cabinet
details, the small eyebrow and the white heading comma
still require pixel/contrast review. At bar-active widths, ordinary
intro action links/buttons use the existing bar-height/safe-area plus16px scroll
clearance so native keyboard focus can keep complete controls above the bar.
This is a bounded presentation repair, with no focus manager or task behavior
change. Design Studio remains intentionally404 in default mode; a documented
local-enabled heading fixture is separate from any production availability.

The family page-title role is 40/44/52px through `--fs-page-title`, separate from
the unchanged 32/44/52px compact feature role. The phone shared photo-hero role
becomes `clamp(44px,13.333vw,56px)`. Canonical Remodeling owns shared source and
transport. Existing Cabinet hero/section alignments, including the centered guide
introduction and closing calls to action, predate the recent update and remain.

The `/kitchen-cabinets` landing consumes the page-title role instead of its former
30px phone override. Its phone hero uses the section-padding token with the
obsolete extra header offset removed; the unchanged service-detail badges and repeated telephone/contact note follow
the hero so the larger title and contact actions have room. The existing image,
useful copy, actions and quote journey remain. Protected task/form typography and
behavior are unchanged. This record grants no fit, accessibility or palette
exception and does not claim final rendered, independent or release acceptance.

The room and location commercial templates use a bounded narrow-screen composition at
700px and below: the full unchanged support sentence begins the existing section
immediately after the hero. The 40px page title, quote action, Call/Text links and
same original photograph remain together. Their eyebrow consumes the canonical
13px label role rather than the inherited 17px body role. The phone photograph
uses a 96px/17.5svh/192px height range; widths of 701px and above retain the original split
composition and support-sentence placement. This corrects measured initial CTA
coverage at320 and complete-hero overflow at normal phone sizes without reducing
body or H1 type, deleting copy, changing intentional alignment or altering contact
destinations. Actual bounds and crops still require final independent review.

### November 5 owner correction: homepage overlay and fold

The latest explicit owner direction permits darkening the uniform overlay as
needed for readability, with black preferred unless it looks odd. Cabinet uses
one uniform `rgba(0, 0, 0, 0.67)` overlay, selected against actual image and glyph
pixels at normal and enlarged text sizes. It replaces the charcoal copy field,
half-height photograph and directional gradients. The existing photograph covers
the complete hero at its original approved focal positions. The homepage fills
the current visible viewport below the measured header; header safe-area padding
is counted once, and browser controls are already excluded by dynamic viewport
units. The existing mobile action bar remains over the continuous hero image.
Content can grow the section naturally for enlarged text or constrained viewports.

This later direction supersedes both the earlier homepage charcoal/half-photo
record and the initial fixed 40%-opacity direction. It preserves exact Cabinet
teal, font roles, copy, contacts and journeys; no accent recoloring, H1 surround,
regional gradient or separate text panel is introduced. Further changes still
require actual contrast, responsive and independent review evidence.
Actual verification and release state are reported in the task pull request and
private review record; this profile is not a final acceptance or deployment claim.

### November 5 approved homepage video

The latest owner-selected Cabinet video replaces only the homepage photograph.
Use natural full-bleed cover, the existing full-fold geometry, exact teal and
unchanged typography, copy, contact actions and proof. The current uniform black
overlay is `rgba(0,0,0,.73)`; final actual-frame contrast remains a release check.
These representative cabinetry scenes make no completed-customer-project claim.

The owner's later direction requires native muted inline autoplay and looping
in every motion/data preference mode, without native or visible playback
controls or preference-based source gating. Preserve the immediate poster for
technical no-JavaScript/loading/error/blocked-play fallback, responsive 720p/1080p selection
and automatic hidden/offscreen pause with visible resume. Browser-enforced
autoplay restrictions cannot be overridden or guaranteed away. This behavior
does not establish full accessibility conformance; the known pause/motion
limitation is recorded with the task, alongside the independent review and
source checks. Replit import/publication remains the owner's separate step.
