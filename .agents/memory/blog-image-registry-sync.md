---
name: Blog image registry generator sync
description: Why the blog image registry generator can pass while verify-blog-images fails the deploy; how GUIDE_PAGES coverage and hero uniqueness must line up.
---

# Blog image registry generator sync

`scripts/generate-blog-image-registry.mjs` is the single source of truth for `shared/blogImageRegistry.ts`. The prebuild regenerates the committed file every deploy (`images:blog`), so fix the generator's `ENTRIES`/`HUB_HEROES`, never hand-edit the committed registry.

**Coverage rule:** the generator must emit an entry for every slug in `BLOG_POSTS` AND every slug in `GUIDE_PAGES`. `GUIDE_PAGES` (shared/guideContent.ts) is composed at runtime, not just the 3 literal objects in the file — it is `[...3 literals, ...CITY_CABINET_GUIDES, ...ALL_HUB_PILLARS]` = 17 guides. So adding city/hub guides elsewhere silently breaks the generator unless its `ENTRIES` (and `EXPECTED_GUIDES`) are updated too.

**Why the generator's own checks aren't enough:** the generator's internal duplicate-hero/duplicate-blog checks only scan its own `ENTRIES`. `verify-blog-images.ts` is stricter — it cross-checks `BLOG_POSTS` + `GUIDE_PAGES` coverage and rejects any duplicate hero path. A generator run can succeed while `verify:images` fails (missing-guide entries, or a hero reused across two slugs).

**Diagnosis trap:** the prebuild gate `verify:images` runs `verify-site-images.ts`, which spawns `verify-blog-images.ts` with stdio:pipe and only echoes the child's STDOUT. The blog verifier prints its actual errors to STDERR, so the real reason is hidden in build logs. To see it, run `npx tsx scripts/verify-blog-images.ts` directly.

**How to apply:** when adding any guide/blog page or changing imagery, update the generator's `ENTRIES` + expected counts, give each hero a unique existing file path (area/cat/gal/etc.), then run `node scripts/generate-blog-image-registry.mjs && node scripts/setup-blog-images.mjs && npx tsx scripts/verify-blog-images.ts` to confirm green before publishing.
