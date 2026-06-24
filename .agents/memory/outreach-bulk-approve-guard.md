---
name: Outreach bulk-approve status guard
description: Why bulk approve in the cold-outreach admin filters on status, not just email.
---

The bulk action endpoint (`/api/admin/outreach/bulk`) approve path filters on
`isNotNull(email)` AND `status IN (discovered, needs_email, ready, skipped, error)`.

**Why:** Approving sets status to `approved` which re-enters the send queue.
Without the status filter, selecting a prospect already in a terminal/in-flight
state (sent/opened/replied/sending/bounced/unsubscribed) would re-queue them and
risk a duplicate cold email or emailing someone who opted out. The single-row
approve UI already hides approve once status is `approved`, but bulk operates on
raw selected ids regardless of what column the user is viewing.

**How to apply:** Any new path that flips a prospect to `approved` must apply the
same two guards. Outreach throttle keys off `sentAt` (see outreach-throttle note)
but that only caps rate; it does not prevent a re-queued terminal prospect from
eventually resending.
