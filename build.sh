#!/bin/bash
set -e
npm install
# NOTE: the deploy build must never run `db:push` (or any schema mutation).
# Replit's Publish flow diffs the dev database against production and applies
# the schema changes itself, asking the user to confirm anything destructive.
# A db:push here targets the production DATABASE_URL and hangs the whole
# deploy whenever drizzle-kit raises its interactive data-loss prompt.
# Remove any previous standalone tree so each deploy assembles a clean one. The
# Replit workspace persists across deploys, so a stale standalone (including its
# traced node_modules) can survive on disk and leave a missing dependency that
# crashes the server with MODULE_NOT_FOUND at startup. (.next/cache is kept for
# fast incremental builds; it is pruned at the end of this script.)
rm -rf .next/standalone
npm run build

# The standalone server (server.js) chdir's to .next/standalone and serves
# /_next/static from ./.next/static and public/ assets from ./public. `next build`
# creates neither, so we provide both here.
#
# _next/static is small — copy it.
rm -rf .next/standalone/.next/static
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
#
# public/ is large (~290 MB) and is committed to git, so the repo's own public/
# always ships with the deployment. Duplicating it into the standalone bundle
# doubles that payload in the deploy image; previously every public/ asset 404'd
# in production (while the small _next/static copy served fine) — consistent with
# the large duplicate copy being dropped during image assembly. Symlink instead:
# Next's startup public-folder scan (recursiveReadDir) and serveStatic (send with
# an absolute path, no root) both follow symlinks, so this serves identically
# without shipping a second 290 MB copy. The link is relative (../../public,
# resolved from .next/standalone) so it stays valid wherever the deploy runs.
rm -rf .next/standalone/public
ln -sfn ../../public .next/standalone/public
# Submit sitemap URLs to IndexNow for search engine indexing.
if command -v node &>/dev/null; then
  node scripts/submit-indexnow.mjs || echo "IndexNow submission skipped (non-fatal)"
fi
# Remove regenerable build/tooling caches so they are not shipped in the deployment
# image. The standalone runtime (.next/standalone/server.js) reads none of them, but
# Replit's Repl layer ships the whole workspace regardless of .gitignore, so anything
# left on disk bloats that layer AND its duplicate cache layer during image assembly
# on the small cr-2-4 (2 vCPU / 4 GB) build machine.
#   .next/cache : webpack/build incremental cache (hundreds of MB).
#   .cache      : Playwright browsers + bun/npm tooling caches (~1GB+).
# Both regenerate on demand, so removing them here is safe. Also drop the small
# catalog-verification scratch files left in the repo root.
rm -rf .next/cache .cache
rm -f .tmp-osc-*.txt
