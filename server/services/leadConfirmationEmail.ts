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

const ESTIMATE_THANKS_MARKER = "Your preliminary estimate is below, and the complete estimate is attached as a PDF.</p>";

const ESTIMATE_VIEW_ANCHOR = ">View or update your estimate online</a>";

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
 * The mounted estimator already builds the full preliminary-estimate email in
 * the shared engine. That file cannot change in this repo. This adds the
 * Schedule now button and the estimate disclaimer to the customer copy only,
 * at send time. Team, alert and project-request messages pass through unchanged
 * so the shared intake transport test still sees the original bytes.
 */
export function decoratePreliminaryEstimateEmail<T extends { subject: string; text: string; html?: string }>(input: T): T {
  const prefix = `Your ${SITE_CONFIG.name} preliminary estimate`;
  if (!input.subject.startsWith(prefix)) return input;
  if (input.text.includes(SCHEDULE_URL) || (input.html ?? "").includes(SCHEDULE_URL)) return input;

  const schedule =
    paragraph(ESTIMATE_NEXT) +
    bulletproofButton({ href: SCHEDULE_URL, label: "Schedule now", variant: "primary", accent: CABINET_EMAIL_ACCENT }) +
    `<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>`;
  let html = input.html;
  if (html && html.includes(ESTIMATE_THANKS_MARKER)) {
    html = html.replace(ESTIMATE_THANKS_MARKER, ESTIMATE_THANKS_MARKER + schedule);
    const anchorAt = html.indexOf(ESTIMATE_VIEW_ANCHOR);
    if (anchorAt >= 0) {
      const tableEnd = html.indexOf("</table>", anchorAt);
      if (tableEnd >= 0) {
        const cut = tableEnd + "</table>".length;
        html = html.slice(0, cut) + paragraph(ESTIMATE_DISCLAIMER) + html.slice(cut);
      }
    } else {
      html = html.replace(ESTIMATE_THANKS_MARKER + schedule, ESTIMATE_THANKS_MARKER + schedule + paragraph(ESTIMATE_DISCLAIMER));
    }
  } else if (html) {
    const block = schedule + paragraph(ESTIMATE_DISCLAIMER);
    html = html.includes("</body>") ? html.replace("</body>", block + "</body>") : html + block;
  }

  const lead = `${ESTIMATE_NEXT}\n\nSchedule now: ${SCHEDULE_URL}\n\n`;
  const viewRe = /View or update your estimate online:[^\n]*\n/;
  const text = viewRe.test(input.text)
    ? input.text.replace(viewRe, (line) => `${lead}${line}\n${ESTIMATE_DISCLAIMER}\n\n`)
    : `${input.text}\n\n${lead}${ESTIMATE_DISCLAIMER}\n`;

  return { ...input, text, html };
}
