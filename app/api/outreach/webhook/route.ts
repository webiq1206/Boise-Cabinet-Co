import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions } from "@/shared/schema";
import { eq } from "drizzle-orm";

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
  };
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

  return NextResponse.json({ ok: true, type: event.type, suppressed: emails.length });
}
