# Template Audit: City + Service Permutations

Generator: `app/services/[slug]/[city]/page.tsx`
Covers 28 services x 6 cities = **168 routes**.

## Template-level checks
| Field | Generation | Status |
|---|---|---|
| Title | `generateCityServiceTitle(service, city)` returning e.g. "Lawn Mowing in Boise, ID" (capped at 60) | PASS |
| Description | `generateCityServiceDescription(service, city)` (<160) | PASS |
| Canonical | `${BASE_URL}/services/${slug}/${city}` (no trailing slash) | PASS |
| OG title / description / url | match metadata | PASS |
| Twitter card | summary_large_image (layout default) | PASS |
| H1 | "{Service} in {City}, ID" (single) | PASS |
| Schema: LocalBusiness | city-scoped (geo from CITY_SEO_DATA) | PASS |
| Schema: Service | city-scoped, includes price range | PASS |
| Schema: BreadcrumbList | Home > Services > {Service} > {City} | PASS |
| Schema: FAQPage | city + service FAQs | PASS |
| Schema: HowTo | when service.process is set | PASS |
| Schema: SpeakableSpecification | hero + FAQ | PASS |
| Internal links | sibling services in same city + same service in other cities + RelatedContent | PASS |
| Image alt | descriptive | PASS |

## Sampled URLs (matrix corners + center)
- `/services/lawn-mowing/kuna` HTTP 200 (canonical home city)
- `/services/lawn-mowing/boise` HTTP 200 (largest city)
- `/services/snow-removal/middleton` HTTP 200 (edge service + edge city)
- `/services/christmas-light-installation/eagle` HTTP 200 (seasonal)
- `/services/sprinkler-repair/meridian` HTTP 200
- `/services/sod-installation/star` HTTP 200

## Coverage note
The 168 permutations share the same template logic; field-level checks above apply identically to every URL. No per-route deviations were found via differential review of generated HTML across the 6 sampled URLs.

No defects in this template after the global LocalBusiness dedup fix.
