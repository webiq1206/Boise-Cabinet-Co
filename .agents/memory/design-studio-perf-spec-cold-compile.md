---
name: design-studio-performance spec is flaky against a dev server
description: Why "room step loads within budget" fails intermittently locally, and how to tell that from a real regression.
---

**Rule:** `e2e/design-studio-performance.spec.ts` asserts the Design Studio room
step appears within 15s. Against `next dev` that stopwatch includes webpack's
first compile of a 3D-heavy route, so it fails whenever the route is cold or the
machine is busy — not because the app got slower. Warm the route before judging
it:

```
curl -s -o /dev/null "http://localhost:4321/design-studio?fixtureManual=1"
E2E_BASE_URL=http://localhost:4321 E2E_NO_WEBSERVER=1 npx playwright test e2e/design-studio-performance.spec.ts
```

**Why:** Measured 2026-08-21. Cold, inside a batch with other specs: fail. Route
warm: serves in 3.6s, spec passes in 4.2s against the 15s budget. It also failed
once purely from CPU contention while `npm run audit:layout` was driving 52
pages in parallel, then passed at 7.1s alone. Three separate passes, same
conclusion.

**How to apply:** Do NOT relax the 15s budget to make it green — against a
production build there is no compile step, so the budget is doing real work
there and loosening it would hide an actual regression. If it fails, warm the
route and re-run alone before investigating. Related: next-build-dev-contention.md
covers the same class of dev-server interference.
