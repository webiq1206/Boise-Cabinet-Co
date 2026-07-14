/**
 * Outreach sender. Dispatches an APPROVED (human-gated) outreach draft.
 *
 * Safe by default: dry-run unless BACKLINK_SEND_LIVE=true AND RESEND_API_KEY are
 * both set. Even then it only ever processes items a human approved in the
 * dashboard. Uses Resend's HTTP API (no extra dependency); swap for SMTP/other
 * by replacing the transport block. Sending from SITE.outreachFromEmail requires
 * that domain to be verified with the transport.
 */

import { SITE } from "./config";
import type { Opportunity } from "./types";

export interface SendResult {
  ok: boolean;
  mode: "dry-run" | "live";
  detail: string;
}

export async function sendOutreach(opp: Opportunity, toEmail?: string): Promise<SendResult> {
  const draft = opp.outreachDraft ?? "";
  const subject = (draft.match(/^Subject:\s*(.+)$/m)?.[1] ?? `Regarding ${SITE.name}`).trim();
  const body = draft.replace(/^Subject:.*\n\n?/, "");
  const to = toEmail ?? opp.contact?.email;

  const live = process.env.BACKLINK_SEND_LIVE === "true" && Boolean(process.env.RESEND_API_KEY);
  if (!live) {
    return { ok: true, mode: "dry-run", detail: `Would email ${to ?? "(no address on file)"} · subject "${subject}"` };
  }
  if (!to) return { ok: false, mode: "live", detail: "No recipient email on file (contact discovery pending)" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: SITE.outreachFromEmail, to, subject, text: body }),
  });
  if (!res.ok) return { ok: false, mode: "live", detail: `Resend ${res.status}: ${await res.text()}` };
  return { ok: true, mode: "live", detail: `Sent to ${to}` };
}
