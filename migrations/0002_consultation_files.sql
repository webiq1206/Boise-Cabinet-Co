-- Photos, plans and PDFs attached to a quote request (the quote form's
-- "Add photos, plans or files" tile). Additive and safe to run repeatedly.
-- Mirrors consultationFiles in shared/schema.ts. The app also creates the
-- table on first upload (server/services/consultationFileStore.ts), so a
-- deploy works without running this by hand. Apply it to the DEVELOPMENT
-- database so Replit's publish diff sees one new table rather than proposing
-- to drop a production-only one (replit.md, "Publish checklist"). Never run it
-- against production from a workstation. Reversible by hand only.
CREATE TABLE IF NOT EXISTS "consultation_files" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_id" varchar NOT NULL,
  "name" text NOT NULL,
  "content_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "sha256" text NOT NULL,
  "data_base64" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "consultation_files_request_id_idx" ON "consultation_files" ("request_id");
CREATE UNIQUE INDEX IF NOT EXISTS "consultation_files_request_sha_idx" ON "consultation_files" ("request_id", "sha256");
