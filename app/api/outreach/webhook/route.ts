import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import {
  leads,
  outreachProspects,
  outreachSuppressions,
  sequenceEnrollments,
  leadActivities,
} from "@/shared/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getUncachableResendClient } from "@/server/resend";
import { getOutreachFromEmail, getOutreachSenderName } from "@/lib/outreach/config";
import { SITE_CONFIG } from "@/shared/siteConfig";

// Resend signs every webhook with Svix. The signing secret (whsec_...) is shown
// once when the endpoint is created in the Resend dashboard and must be stored
// as the RESEND_WEBHOOK_SECRET secret (global, so it covers dev and deploy).
function getWebhookSecret(): string | null {
  return process.env.RESEND_WEBHOOK_SECRET ?? null;
}

// Resend's event payload. We only need the event type and the recipient/message
// identifiers; everything else is ignored.
interface ResendWebhookEvent {
  type: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    // Present on inbound (email.received) events: the address that replied and
    // the subject line. Body/attachments are NOT in the webhook and must be
    // fetched from the Received Emails API.
    from?: string;
    subject?: string;
  };
}

// Inbound "from" can be a bare address or "Display Name <addr@host>". Extract the
// address and lowercase it so it matches stored lead emails case-insensitively.
function parseFromAddress(raw?: string): string | null {
  if (!raw) return null;
  const angle = raw.match(/<([^>]+)>/);
  const addr = (angle ? angle[1] : raw).trim().toLowerCase();
  return addr.includes("@") ? addr : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Forward the reply to the human inbox so a person still reads and answers it
// (the outreach reply-to lives on the Resend receiving subdomain, not the main
// mailbox). Reply-To is set to the lead so hitting reply goes straight to them.
// Best effort: a forwarding failure must not fail the webhook.
async function forwardReplyToInbox(
  from: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  try {
    const fromEmail = getOutreachFromEmail();
    if (!fromEmail) return;
    const { client } = await getUncachableResendClient();
    const banner = `Reply from ${from} to your outreach email. This lead's sequence has been stopped automatically.`;
    await client.emails.send({
      from: `${getOutreachSenderName()} <${fromEmail}>`,
      to: SITE_CONFIG.email,
      replyTo: from,
      subject: `[Outreach reply] ${subject || "(no subject)"}`,
      text: `${banner}\n\n--- Original reply ---\n${text || "(no plain-text body - see Resend dashboard)"}`,
      html: html
        ? `<p>${escapeHtml(banner)}</p><hr/>${html}`
        : `<p>${escapeHtml(banner)}</p>`,
    });
  } catch (err) {
    console.error("[outreach webhook] forward reply failed:", err);
  }
}

// A lead replied to outreach. Mark the lead "replied", stop any active sequence
// enrollment (reserveNext only picks status='active', so this halts further
// sends), log the reply to the CRM timeline, and forward a copy to the inbox.
// Idempotent on the inbound email_id because Resend retries webhook delivery.
async function handleInboundReply(data: ResendWebhookEvent["data"]): Promise<number> {
  if (!db) return 0;
  const from = parseFromAddress(data?.from);
  const emailId = data?.email_id ?? null;
  const subject = (data?.subject ?? "").toString().trim();
  if (!from) return 0;

  if (emailId) {
    const seen = await db
      .select({ id: leadActivities.id })
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.type, "email_received"),
          sql`${leadActivities.detail}->>'emailId' = ${emailId}`,
        ),
      )
      .limit(1);
    if (seen.length > 0) return 0;
  }

  const matched = await db
    .select({ id: leads.id })
    .from(leads)
    .where(sql`lower(${leads.email}) = ${from}`);
  if (matched.length === 0) {
    // Still forward unmatched replies so nothing is lost, but take no CRM action.
    await forwardReplyToInbox(from, subject, "", "");
    return 0;
  }

  const now = new Date();
  const ids = matched.map((l) => l.id);

  await db
    .update(leads)
    .set({ emailStatus: "replied", updatedAt: now })
    .where(sql`lower(${leads.email}) = ${from}`);

  await db
    .update(sequenceEnrollments)
    .set({ status: "replied", nextDueAt: null })
    .where(
      and(
        inArray(sequenceEnrollments.leadId, ids),
        eq(sequenceEnrollments.status, "active"),
      ),
    );

  // Fetch the body from the Received Emails API for a timeline preview and to
  // forward the real content. Best effort: the reply is already recorded.
  let text = "";
  let html = "";
  let snippet = "";
  try {
    if (emailId && process.env.RESEND_API_KEY) {
      const res = await fetch(`https://api.resend.com/emails/received/${emailId}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (res.ok) {
        const body = (await res.json()) as { text?: string; html?: string };
        text = body.text ?? "";
        html = body.html ?? "";
        snippet = (text || stripHtml(html)).slice(0, 500);
      }
    }
  } catch (err) {
    console.error("[outreach webhook] fetch received email failed:", err);
  }

  for (const id of ids) {
    await db.insert(leadActivities).values({
      leadId: id,
      type: "email_received",
      message: subject ? `Replied: ${subject}` : "Replied to outreach email",
      detail: { from, subject, emailId, snippet },
    });
  }

  await forwardReplyToInbox(from, subject, text, html);
  return ids.length;
}

function extractRecipients(data: ResendWebhookEvent["data"]): string[] {
  if (!data?.to) return [];
  const list = Array.isArray(data.to) ? data.to : [data.to];
  return list
    .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
    .filter((e) => e.length > 0);
}

async function addSuppression(email: string, reason: "bounce" | "complaint"): Promise<void> {
  if (!db) return;
  // email is the primary key; an existing suppression (e.g. a prior unsubscribe)
  // is left untouched so we never downgrade or churn the do-not-email record.
  await db
    .insert(outreachSuppressions)
    .values({ email, reason })
    .onConflictDoNothing();
}

// Retire any prospect that owns this email or provider message id so it drops
// out of the approved-only send queue. Bounces become "bounced"; complaints are
// treated like an unsubscribe (an explicit do-not-contact signal).
async function retireProspects(
  emails: string[],
  emailId: string | null,
  kind: "bounce" | "complaint",
): Promise<void> {
  if (!db) return;
  const now = new Date();
  const updates: Record<string, unknown> =
    kind === "bounce"
      ? { status: "bounced", bouncedAt: now, updatedAt: now }
      : { status: "unsubscribed", unsubscribedAt: now, updatedAt: now };

  if (emailId) {
    await db
      .update(outreachProspects)
      .set(updates)
      .where(eq(outreachProspects.providerMessageId, emailId));
  }
  for (const email of emails) {
    await db
      .update(outreachProspects)
      .set(updates)
      .where(eq(outreachProspects.email, email));
  }
}

// Mark any CRM lead that owns this email as undeliverable so the admin dashboard
// reflects the hard bounce / complaint and the lead leaves the emailable pool.
// Bounces become "bounced"; complaints are treated like an unsubscribe (an
// explicit do-not-contact signal). Lead emails are matched case-insensitively
// because the webhook lowercases recipients but leads store the original casing.
async function retireLeads(
  emails: string[],
  kind: "bounce" | "complaint",
): Promise<void> {
  if (!db) return;
  const now = new Date();
  const updates = {
    emailStatus: kind === "bounce" ? "bounced" : "unsubscribed",
    emailable: false,
    updatedAt: now,
  };

  for (const email of emails) {
    await db
      .update(leads)
      .set(updates)
      .where(sql`lower(${leads.email}) = ${email}`);
  }
}

export async function POST(request: NextRequest) {
  const secret = getWebhookSecret();
  if (!secret) {
    // Fail loudly rather than silently accepting unverified events. Without the
    // secret we cannot trust the payload, so we must not act on it.
    console.error("[outreach webhook] RESEND_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  // Svix verifies against the EXACT raw body, so read it as text before parsing.
  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  let event: ResendWebhookEvent;
  try {
    event = new Webhook(secret).verify(payload, headers) as ResendWebhookEvent;
  } catch {
    // Bad/forged signature: reject so a caller cannot suppress arbitrary emails.
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, ignored: "no_db" });
  }

  // A lead replied: mark replied, stop the sequence, log it, forward to inbox.
  if (event.type === "email.received") {
    const matched = await handleInboundReply(event.data);
    return NextResponse.json({ ok: true, type: event.type, matched });
  }

  const kind =
    event.type === "email.bounced"
      ? "bounce"
      : event.type === "email.complained"
        ? "complaint"
        : null;

  // Acknowledge every other event type (delivered, opened, ...) so Resend does
  // not retry; we simply take no suppression action on them.
  if (!kind) {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const emails = extractRecipients(event.data);
  const emailId = event.data?.email_id ?? null;

  for (const email of emails) {
    await addSuppression(email, kind);
  }
  await retireProspects(emails, emailId, kind);
  await retireLeads(emails, kind);

  return NextResponse.json({ ok: true, type: event.type, suppressed: emails.length });
}
