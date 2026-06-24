import { SITE_CONFIG } from "@/shared/siteConfig";
import { getOutreachPostalAddress } from "@/lib/outreach/config";
import {
  DEFAULT_TEMPLATE_CONTENT,
  applyTokens,
  type OutreachTemplateContent,
  type TemplateTokens,
} from "@/lib/outreach/templateContent";

/**
 * Outreach email copy. Goals: sounds like a real person wrote it, warm and
 * low-pressure, never salesy, and contains ZERO em-dashes anywhere (subject or
 * body). The footer carries the CAN-SPAM required elements: a valid postal
 * address, a clear opt-out, and an honest description of why they received it.
 *
 * The human wording (subject, opener, message, closing) is admin-editable and
 * passed in as `content` (see lib/outreach/templateContent.ts). When omitted we
 * fall back to the code defaults so previews and sends never break. The
 * structure, signature, footer, and safety stripping stay code-owned.
 */

export type OutreachTemplateKey = "personal" | "branded";

export const DEFAULT_TEMPLATE_KEY: OutreachTemplateKey = "personal";

export const OUTREACH_TEMPLATE_OPTIONS: {
  key: OutreachTemplateKey;
  label: string;
  description: string;
}[] = [
  {
    key: "personal",
    label: "Personal note",
    description: "Plain and low key, reads like a real person typed it out.",
  },
  {
    key: "branded",
    label: "Branded intro",
    description: "A warmer, more structured introduction to the cabinet shop.",
  },
];

export const OUTREACH_TEMPLATE_KEYS = OUTREACH_TEMPLATE_OPTIONS.map((o) => o.key);

export function isValidTemplateKey(
  key: string | null | undefined,
): key is OutreachTemplateKey {
  return !!key && (OUTREACH_TEMPLATE_KEYS as string[]).includes(key);
}

/** Resolve an effective template key, falling back to the default. */
export function resolveTemplateKey(
  key: string | null | undefined,
): OutreachTemplateKey {
  return isValidTemplateKey(key) ? key : DEFAULT_TEMPLATE_KEY;
}

/** Strip any em-dash or en-dash defensively, even from dynamic inputs. */
function stripDashes(s: string): string {
  return s.replace(/[\u2014\u2013]/g, ",");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function tokensFor(businessName: string, city: string): TemplateTokens {
  return {
    business: businessName,
    city,
    owner: SITE_CONFIG.owner.name,
    company: SITE_CONFIG.name,
    phone: SITE_CONFIG.phone,
  };
}

export interface OutreachCopyInput {
  businessName: string;
  city: string;
  personalizationNote?: string | null;
  unsubscribeUrl: string;
  seed: string;
  // Which named template/voice to render. Falls back to the default when unset
  // or unrecognized so existing prospects never break.
  templateKey?: string | null;
  // Admin-editable wording. Falls back to code defaults when omitted.
  content?: OutreachTemplateContent | null;
  // When provided, a 1x1 tracking pixel pointing at this URL is embedded in the
  // HTML body so we can record opens where the recipient's mail client loads
  // remote images. Omitted for previews.
  openTrackingUrl?: string | null;
}

export interface OutreachCopy {
  subject: string;
  html: string;
  text: string;
}

interface FooterParts {
  businessName: string;
  city: string;
  postal: string;
  unsubscribeUrl: string;
}

/** Plain-text CAN-SPAM footer lines shared by every template. */
function footerTextLines({ businessName, city, postal, unsubscribeUrl }: FooterParts): string[] {
  return [
    `---`,
    `You received this note because ${businessName} is publicly listed as a general contractor in ${city}, Idaho. This is a one time business introduction from ${SITE_CONFIG.name}.`,
    `Our mailing address: ${postal}`,
    `If you would rather not hear from us, unsubscribe here: ${unsubscribeUrl}`,
  ];
}

/** HTML CAN-SPAM footer block shared by every template. */
function footerHtml({ businessName, city, postal, unsubscribeUrl }: FooterParts): string {
  return `<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
  <p style="font-size:12px;color:#888;">
    You received this note because ${esc(businessName)} is publicly listed as a general contractor in ${esc(city)}, Idaho. This is a one time business introduction from ${esc(SITE_CONFIG.name)}.<br>
    Our mailing address: ${esc(postal)}<br>
    If you would rather not hear from us, <a href="${esc(unsubscribeUrl)}" style="color:#888;">unsubscribe here</a>.
  </p>`;
}

/** Open-tracking pixel, only ever included for real sends. */
function trackingPixel(openTrackingUrl?: string | null): string {
  return openTrackingUrl
    ? `\n  <img src="${esc(openTrackingUrl)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`
    : "";
}

/**
 * "Personal note" template: intentionally plain, like a normal person's email.
 * No marketing template, no banner image, no heavy branding, which both reads
 * as human and keeps spam signals low.
 */
function buildPersonalCopy(input: OutreachCopyInput): OutreachCopy {
  const { businessName, city, personalizationNote, unsubscribeUrl, openTrackingUrl } = input;
  const postal = getOutreachPostalAddress();
  const c = (input.content ?? DEFAULT_TEMPLATE_CONTENT).personal;
  const tokens = tokensFor(businessName, city);

  const subject = stripDashes(applyTokens(c.subject, tokens));
  const opener = stripDashes(applyTokens(c.opener, tokens));
  const pitch = stripDashes(applyTokens(c.pitch, tokens));
  const closing = stripDashes(applyTokens(c.closing, tokens));

  const noteLine = personalizationNote?.trim()
    ? `${stripDashes(personalizationNote.trim())} `
    : "";

  const bodyLines = [
    `Hi there,`,
    ``,
    opener,
    ``,
    `${noteLine}${pitch}`,
    ``,
    closing,
    ``,
    `Warmly,`,
    SITE_CONFIG.owner.name,
    `${SITE_CONFIG.owner.title}, ${SITE_CONFIG.name}`,
    SITE_CONFIG.phone,
  ];

  const text = stripDashes(
    [...bodyLines, ``, ...footerTextLines({ businessName, city, postal, unsubscribeUrl })].join("\n"),
  );

  const paragraphs = [
    esc(opener),
    `${noteLine ? esc(noteLine) : ""}${esc(pitch)}`,
    esc(closing),
  ];

  const html = stripDashes(`<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #222;">
  <p>Hi there,</p>
  ${paragraphs.map((p) => `<p>${p}</p>`).join("\n  ")}
  <p>Warmly,<br>
  ${esc(SITE_CONFIG.owner.name)}<br>
  ${esc(SITE_CONFIG.owner.title)}, ${esc(SITE_CONFIG.name)}<br>
  ${esc(SITE_CONFIG.phone)}</p>
  ${footerHtml({ businessName, city, postal, unsubscribeUrl })}${trackingPixel(openTrackingUrl)}
</div>`);

  return { subject, html, text };
}

/**
 * "Branded intro" template: still warm and low-pressure, but a more structured
 * company introduction with light branding and a short, scannable list of what
 * the shop offers. Distinct voice from the plain personal note.
 */
function buildBrandedCopy(input: OutreachCopyInput): OutreachCopy {
  const { businessName, city, personalizationNote, unsubscribeUrl, openTrackingUrl } = input;
  const postal = getOutreachPostalAddress();
  const c = (input.content ?? DEFAULT_TEMPLATE_CONTENT).branded;
  const tokens = tokensFor(businessName, city);

  const subject = stripDashes(applyTokens(c.subject, tokens));
  const opener = stripDashes(applyTokens(DEFAULT_TEMPLATE_CONTENT.personal.opener, tokens));

  const noteLine = personalizationNote?.trim()
    ? `${stripDashes(personalizationNote.trim())} `
    : "";

  const intro = `${noteLine}${stripDashes(applyTokens(c.intro, tokens))}`;
  const bullets = c.bullets.map((b) => stripDashes(applyTokens(b, tokens)));
  const close = stripDashes(applyTokens(c.closing, tokens));

  const text = stripDashes(
    [
      `Hi there,`,
      ``,
      opener,
      ``,
      intro,
      ``,
      `What we do:`,
      ...bullets.map((b) => `- ${b}`),
      ``,
      close,
      ``,
      `Warmly,`,
      SITE_CONFIG.owner.name,
      `${SITE_CONFIG.owner.title}, ${SITE_CONFIG.name}`,
      SITE_CONFIG.phone,
      ``,
      ...footerTextLines({ businessName, city, postal, unsubscribeUrl }),
    ].join("\n"),
  );

  const html = stripDashes(`<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #222;">
  <p style="font-size:18px;font-weight:bold;color:#9a4a2a;margin:0 0 4px;">${esc(SITE_CONFIG.name)}</p>
  <p style="font-size:12px;color:#888;margin:0 0 16px;">Custom cabinets for contractors in the Treasure Valley</p>
  <p>Hi there,</p>
  <p>${esc(opener)}</p>
  <p>${esc(intro)}</p>
  <p style="margin-bottom:4px;"><strong>What we do</strong></p>
  <ul style="margin-top:0;padding-left:20px;">
  ${bullets.map((b) => `  <li>${esc(b)}</li>`).join("\n  ")}
  </ul>
  <p>${esc(close)}</p>
  <p>Warmly,<br>
  ${esc(SITE_CONFIG.owner.name)}<br>
  ${esc(SITE_CONFIG.owner.title)}, ${esc(SITE_CONFIG.name)}<br>
  ${esc(SITE_CONFIG.phone)}</p>
  ${footerHtml({ businessName, city, postal, unsubscribeUrl })}${trackingPixel(openTrackingUrl)}
</div>`);

  return { subject, html, text };
}

const BUILDERS: Record<OutreachTemplateKey, (input: OutreachCopyInput) => OutreachCopy> = {
  personal: buildPersonalCopy,
  branded: buildBrandedCopy,
};

export function buildOutreachCopy(input: OutreachCopyInput): OutreachCopy {
  const key = resolveTemplateKey(input.templateKey);
  return BUILDERS[key](input);
}
