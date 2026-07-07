---
name: Resend webhook must target the app domain, not the email subdomain
description: Why the outreach webhook kept failing / got auto-disabled by Resend
---

Resend disabled the outreach webhook because it was pointed at
`https://outreach.boisecabinet.co/api/outreach/webhook`. That subdomain is the
Resend email (sending/receiving) domain — it only has email DNS (MX/TXT/CNAME)
and NO web A/CNAME record, so it does not resolve for HTTPS. Every webhook POST
failed to connect, and Resend auto-disables an endpoint after sustained
failures.

**Rule:** Point the Resend webhook at the deployed APP domain
(`https://boisecabinet.co/api/outreach/webhook`), never at the email subdomain.

**Why:** The app is served on the apex `boisecabinet.co` (resolves to the
Replit deployment). The `outreach.*` subdomain exists only for email. Mixing an
HTTPS endpoint onto the email subdomain can never work.

**How to apply / diagnose:** If Resend says the webhook is failing/disabled,
first check DNS of the configured host (`getent hosts <host>`). If it does not
resolve but the apex does, the URL is wrong. Verify the app endpoint with an
unsigned POST: a healthy endpoint returns HTTP 401 "Invalid signature" (app up +
`RESEND_WEBHOOK_SECRET` present); 500 "Webhook secret not configured" means the
secret is missing. The signing secret is per-endpoint, so re-pointing the SAME
endpoint keeps `RESEND_WEBHOOK_SECRET` valid — no secret change needed. After
fixing the URL, the user must re-enable the endpoint in the Resend dashboard.
