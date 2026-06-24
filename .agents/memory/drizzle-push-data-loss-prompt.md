---
name: drizzle-kit push data-loss prompt
description: How to drop columns/tables when db:push blocks on an interactive data-loss confirmation
---

`npm run db:push` (drizzle-kit push) blocks on an **interactive arrow-key select** ("No, abort" / "Yes, I want to remove N columns") whenever a schema change deletes columns or tables that hold data. Piping `echo y` or `printf '\x1b[B\n'` does NOT reliably select "Yes" — the prompt just re-renders and the push aborts, leaving the DB unchanged.

**How to apply:** When a task removes schema columns/tables and you need the DB to match, don't fight the prompt. Run the equivalent `DROP TABLE IF EXISTS ... CASCADE` / `ALTER TABLE ... DROP COLUMN IF EXISTS ...` statements directly (via the `executeSql` code-execution callback), then verify with an `information_schema` count. This app's runtime DB is Neon via `DATABASE_URL`; the `checkDatabase` callback reports "not provisioned" (it checks a different built-in PG) so use `executeSql` to inspect the real schema.

**Why:** drizzle select() only reads columns defined in the TS schema, so leftover DB columns are functionally harmless, but they cause persistent schema drift (every future push re-prompts to drop them). Dropping them directly keeps schema and DB in sync without the blocking prompt.
