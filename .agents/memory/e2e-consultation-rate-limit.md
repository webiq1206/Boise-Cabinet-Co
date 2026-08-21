---
name: Repeated e2e runs trip the consultation rate limit
description: Why consultation-form.spec fails in a batch but passes alone — the limiter is working, not the test.
---

**Rule:** `/api/consultation` allows 8 submissions per IP per 15 minutes
(`PER_IP_LIMIT` / `PER_IP_WINDOW_MS` in `app/api/consultation/route.ts`). A full
e2e run posts twice — `consultation-form.spec.ts` and
`calculator-mobile.spec.ts` — so roughly the fourth full-suite run inside a
15-minute window starts getting 429s and those specs fail. They pass again once
the window rolls over, or immediately when run alone.

**Why:** Confirmed 2026-08-21 by probing the endpoint directly from the same
host: `200 200 200 200 200 200 429 429 429 429`. Both specs passed in isolation
(8.7s and 10.2s) minutes after failing inside a batch. Nothing in the app was
broken — the limiter was doing its job against a machine that had been
submitting all session.

**How to apply:** If `consultation-form` or `calculator-mobile` fails, re-run
that spec alone before investigating. Do NOT raise the limit to make the suite
green: it is real abuse protection on the site's only lead ingress. If the suite
ever needs to run repeatedly in CI, prefer a per-test IP (an `x-forwarded-for`
header is what `getClientIp` reads) over weakening the limit.

**Related:** design-studio-perf-spec-cold-compile.md and
next-build-dev-contention.md cover the other two ways this suite fails for
environmental reasons rather than code ones.
