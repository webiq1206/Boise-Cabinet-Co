# Email delivery: boisecabinet.co

## Sending configuration

Use this domain's separate Resend account and server-only RESEND_API_KEY, or its existing Replit connector. From must use boisecabinet.co or an owned, provider-verified subdomain. Keep Reply-to on the brand's working hello@ mailbox. A provider error, missing ID, or no-op response is a failure. The transport preserves attachments and idempotency options.

Never use a visitor's address as From. Credentials must not use NEXT_PUBLIC_ variables. Provider acceptance means accepted for processing, not delivered or placed in an inbox.

## DNS and operational checks

Run `node scripts/email-dns-health.mjs`. It checks public DNS without changing records or sending mail. Missing records and failed lookups produce a nonzero exit; a lookup failure is UNKNOWN, not a confirmed missing record.

Workspace SPF is one TXT at @: `v=spf1 include:_spf.google.com ~all`. Google DKIM uses google._domainkey and must also be activated in Google Admin.
Resend uses its existing resend._domainkey and send return-path SPF/MX records. Do not combine the separate return-path SPF with the Workspace apex SPF.

The September 19, 2026 repairs were verified publicly and all five Workspace domains showed DKIM authenticating. DMARC remains p=none with aggregate reporting. Child domains report to their corresponding hello@ aliases, which route to the central P5 mailbox without cross-domain reporting authorization.

Before quarantine: account for every legitimate sender, complete DNS/account repairs, inspect fresh externally received Workspace and actual website emails for all five domains, and review at least seven representative reporting days with no unexplained legitimate authentication failures. Missing reports or low volume are not proof of success. Before reject: review approximately another month of clean reporting after quarantine. Retain the working monitoring records for rollback. Never advance policy just because time has elapsed.

## Deployment and received-message tests

Publish the reviewed Git changes, then pull and republish in the existing Replit deployment. Confirm the deployed version and sender environment settings. Send one clearly labeled test from each Workspace identity and submit a test through each real site form to a controlled external mailbox. Record provider ID, From, Return-Path, receiver Authentication-Results (SPF/DKIM/DMARC and alignment), and inbox/spam placement separately. Do not count a Sent-folder copy as receiver evidence.

For commercial outreach, use an owned verified outreach subdomain, an accurate full postal address, a usable plain-text unsubscribe URL, one-click unsubscribe where applicable, and bounce/complaint suppression. A subdomain does not guarantee isolation from the parent domain's reputation. Avoid shortened links and first-contact attachments. Increase volume only among recipients who expect the mail.

Cabinet's supported outreach workflow retains suppression and unsubscribe handling. OUTREACH_FROM_EMAIL must be a Cabinet subdomain. Custom tracking defaults off; enable OUTREACH_TRACKING_ENABLED=true only deliberately. The unified sender omits attachments until a lead has already been contacted. OUTREACH_MAILING_ADDRESS must contain the full business address. The legacy backlink dispatcher is paused; drafting remains available.

Google Postmaster registration is a separate remaining account step. A dashboard with no data does not establish successful delivery.

References: [Google sender guidelines](https://support.google.com/a/answer/81126), [Google DKIM](https://support.google.com/a/answer/174124), [Resend domains](https://resend.com/docs/dashboard/domains/introduction).

## October 6 authentication follow-up

The DNS check now prints the active DMARC policy and warns when it only monitors.
Use `node scripts/email-dns-health.mjs --require-enforcement` when checking whether
quarantine or reject has actually been published. The ordinary check still tests
record health independently of policy readiness. Neither check changes DNS.

Assess rollout readiness separately for each domain and each legitimate sender.
Confirmed spoofed messages are the reason to enforce DMARC, and do not reset the
observation period for legitimate senders. Investigate unknown sources before
classifying them. A forged source must never be added to SPF or another allowlist.
Postmaster visibility and inbox placement are separate from authentication;
missing Postmaster data alone is not evidence of a signing failure.

Unsubscribe links now show a confirmation page on GET without changing the
recipient. POST accepts the RFC 8058 `List-Unsubscribe=One-Click` form (URL-encoded
or multipart), with no sign-in or extra confirmation for mailbox providers.
Human confirmation uses the same suppression callback. Both lead and legacy
prospect tokens remain supported, repeat requests are safe, and storage errors
return 503 so providers can retry. Unsubscribe pages cannot be cached or indexed
and do not leak their token through referrer headers.

## October 7 reply delivery repair

Outreach replies now go to the working `hello@boisecabinet.co` inbox by default.
An existing `OUTREACH_REPLY_TO` setting does not override that default on its
own. The verified Cabinet From identity and the dedicated outreach sender
subdomain remain unchanged.

Resend inbound routing requires `OUTREACH_INBOUND_REPLY_ROUTING_ENABLED=true`,
a valid `OUTREACH_REPLY_TO` on an owned receiving subdomain, and
`RESEND_WEBHOOK_SECRET`. Enable it only after verifying receiving MX records,
successful signed webhook deliveries, and a complete reply arriving in the
human inbox. The MX target must resolve directly to its mail server addresses;
an MX target with only another MX record does not establish that route.

While replies go directly to the human inbox, automatic follow-up steps are
held because the webhook cannot detect those replies. Initial outreach and
separately approved runs keep their current behavior. Pending sequence steps
and stored campaign settings are preserved. Do not resume follow-ups until
replies received during this period have been reconciled in the CRM.

Already-sent emails retain their original Reply-To address. Repair receiving
on that old subdomain as well, and inspect any delivery failures or received
messages that need recovery. Changing new messages cannot repair old headers.

The inbound handler uses `client.emails.receiving.get` through the same
credential source as sending, verifies the received message ID and sender
against the signed event, and fetches full content for matched and unmatched
senders. Temporary retrieval, forwarding, or database failures return 503.
Both CRM and legacy prospect follow-ups stop when a reply is recorded.

Forwarding uses a deterministic Resend idempotency key. Accepted forwards also
have a durable `outreach_reply_receipt:<email_id>` entry in `site_settings`,
including unmatched replies. This entry contains only delivery status,
provider ID, and acceptance time, with no sender or message content. Existing
CRM activities without a forwarding receipt remain recoverable. Provider
acceptance is recorded separately from successful delivery to the inbox.

Forwarded copies include the full text and HTML body. If the original message
contains attachments, the copy identifies their filenames and directs the
operator to retrieve the originals from the received message in Resend.
Attachments are not automatically copied by this handler.

Run the regression tests with database connection variables unset so the signed
webhook's unavailable-database case cannot touch a real database:

```sh
env -u DATABASE_URL -u PGDATABASE_URL -u REPLIT_DB_URL \
  node --import tsx --test tests/outreach-reply-routing.test.ts \
  tests/outreach-inbound-reply.test.ts tests/email-delivery.test.ts \
  tests/outreach-email-footer.test.ts tests/outreach-unsubscribe.test.ts
```

Then typecheck and build. After deployment, verify the new Reply-To header from an
actual external received email and separately test a reply to the legacy
receiving address. Keep automatic inbound routing disabled until that test
succeeds.
