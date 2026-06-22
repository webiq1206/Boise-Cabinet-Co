---
name: admin role assignment policy
description: Durable policy/risk for how the "admin" role may be granted in this app.
---

Policy: the admin role must only be granted from a **verified-email** path (OIDC login) or a **manual DB promotion**. Never from an unverified email match.

**Why:** Password signup/login does not prove email ownership, and the privileged admin address is a fixed, well-known value. Auto-promoting on an email match (at register or login) let anyone claim admin by registering that address first. A stale env value also once granted admin to the wrong account.

**Single source of truth (2026-06-22):** the admin email set lives in `shared/adminEmails.ts`; every role-decision layer imports it and nothing else decides admin-by-email. Do NOT reintroduce an `ADMIN_EMAILS` *env var* path for granting admin — an env-driven allowlist is exactly the stale-config divergence/privilege risk this policy exists to prevent.

**Adding a password-login admin is a deploy-time action, not a code-only one:** password registration deliberately refuses to grant admin (email unproven) and login just reads the stored `role`, so adding an email to the canonical list does nothing until the `instrumentation.ts` bootstrap runs on the next PRODUCTION deploy (gated by `ADMIN_BOOTSTRAP_PASSWORD`) and creates/promotes the row. No effect in dev; requires a re-publish.

**How to apply:**
- When changing who is admin, edit only the canonical list; that keeps every role-decision layer in sync. (They used to be duplicated across auth + storage + an env var and silently diverged.)
- Beware role-defaulting helpers that map one non-admin role to another (e.g. subcontractor→partner); calling them on a login/promotion path can silently mutate existing users' roles.
- Existing rows keep their role on upsert, so demoting/promoting an existing user requires a direct DB UPDATE, not just a code change.
