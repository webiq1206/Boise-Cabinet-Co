# Automated Internal Linking

Internal links across the site are generated at build time from the live content
files. There is no hand-maintained mapping of slugs to related posts or
services. Edit the source data, rerun the generator, and the manifest updates.

## Sources

The generator reads:

- `shared/blogContent.ts` - every blog post (title, excerpt, category, tags)
- `shared/contentData.ts` - `PRIORITY_SERVICES` and `CITIES`

It produces every page in scope: blog posts, service pages, city (area) pages,
and the full city-service permutation set.

## Output

`data/internal-links.json` is the single manifest the site reads at render
time. It is committed to the repo so production builds are deterministic and do
not require running the generator twice.

Shape:

```
{
  "generatedAt": null,
  "counts": { "blog": 92, "service": 28, "city": 6, "cityService": 168 },
  "pages": {
    "/blog/my-post": {
      "type": "blog",
      "title": "My Post",
      "anchor": "My Post",
      "url": "/blog/my-post",
      "links": [
        { "url": "/services/aeration", "anchor": "Aeration", "title": "Aeration in Kuna & Boise, Idaho", "type": "service", "score": 0.812 }
      ]
    }
  },
  "incoming": { "/services/aeration": 17 },
  "blogByCategory": { "Lawn Care": [{ "slug": "...", "title": "...", "publishedAt": "..." }] }
}
```

## Scoring

For each ordered pair (`from`, `to`) we compute:

1. Jaccard similarity of tokenized text (title plus tags plus short
   description plus category, lowercased, stopwords removed).
2. Bonuses:
   - Same category: `+0.30`
   - Shared service slug (across service and city-service pages): `+0.50`
   - Shared city slug (across city and city-service pages): `+0.30`
   - Each shared tag: `+0.10`
   - Target is a service page: `+0.15` (uniform boost across all 28 services)

The generator stores a larger candidate pool per page in the manifest so the
audit can verify the >=5 incoming floor for every page:

- Blog pages: up to 6 candidates
- Service, city, and city-service pages: up to 8 candidates

The render component then trims to:

- Blog pages: 3 links
- Service, city, and city-service pages: 5 links

After the initial pass, a floor-enforcement step guarantees every page has at
least 5 incoming links by promoting each weakly-linked target onto its best
margin candidate's manifest, displacing only the weakest non-override link.

The manifest is deterministic: identical inputs always produce byte-identical
output, so committed manifest changes always reflect a real content change.

## Anchor text

The anchor for an outgoing link is the target page's `anchor` field:

- Blog: the post title
- Service: the service name (`Aeration`, not the full `Aeration in Kuna & Boise, Idaho`)
- City: `Lawn Care in <City>`
- City-service: `<Service> in <City>`

Per-page overrides are supported in two ways:

- **Content-level**: add a `relatedLinks: [{ url, anchor? }]` array to any
  blog post in `shared/blogContent.ts` or any service in `shared/contentData.ts`.
  The generator places those first in the manifest and the render component
  prepends them to the displayed list.
- **Render-level**: pass an `overrides` prop to `<RelatedContent>` for a one-off
  page that needs ad-hoc link text.

The component never renders generic anchors such as `click here` or `this article`.

## Running

```
# Regenerate the manifest
npm run links:generate

# Run the audit
npm run audit:links
```

Both run automatically as part of `npm run build` via the `prebuild` hook:

1. `links:generate` writes the manifest
2. `audit:links` prints orphans, weak pages, and broken links

The audit is warn-only by design. It never fails the build.

## Audit report

The audit reports five classes of signal:

- **Canonical coverage** - every route built from `blogContent.ts`,
  `contentData.ts`, and the city-service permutation set is present in the
  manifest. Missing or stale routes are listed.
- **Orphans** - pages with 0 incoming internal links from the manifest.
- **Weak** - pages with fewer than 5 incoming internal links (the system's hard floor).
- **Broken** - links whose target URL is not in the manifest.
- **Service equity** - any service page whose incoming count is below the
  site-wide average. The generator boosts all 28 services uniformly so the
  expected output is "OK all 28 service pages meet or exceed average".

Treat orphans, broken links, and service-equity warnings as something to fix
in the next content pass. Weak pages are informational only.

## Adding new content

1. Add the blog post, service, or city to its source file.
2. Run `npm run links:generate` (or just `npm run build`).
3. Commit the regenerated `data/internal-links.json`.

The footer's "From the blog" column also reads `blogByCategory` from the same
manifest, so new posts will surface there automatically.
