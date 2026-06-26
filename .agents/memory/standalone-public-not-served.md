---
name: Standalone deploy does not serve public/ static files
description: In the autoscale standalone Next.js deploy, every static public/ file 404s; serve text assets via app routes instead.
---

In production (autoscale, `output: 'standalone'`), every static file under `public/` returns 404 at its web URL (llms.txt, site.webmanifest, apple-touch-icon, icons, verification txt), even though the build copies `public/` into the standalone bundle and prod is on the latest build. App routes, by contrast, serve fine in prod (robots.ts, sitemap.ts, page routes all 200).

**Why:** the standalone server in this Replit autoscale setup does not serve the `public/` dir at the web root (root cause not fully isolated; a full prod `next build` can't be run locally — it OOMs). App routes are the reliable path.

**How to apply:**
- Serve any text/config asset that must be fetchable in prod (e.g. `/llms.txt`) via an app route returning a `Response`, with content in a shared module. Don't rely on `public/<file>` being reachable over HTTP in prod — it works under `next dev`, which masks the bug, so always verify the prod URL with curl.
- Still-broken and out of scope: favicons/manifest/icons in `public/` 404 in prod; a universal fix means getting standalone to serve `public/` at root (untestable locally, risky).
- The `verify:no-em-dash` prebuild gate forbids only em-dash (— U+2014), not en-dash (– U+2013), so en-dashes in shared `.ts` content are fine.
