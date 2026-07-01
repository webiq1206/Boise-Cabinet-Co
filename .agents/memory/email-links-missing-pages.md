---
name: Email links to non-existent pages
description: Which email CTA URLs 404 and the redirect-based fix pattern
---

Several buttons in outgoing emails linked to routes that return 404:
- `/consultation` — cold-outreach CTAs (seed-managed in outreachSeed.ts) + already-sent emails.
- `/quote-status/{quoteId}` — customer status email (sendCustomerStatusUpdate).
- `/subcontractor/leads`, `/subcontractor/projects` — contractor lead/project emails.
There is NO contractor lead/project portal and NO customer quote-status page. `/dealer` and `/installer` are noindex catalog-reference pages only; `/subcontractor` (exact) already redirects to `/`.

**Rule:** fix broken email-link 404s with redirects in `next.config.js`, not by editing the email-sending code or reseeding templates.
**Why:** a redirect also repairs links in emails ALREADY in inboxes (the send code / seed only affects future sends, and prod seed only changes on publish). It's also consistent with the existing large redirects() alias block and avoids reopening the seed/publish cycle.
**How to apply:** consult-intent aliases (`/consultation`, `/get-quote`, etc.) → `/#consult` (the inline consultation form) via pageAliases (r() helper adds trailing-slash + permanent). For pages that may be built later (quote-status, subcontractor/*) use `permanent:false` and add explicit trailing-slash variants, destination `/contact`. Longer term: build real destinations, then drop the temporary fallbacks.
