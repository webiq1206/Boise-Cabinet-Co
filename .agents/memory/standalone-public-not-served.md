---
name: Standalone deploy does not serve public/ static files
description: In the autoscale standalone Next.js deploy, every public/ file 404'd; cause was the duplicate ~290MB public copy dropped during image assembly — fixed by symlinking instead of copying in build.sh.
---

In production (autoscale, `output: 'standalone'`) every file under `public/` returned 404 at its web URL (images, icons, manifest, apple-touch-icon, llms.txt), while app routes (robots/sitemap/pages) and `/_next/static/*` all served 200. It works under `next dev`, which masks the bug — so always verify the prod URL with curl, never assume `public/<file>` is reachable in prod from dev behavior alone.

**Root cause (best-supported, not 100% provable without a deploy):** `build.sh` copied `public/` into the standalone bundle, but `public/` is fully git-committed (~290MB) so the repo's own copy already ships — the `cp` added a *second* ~290MB copy. The small `.next/static` copy survived and served; the huge duplicate `public` copy did not reach/serve at runtime. Most consistent explanation: the large duplicate is dropped/truncated during deploy image assembly on the constrained build machine (build.sh's own comments flag image-size pressure).

**Ruled-out dead-ends (don't re-investigate):** stale-`public`-nesting from a prior deploy (a prior deploy's correctly-placed files would persist and keep serving); middleware shadowing (`middleware.ts` matcher is scoped only to `/portal` + `/admin`).

**Fix (build.sh only):** symlink instead of copy — `ln -sfn ../../public .next/standalone/public` (relative, so valid wherever the deploy runs). The standalone server chdir's to `.next/standalone` and serves `public/` from `./public`; Next's startup public scan and its static file server both follow symlinks, so serving is identical without a second copy. `.next/static` stays a copy (small, already works). Also `rm -rf .next/standalone` before `next build` to avoid stale traced node_modules (separate MODULE_NOT_FOUND startup risk).

**Why symlink is a safe bet:** it's >= the old copy in every plausible packaging scenario *here* (full-workspace filesystem snapshot ships the git-tracked target). Residual risk: a packager that ships only `.next/standalone` and excludes `../../public` would break the link — low for this environment but the one thing to re-check if prod still 404s after deploy.

**Verify only by deploying + curling** `/apple-touch-icon.png`, `/site.webmanifest`, a representative `/images/...webp`. A full prod `next build` can't be run locally — it OOMs (co-resident dev eats RAM). Earlier text-asset app-route workarounds (e.g. `/llms.txt`) are now redundant but harmless.
