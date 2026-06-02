---
name: Next.js standalone deploy — instrumentation must not block boot
description: Why the autoscale deploy failed at promote with no logs, and the constraint on instrumentation.ts
---

# Standalone deploy health check vs. blocking instrumentation

This project deploys as a Next.js `output: "standalone"` build on Replit autoscale
(cloud_run). Run command: `node .next/standalone/server.js`. The deployer promotes
only after the container answers the startup probe (HTTP 200 on `GET /`).

## The trap
`instrumentation.ts` `register()` is **awaited by Next.js during boot**. Any heavy /
unbounded work there (e.g. a full `leads` table scan + per-row UPDATEs for address
backfill) delays readiness. On the tiny dev DB it's instant; against the larger
production DB it can exceed the startup-probe timeout. Symptom: build compiles, all
273 pages generate, all image layers push, then the build is marked **failed ~10s
later with NO runtime logs** (the container never became healthy).

**Rule:** keep `register()` non-blocking. Run maintenance fire-and-forget:
`void (async () => { ... })()` so `register()` returns immediately.

## Edge-bundle constraint
The dynamic `await import("pg")` (and the IIFE that uses it) MUST stay lexically
inside the `if (process.env.NEXT_RUNTIME === "nodejs" ...)` guard. Moving it to a
top-level helper function makes webpack bundle `pg` for the edge runtime →
`Module not found: Can't resolve 'fs'/'path'/'stream'` build failure.

## Verify a deploy artifact locally
`npx next build` then `cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public`,
then `PORT=<free> HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js`
and curl `GET /` expecting 200. (`npm run dev` overwrites `.next`, so restart the
"Start application" workflow afterward.)

## Known-better long-term (not yet done)
Startup maintenance is best-effort: re-runs on every cold start, can duplicate across
instances. If hardened later, use `pg_try_advisory_lock`, per-step try/catch, and
set-based/batched SQL with a time budget — or move it to a cron/admin job entirely.
