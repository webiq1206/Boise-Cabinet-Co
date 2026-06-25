---
name: Modern CRM outreach tables + dev/prod schema flow
description: The modern outreach engine tables (email_templates/sequences/...) and how they get from schema.ts into the dev and prod databases.
---

The modern CRM outreach engine tables (`email_templates`, `sequences`, `sequence_steps`,
`sequence_enrollments`, `outreach_runs`, `outreach_sends`) are declared in `shared/schema.ts`.
They were initially absent from BOTH databases; only the legacy `outreach_prospects` /
`outreach_suppressions` tables existed.

**DB topology:** the app runs on Replit-managed PostgreSQL — `DATABASE_URL` host == `PGHOST`.
The `@neondatabase/serverless` driver just connects to it. So the database skill's `executeSql`
(`replit_database`) hits the SAME database as the app's `@/lib/db`. (An earlier note claimed they
differ — that was a misdiagnosis; the table simply didn't exist yet.)

**Why the tables go missing:** `seedOutreachContent()` and `processSendingTick()` are prod-guarded
in `instrumentation.ts`, so the seed never creates/populates anything at dev boot. And `db:push`
(the normal dev-side apply) is **blocked by heavy drift** — `schema.ts` and the live DB diverge
(orphan tables like `compliance_documents`/`contracts`/`lead_quotes` in the DB but not schema, and
vice-versa), so `drizzle-kit push` goes interactive and offers destructive table renames. The
post-merge setup script hits this same interactive prompt.

**Getting the tables into DEV (workaround):** because db:push is blocked, create just these tables
by hand with `CREATE TABLE IF NOT EXISTS` DDL matched to `schema.ts` (run via the database skill
`executeSql` development, or a throwaway tsx script using `@/lib/db`). `leads.id` is
`character varying`, so FK columns must be `varchar`. Non-destructive. Then the seed populates them.

**Getting the tables into PRODUCTION — use the Publish flow, NOT manual DDL.** Per the database
skill, the agent must never run DDL against prod, write a prod migration script, add a deploy-build
hook, or add startup DDL. Production schema is applied only when the user **re-publishes**: Replit
diffs dev DB vs prod DB and applies the SQL, surfacing rename confirmations in the Publish UI.
For these additive tables the user must pick "create table" (not "rename") to avoid data loss.
After publish, the next prod boot auto-seeds the sequences via `instrumentation.ts`.

**Seeded-content source of truth:** `server/services/outreachSeed.ts` (TEMPLATES + SEQUENCES,
create-once per `seedKey`; templates refresh while `seedManaged=true`). Render adds greeting,
signature (from `signerName`), CAN-SPAM footer, unsubscribe, pixel, click-tracking — so
`openingLine` must not include a greeting.
