import { sql } from "drizzle-orm";
import type { db as Database } from "@/lib/db";

/**
 * consultation_files is new (quote form v2). Like estimator_sessions, the app
 * creates it on first use with the same additive statements as
 * migrations/0002_consultation_files.sql, so uploads work right after a
 * deploy without anyone running a migration by hand. Additive only:
 * CREATE ... IF NOT EXISTS, never ALTER or DROP.
 *
 * Publishing note (replit.md, "Publish checklist"): a table the app creates
 * at runtime exists in production before it exists in a development database
 * that has never run the app, so Replit's publish diff may propose dropping
 * it. Never approve a DROP; apply migrations/0002 to the development
 * database (or run the app there once) and the diff is clean.
 */
let ensured: Promise<void> | null = null;

export function ensureConsultationFilesTable(database: NonNullable<typeof Database>): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await database.execute(sql`CREATE TABLE IF NOT EXISTS "consultation_files" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "request_id" varchar NOT NULL,
        "name" text NOT NULL,
        "content_type" text NOT NULL,
        "size_bytes" integer NOT NULL,
        "sha256" text NOT NULL,
        "data_base64" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now()
      )`);
      await database.execute(
        sql`CREATE INDEX IF NOT EXISTS "consultation_files_request_id_idx" ON "consultation_files" ("request_id")`,
      );
      await database.execute(
        sql`CREATE UNIQUE INDEX IF NOT EXISTS "consultation_files_request_sha_idx" ON "consultation_files" ("request_id", "sha256")`,
      );
    })().catch((error) => {
      // Try again on the next upload rather than caching a failure.
      ensured = null;
      throw error;
    });
  }
  return ensured;
}
