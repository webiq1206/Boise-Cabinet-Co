import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions, type OutreachProspect } from "@/shared/schema";
import { and, eq, gte, inArray, isNotNull, isNull, lt, lte, sql } from "drizzle-orm";
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
import {
  getOutreachTemplateContent,
  type OutreachTemplateContent,
} from "@/lib/outreach/templateContent";

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

// A single fixed key for the Postgres transaction-level advisory lock that
// serializes the "decide + reserve the next send" critical section across ALL
// app instances. Only one instance can hold it at a time, so the daily-cap and
// min-gap checks are evaluated against committed state and cannot be raced.
const OUTREACH_RESERVE_LOCK_KEY = 4815162342;

// How long a row may sit in "sending" before it is treated as a crashed,
// abandoned reservation and reclaimed. Comfortably longer than any real send.
const SENDING_LEASE_MINUTES = 15;

type SendStep = "first" | "followup";

interface Reservation {
  prospect: OutreachProspect | null;
  // Which step this reserved send is: the initial cold email or the step-2
  // follow-up to a non-replier. Defaults to "first" when no prospect.
  step?: SendStep;
  reason?: BatchResult["stoppedReason"];
}

/**
 * Atomically reserve the next email to send. Everything that must be globally
 * consistent - the in-flight guard, the rolling 24h daily cap, the minimum gap
 * between sends, and claiming the prospect row - happens inside ONE transaction
 * guarded by a Postgres advisory lock. For a real send we stamp `sentAt` at
 * reserve time so a concurrent instance immediately sees this send when it
 * evaluates the cap/gap, making both hard guarantees rather than best-effort.
 * The actual network send happens AFTER this returns, so the lock is never held
 * during slow I/O.
 */
async function reserveNextProspect(config: OutreachRuntimeConfig): Promise<Reservation> {
  if (!db) return { prospect: null, reason: "not_configured" };

  return db.transaction(async (tx) => {
    // Serialize this whole section across instances. Auto-released on commit.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${OUTREACH_RESERVE_LOCK_KEY}::bigint)`);

    // Recover stale reservations: if a process crashed mid-send a row can be
    // stuck in "sending" forever, which (because the in-flight guard below is a
    // hard gate) would permanently halt all outreach. Reclaim anything held
    // longer than the lease, restoring each row to the correct pre-send state so
    // an interrupted send is never re-sent (no duplicate spam) and a prospect
    // that had already opened is never regressed back to "sent":
    //   - openedAt set  -> "opened" (covers crashed follow-ups on opened rows)
    //   - else sentAt set -> "sent" (first email assumed delivered)
    //   - else            -> "approved" (interrupted before any first send)
    const leaseCutoff = new Date(Date.now() - SENDING_LEASE_MINUTES * 60 * 1000);
    const staleLease = and(
      eq(outreachProspects.status, "sending"),
      lt(outreachProspects.updatedAt, leaseCutoff),
    );
    await tx
      .update(outreachProspects)
      .set({ status: "opened", updatedAt: new Date() })
      .where(and(staleLease, isNotNull(outreachProspects.openedAt)));
    await tx
      .update(outreachProspects)
      .set({ status: "sent", updatedAt: new Date() })
      .where(
        and(staleLease, isNull(outreachProspects.openedAt), isNotNull(outreachProspects.sentAt)),
      );
    await tx
      .update(outreachProspects)
      .set({ status: "approved", updatedAt: new Date() })
      .where(and(staleLease, isNull(outreachProspects.sentAt)));

    // In-flight guard: never have two sends overlapping.
    const inflight = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(outreachProspects)
      .where(eq(outreachProspects.status, "sending"));
    if ((inflight[0]?.n ?? 0) > 0) return { prospect: null, reason: "throttled" };

    // Rolling 24h daily cap, counted by durable timestamps (not mutable status).
    // Both first sends (sentAt) and follow-ups (followupSentAt) consume the cap.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const capRows = await tx
      .select({
        first: sql<number>`count(*) filter (where ${outreachProspects.sentAt} >= ${since})::int`,
        followup: sql<number>`count(*) filter (where ${outreachProspects.followupSentAt} >= ${since})::int`,
      })
      .from(outreachProspects);
    const capCount = (capRows[0]?.first ?? 0) + (capRows[0]?.followup ?? 0);
    if (capCount >= config.dailyCap) return { prospect: null, reason: "daily_cap" };

    // Minimum spacing between real sends, measured from the most recent of any
    // first send or follow-up. Dry runs never stamp timestamps, so exempt.
    if (!config.dryRun) {
      const lastRows = await tx
        .select({
          lastSent: sql<string | null>`max(${outreachProspects.sentAt})`,
          lastFollowup: sql<string | null>`max(${outreachProspects.followupSentAt})`,
        })
        .from(outreachProspects);
      const times = [lastRows[0]?.lastSent, lastRows[0]?.lastFollowup]
        .filter((v): v is string => !!v)
        .map((v) => new Date(v).getTime());
      if (times.length > 0) {
        const gapMin = (Date.now() - Math.max(...times)) / 60000;
        if (gapMin < config.minGapMinutes) return { prospect: null, reason: "throttled" };
      }
    }

    // Helper: skip + retire any suppressed candidate, else return the first
    // sendable one. Suppressed rows are retired without consuming a send slot.
    const pickSendable = async (
      rows: OutreachProspect[],
    ): Promise<OutreachProspect | null> => {
      for (const candidate of rows) {
        if (!candidate.email) continue;
        const supp = await tx
          .select({ email: outreachSuppressions.email })
          .from(outreachSuppressions)
          .where(eq(outreachSuppressions.email, candidate.email.toLowerCase()))
          .limit(1);
        if (supp.length > 0) {
          await tx
            .update(outreachProspects)
            .set({ status: "unsubscribed", unsubscribedAt: new Date(), updatedAt: new Date() })
            .where(eq(outreachProspects.id, candidate.id));
          continue;
        }
        return candidate;
      }
      return null;
    };

    // Step 1 is always prioritized: send all approved first-touch emails before
    // any follow-ups so new contractors are not starved by the follow-up queue.
    const firstCandidates = await tx
      .select()
      .from(outreachProspects)
      .where(and(eq(outreachProspects.status, "approved"), isNotNull(outreachProspects.email)))
      .orderBy(outreachProspects.approvedAt)
      .limit(10);
    let chosen = await pickSendable(firstCandidates);
    let step: SendStep = "first";

    // Step 2: only when the sequence is enabled and no first-touch send is due.
    // Eligible = already sent (or opened, never replied/bounced/unsubscribed),
    // not yet followed up, and the configured wait has elapsed since the first
    // send. Suppression is still re-checked at claim time via pickSendable.
    if (!chosen && config.sequenceEnabled) {
      const cutoff = new Date(Date.now() - config.followupDelayDays * 24 * 60 * 60 * 1000);
      const followupCandidates = await tx
        .select()
        .from(outreachProspects)
        .where(
          and(
            inArray(outreachProspects.status, ["sent", "opened"]),
            isNull(outreachProspects.followupSentAt),
            isNull(outreachProspects.repliedAt),
            isNull(outreachProspects.bouncedAt),
            isNull(outreachProspects.unsubscribedAt),
            isNotNull(outreachProspects.email),
            isNotNull(outreachProspects.sentAt),
            lte(outreachProspects.sentAt, cutoff),
          ),
        )
        .orderBy(outreachProspects.sentAt)
        .limit(10);
      chosen = await pickSendable(followupCandidates);
      if (chosen) step = "followup";
    }

    if (!chosen) return { prospect: null, reason: "empty" };

    // Reserve the slot. status -> sending blocks the in-flight guard for others;
    // for a real send we also stamp the relevant timestamp now so it immediately
    // counts toward cap and gap even before the network send resolves.
    const reserveUpdates: Record<string, unknown> = { status: "sending", updatedAt: new Date() };
    if (!config.dryRun) {
      if (step === "first") reserveUpdates.sentAt = new Date();
      else reserveUpdates.followupSentAt = new Date();
    }
    const claimWhere =
      step === "first"
        ? and(eq(outreachProspects.id, chosen.id), eq(outreachProspects.status, "approved"))
        : and(
            eq(outreachProspects.id, chosen.id),
            inArray(outreachProspects.status, ["sent", "opened"]),
            isNull(outreachProspects.followupSentAt),
          );
    const claimed = await tx
      .update(outreachProspects)
      .set(reserveUpdates)
      .where(claimWhere)
      .returning();
    return { prospect: claimed[0] ?? null, step, reason: claimed[0] ? undefined : "empty" };
  });
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
  content: OutreachTemplateContent,
  step: SendStep,
): Promise<SendOneResult> {
  const base: Omit<SendOneResult, "status"> = {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    email: prospect.email,
  };
  const isFollowup = step === "followup";
  // Where a follow-up should land if it is NOT actually sent (dry run, missing
  // sender, error): back to its pre-send state, never "approved" (which would
  // wrongly re-queue it for another cold first email).
  const followupRestoreStatus = prospect.openedAt ? "opened" : "sent";

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
    content,
    // Effective template: follow-ups use the configured follow-up voice; the
    // first touch uses the per-prospect override, else the batch default.
    templateKey: isFollowup ? config.followupTemplate : prospect.templateKey ?? config.defaultTemplate,
    isFollowup,
    // Only embed the open-tracking pixel in a real send, never in a dry run.
    openTrackingUrl: config.dryRun ? null : buildOpenTrackingUrl(prospect.unsubscribeToken),
  });

  // Dry run: compose and preview only. Do not call Resend, do not mark sent.
  // First-touch claims release back to "approved" so they can be sent for real
  // later; follow-up claims return to their pre-send state.
  if (config.dryRun) {
    if (db) {
      await db
        .update(outreachProspects)
        .set({ status: isFollowup ? followupRestoreStatus : "approved", updatedAt: new Date() })
        .where(and(eq(outreachProspects.id, prospect.id), eq(outreachProspects.status, "sending")));
    }
    return { ...base, status: "dry_run", subject: copy.subject };
  }

  const fromEmail = getOutreachFromEmail();
  if (!fromEmail) {
    if (db) {
      await db
        .update(outreachProspects)
        .set({
          status: isFollowup ? followupRestoreStatus : "approved",
          lastError: "OUTREACH_FROM_EMAIL not configured.",
          updatedAt: new Date(),
        })
        .where(and(eq(outreachProspects.id, prospect.id), eq(outreachProspects.status, "sending")));
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
      if (isFollowup) {
        // followupSentAt was already stamped at reserve time. Preserve the
        // original first-send record (sentAt, providerMessageId) and just
        // restore the prospect to its pre-send state.
        await db
          .update(outreachProspects)
          .set({ status: followupRestoreStatus, lastError: null, updatedAt: new Date() })
          .where(and(eq(outreachProspects.id, prospect.id), eq(outreachProspects.status, "sending")));
      } else {
        await db
          .update(outreachProspects)
          .set({
            status: "sent",
            sentAt: new Date(),
            providerMessageId,
            lastError: null,
            updatedAt: new Date(),
          })
          .where(and(eq(outreachProspects.id, prospect.id), eq(outreachProspects.status, "sending")));
      }
    }
    return { ...base, status: "sent", subject: copy.subject };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed.";
    if (db) {
      // A failed follow-up keeps its original sent/opened state (the first email
      // did go out) and records the error; followupSentAt stays stamped so it is
      // never retried. A failed first send becomes "error" as before.
      await db
        .update(outreachProspects)
        .set({
          status: isFollowup ? followupRestoreStatus : "error",
          lastError: message,
          updatedAt: new Date(),
        })
        .where(and(eq(outreachProspects.id, prospect.id), eq(outreachProspects.status, "sending")));
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
  // Editable wording, loaded once per batch and shared by every send.
  const content = await getOutreachTemplateContent();

  // When the caller does not pin an explicit limit, a manual run uses the
  // admin-chosen batch size; the background runner stays at one per tick. Always
  // clamped to the hard ceiling so the UI can never burst past the throttle.
  const requested = options.limit ?? (options.source === "manual" ? config.batchSize : 1);
  const limit = Math.max(1, Math.min(requested, 10));

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
    // The in-flight guard, daily cap, min-gap, and prospect claim are ALL decided
    // inside reserveNextProspect's advisory-locked transaction, so they are hard
    // guarantees even with multiple autoscale instances racing - not best-effort.
    // Enforced for EVERY send path (auto and manual); there is no bypass.
    const reservation = await reserveNextProspect(config);
    if (!reservation.prospect) {
      result.stoppedReason = reservation.reason ?? "empty";
      break;
    }

    result.attempted++;
    const one = await sendToProspect(
      reservation.prospect,
      config,
      content,
      reservation.step ?? "first",
    );
    result.results.push(one);

    if (one.status === "sent") result.sent++;
    else if (one.status === "dry_run") result.dryRun++;
    else if (one.status === "error" || one.status === "no_email") result.errors++;
    else result.skipped++;

    if (i + 1 >= limit) result.stoppedReason = "limit";
  }

  return result;
}
