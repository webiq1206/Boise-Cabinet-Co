---
name: dev/prod are separate databases
description: This project's development and production environments use independent Postgres databases; runtime data (site_settings, leads) does NOT sync on publish.
---

# Dev and prod use separate databases

Development and the published deployment have **independent** Postgres databases
in this project. They have diverged in real data: different lead counts, and
production carries site_settings keys that dev does not (and vice versa). The
`executeSql` production target is a **read-only replica** — you cannot write prod
data from the dev environment.

**Why:** Confirmed during outreach go-live — flipping `outreach_enabled=true` /
`outreach_dry_run=false` in dev's `site_settings` had zero effect on production,
which still read its own old rows (`enabled=false`, `dry_run=true`).

**How to apply:**
- Replit's Publish flow migrates **schema** dev→prod, NOT row data. Any runtime
  data / feature-flag / `site_settings` toggle set in dev will NOT appear in prod.
- To change production runtime settings (e.g. outreach live switches), they must
  be set on the deployment itself — typically via the deployed admin UI endpoint
  that writes to the prod DB at runtime (e.g. `PATCH /api/admin/outreach/config`),
  since the agent can't write the prod DB directly.
- **Secrets are global** (not env-scoped): RESEND_API_KEY, OUTREACH_FROM_EMAIL,
  OUTREACH_MAILING_ADDRESS etc. already apply to prod. Only DB-stored toggles
  need a separate prod action.
