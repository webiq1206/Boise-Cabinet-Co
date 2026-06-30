---
name: Gmail connector is send-only (reply/inbox tracking)
description: Why inbox reads fail via the Replit google-mail connector and what to use instead for reply tracking.
---

The Replit `google-mail` connector grants only **send + Gmail add-on contextual** scopes:
`gmail.send`, `gmail.labels`, and the `gmail.addons.current.message.*` set (including
`...message.readonly` / `...message.metadata`). Those "readonly" scopes are add-on
contextual scopes that ONLY work inside the Gmail add-on UI runtime — they do NOT grant
general mailbox read. So `users.messages.list` / `users.messages.get` return
`403 ACCESS_TOKEN_SCOPE_INSUFFICIENT`. You cannot read the inbox through this connection,
and the connector's scope set is fixed (re-authorizing grants the same scopes).

**Why:** discovered when building outreach reply tracking — needed to detect when a lead
replied, but the existing healthy google-mail connection could only send.

**How to apply:** for any "read the inbox / detect replies / parse incoming mail" feature,
do NOT rely on the google-mail connector. Use **Resend Inbound** instead (fits the existing
Resend stack): point one MX record at a receiving SUBDOMAIN (never the root/main mailbox),
add a Resend webhook for `email.received`, verify with `RESEND_WEBHOOK_SECRET` (Svix), then
fetch the body via `GET https://api.resend.com/emails/received/{email_id}` (webhook payload
is metadata-only: from/to/subject/email_id). Set the outreach reply-to to an address on that
inbound subdomain and forward replies to the human inbox so nothing is lost.
