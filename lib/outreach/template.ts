import { SITE_CONFIG } from "@/shared/siteConfig";
import { getOutreachPostalAddress, getOutreachSenderName } from "@/lib/outreach/config";

/**
 * Outreach email copy. Goals: sounds like a real person wrote it, warm and
 * low-pressure, never salesy, and contains ZERO em-dashes anywhere (subject or
 * body). The footer carries the CAN-SPAM required elements: a valid postal
 * address, a clear opt-out, and an honest description of why they received it.
 *
 * Templates are a fixed, code-defined set chosen from a menu (no arbitrary
 * admin-authored bodies). Each template still outputs subject/html/text, keeps
 * the CAN-SPAM footer + unsubscribe, supports the personalization note, embeds
 * the open-tracking pixel only on real sends, and strips em/en-dashes.
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

const SUBJECT_VARIANTS = [
  (name: string) => `Cabinet help for ${name}'s projects`,
  (name: string) => `Quick note from a local cabinet shop`,
  (_name: string) => `Cabinets for your remodels in the Treasure Valley`,
  (_name: string) => `A local cabinet partner for your builds`,
];

const BRANDED_SUBJECT_VARIANTS = [
  (_name: string) => `${SITE_CONFIG.name}, your local cabinet partner`,
  (name: string) => `Custom cabinets for ${name}`,
  (_name: string) => `A cabinet bid partner here in the Treasure Valley`,
];

const OPENERS = [
  (name: string, city: string) =>
    `I came across ${name} while looking at general contractors around ${city} and wanted to introduce myself.`,
  (name: string, city: string) =>
    `I run a small cabinet shop here in the Treasure Valley and found ${name} while looking up builders in ${city}.`,
  (name: string, city: string) =>
    `I noticed ${name} does general contracting in ${city}, so I figured I would reach out.`,
];

function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
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

export interface OutreachCopyInput {
  businessName: string;
  city: string;
  personalizationNote?: string | null;
  unsubscribeUrl: string;
  seed: string;
  // Which named template/voice to render. Falls back to the default when unset
  // or unrecognized so existing prospects never break.
  templateKey?: string | null;
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
  const { businessName, city, personalizationNote, unsubscribeUrl, seed, openTrackingUrl } = input;
  const senderName = getOutreachSenderName();
  const postal = getOutreachPostalAddress();

  const subject = stripDashes(pick(SUBJECT_VARIANTS, seed)(businessName));
  const opener = stripDashes(pick(OPENERS, seed)(businessName, city));

  const noteLine = personalizationNote?.trim()
    ? `${stripDashes(personalizationNote.trim())} `
    : "";

  const pitch = `We build custom cabinets here in the valley, and we work with contractors who would rather hand off the cabinet part of a job than manage it in house. Our pricing is fair and competitive, and the work is solid, well built cabinets your clients will be happy with, so you can keep both the budget and the quality where they need to be. If it is ever helpful, I am happy to put together a bid on your next kitchen, bath, or built in and handle the design and build so you can stay focused on the rest of the project.`;

  const bodyLines = [
    `Hi there,`,
    ``,
    opener,
    ``,
    `${noteLine}${pitch}`,
    ``,
    `No pressure at all. If you ever have a job coming up where cabinets would be useful to price out, just reply to this email or give me a call at ${SITE_CONFIG.phone} and I will take care of it.`,
    ``,
    `Thanks for your time,`,
    senderName,
    SITE_CONFIG.name,
    SITE_CONFIG.phone,
  ];

  const text = stripDashes(
    [...bodyLines, ``, ...footerTextLines({ businessName, city, postal, unsubscribeUrl })].join("\n"),
  );

  const paragraphs = [
    esc(opener),
    `${noteLine ? esc(noteLine) : ""}${pitch}`,
    `No pressure at all. If you ever have a job coming up where cabinets would be useful to price out, just reply to this email or give me a call at ${esc(SITE_CONFIG.phone)} and I will take care of it.`,
  ];

  const html = stripDashes(`<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #222;">
  <p>Hi there,</p>
  ${paragraphs.map((p) => `<p>${p}</p>`).join("\n  ")}
  <p>Thanks for your time,<br>
  ${esc(senderName)}<br>
  ${esc(SITE_CONFIG.name)}<br>
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
  const { businessName, city, personalizationNote, unsubscribeUrl, seed, openTrackingUrl } = input;
  const senderName = getOutreachSenderName();
  const postal = getOutreachPostalAddress();

  const subject = stripDashes(pick(BRANDED_SUBJECT_VARIANTS, seed)(businessName));
  const opener = stripDashes(pick(OPENERS, seed)(businessName, city));

  const noteLine = personalizationNote?.trim()
    ? `${stripDashes(personalizationNote.trim())} `
    : "";

  const intro = `${noteLine}I am with ${SITE_CONFIG.name}, a local custom cabinet shop. We partner with general contractors who would rather hand off the cabinet portion of a remodel than manage it in house.`;

  const bullets = [
    `Custom kitchens, baths, and built ins designed and built here in the valley.`,
    `Fair, competitive pricing that keeps your project budget on track.`,
    `Solid, well built work your clients will be proud of.`,
    `One point of contact for design, build, and install so you can stay focused on the rest of the job.`,
  ];

  const close = `If you have a project coming up where cabinets would be useful to price out, just reply here or call me at ${SITE_CONFIG.phone} and I will put a bid together. No pressure at all.`;

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
      `Thanks for your time,`,
      senderName,
      SITE_CONFIG.name,
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
  <p>Thanks for your time,<br>
  ${esc(senderName)}<br>
  ${esc(SITE_CONFIG.name)}<br>
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
