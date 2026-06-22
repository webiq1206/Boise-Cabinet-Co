import { SITE_CONFIG } from "@/shared/siteConfig";
import { getOutreachPostalAddress, getOutreachSenderName } from "@/lib/outreach/config";

/**
 * Outreach email copy. Goals: sounds like a real person wrote it, warm and
 * low-pressure, never salesy, and contains ZERO em-dashes anywhere (subject or
 * body). The footer carries the CAN-SPAM required elements: a valid postal
 * address, a clear opt-out, and an honest description of why they received it.
 */

const SUBJECT_VARIANTS = [
  (name: string) => `Cabinet help for ${name}'s projects`,
  (name: string) => `Quick note from a local cabinet shop`,
  (_name: string) => `Cabinets for your remodels in the Treasure Valley`,
  (_name: string) => `A local cabinet partner for your builds`,
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

export interface OutreachCopyInput {
  businessName: string;
  city: string;
  personalizationNote?: string | null;
  unsubscribeUrl: string;
  seed: string;
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

export function buildOutreachCopy(input: OutreachCopyInput): OutreachCopy {
  const { businessName, city, personalizationNote, unsubscribeUrl, seed, openTrackingUrl } = input;
  const senderName = getOutreachSenderName();
  const postal = getOutreachPostalAddress();

  const subject = stripDashes(pick(SUBJECT_VARIANTS, seed)(businessName));
  const opener = stripDashes(pick(OPENERS, seed)(businessName, city));

  const noteLine = personalizationNote?.trim()
    ? `${stripDashes(personalizationNote.trim())} `
    : "";

  // The core pitch: a cabinet bid partner, with a brief, natural mention of the
  // two things contractors actually weigh, price and quality, kept low key so it
  // reads like a person and not a sales blast.
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
    [
      ...bodyLines,
      ``,
      `---`,
      `You received this note because ${businessName} is publicly listed as a general contractor in ${city}, Idaho. This is a one time business introduction from ${SITE_CONFIG.name}.`,
      `Our mailing address: ${postal}`,
      `If you would rather not hear from us, unsubscribe here: ${unsubscribeUrl}`,
    ].join("\n"),
  );

  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Intentionally plain, like a normal person's email. No marketing template,
  // no banner image, no heavy branding, which both reads as human and keeps
  // spam signals low.
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
  <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
  <p style="font-size:12px;color:#888;">
    You received this note because ${esc(businessName)} is publicly listed as a general contractor in ${esc(city)}, Idaho. This is a one time business introduction from ${esc(SITE_CONFIG.name)}.<br>
    Our mailing address: ${esc(postal)}<br>
    If you would rather not hear from us, <a href="${esc(unsubscribeUrl)}" style="color:#888;">unsubscribe here</a>.
  </p>${
    openTrackingUrl
      ? `\n  <img src="${esc(openTrackingUrl)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`
      : ""
  }
</div>`);

  return { subject, html, text };
}
