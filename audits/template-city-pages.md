# Template Audit: City / Area Pages

Generator: `app/areas/[slug]/page.tsx`
Covers 6 slugs: kuna, boise, meridian, eagle, star, middleton.

## Template-level checks
| Field | Generation | Status |
|---|---|---|
| Title | `${city} Lawn Care & Landscaping Services` | PASS (<60) |
| Description | city-specific description from CITY_SEO_DATA | PASS (<160) |
| Canonical | `${BASE_URL}/areas/${slug}` | PASS |
| OG | inherits + sets url/title/description | PASS |
| H1 | "Lawn Care in {City}, Idaho" | PASS |
| Schema: LocalBusiness | city-scoped with geo coords | PASS |
| Schema: BreadcrumbList | Home > Areas > {City} | PASS |
| Schema: Service | per service offered | PASS |
| Schema: FAQPage | 5+ city-specific FAQs | PASS |
| Schema: SpeakableSpecification | hero + FAQ | PASS |
| Internal links | links to every service in this city (168 internal) | PASS |
| Image alt | per city hero | PASS |

## Sampled URLs
- `/areas/kuna` HTTP 200
- `/areas/boise` HTTP 200
- `/areas/middleton` HTTP 200

No defects in this template after the global LocalBusiness dedup fix.
