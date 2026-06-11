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
# Remove regenerable build cache so it is not shipped in the deployment image.
# .next/cache is webpack/build incremental cache only; the standalone runtime
# (.next/standalone/server.js) never reads it. Shipping it (hundreds of MB)
# bloats the Repl layer and its duplicate cache layer during image assembly.
rm -rf .next/cache
