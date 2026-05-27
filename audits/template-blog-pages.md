# Template Audit: Blog Posts

Generator: `app/blog/[slug]/page.tsx`
Source: `shared/blogContent.ts` (92 posts).

## Template-level checks
| Field | Generation | Status |
|---|---|---|
| Title | post.title + " | Lawn Care Kuna" via template (<60) | PASS |
| Description | post.excerpt capped at 160 | PASS |
| Canonical | `${BASE_URL}/blog/${slug}` | PASS |
| OG type | article | PASS |
| OG image | post.image or brand fallback | PASS |
| Twitter card | summary_large_image | FIXED (was summary) |
| H1 | post.title (single) | PASS |
| Schema: Article | datePublished, author, image, headline | PASS |
| Schema: BreadcrumbList | Home > Blog > {post} | PASS |
| Internal links | RelatedContent + category links + nav | PASS |
| Image alt | from blog content | PASS |

## Sampled URLs
- `/blog` (index) HTTP 200
- `/blog/spring-lawn-care-checklist` HTTP 200
- `/blog/best-grass-for-kuna-idaho` HTTP 200 (if present)

## Logged follow-ups
- `dateModified === datePublished` for all posts (no edit tracking). Acceptable for evergreen content, but adding `updatedAt` would help fresh-content rankings.
