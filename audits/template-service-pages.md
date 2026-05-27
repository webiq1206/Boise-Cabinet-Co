# Template Audit: Service Pages

Generator: `app/services/[slug]/page.tsx` (plus 8 legacy back-compat files in `app/services/{lawn-care,landscaping,lawn-mowing,christmas-lights,fence-installation,irrigation-installation,patio-installation,pond-installation}/page.tsx`)

Covers 28 service slugs: lawn-mowing, aeration, fertilization, weed-control, dethatching, overseeding, lawn-edging, lawn-renovation, patio-installation, retaining-walls, fire-pit-installation, hedge-trimming, mulch-installation, sod-installation, spring-cleanup, fall-cleanup, snow-removal, christmas-light-installation, tree-trimming, tree-removal, stump-grinding, sprinkler-system-installation, sprinkler-repair, irrigation-repair, irrigation-maintenance, sprinkler-blowout, landscape-lighting (+ legacy fence-installation, pond-installation).

## Template-level checks
| Field | Generation | Status |
|---|---|---|
| Title | `generateSafePageTitle(service.name)`, capped to 60 chars | PASS |
| Description | `service.metaDescription` capped to 160 | PASS |
| Canonical | `${BASE_URL}/services/${slug}` | PASS |
| OG type / image / url | website, brand logo 1200x630, canonical url | PASS |
| Twitter card | summary_large_image (default from layout) | PASS |
| H1 | service.name | PASS |
| Schema: Service | generateServiceSchema(service) | PASS |
| Schema: BreadcrumbList | Home > Services > {service} | PASS |
| Schema: FAQPage | 6+ service FAQs each | PASS |
| Schema: LocalBusiness | generateLocalBusinessSchema() | PASS |
| Schema: HowTo | when service.process is set | PASS |
| Schema: SpeakableSpecification | hero + FAQ section | PASS |
| Internal links | RelatedContent component + nav/footer + city CTAs | PASS |
| Hero image alt | descriptive per service | PASS |
| Hero image lazy/eager | eager on hero, lazy below fold | PASS |

## Sampled URLs (spot-checked HTML head)
- `/services/lawn-mowing` HTTP 200, all schema blocks present
- `/services/snow-removal` HTTP 200
- `/services/christmas-light-installation` HTTP 200
- `/services/sprinkler-blowout` HTTP 200

## Defects found in this template
- HIGH defect #1 (duplicate LocalBusiness with root layout) - FIXED at the layout level; per-page emission remains correct.

No template-local defects remain.
