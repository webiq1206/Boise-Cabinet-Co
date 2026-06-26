---
name: Outreach send status-machine restores
description: How in-flight outreach sends must restore prospect status without clobbering terminal webhook states, and how stale-lease reclaim must avoid regressing opened rows.
---

# Outreach send status-machine restores

When the send engine reserves a prospect it flips `status` to `sending`. Every
update in `sendToProspect` that releases that reservation (dry-run, missing
sender, success, error — for both first sends and follow-ups) MUST be guarded by
`and(eq(id, prospect.id), eq(status, "sending"))`, not by `id` alone.

**Why:** open-tracking webhooks and the admin "Replied / Bounced" actions run
concurrently and can flip the row to a terminal status (`replied`, `bounced`,
`unsubscribed`) or `opened` while the send is in flight. An `id`-only restore
would overwrite that newer terminal status with `sent`/`opened`/`approved`,
silently re-queueing or mis-stating a prospect that already replied/unsubscribed.

**How to apply:** any new code path that updates a `sending` row back to a
non-sending status must keep the `status = "sending"` predicate so a stale write
no-ops when something else already advanced the row.

## Stale-lease reclaim
The crashed-reservation reclaim (rows stuck in `sending` past the lease) must
restore by durable timestamps, in this order: `openedAt` set -> `opened`; else
`sentAt` set -> `sent`; else -> `approved`. Do NOT force `sent` for any row with
`sentAt` set — that regresses an already-`opened` follow-up reservation back to
`sent`. Follow-up reservations always have `sentAt` set (first email went out),
so they fall into the opened/sent buckets and are never re-queued.
