/**
 * Lead confirmation copy and the Schedule now button.
 *
 * One booking page serves every brand. The URL cannot preselect a length, so
 * the sentence above the button tells the lead which option to choose:
 * 1 hour for a home walkthrough, 15 minutes for a phone consult.
 *
 * The button is a table, with Outlook VML beside it, so Gmail, Outlook and
 * iOS Mail all show a real button without depending on a stylesheet.
 *
 * Copy and markup match p5-home-co app/lib/leads/scheduleEmail.ts. This site
 * speaks as Boise Cabinet Co. The guided instant estimator confirmation is
 * sent by p5homeco.com, not from this file.
 *
 * After the estimate (owner request, 16 November 2026): an email that tells a
 * customer about an estimate greets with "Hey", invites them to adjust it
 * (ESTIMATE_ADJUST_NOTE, before the disclaimer) and ends with the family
 * question (ESTIMATE_FAMILY_PS, the last paragraph). The words live here and
 * nowhere else. A request confirmation and every team email do not carry them.
 */

import type { Message } from "./leadConfirmationMessage";
import { SITE_CONFIG } from "@/shared/siteConfig";

/** HubSpot meetings page. Durations on the page are 15, 30, 60 and 120 minutes. */
export const SCHEDULE_URL = "https://meetings-na2.hubspot.com/client3";

export const BUTTON_CHARCOAL = "#383837";
export const BUTTON_WHITE = "#ffffff";
export const BUTTON_PAPER = "#fbfaf6";

/** Teal accent bar under the button (family brand accent on this site). */
export const CABINET_EMAIL_ACCENT = "#659b9a";

export type ScheduleIntent = "walkthrough" | "consult";

const ESTIMATE_DISCLAIMER =
  "We work hard to make that estimate as realistic as we can, but we can't give you a true bid until we walk the property. Depending on the scope and what we find, the bid may come in higher or lower than this first estimate. Either way, we'll work with you to get you what you want, within your budget.";

const SHARED_DISCLAIMER =
  "We work hard to make any estimate we share as realistic as we can, but we can't give you a true bid until we walk the property. Depending on the scope and what we find, the bid may come in higher or lower than that first estimate. Either way, we'll work with you to get you what you want, within your budget.";

const ESTIMATE_NEXT =
  "The next step is a home walkthrough, so we can see the property and turn this estimate into a true bid. On the scheduling page, choose the 1 hour option.";

/** Sits before the estimate disclaimer in every customer email about an estimate. */
export const ESTIMATE_ADJUST_NOTE =
  "If something is missing, or you'd like to change the scope, the finishes or the timing, tell us. It's easy to adjust, and we'd rather get it right than have you guessing.";

/** The last paragraph of every customer email about an estimate. A question, never a pitch. */
export const ESTIMATE_FAMILY_PS =
  "P.S. Anything else on your list? Boise Cabinet Co is part of P5 Home Co, the company behind Boise Construction Co, Boise Remodeling Co and Boise Handyman Co. So whether it's a few repairs, new cabinets, a full kitchen or bath remodel, an addition or a new home, tell us and we'll plan it alongside this project.";

const ESTIMATE_THANKS_MARKER = "Your preliminary estimate is below, and the complete estimate is attached as a PDF.</p>";

const ESTIMATE_VIEW_ANCHOR = ">View or update your estimate online</a>";

/** The shared template opens "Hi <first>," directly above its thank-you line. "Hello," (no name) is left alone. */
const ESTIMATE_GREETING = />Hi ([^<>]+,)<\/p>(?=<p [^>]*>Thank you for using the )/;

/**
 * Where the shared customer layout ends its letter and starts its footer (the
 * row with the brand name, phone, email and legal line).
 */
const ESTIMATE_FOOTER_START = '</td></tr>\n <tr><td class="pad" style="padding:18px 28px 22px;border-top:';

export function scheduleIntentFor(input: { requestKind?: string | null; form?: string | null }): ScheduleIntent {
  const kind = (input.requestKind ?? "").trim().toLowerCase();
  const form = (input.form ?? "").trim().toLowerCase();
  if (kind === "callback" || form === "site chat" || form.includes("call you")) return "consult";
  return "walkthrough";
}

/** The words that tell the lead which length to pick on the shared booking page. */
export function durationChoice(intent: ScheduleIntent): string {
  return intent === "consult" ? "the 15 minute option for a phone consult" : "the 1 hour option for a home walkthrough";
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(value: string): string {
  const trimmed = value.trim();
  if (!/^https:\/\/[^\s"'<>]+$/.test(trimmed)) return SCHEDULE_URL;
  return trimmed;
}

function safeAccent(value: string | undefined): string {
  return /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? (value as string) : CABINET_EMAIL_ACCENT;
}

function greetingName(firstName: string | null | undefined): string {
  const name = (firstName ?? "").trim();
  return name || "there";
}

function contactLine(phone: string | undefined): string {
  const shown = (phone ?? "").trim() || SITE_CONFIG.phone;
  return `If you have questions, just reply to this email or call ${shown}.`;
}

/**
 * A full-width button. Primary is charcoal with white text and a brand
 * accent bar. Secondary is an outline on paper, shorter, so it reads as
 * the quieter action.
 */
export function bulletproofButton(options: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  accent?: string;
}): string {
  const href = esc(safeHref(options.href));
  const label = esc(options.label);
  const accent = safeAccent(options.accent);
  if (options.variant === "secondary") {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
<tr>
<td align="center" bgcolor="${BUTTON_PAPER}" style="background-color:${BUTTON_PAPER};border:2px solid ${BUTTON_CHARCOAL};">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:520px;" arcsize="4%" strokecolor="${BUTTON_CHARCOAL}" fillcolor="${BUTTON_PAPER}">
<w:anchorlock/>
<center style="color:${BUTTON_CHARCOAL};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${href}" target="_blank" style="display:block;padding:12px 20px;background-color:${BUTTON_PAPER};color:${BUTTON_CHARCOAL};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:20px;text-align:center;text-decoration:none;border:0;mso-hide:all;">${label}</a>
<!--<![endif]-->
</td>
</tr>
</table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:8px 0 0;">
<tr>
<td align="center" bgcolor="${BUTTON_CHARCOAL}" style="background-color:${BUTTON_CHARCOAL};">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:56px;v-text-anchor:middle;width:520px;" arcsize="4%" strokecolor="${BUTTON_CHARCOAL}" fillcolor="${BUTTON_CHARCOAL}">
<w:anchorlock/>
<center style="color:${BUTTON_WHITE};font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${href}" target="_blank" style="display:block;padding:16px 24px;background-color:${BUTTON_CHARCOAL};color:${BUTTON_WHITE};font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;line-height:24px;text-align:center;text-decoration:none;border:0;mso-hide:all;">${label}</a>
<!--<![endif]-->
</td>
</tr>
<tr>
<td bgcolor="${accent}" style="background-color:${accent};height:4px;font-size:0;line-height:0;">&nbsp;</td>
</tr>
</table>`;
}

function wrapHtml(inner: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:${BUTTON_CHARCOAL};max-width:560px;font-size:16px;line-height:1.6;">${inner}</div>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;">${esc(text)}</p>`;
}

export type RequestConfirmationInput = {
  firstName: string | null;
  brandName: string;
  intent: ScheduleIntent;
  phone?: string;
  accent?: string;
};

/** Short request, quote form, design pricing, and the same note when an email arrives on step 2. */
export function requestConfirmation(input: RequestConfirmationInput): Message {
  const first = greetingName(input.firstName);
  const brandName = input.brandName.trim() || SITE_CONFIG.name;
  const phone = contactLine(input.phone);
  const subject = `We have your request, ${first}`;
  const thanks = `Thanks for reaching out to ${brandName}. We have your request, and someone from the team will follow up shortly.`;
  const next = `If you would like to get on the calendar now, use the button below and choose ${durationChoice(input.intent)}.`;
  const signoff = `The ${brandName} team`;
  const text = [
    `Hi ${first},`,
    "",
    thanks,
    "",
    next,
    "",
    `Schedule now: ${SCHEDULE_URL}`,
    "",
    SHARED_DISCLAIMER,
    "",
    phone,
    "",
    signoff,
  ].join("\n");
  const html = wrapHtml(
    [
      paragraph(`Hi ${first},`),
      paragraph(thanks),
      paragraph(next),
      bulletproofButton({ href: SCHEDULE_URL, label: "Schedule now", variant: "primary", accent: input.accent ?? CABINET_EMAIL_ACCENT }),
      `<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>`,
      paragraph(SHARED_DISCLAIMER),
      paragraph(phone),
      paragraph(signoff),
    ].join(""),
  );
  return { subject, text, html };
}

/**
 * The P.S. closes the letter. In the shared layout it is the last paragraph of
 * the body, directly above the brand footer; any other markup gets a closing
 * paragraph.
 */
function appendFamilyPs(html: string): string {
  const footer = html.lastIndexOf(ESTIMATE_FOOTER_START);
  if (footer >= 0) {
    const ps = `<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${BUTTON_CHARCOAL};">${esc(ESTIMATE_FAMILY_PS)}</p>`;
    return html.slice(0, footer) + ps + html.slice(footer);
  }
  const body = html.lastIndexOf("</body>");
  const ps = paragraph(ESTIMATE_FAMILY_PS);
  return body >= 0 ? html.slice(0, body) + ps + html.slice(body) : html + ps;
}

/**
 * The mounted estimator already builds the full preliminary-estimate email in
 * the shared engine. That file cannot change in this repo. This adds, to the
 * customer copy only and at send time: the "Hey" greeting, the Schedule now
 * button, the adjust note above the estimate disclaimer, and the family P.S.
 * as the last paragraph. Team, alert and project-request messages pass through
 * unchanged so the shared intake transport test still sees the original bytes.
 */
export function decoratePreliminaryEstimateEmail<T extends { subject: string; text: string; html?: string }>(input: T): T {
  const prefix = `Your ${SITE_CONFIG.name} preliminary estimate`;
  if (!input.subject.startsWith(prefix)) return input;
  if (input.text.includes(SCHEDULE_URL) || (input.html ?? "").includes(SCHEDULE_URL)) return input;

  const schedule =
    paragraph(ESTIMATE_NEXT) +
    bulletproofButton({ href: SCHEDULE_URL, label: "Schedule now", variant: "primary", accent: CABINET_EMAIL_ACCENT }) +
    `<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>`;
  const closing = paragraph(ESTIMATE_ADJUST_NOTE) + paragraph(ESTIMATE_DISCLAIMER);
  let html = input.html;
  if (html && html.includes(ESTIMATE_THANKS_MARKER)) {
    html = html.replace(ESTIMATE_GREETING, (_match, name: string) => `>Hey ${name}</p>`);
    html = html.replace(ESTIMATE_THANKS_MARKER, ESTIMATE_THANKS_MARKER + schedule);
    const anchorAt = html.indexOf(ESTIMATE_VIEW_ANCHOR);
    if (anchorAt >= 0) {
      const tableEnd = html.indexOf("</table>", anchorAt);
      if (tableEnd >= 0) {
        const cut = tableEnd + "</table>".length;
        html = html.slice(0, cut) + closing + html.slice(cut);
      }
    } else {
      html = html.replace(ESTIMATE_THANKS_MARKER + schedule, ESTIMATE_THANKS_MARKER + schedule + closing);
    }
  } else if (html) {
    const block = schedule + closing;
    html = html.includes("</body>") ? html.replace("</body>", block + "</body>") : html + block;
  }
  if (html) html = appendFamilyPs(html);

  const lead = `${ESTIMATE_NEXT}\n\nSchedule now: ${SCHEDULE_URL}\n\n`;
  const after = `${ESTIMATE_ADJUST_NOTE}\n\n${ESTIMATE_DISCLAIMER}`;
  const viewRe = /View or update your estimate online:[^\n]*\n/;
  const body = viewRe.test(input.text)
    ? input.text.replace(viewRe, (line) => `${lead}${line}\n${after}\n\n`)
    : `${input.text}\n\n${lead}${after}\n`;
  const text = `${body.replace(/\s+$/, "")}\n\n${ESTIMATE_FAMILY_PS}`;

  return { ...input, text, html };
}
