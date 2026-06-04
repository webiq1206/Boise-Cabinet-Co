---
name: admin role assignment policy
description: Durable policy/risk for how the "admin" role may be granted in this app.
---

Policy: the admin role must only be granted from a **verified-email** path (OIDC login) or a **manual DB promotion**. Never from an unverified email match.

**Why:** Password signup/login does not prove email ownership, and the privileged admin address is a fixed, well-known value. Auto-promoting on an email match (at register or login) let anyone claim admin by registering that address first. A stale env value also once granted admin to the wrong account.

**How to apply:**
- When changing who is admin, update every place that decides roles — they are duplicated across the auth layer and the storage upsert layer, plus an env var — or they silently diverge.
- Beware role-defaulting helpers that map one non-admin role to another (e.g. subcontractor→partner); calling them on a login/promotion path can silently mutate existing users' roles.
- Existing rows keep their role on upsert, so demoting/promoting an existing user requires a direct DB UPDATE, not just a code change.
