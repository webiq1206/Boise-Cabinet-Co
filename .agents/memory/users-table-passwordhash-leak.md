---
name: Sensitive user columns leak through raw row responses
description: Adding a secret column to the shared users table silently exposes it via every API route that returns raw user rows.
---

Adding a sensitive column (e.g. `passwordHash`) to the `users` table in
`shared/schema.ts` instantly exposes it through every API route that returns a
raw `db.select().from(users)` row (or `getUserFromDb` result) via
`NextResponse.json(...)`. There is no implicit projection — Drizzle selects all
columns by default.

**Why:** Auth rebuild added `passwordHash`; several pre-existing routes
(notification-preferences, accept-agreement, admin subcontractors list, admin
credits) returned full user rows and started leaking the hash to the browser.

**How to apply:** Use the `sanitizeUser()` helper exported from `lib/auth.ts` at
**every** API boundary that returns a user object (map it over lists). When
adding any new secret/PII column to `users`, grep for routes returning user rows
and confirm each one sanitizes. Prefer explicit column projections for
client-facing selects.
