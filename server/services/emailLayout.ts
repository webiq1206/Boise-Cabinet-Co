import { SITE_CONFIG } from "@/shared/siteConfig";

/**
 * Email brand tokens, matching the site's DARK theme in app/globals.css
 * (charcoal ground, bone ink, restrained sage accent). Key names are kept
 * stable for the other templates that import them, but the VALUES are now the
 * real dark palette:
 *   charcoal      -> primary bone text (used as `color:` in ~27 places)
 *   charcoalLight -> muted "mist" text
 *   white         -> card/content SURFACE (used as `background:` only)
 *   canvas        -> outer body ground (darkest)
 *   highlightBg   -> raised surface for boxes/badges
 *   border        -> hairline
 *   sage          -> decorative accent (box left-borders)
 *   accentDark    -> readable accent for links (lighter sage, WCAG-safe)
 * plus bone/onAccent for the light CTA button.
 */
export const EMAIL_BRAND = {
  charcoal: "#EDEAE4", // primary text (light-on-dark)
  charcoalLight: "#9AA098", // mist / muted text
  sage: "#5D6561", // decorative accent (deep sage)
  canvas: "#1C1F1E", // body ground (darkest)
  white: "#222624", // card / content surface
  border: "#39403D", // hairline
  highlightBg: "#262B29", // raised surface (boxes, badges)
  accentDark: "#8FA399", // readable accent (lighter sage) for links
  bone: "#F7F5F3", // headings + CTA button background
  onAccent: "#1C1F1E", // text on the bone button
} as const;

export const SITE_BASE_URL = SITE_CONFIG.siteUrl;

export function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildTextLogo(): string {
  // Reversed (bone) wordmark for dark email backgrounds. PNG, not SVG, because
  // Gmail and Outlook strip inline/linked SVG.
  return `
    <div style="margin-bottom: 20px;">
      <img src="https://boisecabinet.co/images/brc-logo-reverse.png" alt="Boise Cabinet Co" width="220" style="display:block; margin:0 auto; width:220px; max-width:220px; height:auto; border:0; outline:none; text-decoration:none;" />
    </div>
  `;
}

export const emailStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background-color: ${EMAIL_BRAND.canvas};
    color: ${EMAIL_BRAND.charcoal};
    line-height: 1.6;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 0 auto;
    background-color: ${EMAIL_BRAND.white};
  }
  .header {
    background: linear-gradient(135deg, ${EMAIL_BRAND.highlightBg} 0%, ${EMAIL_BRAND.white} 100%);
    color: ${EMAIL_BRAND.charcoal};
    padding: 40px 30px;
    text-align: center;
    border-bottom: 1px solid ${EMAIL_BRAND.border};
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: ${EMAIL_BRAND.charcoal};
  }
  .header p {
    margin: 8px 0 0 0;
    font-size: 14px;
    color: ${EMAIL_BRAND.charcoalLight};
  }
  .content {
    padding: 40px 30px;
    background-color: ${EMAIL_BRAND.white};
  }
  .greeting {
    font-size: 18px;
    color: ${EMAIL_BRAND.charcoal};
    margin: 0 0 20px 0;
  }
  .section {
    margin: 30px 0;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: ${EMAIL_BRAND.charcoal};
    margin: 0 0 15px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  .info-table td {
    padding: 12px 0;
    border-bottom: 1px solid ${EMAIL_BRAND.border};
  }
  .info-table .label {
    font-weight: 600;
    color: ${EMAIL_BRAND.charcoalLight};
    width: 40%;
  }
  .info-table .value {
    color: ${EMAIL_BRAND.charcoal};
  }
  .highlight-box {
    background: ${EMAIL_BRAND.highlightBg};
    border-left: 4px solid ${EMAIL_BRAND.sage};
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  .highlight-box p {
    margin: 0;
    color: ${EMAIL_BRAND.charcoal};
  }
  .warning-box {
    background: #2a2517;
    border-left: 4px solid #c99a3a;
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  .warning-box p {
    margin: 0;
    color: #e8d9b0;
  }
  .cta-button {
    display: inline-block;
    background: ${EMAIL_BRAND.bone};
    color: ${EMAIL_BRAND.onAccent} !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .footer {
    background-color: ${EMAIL_BRAND.canvas};
    padding: 30px;
    text-align: center;
    border-top: 1px solid ${EMAIL_BRAND.border};
  }
  .footer-tagline {
    font-size: 13px;
    color: ${EMAIL_BRAND.charcoalLight};
    margin: 0 0 15px 0;
  }
  .footer-contact {
    font-size: 13px;
    color: ${EMAIL_BRAND.charcoalLight};
    margin: 5px 0;
  }
  .footer-contact a {
    color: ${EMAIL_BRAND.charcoal};
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background-color: ${EMAIL_BRAND.border};
    margin: 25px 0;
  }
  .badge {
    display: inline-block;
    background-color: ${EMAIL_BRAND.highlightBg};
    color: ${EMAIL_BRAND.charcoal};
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    margin: 5px 0;
  }
`;

export function buildEmailFooter(tagline = "Custom Cabinetry"): string {
  return `
    <div class="footer">
      ${buildTextLogo()}
      <p class="footer-tagline">${escapeHtml(tagline)}</p>
      <p class="footer-contact">${escapeHtml(`${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state} · ${SITE_CONFIG.serviceAreaLabel}`)}</p>
      <p class="footer-contact">Phone: <a href="${SITE_CONFIG.phoneHref}">${escapeHtml(SITE_CONFIG.phone)}</a></p>
      <p class="footer-contact">Email: <a href="mailto:${escapeHtml(SITE_CONFIG.email)}">${escapeHtml(SITE_CONFIG.email)}</a></p>
      <p class="footer-contact">Web: <a href="${SITE_BASE_URL}">${escapeHtml(SITE_BASE_URL.replace(/^https?:\/\//, ""))}</a></p>
    </div>
  `;
}

export function wrapEmailHtml(options: {
  title: string;
  subtitle?: string;
  tagline?: string;
  content: string;
}): string {
  const { title, subtitle, tagline = "Custom Cabinetry", content } = options;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    ${emailStyles}
  </style>
</head>
<body style="background-color:${EMAIL_BRAND.canvas}; color:${EMAIL_BRAND.charcoal};">
  <div class="email-wrapper">
    <div class="header">
      ${buildTextLogo()}
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    </div>
    <div class="content">
      ${content}
    </div>
    ${buildEmailFooter(tagline)}
  </div>
</body>
</html>`;
}

/** Canonical address for all outbound mail and internal notifications */
export const PLATFORM_EMAIL = SITE_CONFIG.email;

export async function getAdminRecipientEmails(
  _fallbackEmail?: string
): Promise<string[]> {
  return [PLATFORM_EMAIL];
}

export function formatFromAddress(_fromEmail?: string): string {
  // Show Nick as the sender so every email reads like a note from the owner.
  // The underlying address, domain, and reply-to are intentionally unchanged.
  return `${SITE_CONFIG.senderDisplayName} <${PLATFORM_EMAIL}>`;
}

export function getReplyToAddress(): string {
  return PLATFORM_EMAIL;
}

/**
 * Nick's personal sign-off, shared by every template so the whole system
 * speaks in one consistent, warm voice. Pass a different closing line when a
 * lighter or more internal tone fits (e.g. "Thanks," on admin notifications).
 */
export function buildOwnerSignatureHtml(closing = "Warmly,"): string {
  return `
    <p style="margin: 28px 0 0 0; color: ${EMAIL_BRAND.charcoal}; line-height: 1.5;">
      ${escapeHtml(closing)}<br>
      <strong>${escapeHtml(SITE_CONFIG.owner.name)}</strong><br>
      ${escapeHtml(SITE_CONFIG.owner.title)}, ${escapeHtml(SITE_CONFIG.name)}<br>
      <a href="${SITE_CONFIG.phoneHref}" style="color: ${EMAIL_BRAND.charcoal}; text-decoration: none;">${escapeHtml(SITE_CONFIG.phone)}</a>
    </p>
  `;
}

/**
 * The Colorado-to-Boise brand story plus a low-pressure invitation to talk or
 * bid. For HOMEOWNER-facing mail only. Contractor and admin emails keep Nick's
 * voice and signature but never get this homeowner pitch.
 */
export function buildHomeownerStoryHtml(): string {
  return `
    <div class="highlight-box">
      <p style="margin: 0;">A little about me: I spent several years running a remodeling business in Colorado before my family moved out to Boise and I opened ${escapeHtml(SITE_CONFIG.name)}. I brought that same care for craftsmanship with me, I use genuinely high quality materials, and I keep my pricing about as competitive as you will find anywhere in the Treasure Valley. If it is ever helpful, I would be glad to bid on your project or simply talk through your ideas. No pressure at all.</p>
    </div>
  `;
}
