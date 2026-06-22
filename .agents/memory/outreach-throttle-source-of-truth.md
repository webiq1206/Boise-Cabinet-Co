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

All cold-outreach send paths (the automated background tick and the manual admin
"send" button) must funnel through the single batch function and be subject to
the same gating: master on/off, daily cap, minimum gap, and in-flight guard.

**Why:** A review rejected the feature because the manual path had a
skip-the-gap flag and a multi-per-request limit, allowing bursty back-to-back
sends. Cold outreach must always drip out.

**How to apply:** Do not add a "respect gap" / skip-throttle option or a
batch-size knob to any send entrypoint. Manual send = one message per run,
identical gating to auto.

## Manual email entry is provenance-gated

An admin may only save/approve a prospect email that is provably on the
contractor's own website domain — the same on-domain rule the scraper uses.
Guessed (`info@theircompany.com`) or third-party addresses, and prospects with
no parseable website, must be rejected, not contacted.

