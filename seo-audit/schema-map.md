# Schema Map - Boise Cabinet Co

Validated against source (`lib/schema.ts`) + parsed live JSON-LD on 8 URLs. All templates emit **valid JSON**. **[FIXED]** = applied this pass.

| Template | Types | Status |
|---|---|---|
| Home | Organization, LocalBusiness, WebSite, FAQPage, Speakable | valid; **logo added [FIXED]**, **entity `@id` linked [FIXED]**, **FurnitureStore dropped [FIXED]**, geo->Meridian **[FIXED]** |
| `/cabinets/[room]` | WebPage, BreadcrumbList, Service, FAQPage | valid, complete |
| `/construction` | WebPage, BreadcrumbList, **Service [FIXED]** | Service was missing |
| Product `/products/[c]/[s]` | Product, BreadcrumbList | **priceless Offer removed [FIXED]** |
| Finish detail | BreadcrumbList, Product, FAQPage | Product on a color (weak); priceless Offer removed [FIXED] |
| Blog / Guide | Article, BreadcrumbList, FAQPage, Speakable | valid; **author = Organization (should be a named Person)** [DATA] |
| Testimonials | ImageGallery, LocalBusiness | no Review nodes (dead `generateReviewSchema`) |
| Static (about/contact/warranty) | WebPage + BreadcrumbList (+ Org/LocalBusiness) | valid; breadcrumbs everywhere |

## Fixed this pass
- **Organization + LocalBusiness `logo`** (ImageObject, absolute) - was the single biggest schema gap.
- **Product `Offer` removed** - a priceless Offer is invalid for Product rich results (was on 382 + finishes).
- **Entity `@id`** - Organization `/#organization`, LocalBusiness `/#localbusiness`, `WebSite.publisher` by `@id` -> one linked graph (was two competing nodes).
- **Geo/locality aligned** to Meridian (was Kuna fallback / Boise on home vs Meridian locality).
- **Subtype** -> `HomeAndConstructionBusiness` + `GeneralContractor` (dropped FurnitureStore -> no showroom).
- **Service schema on `/construction`.**

## Still open
- **[DATA]** aggregateRating/Review - keep omitted until real dated, sourced reviews render on-page (self-serving LocalBusiness rating = manual-action risk). Wire `generateReviewSchema` when data exists.
- **[DATA]** Article author -> named `Person` with credentials.
- **[DATA]** `sameAs` currently only FB+IG; add verified GBP/Houzz/Yelp/BBB (confirm FB/IG handles resolve).
- **[LOW]** optional `SearchAction` on WebSite (requires making `/search` crawlable); remove dead `lib/landing-schema.ts`.
