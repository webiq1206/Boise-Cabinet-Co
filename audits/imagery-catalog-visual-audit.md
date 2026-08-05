# Imagery, Catalog, Project-Gallery, and Visual-Quality Audit

Implementation record for the site-wide imagery, product-presentation, catalog,
project-gallery, and visual-quality review of boisecabinet.co.

Goal: the site should feel premium, clean, organized, design and product focused,
credible, local to Boise and the Treasure Valley, cohesive, and believable, with
no image or claim that is generic, misleading, or misrepresented.

---

## 1. Scope and environment constraints

The review covered the homepage, room/cabinet pages, product catalog, catalog
PDF, finish and door-style pages, builder page, location pages, guides, blog,
project galleries, and shared components.

Two hard constraints shaped what could be executed in this pass:

1. **No image-generation credentials in this environment.** New photography is
   produced by `scripts/generate-site-images.mjs` and the `catalog:images:*`
   scripts, which require `OPENAI_API_KEY`. That key is not present here, so
   images could not be regenerated in this pass. All work that required new
   pixels is documented below as a backlog the owner can run in one command
   once the key is set (see Section 6).
2. **The site is already mature and heavily tooled.** The brand system (dark
   charcoal + bone + teal + Montserrat + Libre Baskerville italic), the catalog
   SSOT, static WebP image variants, LQIP blur placeholders, alt-text tooling,
   and a fully branded downloadable catalog PDF already exist. The highest-value
   work was therefore **credibility and consistency correction**, not a rebuild.

This pass prioritized changes that improve credibility, accuracy, and brand
consistency **without fabricating imagery or project claims**.

---

## 2. Highest-priority finding: renderings presented as documented projects

The project gallery and case studies presented AI/design renderings as verified,
completed Boise Cabinet Co installations, with:

- Invented before/after comparison sliders built from `gallery-*-before.webp` and
  `gallery-*-after.webp` pairs that are not photographs of one real space.
- Invented cities, budgets ("Mid $20,000s installed"), and timelines ("9 weeks
  design to install") attached to those renderings.
- JSON-LD and the image sitemap describing them as "Before and after custom
  cabinet projects."

This violates the credibility standard: generated or inspiration imagery may be
used, but it must never be presented as documented completed work, and
before/after sliders must show the same real space.

### What was changed (this PR)

| Area | Before | After |
|------|--------|-------|
| `shared/galleryData.ts` | `GalleryProject` with `before/afterImageUrl`, invented city-as-completed-project | `DesignConcept` with a single completed-look `imageUrl`, `area` for local relevance only, explicit "not photographs of specific completed homes" doc + `DESIGN_CONCEPT_DISCLOSURE` |
| `components/sections/FeaturedProjectSection.tsx` (homepage) | Before/after slider, "Featured project", "Drag to reveal the transformation" | Single completed-look image, "Design concept" eyebrow + on-image label, visible disclosure caption |
| `components/sections/ProjectGallerySection.tsx` | "Our work", before/after slider cards, "Drag any slider to see before and after" | "Design inspiration" concept cards (single image + "Design concept" chip) and a visible disclosure line |
| `components/sections/CaseStudiesSection.tsx` | "Project case studies" implying documented builds | "Representative scenarios" eyebrow, disclosure that images are illustrative renderings, "Illustrative rendering" badge on each image |
| `shared/caseStudies.ts` | Alt text claiming installs ("installed in a Boise ranch home") | Alt text framed as "Design rendering of ..." |
| `app/testimonials/page.tsx` | ImageGallery JSON-LD as before/after projects; "recent cabinet work" | Design-concept JSON-LD (single image per concept, illustrative caption); "cabinet design concepts" copy |
| `app/image-sitemap.xml/route.ts` | "Before: ... project" / "After: ... installed by Boise Cabinet Co" | "Cabinet design concept: ... for Treasure Valley homes", driven by the concept data |

The `BeforeAfterSlider` component is retained in the codebase for future use with
**verified** same-space photography; it is simply no longer fed fabricated pairs.

### Follow-up for the owner (now automated)

Projects are authored once in a single source of truth and compiled into every
surface (gallery cards, homepage feature, case studies, testimonials JSON-LD,
image sitemap) with the credibility rules applied automatically. See Section 11.
You no longer hand-edit `GALLERY_PROJECTS` or `CASE_STUDIES`.

---

## 3. Finish and color disclaimers (was missing site-wide)

No finish/color accuracy disclaimer existed anywhere, despite 299 finishes being
presented as swatches. Screens, lighting, printing, and natural material
variation all change how a color reads.

Added a reusable `components/catalog/FinishDisclaimer.tsx` and placed it on:

- `/finishes`
- `/finishes/[category]` (matte, gloss, woodgrain)
- The downloadable catalog PDF (new "Before you finalize" section, see Section 5)

The disclaimer advises reviewing physical samples in-home before finalizing.

---

## 4. Catalog (online)

The online catalog is already brand-native: it uses the site typography, the
dark brand tokens, consistent cards, `CatalogImage` with blur placeholders, and
static WebP variants, and it is generated from a single catalog SSOT
(`shared/catalog`) that also drives the PDF, so names/categories/finishes stay in
sync. No supplier chrome or generic ecommerce styling was found in the rendered
catalog surfaces.

Retained as-is. Remaining catalog work is **image quality**, which is gated on
image generation (Section 6): some product cells still use SVG line drawings or
placeholder art rather than photographed cabinetry.

---

## 5. Catalog PDF (`public/downloads/boise-cabinet-catalog.pdf`)

Already strong: branded cover with logo + seal, Montserrat + Libre Baskerville
italic embedded fonts, table of contents, door styles, rooms, finishes by family
and full list, cabinets by category, hardware, accessories, generated directly
from the catalog SSOT, correct branded filename, per-page branded footer, and it
regenerates on every `prebuild` (`npm run catalog:pdf`).

### Gaps fixed (this PR)

The PDF had **no finish/material/availability disclaimers** and **no closing
contact/CTA back matter**. Added to `shared/catalog/catalogPdfContent.ts`:

- "Before you finalize" section: finish/color-variation disclaimer + availability,
  lead-time, pricing, built-to-order, and "planning reference, not a contract"
  language.
- "Plan your project with us" section: consultation CTA with phone, email, site
  URL, and the eight Treasure Valley cities.

The PDF was regenerated (427 images embedded, 0 missing, ~11.7 MB).

---

## 6. Image-regeneration backlog (requires `OPENAI_API_KEY`)

These items need new pixels and are intentionally **not** faked. Once the key is
set, they run from existing tooling:

```bash
export OPENAI_API_KEY=sk-...
npm run repopulate   # images:generate:all + catalog:images:generate + catalog:build
                     # (catalog:build also runs projects:build, so gallery/case
                     #  studies/schema/sitemap all recompile from the project SSOT)
```

Prioritized targets (page + purpose + why):

1. **Builder / contractor page** (`/builders`) - currently text-hero only. Needs
   trade-focused imagery: cabinet deliveries, organized staging, installation,
   plans/specs, jobsite coordination. Avoid generic handshakes and trucks. Team
   apparel must carry the approved seal naturally (black work shirts/hats).
2. **Location pages** - should feel area-specific (established Boise homes,
   suburban Meridian/Kuna, larger Eagle customs, Canyon County Nampa/Caldwell)
   without reusing one hero everywhere or importing non-local architecture.
3. **Room-category heroes and section imagery** - verify each room shows the
   cabinetry it describes (base/wall/tall, islands, drawers, corner storage,
   vanities/linen towers, laundry uppers+utility sink, mudroom lockers, office
   built-ins, closets, garage/utility, entertainment built-ins).
4. **Catalog product cells** still on line-drawings/placeholders - replace with
   consistent, accurately-labeled product photography (correct door style +
   finish), not full-room shots standing in for a single finish.
5. **Guides and blog featured images** - one unique, topic-specific image per
   piece; no broad kitchen photo where a specific detail (door profile, finish
   swatch, hardware, storage system) would communicate better.

All generated imagery must look like real professional photography, use
believable cabinet proportions/hardware/lighting, avoid AI artifacts, and must
never be labeled as a verified install, a real customer's home, or a documented
before/after.

---

## 7. Team, apparel, and seal standard (for any generated people imagery)

When people appear (installers, designers), follow: clean black work shirts /
neutral jackets / black hats, appropriate PPE, the approved seal applied
naturally to garments (follows folds, perspective, lighting), workers shown doing
real work from side/behind angles, no promotional poses or camera eye-contact,
organized-but-real jobsites. No pasted, distorted, or misspelled seals.

---

## 8. Design balance (charcoal usage)

The dark charcoal ground is the intentional brand identity, so wholesale removal
is out of scope and would break the brand. The homepage and inner pages already
alternate charcoal bands with `canvas`, `greige`, `surface`, and image split
sections. As real photography is added (Section 6), prefer routing it into the
existing image/copy split sections to keep visual rhythm rather than adding more
dark text bands.

---

## 9. Verification performed

- `npm run verify:images` - passed.
- `npx next build` - completed successfully (exit 0); `/`, `/testimonials`,
  `/finishes`, `/finishes/[category]`, and `/image-sitemap.xml` all prerender.
- `npm run catalog:pdf` - regenerated successfully (0 missing images).
- Em-dash scan on all changed user-facing files - clean.
- TypeScript: no new errors introduced by these changes (the repo's pre-existing
  `tsc` errors are unrelated files and the build runs with
  `typescript.ignoreBuildErrors`).

---

## 10. Change log (files touched)

- `shared/galleryData.ts` - concept model, single image, disclosure.
- `shared/caseStudies.ts` - rendering-framed alt text.
- `components/sections/FeaturedProjectSection.tsx` - single-image concept.
- `components/sections/ProjectGallerySection.tsx` - single-image concept cards + disclosure.
- `components/sections/CaseStudiesSection.tsx` - representative-scenario framing + illustrative badge.
- `components/catalog/FinishDisclaimer.tsx` - new reusable disclaimer.
- `app/finishes/page.tsx`, `app/finishes/[category]/page.tsx` - disclaimer placement.
- `app/testimonials/page.tsx` - honest gallery JSON-LD + copy.
- `app/image-sitemap.xml/route.ts` - honest concept titles.
- `shared/catalog/catalogPdfContent.ts` - PDF disclaimer + contact/CTA back matter.
- `public/downloads/boise-cabinet-catalog.pdf` - regenerated.
- `replit.md` - corrected stale "Boise Remodeling Co" brand overview (name, palette, fonts, services, service areas).
- `audits/imagery-catalog-visual-audit.md` - this record.

---

## 11. Automated project repopulation (gallery, feature, case studies)

Projects are now authored once and compiled into every surface, so repopulating
after new photography is a single command with the credibility rules enforced by
the build rather than by trust.

### Author a project in one place

- Central file: `data/projects.json` (a `projects` array), or
- Per-project folder: `public/images/projects/<slug>/project.json` plus images.
  Images can be named by convention (`after.*`, `before.*`, `detail-*.*`) and are
  auto-resolved, so a real project is "drop the folder, run one command."

Each project declares `kind`:

- `concept` - illustrative rendering. Renders as a single completed-look image
  with a "Design concept" label and the design-concept disclosure. A before/after
  slider is never shown, even if a `before` image is supplied.
- `verified` - a real, documented install. A before/after slider is emitted
  **only** when a real `before` image exists, `images.sameSpaceBeforeAfter` is
  `true`, and the before/after aspect ratios match within 6 percent. Otherwise
  the completed image shows alone. Set `verified` only for actual photos of that
  one property.

### Compile

```bash
npm run projects:build   # also runs inside catalog:build and prebuild
```

`scripts/projects/build-projects.mjs` validates every referenced image, applies
the rules above, and writes `shared/generated/projects.generated.ts` (committed).
Hard errors (missing image, duplicate slug, bad kind) fail the build; soft issues
(missing alt, aspect mismatch) warn and safely fall back. `shared/galleryData.ts`
and `shared/caseStudies.ts` derive from the generated data; the homepage feature,
gallery grid, case studies, testimonials JSON-LD, and image sitemap all update
automatically, and a before/after slider appears the moment a valid verified
project is added, with no component edits.

Verified end to end: adding a verified same-space project produced a
before/after slider automatically; removing it returned the site to the honest
six-concept, zero-slider state.

### New/changed files

- `data/projects.json` - project source of truth (seeded from the current concepts).
- `shared/projects/types.ts` - `SiteProject` model + credibility rules.
- `scripts/projects/build-projects.mjs` - validating compiler.
- `shared/generated/projects.generated.ts` - generated, committed output.
- `shared/galleryData.ts`, `shared/caseStudies.ts` - now derive from the generated data.
- `components/sections/FeaturedProjectSection.tsx`, `ProjectGallerySection.tsx`, `CaseStudiesSection.tsx` - render concept vs verified automatically.
- `app/testimonials/page.tsx`, `app/image-sitemap.xml/route.ts` - per-kind captions/titles.
- `package.json` - `projects:build`, `repopulate`, wired into `catalog:build` and `prebuild`.
