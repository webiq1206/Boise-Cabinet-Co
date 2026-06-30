// Shared helpers for rendering outreach email HTML inside admin preview iframes.
//
// Previews must stay sandboxed (no scripts, no same-origin) so untrusted email
// markup can't touch the admin app, but a reviewer still needs to click the
// real buttons/links to confirm they work. An empty `sandbox=""` blocks popups
// and navigation entirely, which makes every button in a preview appear broken.
//
// We therefore allow popups (so links can open) and inject `<base target="_blank">`
// so every link opens in a fresh, un-sandboxed browser tab instead of trying to
// navigate the sandboxed frame itself. Scripts and same-origin access remain off.

export const EMAIL_PREVIEW_SANDBOX = "allow-popups allow-popups-to-escape-sandbox";

export function toEmailPreviewSrcDoc(html: string): string {
  if (!html) return html;
  if (/<base\b/i.test(html)) return html;
  const baseTag = '<base target="_blank" />';
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (m) => `${m}${baseTag}`);
  }
  if (/<html\b[^>]*>/i.test(html)) {
    return html.replace(/<html\b[^>]*>/i, (m) => `${m}<head>${baseTag}</head>`);
  }
  return `${baseTag}${html}`;
}
