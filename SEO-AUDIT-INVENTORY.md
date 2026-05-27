# SEO Audit Inventory - Lawn Care Kuna

294 indexable routes audited at the **template/group level** (individual per-page `audits/<slug>.md` were skipped: the four templates (home, service, city-service, area, blog) generate 99% of routes deterministically from the same generators, so per-route audits would duplicate the template audit. See SEO-AUDIT-LOG.md for findings.

## Group A - Root / Site-wide
| Route | File | Notes |
|---|---|---|
| Layout | `app/layout.tsx` | Title template, root OG, GA4, JSON-LD root, manifest, viewport |
| `/sitemap.xml` | `app/sitemap.ts` | Generates all 294 URLs |
| `/robots.txt` | `app/robots.ts` | Disallows /api, /admin, /subcontractor |
| `/404` | `app/not-found.tsx` | Custom; needs metadata + noindex |
| `/llms.txt` | `public/llms.txt` | Static, AI crawler manifest |
| `/site.webmanifest` | `public/site.webmanifest` | PWA manifest |

## Group B - Homepage (1 route)
| Route | File | Schema | Status |
|---|---|---|---|
| `/` | `app/page.tsx` | LocalBusiness, Organization, FAQPage, Speakable | metadata + canonical |

## Group C - Service Pages (28 routes, 1 template)
Template: `app/services/[slug]/page.tsx`
Schema emitted: Service, BreadcrumbList, FAQPage, LocalBusiness, HowTo, SpeakableSpecification
Generates: lawn-mowing, aeration, fertilization, weed-control, dethatching, overseeding, lawn-edging, lawn-renovation, patio-installation, retaining-walls, fire-pit-installation, hedge-trimming, mulch-installation, sod-installation, spring-cleanup, fall-cleanup, snow-removal, christmas-light-installation, tree-trimming, tree-removal, stump-grinding, sprinkler-system-installation, sprinkler-repair, irrigation-repair, irrigation-maintenance, sprinkler-blowout, landscape-lighting + legacy redirects

Legacy individual service files (also auto-included for back-compat):
- `app/services/christmas-lights/page.tsx`
- `app/services/fence-installation/page.tsx`
- `app/services/irrigation-installation/page.tsx`
- `app/services/landscaping/page.tsx`
- `app/services/lawn-care/page.tsx`
- `app/services/lawn-mowing/page.tsx`
- `app/services/patio-installation/page.tsx`
- `app/services/pond-installation/page.tsx`

## Group D - City-Service Pages (168 routes, 1 template)
Template: `app/services/[slug]/[city]/page.tsx`
Schema emitted: LocalBusiness (city-scoped), Service (city-scoped), BreadcrumbList, FAQPage, HowTo, SpeakableSpecification
Generates: 28 services × 6 cities

## Group E - Area Pages (6 routes, 1 template)
Template: `app/areas/[slug]/page.tsx`
Cities: kuna, boise, meridian, eagle, star, middleton

## Group F - Blog (1 index + 92 posts)
- `app/blog/page.tsx` (index) - WebPage, BreadcrumbList
- `app/blog/[slug]/page.tsx` (template) - Article, BreadcrumbList

## Group G - Static Utility (12 routes)
| Route | File | Has metadata | JSON-LD |
|---|---|---|---|
| `/about` | `app/about/page.tsx` | yes | none |
| `/contact` | `app/contact/page.tsx` | yes | none |
| `/faq` | `app/faq/page.tsx` | yes | none |
| `/get-quote` | `app/get-quote/page.tsx` | yes | none |
| `/pricing` | `app/pricing/layout.tsx` | yes (layout) | none |
| `/services` | `app/services/page.tsx` | yes | WebPage, BreadcrumbList (added) |
| `/seasonal-guide` | `app/seasonal-guide/page.tsx` | yes | none |
| `/commercial` | `app/commercial/page.tsx` | yes | none |
| `/commercial/hoa-services` | `app/commercial/hoa-services/page.tsx` | yes | none |
| `/commercial/municipal-services` | `app/commercial/municipal-services/page.tsx` | yes | none |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | yes | none |
| `/terms-of-service` | `app/terms-of-service/page.tsx` | yes | none |

## Group H - Noindex Surface (excluded from sitemap)
- `app/admin/page.tsx`, `app/admin/dashboard/page.tsx` (+ added `app/admin/layout.tsx` with noindex)
- `app/subcontractor/page.tsx`, `/portal/page.tsx`, `/purchases/page.tsx` (+ added `app/subcontractor/layout.tsx`)
- `app/quote/edit/page.tsx` (+ added `app/quote/layout.tsx`)
- `app/quote-status/page.tsx` (+ updated `app/quote-status/layout.tsx` noindex)

## Field-by-field per-template summary
For each page template, the following SEO surface was audited:
1. `<title>` (≤60 chars target via `generateSafePageTitle` / `generateCityServiceTitle`)
2. meta description (≤160 chars)
3. canonical URL (`alternates.canonical`)
4. OG title / description / image / type / url
5. Twitter card type
6. H1 (single, keyword-rich, city/service)
7. JSON-LD blocks rendered
8. Internal links (via `RelatedContent` + nav/footer + hard-coded CTAs)
9. Robots directive
10. Image alt text (icons use `aria-hidden`, content images checked)

Defects discovered are recorded in SEO-AUDIT-LOG.md.
