---
name: Outreach email preview iframe sandbox
description: Why "buttons don't work in email" reports often point at the admin preview iframe, not the email/link/data.
---

# "View our catalog button not working in email sequences"

When a user reports a button/link in an outreach email is "not working," check the
admin **preview** rendering before suspecting the email content, link, or data.

The admin renders email HTML inside `<iframe srcDoc=... sandbox="...">` in several
places (sequence step preview, template editor preview, sent-message detail dialog).
An empty `sandbox=""` blocks popups AND navigation, so clicking ANY link/button in a
preview is a silent no-op — looks exactly like a broken button.

**Fix pattern (centralized in `lib/outreach/emailPreview.ts`):**
- `sandbox="allow-popups allow-popups-to-escape-sandbox"` (NOT empty) so links can open.
- inject `<base target="_blank">` into the email `<head>` so links open in a new
  un-sandboxed tab instead of trying to navigate the sandboxed frame itself.
- deliberately keep scripts + same-origin OFF (no `allow-scripts`/`allow-same-origin`)
  to preserve XSS isolation for untrusted email markup.

**Why:** the real sent emails were verified working end-to-end (prod catalog PDF 200 +
`/api/track/click` 302 → PDF). The only place links were dead was the sandboxed preview.

**How to apply:** any new email-HTML preview iframe must use `EMAIL_PREVIEW_SANDBOX`
+ `toEmailPreviewSrcDoc()` from `lib/outreach/emailPreview.ts`, never `sandbox=""`.

Note: `renderBlock` in `server/services/outreachRender.ts` escapes body text and only
converts newlines — it does NOT auto-link markdown `[text](url)` or raw URLs in body
copy. CTA buttons (ctaLabel/ctaUrl, secondaryCtaLabel/secondaryCtaUrl) DO work and
route through the click tracker. So inline links typed into body copy would be dead;
authors should use the CTA fields (or this would need a linkify pass added).
