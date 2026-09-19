---
name: Cabinet estimator acceptance boundaries
description: Non-obvious production evidence and fail-closed rules for Cabinet extraction reuse, customer outputs, CRM delivery, and catalog acceptance.
---

Only reuse a completed legacy Cabinet analysis when source text and ordered upload identities match exactly, all non-service visitor answers match, the legacy service is absent, the current deterministic service is `cabinet-install`, and exactly one complete candidate retains provider/model/time provenance.

**Why:** The preserved 20-LF owner-supplied production draft has one qualifying completed Anthropic result with old empty answers. Reuse must not create provider/accounting work or silently choose among ambiguous candidates.

**How to apply:** Inspect reuse through the authenticated read-only admin path before any runtime acceptance. Never use the normal scope POST as a preflight because a miss can enqueue paid work and even a hit saves a new draft revision.

Customer page, PDF, and email outputs must omit direct/unit cost, markup, margin, profit, overhead, cost-location metadata, and structured unit rates. Admin output retains the complete financial trace.

**Why:** Cost arithmetic can arrive inside generated prose, not only known fields, so customer presentation must fail closed on residual finance language.

**How to apply:** Keep quantities, selling totals/ranges, scope, and allowance caveats. Add adversarial output tests whenever customer result fields or renderers change.

Cabinet CRM intentionally uses the central Remodeling leads endpoint; that receiver accepts both brands and resolves Cabinet from source attribution. Keep Cabinet source/brand fields, keep payloads under 96 KiB, and treat HTTP 413 as permanent manual review.

**Why:** Live deployment metadata and source confirmed the shared destination is intentional. A real 133,555-byte production payload received HTTP 413; the compact representation measured 67,148 bytes. The legacy receiver ignores `externalLeadId` and `Idempotency-Key` and only compares email for 60 seconds, so it has no replay-safe acceptance contract.

**How to apply:** Measure UTF-8 bytes before fetch, never start the request when oversized, and scope manual delivery processing to the exact draft revision. Never accept an email-only HTTP 409 as proof of this estimate: preserve it as ambiguous manual review without CRM retry. Do not run live acceptance delivery until the durable source-scoped keyed receiver contract is tested and explicitly enabled.

Production alternate-scope acceptance must pin the canonical approved planning-catalog fingerprint, while supply-only, labor-only, and mixed scenarios remain explicitly synthetic.

**Why:** Descriptive source/authorizer text alone cannot prove that the rates are the approved production set.

**How to apply:** Reject catalog snapshots that do not match the pinned canonical fingerprint and never describe synthetic scenario ranges as customer quotes.