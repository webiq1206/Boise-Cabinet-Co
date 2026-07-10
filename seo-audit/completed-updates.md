# Completed Updates - Boise Cabinet Co SEO Audit

`IMPLEMENT_CHANGES = yes`. The following high-leverage, low-risk fixes were implemented in code, verified against a local dev render, typechecked (`tsc --noEmit` clean), and committed. Larger content/architecture changes are documented in `implementation-roadmap.md` for approval rather than applied blind. Data-dependent items (GBP, license, reviews, named team, real photos, SPF/DMARC) require your input and are flagged, not invented.

## Structured data - `lib/schema.ts`, `components/seo/HomePageSchema.tsx`

| Change | Before | After | Severity |
|---|---|---|---|
| Organization + LocalBusiness `logo` | absent | `ImageObject` -> `/images/brc-logo.png` (absolute) | **Critical** |
| Product `Offer` | `{availability:PreOrder, priceCurrency:USD, seller}` with **no price** (invalid on 382 products + finishes) | `Offer` removed (Product valid without it; custom/quote-only) | **Critical** |
| Entity linking | Organization (no `@id`) + LocalBusiness (`@id: baseUrl`), WebSite.publisher by name | Organization `@id: /#organization`, LocalBusiness `@id: /#localbusiness`, `WebSite.publisher` references `/#organization` | High |
| Geo vs locality | geo fell back to Kuna coords / homepage forced Boise coords while locality = Meridian | geo defaults to Meridian coords (43.6121, -116.3915); homepage passes no city | Medium |
| LocalBusiness subtype | `[LocalBusiness, FurnitureStore, HomeAndConstructionBusiness]` (FurnitureStore implies showroom) | `[LocalBusiness, HomeAndConstructionBusiness, GeneralContractor]` | Medium |
| `/construction` Service schema | absent (WebPage + Breadcrumb only) | added `generateServiceSchema("Custom Cabinet Construction & Installation", ...)` | Medium |

**Verified live (dev):** homepage JSON-LD now contains `logo` x2, `#localbusiness`, `#organization`; `FurnitureStore` absent; `GeneralContractor` present. Product page: `Product` present, `Offer`/`PreOrder` absent.

## Headings - `components/catalog/FinishExplorer.tsx`, `components/catalog/DoorStyleExplorer.tsx`

| Change | Before | After | Severity |
|---|---|---|---|
| Finish-detail H1 | finish name in `<h2>` (0 H1 on an indexable page) | `<h1>{name} Cabinet Finish</h1>` | High |
| Door-style-detail H1 + answer | only image alt + `<h2>` "Example products" (0 H1) | `<h1>{name} Door Style</h1>` + a description answer block | High |

**Verified live:** `<h1>Vanilla Orchid - Matte Cabinet Finish</h1>` and `<h1>Modern Shaker Door Style</h1>` render, exactly one H1 each.

## Metadata - `app/collections/[slug]/page.tsx`
- **Collection title double-"Cabinets" bug:** `${name} Cabinets` produced "Custom Cabinets Cabinets". Now strips a trailing "Cabinet(s)" before appending.

## Content hygiene
- **Blog above-the-fold duplication** (`shared/content/clusterArticleSections.ts`): removed the "About {title}" section that re-printed `excerpt` (already the subtitle) and `quickAnswer` (already the Quick Answer box) across all 56 posts. Body now opens with unique topic content. *(Depth expansion remains a roadmap item.)*
- **`"cabinetss"` typo** (`shared/content/wave1/costClusterPosts.ts`, `shared/content/contextualExpansions.ts`): fixed 3 occurrences.
- **Fake phone placeholder** (`components/consultation/ConsultationFields.tsx`): `(208) 555-0000` -> "Your phone number" (was leaking into raw HTML as a potential AI mis-extraction).

## Not changed (flagged for you - data-dependent)
- **Google Business Profile:** claim/verify, then set `NEXT_PUBLIC_GBP_URL` (flows into `sameAs`). Highest-impact local lever.
- **License number:** set `NEXT_PUBLIC_LICENSE_NUMBER` (Idaho RCE #) -> footer + trust copy populate automatically.
- **Reviews:** set `NEXT_PUBLIC_REVIEW_RATING`/`COUNT` from real GBP data **only** once dated, sourced reviews render on-page; wire the existing `generateReviewSchema` (do not emit aggregateRating without on-page reviews - policy risk).
- **Named team:** replace the 3 `TEAM` placeholders with real people + photos + credentials and set `isPlaceholder: false` to activate Person schema; add named authors to blog/guides.
- **Real project photography** on gallery/case-studies/finish "in-room"/room tiles (pending Drive folder).
- **DNS:** add an SPF record; move DMARC from `p=none` toward `p=quarantine`.

## Commit
`SEO audit fixes: schema, H1s, metadata, content hygiene` (bd8a66c6).
