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
