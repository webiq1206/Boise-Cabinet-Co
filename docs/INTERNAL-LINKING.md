# Automated Internal Linking

Internal links across the site are generated at build time from the live content
files. There is no hand-maintained mapping of slugs to related posts or
services. Edit the source data, rerun the generator, and the manifest updates.

## Sources

The generator reads:

- `shared/blogContent.ts` — every blog post (title, excerpt, category, tags)
- `shared/contentData.ts` — `PRIORITY_SERVICES` and `CITIES`

It produces every page in scope: blog posts, service pages, city (area) pages,
and the full city-service permutation set.

## Output

`data/internal-links.json` is the single manifest the site reads at render
time. It is committed to the repo so production builds are deterministic and do
not require running the generator twice.

Shape:

```
{
  "generatedAt": "...",
  "counts": { "blog": 93, "service": 28, "city": 6, "cityService": 168 },
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

The top N candidates per page are kept:

- Blog pages: 3
- Service, city, and city-service pages: 5

## Anchor text

The anchor for an outgoing link is the target page's `anchor` field:

- Blog: the post title
- Service: the service name (`Aeration`, not the full `Aeration in Kuna & Boise, Idaho`)
- City: `Lawn Care in <City>`
- City-service: `<Service> in <City>`

Per-page anchor overrides can be passed to `RelatedContent` via the
`overrides` prop when a specific page needs custom link text. The component
never renders generic anchors such as `click here` or `this article`.

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

The audit reports three classes of issues:

- **Orphans** — pages with 0 incoming internal links from the manifest.
- **Weak** — pages with fewer than 3 incoming internal links.
- **Broken** — links whose target URL is not in the manifest.

Treat orphans and broken links as something to fix in the next content pass.
Weak pages are informational only.

## Adding new content

1. Add the blog post, service, or city to its source file.
2. Run `npm run links:generate` (or just `npm run build`).
3. Commit the regenerated `data/internal-links.json`.

The footer's "From the blog" column also reads `blogByCategory` from the same
manifest, so new posts will surface there automatically.
