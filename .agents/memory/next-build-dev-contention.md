---
name: Next dev vs build .next contention
description: Why running `next build` while the dev workflow is up breaks pages, and how to validate a build safely.
---

Running `next build` while the `Start application` dev workflow is still running corrupts the shared `.next` directory. Symptom: pages 500 with `Error: Cannot find module './vendor-chunks/<pkg>.js'` (MODULE_NOT_FOUND) coming from the static-paths worker — not from app code.

**Why:** both `next dev` and `next build` write to the same `.next/` in this single-environment repl. Concurrent writes leave half-written webpack chunk manifests. The build also tends to get resource-killed mid-compile (no error in its log, just stops after "Creating an optimized production build ...") because two Next compilers exceed memory.

**How to apply:**
- Do NOT run `npm run build` while the dev workflow is running. There is no stop-workflow tool (only restart), so to validate a production build you must accept dev breakage: run build, then `rm -rf .next` and restart the `Start application` workflow to get a clean dev `.next`.
- If pages suddenly 500 with vendor-chunks MODULE_NOT_FOUND, the fix is `rm -rf .next` + restart the workflow — it is a stale/corrupt cache, not a code bug.
- For routine validation prefer curling the dev server (all routes 200) over a full concurrent build; dev compiles the same routes on demand.
