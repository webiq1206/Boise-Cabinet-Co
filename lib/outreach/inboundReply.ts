import { db } from "@/lib/db";
import { leads, leadActivities, outreachProspects, sequenceEnrollments, siteSettings } from "@/shared/schema";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { getUncachableResendClient } from "@/server/resend";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { assertEmailAccepted, mailboxAddress } from "@/lib/emailDelivery";

export interface InboundReplyData {
  email_id?: string;
  from?: string;
  subject?: string;
}

type Dependencies = {
  database?: typeof db;
  getClient?: typeof getUncachableResendClient;
};

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Recording a reply and delivering its inbox copy are separate milestones.
 * A retry must still forward an existing activity that has no accepted forward.
 * A dedicated receipt in the existing key-value store covers unmatched senders
 * as well. It contains only delivery metadata, never the sender or message body.
 * The provider key covers concurrent retries and recovery after a failed write.
 */
export async function handleInboundReply(
  data: InboundReplyData | undefined,
  { database = db, getClient = getUncachableResendClient }: Dependencies = {},
): Promise<number> {
  if (!database) throw new Error("Reply processing database unavailable");
  const emailId = data?.email_id?.trim();
  if (!emailId || !/^[a-zA-Z0-9_-]{1,128}$/.test(emailId)) {
    throw new Error("Received email ID is missing or invalid");
  }
  const rawFrom = data?.from ?? "";
  const from = mailboxAddress(rawFrom.match(/<([^>]+)>/)?.[1] ?? rawFrom);
  const eventSubject = (data?.subject ?? "").replace(/[\r\n]+/g, " ").trim();
  const receiptKey = `outreach_reply_receipt:${emailId}`;
  const receiptCondition = and(
    eq(leadActivities.type, "email_received"),
    sql`${leadActivities.detail}->>'emailId' = ${emailId}`,
  );

  // Stop sequences even if retrieving or forwarding the message is temporarily
  // unavailable. Lock only the database work, never the provider network calls.
  const state = await database.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(814730, hashtext(${emailId}))`);
    const [receipt] = await tx.select({ value: siteSettings.value }).from(siteSettings)
      .where(eq(siteSettings.key, receiptKey)).limit(1);
    if (receipt) {
      const saved = JSON.parse(receipt.value) as { status?: string; providerId?: string };
      if (saved.status !== "accepted" || !saved.providerId) throw new Error("Invalid reply delivery receipt");
      return { matched: 0, forwarded: true };
    }
    const seen = await tx.select({ leadId: leadActivities.leadId, detail: leadActivities.detail })
      .from(leadActivities).where(receiptCondition);
    if (seen.some((row) => typeof row.detail?.forwardedMessageId === "string")) {
      return { matched: seen.length, forwarded: true };
    }

    const matched = await tx.select({ id: leads.id }).from(leads)
      .where(sql`lower(${leads.email}) = ${from}`);
    const now = new Date();
    const ids = matched.map((lead) => lead.id);
    if (ids.length > 0) {
      await tx.update(leads).set({ emailStatus: "replied", updatedAt: now })
        .where(and(inArray(leads.id, ids), notInArray(leads.emailStatus, ["unsubscribed", "bounced"])));
      await tx.update(sequenceEnrollments).set({ status: "replied", nextDueAt: null })
        .where(and(inArray(sequenceEnrollments.leadId, ids), eq(sequenceEnrollments.status, "active")));
      for (const id of ids) {
        if (seen.some((row) => row.leadId === id)) continue;
        await tx.insert(leadActivities).values({
          leadId: id,
          type: "email_received",
          message: eventSubject ? `Replied: ${eventSubject}` : "Replied to outreach email",
          detail: { from, subject: eventSubject, emailId, forwarding: "pending" },
        });
      }
    }
    // The legacy sender checks repliedAt and status when choosing follow-ups.
    // Existing bounce/unsubscribe state and suppression records stay intact.
    await tx.update(outreachProspects)
      .set({ status: "replied", repliedAt: now, updatedAt: now })
      .where(and(
        sql`lower(${outreachProspects.email}) = ${from}`,
        notInArray(outreachProspects.status, ["unsubscribed", "bounced"]),
      ));
    return { matched: ids.length, forwarded: false };
  });
  if (state.forwarded) return 0;

  // Use the same credential source as sending, including a Replit connector.
  // The SDK uses /emails/receiving/{id}; /emails/received/{id} is not this API.
  const { client } = await getClient();
  const received = await client.emails.receiving.get(emailId);
  if (received.error || !received.data) throw new Error("Could not retrieve received email content");
  const receivedFrom = received.data.from ?? "";
  const authoritativeFrom = mailboxAddress(receivedFrom.match(/<([^>]+)>/)?.[1] ?? receivedFrom);
  if (received.data.id !== emailId || authoritativeFrom !== from) {
    throw new Error("Received email does not match the signed webhook");
  }
  const subject = (received.data.subject ?? "").replace(/[\r\n]+/g, " ").trim();
  const text = received.data.text ?? "";
  const html = received.data.html ?? "";
  const plainText = text || stripHtml(html);
  const detail = { subject, snippet: plainText.slice(0, 500) };
  await database.update(leadActivities).set({
    message: subject ? `Replied: ${subject}` : "Replied to outreach email",
    detail: sql`coalesce(${leadActivities.detail}, '{}'::jsonb) || ${JSON.stringify(detail)}::jsonb`,
  }).where(receiptCondition);

  // Forwarding must remain available even when outreach sending is disabled or
  // its dedicated From setting has been removed. Use the verified brand sender.
  const banner = `Reply from ${from} to your outreach email.`;
  const attachmentNames: string[] = received.data.attachments?.map((attachment: { filename?: string | null }) => attachment.filename || "unnamed attachment") ?? [];
  const attachmentNotice = attachmentNames.length
    ? `This reply includes ${attachmentNames.length} attachment(s): ${attachmentNames.join(", ")}. Retrieve the original files from the received email in Resend.` : "";
  const result = await client.emails.send({
    from: `${SITE_CONFIG.senderDisplayName} <${SITE_CONFIG.email}>`,
    to: SITE_CONFIG.email,
    replyTo: from,
    subject: `[Outreach reply] ${subject || "(no subject)"}`,
    text: `${banner}\n\n${plainText || "(This reply has no message text.)"}${attachmentNotice ? `\n\n${attachmentNotice}` : ""}`,
    html: `${html ? `<p>${escapeHtml(banner)}</p><hr/>${html}`
      : `<p>${escapeHtml(banner)}</p><pre>${escapeHtml(plainText)}</pre>`}${attachmentNotice ? `<hr/><p>${escapeHtml(attachmentNotice)}</p>` : ""}`,
  }, { idempotencyKey: `outreach-reply/${emailId}` });
  assertEmailAccepted(result);

  // If this write fails, the event stays retryable. The provider idempotency key
  // prevents another send while its accepted response is recovered on retry.
  const forwarded = {
    forwarding: "accepted",
    forwardedMessageId: result.data!.id,
    forwardedAt: new Date().toISOString(),
  };
  await database.transaction(async (tx) => {
    await tx.insert(siteSettings).values({
      key: receiptKey,
      value: JSON.stringify({ status: "accepted", providerId: result.data!.id, acceptedAt: forwarded.forwardedAt }),
    }).onConflictDoNothing();
    await tx.update(leadActivities).set({
      detail: sql`coalesce(${leadActivities.detail}, '{}'::jsonb) || ${JSON.stringify(forwarded)}::jsonb`,
    }).where(receiptCondition);
  });
  return state.matched;
}
