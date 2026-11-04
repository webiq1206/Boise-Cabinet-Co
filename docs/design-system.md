# Boise Cabinet Co design-system adoption

The authoritative complete E1 specification is [brand-profile.md](brand-profile.md), version 1.0. Read it with the complete Website Design Quality 2.3 master/implementation/review resources and Organic and AI Search Visibility 1.0.2. This file is an implementation/migration note, not a second profile or a visual acceptance record.

## Current rules

Cabinet retains paper `#FBFAF6`, bone `#F1EDE4`, charcoal controls, teal `#659B9A` and readable teal ink `#356463`. Header, menu and footer use the owner-selected common chrome charcoal `#1C1F1E`. Do not transfer sibling accents. Use complete `public/brand/approved-lockup-dark.svg` and `approved-lockup-light.svg` artwork. Current web teal supersedes the archived kit’s `#7AAAAA` for web UI.

Use self-hosted Cormorant Garamond headings/display and Manrope body/UI. The owner’s all-site comparison selected these equivalent roles; Cabinet is not reduced in isolation:

| Role | Phone <640 | Tablet 640–1023 | Desktop ≥1024 | Line height / tracking |
| --- | --- | --- | --- | --- |
| Shared photo hero | Fluid 42–56 | Fluid 56–80 | Fluid 68–116 | 1.02 / 1.02 / .98; -.03em |
| Editorial section display | 36 | 52 | 64 | 1.05 / -.02em |
| Interior H1 / feature | 32 | 44 | 52 | 1.1 / -.02em |
| Ordinary article/legal H2 | 28 | 36 | 40 | 1.15 / -.01em |
| Content/card H3 | 22 | 26 | 28 | 1.2 / -.01em |
| H4 | 18 | 20 | 20 | 1.3 / 0 |
| Body | 17 | 18 | 18 | 1.6 / 0 |
| Caption | 14 | 15 | 15 | 1.5 / 0 |
| Eyebrow | 13 | 13 | 13 | 1.3 / +.06em |
| Navigation / button | 15 / 16 | 15 / 16 | 15 / 16 | 1 / 0 |

Use exact tokens/weights/measures in the profile. `ed-h2` is editorial display; `ed-h2-sm` is H1/feature; ordinary article headings retain their role. Replace conflicting declarations rather than universal `!important` floors. Marketing roles do not target protected estimator/admin/portal/input geometry.

Spacing uses the 4–128px scale, 20/32/48px gutters (16 below 360px), 1280px content maximum, 65ch copy measure, 64/80/96px standard sections and role-specific stacks. The 1180px navigation threshold does not redefine type tiers. Photography may bleed while text follows the grid. Split/matrix/panel/card primitives are optional; choose grids by real count, four-item balance and intentional incomplete rows.

Canonical buttons: 16px Manrope labels, 48px large/44px medium minimum heights, square neutral faces with teal leading detail, outline/text secondary hierarchy. Inputs ≥48px; touch targets ≥44×44px; choices ≥56px. Radius roles: 0px, 4px, full. Motion: 200/300ms with reduced-motion support. Shared unboxed Call/Text/Chat controls use one icon vocabulary and actual destinations; omit unavailable Chat routes.

## Superseded guidance

The previous document described an older editorial layer. These statements are superseded, not current Cabinet requirements:

- Sibling blue or another company’s palette as Cabinet identity.
- Universal dark-dominant pages, alternating dark/bone stripes or mandatory gradient closing bands. Cabinet keeps its warm image-led paper/bone composition.
- 58px uppercase buttons with 11px labels. Use current 16px roles/control tokens.
- 850ms reveals as the general rule. Use current motion/reduced-motion tokens.
- Historical 1380/1080/720 shells and 1100/820/560 queries replacing current shared tiers. Existing local declarations are implementation debt to reconcile, not new approved exceptions.
- Fixed transparent headers everywhere or universal first-section padding. Use canonical sticky chrome, actual measured clearance and task-specific layouts.
- Mandatory sticky introductions or automatic full-width odd grid leftovers. Sticky is optional; compose rows deliberately.
- Assertions that every estimator step already fits a viewport. Source configuration/historical samples do not establish current C10/D2, keyboard, 200% text or all-route passes.
- Instructions to copy entire `app/family.css` or `family-redesign.css` files across brands. Shared ownership is the canonical 17-file manifest; site-owned presentation remains scoped unless explicitly coordinated.

Historical material remains in [the approved handoff](approved-design-handoff.md), [older brand kit](brand/BRAND.md) and Git history. Newer explicit owner direction and [the current profile](brand-profile.md) resolve conflicts. No approval date or screenshot acceptance is invented.

## Ownership, preservation, and review

Family components/types, `styles/family-*.css` and their manifest are canonically owned by `boise-remodeling-co`; check `scripts/verify-family-chrome.mjs`. Cabinet facts/capabilities live in `lib/familyBrand.ts`. The estimator has separate protected ownership; no bypass or broad engine sync.

Preserve useful content, URLs/indexing/metadata/schema, contacts/geography/registration, safety/legal/pricing/scope qualifiers, catalog/planning behavior, consent, analytics, routing, uploads, saved state, PDFs and authentication. Generic design imagery needs no routine concept labels, but cannot become invented staff/customer/project evidence. Public surfaces omit private street addresses and administrative/status explanations. Correct private verification records stay with their owner.

Record implemented, tested, independently reviewed, approved, deployed and live-verified states separately. Build/rendered/interaction/independent gates remain in the existing ledger. Jared owns import/publication. Updating docs does not itself build, deploy or change UI.
