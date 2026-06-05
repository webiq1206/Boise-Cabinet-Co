# Page-by-Page Audit - Boise Cabinet Co

Per-template analysis: metadata, headings, content depth, intent, schema, and recommended action. Programmatic detail templates are covered in depth in `programmatic-seo-analysis.md` and `doorway-page-analysis.md`.

Action key: KEEP / IMPROVE / REWRITE / MERGE / REDIRECT / REMOVE / NOINDEX

---

## Homepage - `app/page.tsx`

- Intent: navigational + commercial. H1 (single): "Idaho's premier cabinet company." Hierarchy sound.
- Sections: Hero, Room grid, Design Studio, Photo band, Process, Featured project, Testimonials (3), Why choose us, FAQ (12), Estimator, Consult form.
- Schema: Organization, LocalBusiness (no aggregateRating), WebSite, FAQPage, Speakable (no DOM target).
- Gaps: hero CTA = Design Studio/collections (not consult); 108-finish stat conflicts with 299; no review proof; Speakable target missing; ships estimator JS.
- Action: IMPROVE (hero CTA, speakable target, finish count, review proof, lazy estimator).

## About - `app/about/page.tsx`

- Intent: informational/trust. H1 + section H2s + 6 principle H3s. Schema: Organization, WebPage, Breadcrumb.
- Gaps: no named team/founder, no license #/bond/carrier, no certifications with issuers, secondary CTA = collections (not estimate), `yearlyServicesCompleted: 0`.
- Action: IMPROVE (add bios + credentials scaffold + local proof).

## Contact - `app/contact/page.tsx`

- Strongest NAP on site (full address, hours, maps link, LocalBusiness schema, speakable summary).
- Gaps: no map embed, no showroom/team photo, not in primary nav.
- Action: KEEP + minor IMPROVE (nav link, map embed optional).

## Testimonials - `app/testimonials/page.tsx`

- 6 gallery projects + 4 testimonials (initials only, no dates/source). ImageGallery schema only.
- Gaps: no Review/aggregateRating schema (generator exists, unused); reads as marketing samples; metadata `kind: 'about'`.
- Action: IMPROVE (Review schema guarded by real data, add dates/source, review-platform links).

## Warranty - `app/warranty/page.tsx`

- Substantive policy content; good trust value. Indexable but MISSING from sitemap.
- Action: KEEP + add to sitemap.

## Resources - `app/resources/page.tsx`

- Real downloadable PDFs + visual guides; in sitemap.
- Gaps: stale guide-slug links in PDF content; no author byline.
- Action: KEEP + fix links.

---

## Catalog hubs (KEEP - legitimate filter/navigation hubs)

| Route | Schema | Action |
|---|---|---|
| `/cabinets` | WebPage + Breadcrumb | KEEP |
| `/cabinets/[room]` (13) | WebPage + Breadcrumb | IMPROVE (link cabinet grid to product pages; weave local) |
| `/collections` | WebPage + Breadcrumb | KEEP |
| `/collections/[slug]` (1) | WebPage + Breadcrumb | IMPROVE (add FAQPage schema; visible FAQ exists) |
| `/finishes` | WebPage + Breadcrumb | KEEP |
| `/finishes/[category]` (3) | WebPage + Breadcrumb | IMPROVE (enable detail links; richer copy) |
| `/door-styles` + `/door-styles/[slug]` (6) | WebPage + Breadcrumb | KEEP/IMPROVE |
| `/products` | none | IMPROVE (add WebPage schema) |
| `/products/[category]` (9) | NONE + no metadata | REWRITE (add metadata + CollectionPage schema + intro copy) |
| `/catalog` | WebPage + Breadcrumb | KEEP + add to sitemap |
| `/compare` | WebPage + Breadcrumb | KEEP (high-utility) |
| `/hardware` | WebPage + Breadcrumb | KEEP |
| `/accessories` | WebPage + Breadcrumb | KEEP |
| `/construction` | WebPage + Breadcrumb | KEEP |

## Programmatic detail pages (see doorway-page-analysis.md)

| Route | Count | Action |
|---|---|---|
| `/finishes/[category]/[slug]` | 299 | IMPROVE indexable subset + NOINDEX low-value variants; enrich + schema; fix 6 title collisions |
| `/products/[category]/[slug]` | 320 | NOINDEX,follow + self-canonical; remove from sitemap; enrich for users |

## Content pages

| Route | Schema | Action |
|---|---|---|
| `/guides` | WebPage + Breadcrumb | KEEP |
| `/guides/[slug]` (10) | Article, FAQ, Breadcrumb, Speakable | IMPROVE (deepen 7 thin pillars or position as indexes; fix breadcrumb for local-guides) |
| `/blog` | WebPage + Breadcrumb | KEEP |
| `/blog/[slug]` (56) | Article, FAQ, Breadcrumb, Speakable | IMPROVE (hub-tier breadcrumb; unique per-cluster FAQs; deepen ~133-word factory clusters) |
| `/blog/category/[hubSlug]` | CollectionPage + Breadcrumb | KEEP (conditional noindex when <3 posts) |

## Tools / utilities / B2B (NOINDEX)

| Route | Current | Action |
|---|---|---|
| `/design-studio` | indexable + in sitemap | NOINDEX + remove from sitemap |
| `/estimate` | indexable, canonical, not in sitemap | NOINDEX (keep canonical) |
| `/finder` | indexable, no canonical | NOINDEX |
| `/search` | indexable + in sitemap | NOINDEX + remove from sitemap |
| `/login` | indexable | NOINDEX |
| `/dealer` | indexable, thin B2B duplicate | NOINDEX |
| `/installer` | indexable, thin B2B duplicate | NOINDEX |

## Legal

| Route | Action |
|---|---|
| `/privacy-policy` | KEEP (replace hardcoded canonical with helper) |
| `/terms-of-service` | KEEP (replace hardcoded canonical with helper) |
