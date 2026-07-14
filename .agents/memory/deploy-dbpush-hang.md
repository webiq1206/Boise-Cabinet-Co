---
name: Deploy build must never run db:push
description: Why the deploy hung on "Applying database schema" and how prod schema changes actually flow.
---

**Rule:** build.sh (the `.replit` deploy build) must never run `npm run db:push` or any schema mutation. Prod schema changes flow ONLY through the Publish UI diff (dev DB vs prod DB), which asks the user to confirm destructive changes.

**Why:** build.sh used to run db:push against the production DATABASE_URL. When schema.ts dropped the removed compliance system (contract_templates/contracts tables + 8 users agreement_*/compliance_* columns), drizzle-kit raised its interactive data-loss prompt inside the non-interactive deploy build — the deploy stalled and the DB-diff check errored ("terminating connection due to administrator command").

**How to apply:** To retire columns/tables, drop them in the DEV database via executeSql (legacy `contracts` had an FK to `contract_templates` — drop child first), then have the user re-publish; the Publish flow surfaces the prod drops for confirmation. Also: `countInternalLinks` in lib/content-utils.ts has an allowlist of internal route prefixes — when routes are consolidated/renamed, update that list or verify:content starts failing posts whose links were rewritten.
