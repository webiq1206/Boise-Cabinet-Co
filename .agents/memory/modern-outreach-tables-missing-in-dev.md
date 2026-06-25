---
name: Modern CRM outreach tables missing in dev DB
description: The modern outreach engine (email_templates/sequences/...) is defined in schema.ts but not present in the dev Neon DB; how to make it real in dev to seed/verify.
---

The modern CRM outreach engine tables are declared in `shared/schema.ts` but were never created
in the dev Neon DB; only the LEGACY cold-outreach tables exist there.

**Why this is invisible:** the seed (`seedOutreachContent()`) and send tick (`processSendingTick()`)
are both **prod-guarded inside `instrumentation.ts`**, so dev never creates the tables at boot. The
modern CRM admin UI (Sequences/Compose under `/admin/leads`) would 500 in dev until they exist.

**Do NOT use `db:push` to fix this.** There is no `migrations/` folder, and `schema.ts` and the
live dev DB have diverged heavily (many DB tables not in schema, modern tables not in DB), so
`drizzle-kit push` goes interactive and offers destructive table renames/drops. Dangerous.

**How to apply:** to seed/verify the modern engine in dev, create just the modern tables with
`CREATE TABLE IF NOT EXISTS` DDL hand-matched to `schema.ts` (run via a throwaway tsx script
using `@/lib/db`'s `db.execute(sql.raw(...))`), then call `seedOutreachContent()`. `leads.id` is
`character varying`, so FK columns must be `varchar` to match. This is non-destructive and makes
the modern CRM functional in dev. The sandbox `executeSql` callback targets a DIFFERENT database
than `DATABASE_URL`/the app — it does NOT see these tables; always go through the app's `@/lib/db`
client for ground truth.

**Source of truth for seeded content:** `server/services/outreachSeed.ts` (TEMPLATES + SEQUENCES,
create-once per `seedKey`; templates refresh while `seedManaged=true`). Render adds greeting,
signature (from `signerName`), CAN-SPAM footer, unsubscribe, pixel, click-tracking — so
`openingLine` must not include a greeting.
