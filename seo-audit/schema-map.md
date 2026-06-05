# Schema Map - Boise Cabinet Co

JSON-LD generators in `lib/schema.ts`. Emitted via per-page `<JsonLd>` / schema components.

## Generators available

| Generator | Type | Used by |
|---|---|---|
| `generateLocalBusinessSchema` | LocalBusiness + FurnitureStore | home, about, contact |
| `generateOrganizationSchema` | Organization | home, about |
| `generateWebSiteSchema` | WebSite | home |
| `generateServiceSchema` | Service | (available) |
| `generateBreadcrumbSchema` | BreadcrumbList | most templates |
| `generateFAQSchema` | FAQPage | home, guides, blog |
| `generateArticleSchema` | Article | guides, blog |
| `generateReviewSchema` | Review/AggregateRating | UNUSED |
| `generateCollectionPageSchema` | CollectionPage | blog category hubs |
| `generateProductSchema` | Product | product SKU pages |
| `generateWebPageSchema` | WebPage | catalog hubs, about, services index |
| `generateSpeakableSchema` | Speakable | home, guides, blog |
| `generateImageGallerySchema` | ImageGallery | testimonials |

## Coverage matrix

| Page | LocalBusiness | Org | WebSite | WebPage | Breadcrumb | FAQ | Article | Product | Collection | Review | Speakable |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | yes | yes | yes | - | - | yes | - | - | - | NO | yes (no target) |
| `/about` | yes | yes | - | yes | yes | - | - | - | - | NO | hidden |
| `/contact` | yes | - | - | - | - | - | - | - | - | - | hidden |
| `/testimonials` | - | - | - | - | - | - | - | - | - | NO (ImageGallery only) | - |
| `/cabinets/[room]` | - | - | - | yes | yes | NO | - | - | - | - | - |
| `/collections/[slug]` | - | - | - | yes | yes | NO (visible FAQ exists) | - | - | - | - | - |
| `/finishes/[category]/[slug]` | - | - | - | NO | NO | NO | - | NO | - | - | - |
| `/door-styles/[slug]` | - | - | - | yes | yes | NO | - | - | - | - | - |
| `/products/[category]` | - | - | - | NO | NO | - | - | - | NO | - | - |
| `/products/[category]/[slug]` | - | - | - | - | yes | - | - | yes | - | - | - |
| `/guides/[slug]` | - | - | - | - | yes | yes | yes | - | - | - | yes |
| `/blog/[slug]` | - | - | - | - | yes | yes | yes | - | - | - | yes |
| `/blog/category/[hub]` | - | - | - | - | yes | - | - | - | yes | - | - |

## Defects

1. CRITICAL: `hasOfferCatalog` (`generateLocalBusinessSchema` L75-86) emits offer URLs `/services/{kitchen-remodel,...}` which have no route (legacy redirects). Fix to `/cabinets/*`.
2. HIGH: No `aggregateRating` (reviewCount 0). Wire once real data exists; conditional already present.
3. HIGH: Testimonials page has no `Review`/`AggregateRating` despite generator + visible reviews.
4. MEDIUM: Collection page renders visible FAQ accordion but emits no `FAQPage`.
5. MEDIUM: `/products/[category]` emits no schema (and no metadata).
6. MEDIUM: Finish detail pages emit no schema at all.
7. MEDIUM: Homepage Speakable references `[data-speakable='summary']` but homepage has no such element.
8. LOW: Blog breadcrumbs lack hub tier (Home > Blog > Post); add Home > Blog > {Hub} > Post.

## Target end-state additions

- `FAQPage` on collection pages and (where valuable) room/category pages.
- `Product` + (optional) color/`ProductGroup` on indexable finishes; `CollectionPage` on product/finish category pages.
- `Review` + `AggregateRating` on testimonials + LocalBusiness (real data, env/flagged).
- `Person` entities for team (Organization.founder/employee + Article.author).
- `Service` schema (correct URLs) for design/build/install offerings.
- Speakable DOM target on homepage.

## Validation checklist (post-implementation)

- Rich Results Test: LocalBusiness, FAQPage, Article, Product, BreadcrumbList eligibility.
- No offer URLs returning 3xx/4xx in OfferCatalog.
- One LocalBusiness `@id` sitewide (no duplicate/conflicting bodies).
- AggregateRating only when reviewCount > 0.
