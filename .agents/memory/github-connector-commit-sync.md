---
name: GitHub connector commit synchronization
description: Safe recovery when local HTTPS Git authentication fails but the authorized GitHub connector can still fast-forward the remote.
---

Never force-push around a stale local HTTPS credential. Confirm the remote parent and changed blobs, create a normal fast-forward commit through the authorized GitHub connector, then align local refs to the exact remote commit object.

**Why:** Replit’s Git pull may update remote-tracking refs while a later HTTPS push lacks usable credentials. GitHub’s commit API also preserves an input message without a final newline, producing a different commit ID from a normal local commit with the same parent and tree.

**How to apply:** Back up `.git` and the worktree first, preserve recovery refs, verify parent/tree identities, and reconstruct the API commit object locally before updating `main` and `origin/main`. Never overwrite remote history.