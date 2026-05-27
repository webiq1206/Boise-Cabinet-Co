# Per-Page SEO Audit Reports

Lawn Care Kuna has 294 indexable routes, ~99% of which are produced by 5 deterministic Next.js templates. Auditing every URL individually would generate identical reports per template. Instead this directory contains:

1. **One template-level report** per generator covering the full set produced by that template, with a representative sampled URL for each.
2. **One per-page report** for each of the 14 unique static utility pages whose markup is hand-written.
3. **One report** for site-wide infrastructure (layout, sitemap, robots, manifest, 404).

| File | Covers | Route count |
|---|---|---|
| `_site-wide.md` | layout, robots.txt, sitemap.xml, /404, /llms.txt, /site.webmanifest | infra |
| `homepage.md` | `/` | 1 |
| `template-service-pages.md` | `app/services/[slug]/page.tsx` | 28 |
| `template-city-pages.md` | `app/areas/[slug]/page.tsx` | 6 |
| `template-city-service-pages.md` | `app/services/[slug]/[city]/page.tsx` | 168 |
| `template-blog-pages.md` | `app/blog/[slug]/page.tsx` | 92 |
| `services-index.md` | `/services` | 1 |
| `blog-index.md` | `/blog` | 1 |
| `static-pages.md` | about, contact, faq, get-quote, pricing, seasonal-guide, commercial (+2), privacy-policy, terms-of-service | 11 |
| `noindex-surface.md` | /admin, /subcontractor, /quote/edit, /quote-status | 7 |
| **Total covered** | | 315 audited surface areas |

Defects discovered during the audit are recorded in the top-level `SEO-AUDIT-LOG.md` and reflected in each per-template report below.
