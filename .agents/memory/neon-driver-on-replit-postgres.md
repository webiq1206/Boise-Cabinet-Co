---
name: neon driver choice on Replit Postgres
description: Why lib/db uses the neon-serverless WebSocket Pool driver, not neon-http, against Replit's managed Postgres.
---

# Neon driver choice for the app's runtime DB connection

Use the **neon-serverless WebSocket Pool** driver for the app's runtime DB
connection, not the **neon-http** (`neon()` / `drizzle-orm/neon-http`) driver:

```ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
```

**Why:** Against this project's Replit-managed Postgres, the neon-http
SQL-over-HTTP endpoint fails persistently with
`TypeError: Cannot read properties of null (reading 'map')` thrown inside
`@neondatabase/serverless` `processQueryResult` (the HTTP response has no
`rows`). It may appear to work for a brief window right after provisioning, then
fail on every request. The TCP/WebSocket path (pg via drizzle-kit, and the
WebSocket Pool at runtime) works reliably the whole time. The drizzle query API
is identical between the two adapters, so swapping only `lib/db/index.ts` fixes
the whole app with no route changes.

**How to apply:** If every `/api/...` route returns 500 with the null-`map`
error while `db:push` and direct SQL succeed, the runtime is on neon-http —
switch `lib/db` to the WebSocket Pool driver above (`ws` and
`drizzle-orm/neon-serverless` are already installed).

Also note: if `DATABASE_URL` is unset, `lib/db` falls back to `REPLIT_DB_URL`
(Replit's key-value store, NOT Postgres), so `db` is non-null but every query
throws. Check `checkDatabase()` / provision via `createDatabase()` and restart
the workflow so the server process picks up the injected `DATABASE_URL`.
