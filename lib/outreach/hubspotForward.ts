import { mailboxAddress } from "@/lib/emailDelivery";
import { SITE_CONFIG } from "@/shared/siteConfig";

// Verified in P5 Home Co portal 247066159. The Cabinet From address is a
// registered alias of that portal's connected hello@p5homeco.com account.
export const HUBSPOT_FORWARD_ADDRESS = "247066159@forward.na2.hubspot.com";

type ReceivedEmail = {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject?: string | null;
  created_at: string;
  headers?: Record<string, string>;
  message_id?: string | null;
};

function headerText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function header(message: ReceivedEmail, name: string): string {
  const value = Object.entries(message.headers ?? {})
    .find(([key]) => key.toLowerCase() === name)?.[1];
  return typeof value === "string" ? headerText(value) : "";
}

function sourceDate(value: string): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * HubSpot's forwarding parser needs the original-message header in both MIME
 * alternatives. An external Reply-To on a self-addressed inbox copy is not
 * enough. This is a CRM-only copy; the existing human-inbox payload stays the
 * same. Provider acceptance still requires a separate live CRM logging check.
 */
export function buildHubSpotForward(
  message: ReceivedEmail,
  content: { plainText: string; html: string; attachmentNotice: string },
) {
  const fromLine = headerText(message.from);
  const from = mailboxAddress(fromLine.match(/<([^>]+)>/)?.[1] ?? fromLine);
  const to = message.to?.map(mailboxAddress) ?? [];
  if (!to.length) throw new Error("Received email has no original recipients for HubSpot forwarding");
  const cc = message.cc?.map(mailboxAddress) ?? [];
  // The receipt timestamp comes from Resend, never from the time of a retry.
  const receivedAt = sourceDate(message.created_at);
  if (!receivedAt) throw new Error("Received email date is missing or invalid for HubSpot forwarding");
  const originalDate = sourceDate(header(message, "date"));
  const subject = headerText(message.subject ?? "");
  const lines = [
    "---------- Forwarded message ---------",
    `From: ${fromLine}`,
    `Date: ${(originalDate ?? receivedAt).toUTCString()}`,
    `Subject: ${subject || "(no subject)"}`,
    `To: ${to.join(", ")}`,
    ...(cc.length ? [`Cc: ${cc.join(", ")}`] : []),
  ];
  const messageId = headerText(message.message_id || header(message, "message-id") || "(unavailable)");
  const reference = [
    `Original Message-ID: ${messageId}`,
    `Resend received email: ${message.id}`,
    `Received at: ${receivedAt.toISOString()}`,
    ...(!originalDate ? ["Forwarded Date uses the provider receipt time because the original Date header was missing or invalid."] : []),
    ...(content.attachmentNotice ? [content.attachmentNotice] : []),
  ].join("\n");
  return {
    from: `${SITE_CONFIG.senderDisplayName} <${SITE_CONFIG.email}>`,
    to: HUBSPOT_FORWARD_ADDRESS,
    replyTo: from,
    subject: `Fwd: ${subject || "(no subject)"}`,
    text: `${lines.join("\n")}\n\n${content.plainText || "(This reply has no message text.)"}\n\n${reference}`,
    html: `<div class="gmail_quote"><div dir="ltr" class="gmail_attr">${lines.map(escapeHtml).join("<br/>")}</div><br/>${content.html || `<pre>${escapeHtml(content.plainText)}</pre>`}<hr/><pre>${escapeHtml(reference)}</pre></div>`,
  };
}
