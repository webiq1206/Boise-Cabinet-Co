---
name: admin role assignment paths
description: Where the "admin" role is granted on sign-in — multiple independent code paths plus an env var that must stay in sync.
---

Admin role is decided in THREE independent places that must agree:
- `lib/auth.ts` `getDesignatedRole()` — hardcoded `ADMIN_EMAILS` array (used by the OIDC `upsertUserFromClaims` flow).
- `server/storage.ts` `upsertUser()` — BOTH the MemStorage class and the DbStorage class have their own copy that reads `process.env.ADMIN_EMAILS` (comma-separated).
- The `ADMIN_EMAILS` shared env var itself.

**Why:** A single canonical admin (`hello@boisecabinet.co` = `SITE_CONFIG.email`) was once admin in the code list but the `ADMIN_EMAILS` env var still pointed at an unrelated account, so the env-driven storage path granted admin to the wrong user. Changing only one place silently leaves another path wrong.

**How to apply:** When changing who is admin, update all paths. The storage paths now prepend `SITE_CONFIG.email` so the canonical site address is always admin regardless of env. Existing DB rows keep their old role on upsert (role is preserved), so changing an existing user's admin status also requires a direct DB `UPDATE users SET role=...`.
