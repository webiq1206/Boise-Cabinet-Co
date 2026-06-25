// Idempotent DDL to apply the unified CRM schema additions without the
// interactive drizzle-kit push prompt. All statements are additive (ADD COLUMN
// IF NOT EXISTS, CREATE TABLE/INDEX IF NOT EXISTS) or NOT NULL relaxations, so
// this is safe to run multiple times. Run with:
//   DATABASE_URL=... npx tsx scripts/apply-crm-schema.ts

import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ?? process.env.PGDATABASE_URL ?? process.env.REPLIT_DB_URL;

const SQL = `
-- leads: additive columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type text NOT NULL DEFAULT 'homeowner';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emailable boolean NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS street text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_area text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS county text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS full_address text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_category text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_group text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS categories_matched text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rating numeric(3,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_count integer;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS latitude numeric(10,7);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS longitude numeric(10,7);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS distance_mi numeric(8,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS unsubscribe_token varchar NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at timestamp;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_detail text;

-- leads: relax NOT NULL so business / no-email rows are valid
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN city DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN property_type DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN service_type DROP NOT NULL;

-- leads: indexes
CREATE INDEX IF NOT EXISTS leads_lead_type_idx ON leads (lead_type);
CREATE INDEX IF NOT EXISTS leads_email_status_idx ON leads (email_status);
CREATE INDEX IF NOT EXISTS leads_pipeline_stage_idx ON leads (pipeline_stage);
CREATE INDEX IF NOT EXISTS leads_emailable_idx ON leads (emailable);
CREATE INDEX IF NOT EXISTS leads_lead_group_idx ON leads (lead_group);
CREATE UNIQUE INDEX IF NOT EXISTS leads_unsubscribe_token_idx ON leads (unsubscribe_token);

-- submissions
CREATE TABLE IF NOT EXISTS submissions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id varchar REFERENCES leads(id),
  form_type text NOT NULL,
  raw_payload jsonb NOT NULL,
  source_page text,
  submitted_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_lead_id_idx ON submissions (lead_id);

-- lead_quotes
CREATE TABLE IF NOT EXISTS lead_quotes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id varchar NOT NULL REFERENCES leads(id),
  project_type text,
  size_or_scope text,
  door_style text,
  finish text,
  planning_range_low numeric(10,2),
  planning_range_high numeric(10,2),
  estimator_inputs jsonb,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_quotes_lead_id_idx ON lead_quotes (lead_id);

-- email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id varchar PRIMARY KEY,
  name text NOT NULL,
  audience text NOT NULL DEFAULT 'homeowner',
  subject text NOT NULL,
  opening_line text,
  main_message text,
  closing_line text,
  body text,
  signer_name text,
  cta_label text,
  cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  seed_managed boolean NOT NULL DEFAULT false,
  updated_at timestamp NOT NULL DEFAULT now()
);

-- sequences
CREATE TABLE IF NOT EXISTS sequences (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  audience text NOT NULL DEFAULT 'homeowner',
  seed_key text,
  created_at timestamp NOT NULL DEFAULT now()
);

-- sequence_steps
CREATE TABLE IF NOT EXISTS sequence_steps (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id varchar NOT NULL REFERENCES sequences(id),
  template_id varchar NOT NULL REFERENCES email_templates(id),
  step_order integer NOT NULL,
  delay_hours integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sequence_steps_sequence_id_idx ON sequence_steps (sequence_id);

-- sequence_enrollments
CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id varchar NOT NULL REFERENCES sequences(id),
  lead_id varchar NOT NULL REFERENCES leads(id),
  status text NOT NULL DEFAULT 'active',
  current_step integer NOT NULL DEFAULT 0,
  next_due_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sequence_enrollments_seq_lead_idx ON sequence_enrollments (sequence_id, lead_id);
CREATE INDEX IF NOT EXISTS sequence_enrollments_next_due_idx ON sequence_enrollments (status, next_due_at);

-- outreach_runs
CREATE TABLE IF NOT EXISTS outreach_runs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id varchar NOT NULL REFERENCES email_templates(id),
  subject_override text,
  target_filter jsonb,
  batch_size integer NOT NULL DEFAULT 10,
  daily_cap integer NOT NULL DEFAULT 50,
  delay_seconds integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'active',
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

-- outreach_sends
CREATE TABLE IF NOT EXISTS outreach_sends (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id varchar NOT NULL REFERENCES leads(id),
  run_id varchar REFERENCES outreach_runs(id),
  enrollment_id varchar REFERENCES sequence_enrollments(id),
  step_id varchar REFERENCES sequence_steps(id),
  template_id varchar REFERENCES email_templates(id),
  tracking_token varchar NOT NULL DEFAULT gen_random_uuid(),
  sent_at timestamp,
  opened_at timestamp,
  open_count integer NOT NULL DEFAULT 0,
  first_clicked_at timestamp,
  click_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sent',
  error_detail text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS outreach_sends_lead_id_idx ON outreach_sends (lead_id);
CREATE INDEX IF NOT EXISTS outreach_sends_run_id_idx ON outreach_sends (run_id);
CREATE UNIQUE INDEX IF NOT EXISTS outreach_sends_tracking_token_idx ON outreach_sends (tracking_token);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id varchar NOT NULL REFERENCES leads(id),
  title text NOT NULL,
  due_at timestamp,
  completed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_lead_id_idx ON tasks (lead_id);
CREATE INDEX IF NOT EXISTS tasks_due_at_idx ON tasks (due_at);
`;

async function main() {
  if (!connectionString) {
    console.error("[apply-crm-schema] DATABASE_URL not set.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  try {
    await pool.query(SQL);
    console.log("[apply-crm-schema] Schema applied successfully.");
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[apply-crm-schema] Failed:", err);
    process.exit(1);
  });
