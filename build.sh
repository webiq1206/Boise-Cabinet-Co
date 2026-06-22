#!/bin/bash
set -e
npm install
if [ -n "$DATABASE_URL" ] || [ -n "$PGDATABASE_URL" ] || [ -n "$REPLIT_DB_URL" ]; then
  echo "Applying database schema..."
  npm run db:push
else
  echo "No database URL configured — skipping db:push"
fi
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
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
