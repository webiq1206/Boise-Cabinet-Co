---
name: Estimator changed-source isolation
description: Lifecycle rule for preventing prior project facts and clarifications from leaking into replacement estimator scopes.
---

When an already-analyzed project description is replaced, clear prior answers, extraction, conflicts, skipped fields, resolutions, instruction history, and pending client clarification text before installing the new analysis. Apply the same cleanup if analysis fails.

**Why:** Background analysis failures can return before normal reconciliation. Without a common sanitized save path, a new description can be displayed with the old project’s facts and evidence. Pending clarification text can also appear against a different question.

**How to apply:** Distinguish replacement text from first analysis and additive uploads. Replacement text starts a new scope; additive uploads may preserve demonstrably visitor-entered or project-handoff facts but must remove values attributable only to the previous extraction. Queued and synchronous failures must use the same source-version cleanup.