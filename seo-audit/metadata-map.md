# Metadata Map - Boise Cabinet Co

Title/description/canonical status per template. Helpers: `lib/seo.ts`, `lib/page-metadata.ts` (`buildPageMetadata`, `buildCanonical`), `lib/catalog-metadata.ts` (`catalogMetadata`). Root template: `%s | Boise Cabinet Co` (`app/layout.tsx`).

Rules: title <=60 chars (incl. template suffix), description <=160 chars, unique per indexable page, self-canonical.

## Status by template

| Template | Title | Description | Canonical | Issue / Action |
|---|---|---|---|---|
| `/` | OK | OK | OK (no trailing slash) | Fix 108->299 in copy/stat |
| `/about` | OK | OK | OK | - |
| `/contact` | OK | OK | OK | - |
| `/testimonials` | OK | OK | OK | metadata `kind:'about'` -> review/collection kind |
| `/warranty` | OK | OK | OK | add to sitemap |
| `/cabinets`, `/cabinets/[room]` | OK | OK | OK | - |
| `/collections`, `/collections/[slug]` | OK | OK | OK | - |
| `/finishes`, `/finishes/[category]` | OK | OK | OK | - |
| `/finishes/[category]/[slug]` | Templated | Formulaic | OK | 6 duplicate-name titles; enrich or noindex |
| `/door-styles`, `/door-styles/[slug]` | OK | OK | OK | - |
| `/products` | OK | OK | OK | - |
| `/products/[category]` | MISSING | MISSING | MISSING | ADD generateMetadata + canonical |
| `/products/[category]/[slug]` | Duplicated (22 groups) | 9 shared strings | OK | NOINDEX; unique titles for any kept |
| `/catalog` | OK | OK | OK | add to sitemap |
| `/compare`, `/hardware`, `/accessories`, `/construction` | OK | OK | OK | - |
| `/guides`, `/guides/[slug]` | OK | OK | OK | - |
| `/blog`, `/blog/[slug]` | OK | OK | OK | - |
| `/blog/category/[hubSlug]` | OK | OK | OK | - |
| `/resources` | OK | OK | OK | - |
| `/finder` | OK | OK | MISSING | NOINDEX + canonical |
| `/dealer` | OK | OK | MISSING | NOINDEX + canonical |
| `/installer` | OK | OK | MISSING | NOINDEX + canonical |
| `/design-studio` | title/desc only | - | MISSING | NOINDEX |
| `/search` | MISSING (client) | MISSING | MISSING | NOINDEX |
| `/login` | MISSING (client) | MISSING | MISSING | NOINDEX |
| `/estimate` | OK | OK | OK | NOINDEX |
| `/privacy-policy`, `/terms-of-service` | OK | OK | Hardcoded | Use `buildCanonical` |

## Title pattern recommendations

- Room: `{Room} Cabinets in Boise & Treasure Valley` (commercial + local).
- Door style: `{Style} Cabinet Doors | Boise Cabinet Co`.
- Product category: `{Category} Cabinets | Sizes & Specs | Boise Cabinet Co`.
- Finish (indexable): `{Finish Name} {Category} Cabinet Finish | Boise Cabinet Co` (disambiguate collisions with undertone/family).
- Guide: question or topic + Boise/Treasure Valley.

## Description pattern recommendations

- Lead with unique value + local signal; include CTA + (real) phone.
- Avoid the city-service variant machinery in `lib/seo.ts` (`generateCityServiceTitle/Description`) which is vestigial from the remodeling site and unused by current routes; safe to leave but do not extend.

## OG / social

- Default OG: `/images/marketing/og-default.webp` (1792x1024) - OK; Twitter `summary_large_image` sitewide - OK.
- Ensure per-template OG mirrors title/description (handled by `buildPageMetadata`).
