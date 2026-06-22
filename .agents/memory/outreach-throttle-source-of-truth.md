---
name: Outreach throttle rules
description: How cold-outreach send cadence (cap/gap) must be measured and enforced, and what must never bypass it.
---

# Cadence is measured by the durable send timestamp, never by status

The daily cap and minimum-gap guards must key off the durable "sent at"
timestamp, not the prospect's `status`.

**Why:** Status is a mutable lifecycle label — after a send it flips to opened,
then replied/bounced/unsubscribed. Throttle queries filtered on `status='sent'`
let every such transition silently drop the record out of the cap/gap window,
leaking real sends past the cap and bypassing the gap. Caught as a blocking
regression when open-tracking was added.

**How to apply:** Treat the send timestamp as the single source of truth for
cadence (only ever set at send time, never cleared). Status is for UI/filtering.

# Cadence has no bypass and is enforced atomically

Every send path (automated tick and manual admin send) funnels through one
batch function under identical gating: master on/off, daily cap, min-gap,
in-flight guard. Manual send = one message per run.

The cap/gap/in-flight checks and the prospect claim are HARD guarantees, so they
must be serialized across all autoscale instances: do them inside ONE DB
transaction guarded by a Postgres transaction-level advisory lock. Reserve the
slot (stamp the send timestamp) for real sends inside that lock so a concurrent
tick immediately counts it; do the email network call AFTER the transaction
commits so the lock is never held during slow I/O.

**Why:** Best-effort pre-checks (separate count/gap queries, then a claim) let
two instances both pass and send too close together; a per-row claim alone only
prevents double-sending the same prospect, not cadence violations. A manual path
with a skip-gap flag or multi-per-request limit allowed bursty sends.

**How to apply:** Never add a skip-throttle/respect-gap flag or batch-size knob
to any send entrypoint. Any new rate/cadence rule goes inside the same
advisory-locked critical section, evaluated against committed state. A hard
in-flight gate needs a stale-reservation lease so a crashed send can't deadlock
the queue forever (if already stamped sent, retire it — never re-send).

# Manual email entry is provenance-gated

An admin may only save/approve a prospect email that is provably on the
contractor's own website domain (same on-domain rule the scraper uses). Guessed
(`info@theircompany.com`) or third-party addresses, and prospects with no
parseable website, must be rejected, not contacted.
