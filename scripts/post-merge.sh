#!/bin/bash
set -e
npm install
if [ -n "$DATABASE_URL" ] || [ -n "$PGDATABASE_URL" ] || [ -n "$REPLIT_DB_URL" ]; then
  echo "Applying database schema after merge..."
  npm run db:push
else
  echo "No database URL configured — skipping db:push"
fi
