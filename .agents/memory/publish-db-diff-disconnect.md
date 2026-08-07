---
name: Publish "Failed to check for database diff" disconnect
description: Diagnosing the Publish-flow schema-diff error "SERVER unexpectedly disconnected".
---

**Rule:** When Publish shows "Failed to check for database diff: SERVER unexpectedly disconnected", first verify both DBs are healthy and schemas match before suspecting the project. If dev and prod are reachable, `information_schema.columns` md5 fingerprints match, dev DB is small, and `pg_stat_activity` shows no stuck transactions, the failure is a transient platform-side connection drop — the fix is simply to retry Publish.

**Why:** This happened July 2026; dev and prod each had 41 tables, identical 487-column md5 fingerprints, dev DB 11 MB, no active/idle-in-transaction sessions. Nothing in the repo can cause or prevent it; no code change is appropriate (and never add DB steps to build.sh — see deploy-dbpush-hang.md).

**How to apply:** Diagnose with executeSql (dev + `environment:"production"`): compare `md5(string_agg(table_name||'.'||column_name||':'||data_type,...))` over `information_schema.columns`, check `pg_database_size`, and `pg_stat_activity`. Note `checkDatabase()` reports "not provisioned" even though the Replit-managed PG works via executeSql — known quirk, ignore it.

**Recurrence 2026-08-07:** Same banner during the estimating-assistant publish.
`shared/schema.ts` was untouched by that work (`shared/estimateInputSchema.ts`
is a zod request validator, not a table definition), so dev and prod schemas
were necessarily still identical and the diff had nothing to migrate — i.e. the
check was failing to CONNECT, not reporting a real divergence, and publishing
past the banner was safe. Reconfirms the rule above. Do not go looking for a
code cause: the `REPLIT_DB_URL` Postgres fallback in `lib/db`,
`drizzle.config.ts`, `instrumentation.ts`, `scripts/apply-crm-schema.ts` and
`scripts/post-merge.sh` is a genuine latent bug (it is a key-value HTTPS
endpoint, see neon-driver-on-replit-postgres.md) but it is NOT this — it only
bites when `DATABASE_URL` is absent, and it cannot affect Replit's own
diff tooling.
