import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions, type OutreachProspect } from "@/shared/schema";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getUncachableResendClient } from "@/server/resend";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  getOutreachConfig,
  getOutreachFromEmail,
  getOutreachReplyTo,
  getOutreachSenderName,
  isOutreachSendable,
  type OutreachRuntimeConfig,
} from "@/lib/outreach/config";
import { buildOutreachCopy } from "@/lib/outreach/template";

export function buildUnsubscribeUrl(token: string): string {
  const base = SITE_CONFIG.siteUrl.replace(/\/$/, "");
  return `${base}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function buildOpenTrackingUrl(token: string): string {
  const base = SITE_CONFIG.siteUrl.replace(/\/$/, "");
  return `${base}/api/outreach/open?token=${encodeURIComponent(token)}`;
}

async function isSuppressed(email: string): Promise<boolean> {
  if (!db) return false;
  const rows = await db
    .select({ email: outreachSuppressions.email })
    .from(outreachSuppressions)
    .where(eq(outreachSuppressions.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

async function countSentLast24h(): Promise<number> {
  if (!db) return 0;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // Count by sentAt timestamp, NOT by status: once an email is delivered its
  // status can move on (opened, replied, bounced, unsubscribed), but it still
  // counts against the rolling 24h daily cap. A status filter here would let
  // post-send transitions silently leak past the cap.
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(outreachProspects)
    .where(and(isNotNull(outreachProspects.sentAt), gte(outreachProspects.sentAt, since)));
  return rows[0]?.n ?? 0;
}

async function inFlightCount(): Promise<number> {
  if (!db) return 0;
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(outreachProspects)
    .where(eq(outreachProspects.status, "sending"));
  return rows[0]?.n ?? 0;
}

async function minutesSinceLastSend(): Promise<number | null> {
  if (!db) return null;
  // Spacing is based on the most recent actual send time, regardless of the
  // prospect's current status (it may have since moved to opened/replied/etc).
  const rows = await db
    .select({ sentAt: outreachProspects.sentAt })
    .from(outreachProspects)
    .where(isNotNull(outreachProspects.sentAt))
    .orderBy(desc(outreachProspects.sentAt))
    .limit(1);
  const last = rows[0]?.sentAt;
  if (!last) return null;
  return (Date.now() - new Date(last).getTime()) / 60000;
}

/**
 * Atomically claim the next approved, emailable prospect. The conditional
 * UPDATE ensures that if two instances race, only one wins the row, preventing
 * a double-send.
 */
async function claimNextProspect(): Promise<OutreachProspect | null> {
  if (!db) return null;
  const candidates = await db
    .select()
    .from(outreachProspects)
    .where(and(eq(outreachProspects.status, "approved"), isNotNull(outreachProspects.email)))
    .orderBy(outreachProspects.approvedAt)
    .limit(5);

  for (const candidate of candidates) {
    const claimed = await db
      .update(outreachProspects)
      .set({ status: "sending", updatedAt: new Date() })
      .where(and(eq(outreachProspects.id, candidate.id), eq(outreachProspects.status, "approved")))
      .returning();
    if (claimed.length > 0) return claimed[0];
  }
  return null;
}

export interface SendOneResult {
  status: "sent" | "dry_run" | "suppressed" | "no_email" | "error";
  prospectId: string;
  businessName: string;
  email: string | null;
  subject?: string;
  error?: string;
}

async function sendToProspect(
  prospect: OutreachProspect,
  config: OutreachRuntimeConfig,
): Promise<SendOneResult> {
  const base: Omit<SendOneResult, "status"> = {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    email: prospect.email,
  };

  if (!prospect.email) {
    return { ...base, status: "no_email" };
  }

  if (await isSuppressed(prospect.email)) {
    if (db) {
      await db
        .update(outreachProspects)
        .set({ status: "unsubscribed", unsubscribedAt: new Date(), updatedAt: new Date() })
        .where(eq(outreachProspects.id, prospect.id));
    }
    return { ...base, status: "suppressed" };
  }

  const copy = buildOutreachCopy({
    businessName: prospect.businessName,
    city: prospect.city,
    personalizationNote: prospect.personalizationNote,
    unsubscribeUrl: buildUnsubscribeUrl(prospect.unsubscribeToken),
    seed: prospect.id,
    // Only embed the open-tracking pixel in a real send, never in a dry run.
    openTrackingUrl: config.dryRun ? null : buildOpenTrackingUrl(prospect.unsubscribeToken),
  });

  // Dry run: compose and preview only. Do not call Resend, do not mark sent,
  // and release the claim back to "approved" so it can be sent for real later.
  if (config.dryRun) {
    if (db) {
      await db
        .update(outreachProspects)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(outreachProspects.id, prospect.id));
    }
    return { ...base, status: "dry_run", subject: copy.subject };
  }

  const fromEmail = getOutreachFromEmail();
  if (!fromEmail) {
    if (db) {
      await db
        .update(outreachProspects)
        .set({
          status: "approved",
          lastError: "OUTREACH_FROM_EMAIL not configured.",
          updatedAt: new Date(),
        })
        .where(eq(outreachProspects.id, prospect.id));
    }
    return { ...base, status: "error", error: "OUTREACH_FROM_EMAIL not configured." };
  }

  try {
    const { client } = await getUncachableResendClient();
    const from = `${getOutreachSenderName()} <${fromEmail}>`;
    const unsubscribeUrl = buildUnsubscribeUrl(prospect.unsubscribeToken);

    const result = await client.emails.send({
      from,
      replyTo: getOutreachReplyTo(),
      to: prospect.email,
      subject: copy.subject,
      html: copy.html,
      text: copy.text,
      headers: {
        // One-click unsubscribe per RFC 8058, honored by major mailbox providers.
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    const providerMessageId =
      (result as { id?: string; data?: { id?: string } })?.data?.id ??
      (result as { id?: string })?.id ??
      null;

    if (db) {
      await db
        .update(outreachProspects)
        .set({
          status: "sent",
          sentAt: new Date(),
          providerMessageId,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(outreachProspects.id, prospect.id));
    }
    return { ...base, status: "sent", subject: copy.subject };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed.";
    if (db) {
      await db
        .update(outreachProspects)
        .set({ status: "error", lastError: message, updatedAt: new Date() })
        .where(eq(outreachProspects.id, prospect.id));
    }
    return { ...base, status: "error", error: message };
  }
}

export interface BatchOptions {
  limit?: number;
  source: "auto" | "manual";
}

export interface BatchResult {
  attempted: number;
  sent: number;
  dryRun: number;
  skipped: number;
  errors: number;
  stoppedReason: "limit" | "daily_cap" | "throttled" | "empty" | "disabled" | "not_configured";
  results: SendOneResult[];
}

/**
 * Process a small batch of outreach emails with strict throttling: a rolling
 * 24h daily cap and a minimum gap between sends so nothing is ever blasted.
 */
export async function processOutreachBatch(options: BatchOptions): Promise<BatchResult> {
  const limit = Math.max(1, Math.min(options.limit ?? 1, 10));

  const result: BatchResult = {
    attempted: 0,
    sent: 0,
    dryRun: 0,
    skipped: 0,
    errors: 0,
    stoppedReason: "empty",
    results: [],
  };

  if (!db) {
    result.stoppedReason = "not_configured";
    return result;
  }

  const config = await getOutreachConfig();

  // All sends respect the master on/off switch. If an owner disables outreach,
  // nothing goes out (auto or manual). This gives an instant emergency pause.
  if (!config.enabled) {
    result.stoppedReason = "disabled";
    return result;
  }

  // For real (non-dry-run) sends we require a verified outreach sender.
  if (!config.dryRun && !isOutreachSendable()) {
    result.stoppedReason = "not_configured";
    return result;
  }

  for (let i = 0; i < limit; i++) {
    // Soft mutual-exclusion across instances: if another runner is mid-send,
    // back off rather than racing it. NOTE: with multiple autoscale instances
    // the cap/gap remain best-effort (the atomic per-row claim still prevents
    // any double-send); this guard plus a small daily cap keeps cadence sane.
    // Enforced for EVERY send path (auto and manual) — there is no bypass.
    if ((await inFlightCount()) > 0) {
      result.stoppedReason = "throttled";
      break;
    }

    const sentToday = await countSentLast24h();
    if (sentToday >= config.dailyCap) {
      result.stoppedReason = "daily_cap";
      break;
    }

    // Minimum spacing between real sends is always enforced so outreach is
    // dripped out, never bursted. Dry runs never set sentAt, so they are exempt.
    if (!config.dryRun) {
      const gap = await minutesSinceLastSend();
      if (gap !== null && gap < config.minGapMinutes) {
        result.stoppedReason = "throttled";
        break;
      }
    }

    const prospect = await claimNextProspect();
    if (!prospect) {
      result.stoppedReason = "empty";
      break;
    }

    result.attempted++;
    const one = await sendToProspect(prospect, config);
    result.results.push(one);

    if (one.status === "sent") result.sent++;
    else if (one.status === "dry_run") result.dryRun++;
    else if (one.status === "error" || one.status === "no_email") result.errors++;
    else result.skipped++;

    if (i + 1 >= limit) result.stoppedReason = "limit";
  }

  return result;
}
