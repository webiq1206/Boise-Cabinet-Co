---
name: seo-geo-aeo-page-standards
description: Build-time SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) standards applied to every page at creation. ALWAYS use this skill whenever creating or editing any page, route, blog post, service page, location page, landing page, FAQ, or any component that renders user-facing content, even when SEO is not explicitly mentioned. It enforces metadata, JSON-LD schema, heading structure, answer blocks, entity and E-E-A-T signals, internal linking, conversion elements, Core Web Vitals, and accessibility. It detects local vs national intent and loads the matching ruleset. Do not ship a page without running its pre-publish checklist.
---

# SEO / GEO / AEO Page Standards

Every page must earn its place in search, in AI answer engines, and in the user's decision to convert. A page that is not built to these standards is unfinished. Apply this on creation so optimization is the default, not a later cleanup pass.

This skill is a creation standard, not an audit. The goal is that a page is born optimized.

## Step 0: Classify the page first

Before writing anything, decide the page's intent and type, because the extra rules differ:

- **Local intent**: the page targets a place or service area (city pages, service-area pages, "near me" demand, a business with a physical location or defined coverage area). Read `references/local-seo.md` and apply it on top of this core.
- **National / non-geo intent**: blog posts, product or feature pages, pillar and cluster content, comparison and resource pages, anything aimed at a topic rather than a place. Read `references/national-seo.md` and apply it on top of this core.

If a page is both (a service that also targets a region), apply the core plus both references, with local rules taking priority for the location-specific sections.

## Step 1: Challenge whether the page should exist

Do not create a page that duplicates another page's purpose. Before building, confirm the page has a distinct job and unique value a user could not get from an existing page. If it would only differ by a swapped keyword or city name, it is a doorway page and will hurt the whole domain. Either give it genuinely unique substance or fold the content into the page that already owns that intent.

## Universal standards (apply to every page)

### Metadata

- One unique title tag, roughly 50 to 60 characters, primary term front-loaded, brand appended, written to match intent and earn the click. No two pages share a title.
- One unique meta description, roughly 150 to 160 characters, leading with the benefit and ending with a reason to act. It is for click-through, not keyword stuffing.
- Self-referencing canonical on every page.
- Open Graph and Twitter card tags (title, description, image) so shares and AI previews render correctly.
- Match the framework: in Next.js use the Metadata API or `generateMetadata`; in WordPress set these through the SEO plugin or template, never leaving defaults.

### URL

Short, lowercase, hyphenated, carries the primary term, no stop-word bloat, and reflects the site's information architecture (the path should read like a breadcrumb). Avoid dates and IDs in evergreen URLs.

### Heading hierarchy

Exactly one H1 that states the page's topic and primary term. Logical H2 to H6 with no skipped levels. Phrase headings as real questions wherever natural, because question headings are what answer engines and voice search extract.

### Content quality and intent

- Match the dominant search intent (informational, commercial, transactional, or navigational) and deliver what that intent expects.
- Provide depth and original substance: first-hand experience, specifics, numbers, examples. Generic text that any competitor could publish has no ranking or citation value.
- Write for scannability: short paragraphs, descriptive subheads, lists where they aid comprehension.

### AEO: make answers extractable

Answer engines lift self-contained answers. On every page that could answer a question:

- Place a concise direct answer near the top, roughly 40 to 60 words, that resolves the page's core question in plain language before any preamble.
- Include a FAQ section with question-style headings and tight answers.
- Where relevant, add the patterns AI loves to cite: step-by-step instructions, definitions, comparisons, cost or pricing explanations, and "what to expect" sections.

### GEO: make the entity unmistakable

Generative engines cite sources they understand. State plainly, on the page and across the site, who the company is, what it does, who it serves, why it can be trusted, and what makes it different. Write facts as self-contained, quotable statements rather than burying them in marketing prose, so a model can extract and attribute them.

### Schema (JSON-LD)

Output valid JSON-LD that matches the visible content. Never claim in schema what is not on the page.

- Every page: `WebPage` and `BreadcrumbList`, plus `Organization` (or `LocalBusiness` for local pages).
- By type, add the matching schema: `Service`, `Article` or `BlogPosting`, `FAQPage`, `Product`, `Review` or `AggregateRating`, `HowTo`.
- Validate against schema.org and keep one source of truth so types do not conflict.

### Internal linking

Link contextually to the relevant pillar, cluster, and supporting pages with descriptive anchor text. No page ships orphaned. New content must be linked from related existing pages, and must link out to them, so authority flows and crawlers find it.

### E-E-A-T and trust

Show experience, expertise, authority, and trust on the page: author or company credentials where relevant, real proof, testimonials or reviews, accurate and sourced claims. Trust signals are both a ranking factor and a conversion factor.

### Conversion

A hero with a clear value proposition, a prominent CTA matched to the page's intent, low-friction forms, and visible social proof and trust signals. Optimization that drives traffic to a page that does not convert is wasted.

### Images and media

Descriptive file names, meaningful alt text, compression, correct dimensions, lazy loading below the fold, and modern formats (WebP or AVIF). No uncompressed hero images and no missing alt text.

### Performance and Core Web Vitals

Target 95+ on mobile and desktop where the stack allows. Protect LCP (prioritize the hero, preload critical assets), CLS (reserve space for images and embeds, no layout shift), and INP (defer non-critical JS). Never trade away UX or conversion to chase the score.

### Accessibility

Semantic HTML, sufficient color contrast, visible focus states, labeled controls, and full keyboard operability. Accessibility overlaps heavily with crawlability and is non-negotiable.

## Step 2: Pre-publish checklist

Do not consider a page done until every line is true:

- [ ] Page has a distinct purpose and unique value, not a near-duplicate or keyword-swap
- [ ] Unique title and meta description, correct length, intent-matched
- [ ] Clean keyword-bearing URL, self-referencing canonical, OG and Twitter tags
- [ ] One H1, logical heading order, question-style headings where natural
- [ ] Direct-answer block near the top plus a FAQ section
- [ ] Entity clarity present (who, what, who for, why trust, differentiation)
- [ ] Valid JSON-LD for the page type, matching visible content
- [ ] Contextual internal links in and out, descriptive anchors, no orphan
- [ ] E-E-A-T and trust signals present and accurate
- [ ] Clear hero, intent-matched CTA, social proof
- [ ] Images named, alt-texted, compressed, modern format, lazy-loaded
- [ ] Core Web Vitals protected (LCP, CLS, INP), targeting 95+
- [ ] Accessibility basics met
- [ ] Local or national reference rules applied per Step 0

## Notes by stack

- **Next.js**: metadata via the Metadata API or `generateMetadata`; JSON-LD via a `<script type="application/ld+json">` in the route; `sitemap.ts` and `robots.ts` kept current; `next/image` for the media rules above.
- **WordPress / Elementor**: set metadata and schema through the SEO plugin or template, override defaults explicitly, and confirm Elementor is not injecting duplicate H1s or bloated markup that breaks the heading and performance rules.
- **Other stacks**: the standards are framework-agnostic; implement each requirement with whatever the platform provides, and never accept platform defaults as "good enough."
