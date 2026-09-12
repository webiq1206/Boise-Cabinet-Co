---
name: Estimator changed-source isolation
description: Lifecycle rule for preventing prior project facts and clarifications from leaking into replacement estimator scopes.
---

When an already-analyzed project description is explicitly replaced as a different project, create a fresh draft ID and key. Do not mutate or delete the prior server draft or its uploads. The new identity starts without prior answers, contact, extraction, conflicts, skipped fields, resolutions, instruction history, or uploaded-file metadata. Only files added locally since the prior analysis may follow the new identity.

**Why:** Same-draft replacement cannot detach old server uploads and can autosave new text into the old record before project intent is clear. A new identity preserves the old record while preventing its facts, evidence, files, or clarification state from contaminating the replacement.

**How to apply:** Pause contact-triggered autosave while analyzed text differs and offer two explicit actions: update this project or start a separate new project. Ordinary same-project edits and additive uploads remain on the current draft. Keep pending-file provenance synchronized across recovery, upload, removal, and reset so old uploaded files never follow the replacement.