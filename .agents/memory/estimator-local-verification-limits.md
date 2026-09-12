---
name: Estimator local verification limits
description: Replit-specific false negatives in the P5 estimator browser and clarification checks.
---

Local P5 verification can fail before exercising estimator behavior: the cached Playwright Chromium binary may lack required Nix shared libraries, and the local `tsx` loader may encode a cache-busting query string into a dependency filename during dynamic TypeScript imports.

**Why:** The production build and managed preview succeeded on an exact upstream-tested tree, while Playwright stopped at process launch for missing `libglib-2.0.so.0` and two clarification checks stopped at module resolution for an `extraction.ts?namespace=...` path.

**How to apply:** Classify these as local verification-environment failures, not estimator regressions. Do not change synchronized application source to mask them; fix test portability upstream or provide the supported Nix browser runtime, then synchronize normally.