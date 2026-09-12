---
name: Estimator local verification limits
description: Replit-specific false negatives in the P5 estimator browser and clarification checks.
---

Local P5 browser verification can fail before exercising estimator behavior because the cached Playwright Chromium binary may lack required Nix shared libraries.

The earlier clarification-test failure caused by query-suffixed dynamic TypeScript imports was corrected upstream. After synchronization, the intended Node 24 command passes all clarification and processing-status checks locally.

**Why:** The production build, clarification tests, and managed preview succeed, while the cached Playwright Chromium process can still stop at launch for missing `libglib-2.0.so.0`.

**How to apply:** Classify a missing-library browser launch as a local verification-environment failure, not an estimator regression. Do not change synchronized application source to mask it; provide the supported Nix browser runtime or rely on upstream browser results when application code is unchanged.