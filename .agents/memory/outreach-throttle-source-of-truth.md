---
name: Outreach throttle source of truth
description: Why send cap/gap guards must key off sentAt timestamp, not the mutable prospect status.
---

# Outreach throttling must be timestamp-based, not status-based

The cold-outreach daily cap (`countSentLast24h`) and minimum-spacing
(`minutesSinceLastSend`) guards in `lib/outreach/sender.ts` must filter on
`sentAt IS NOT NULL` (a durable send event), NOT on `status = 'sent'`.

**Why:** The prospect `status` is a mutable lifecycle label. After a send,
open-tracking flips `sent -> opened`, and later transitions can move it to
`replied`, `bounced`, or `unsubscribed`. If the throttle queries filter on
`status = 'sent'`, every such transition silently drops the record out of the
cap/gap window, letting real sends leak past the daily cap and bypass the
min-gap spacing. This was caught as a blocking regression when open-tracking
was added.

**How to apply:** Treat `sentAt` as the single source of truth for send
cadence — it is only ever set at actual send time and never cleared. Any new
throttling/cadence/rate-limit logic for outreach must key off `sentAt`, not the
status string. Status is for UI/filtering only.

## The throttle must have no bypass

`processOutreachBatch` enforces the in-flight guard, rolling daily cap, and
minimum gap on EVERY path. Do not reintroduce a `respectGap`/skip-throttle
option. The manual admin "send" endpoint sends exactly one message per run and
goes through the identical gating as the automated `instrumentation.ts` tick.

**Why:** A previous review rejected the feature because the manual send route
called the batch with the gap check disabled and a per-request limit up to 5,
allowing bursty back-to-back sends. Cold outreach must always be dripped out.

## Manual email entry is provenance-gated

Admin-entered prospect emails go through `isEmailOnDomain()` (in
`lib/outreach/emailScraper.ts`) — same on-domain rule as the scraper. An admin
can never approve a guessed (`info@theircompany.com`) or third-party address;
if the prospect has no parseable website, manual email entry is rejected.

