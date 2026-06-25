import { db } from "@/lib/db";
import {
  leads,
  outreachRuns,
  outreachSends,
  outreachSuppressions,
  sequenceEnrollments,
  sequenceSteps,
  emailTemplates,
  type EmailTemplate,
} from "@/shared/schema";
import { and, asc, desc, eq, gte, isNotNull, lte, notInArray, sql } from "drizzle-orm";
import { getUncachableResendClient } from "@/server/resend";
import {
  getOutreachConfig,
  getOutreachFromEmail,
  getOutreachReplyTo,
  getOutreachSenderName,
  isOutreachSendable,
} from "@/lib/outreach/config";
import { renderOutreachEmail, tokensForLead } from "./outreachRender";
import { buildUnsubscribeUrl, buildOpenPixelUrl, buildClickUrl } from "@/lib/crm/urls";
import { buildLeadConditions, combineConditions, type LeadAudienceFilter } from "@/lib/crm/leadFilter";

// One advisory-lock key for the unified send critical section. Different from the
// legacy prospect sender so they never deadlock, but enforces a single global
// reservation path across runs and sequences.
const SEND_LOCK_KEY = 4815162343;

type Lead = typeof leads.$inferSelect;
type OutreachSendInsert = typeof outreachSends.$inferInsert;

interface SendJob {
  sendId: string;
  trackingToken: string;
  lead: Lead;
  template: EmailTemplate;
  // Bookkeeping refs for status updates after the network call.
  runId: string | null;
  enrollmentId: string | null;
  stepId: string | null;
}

export type TickReason =
  | "sent"
  | "dry_run"
  | "empty"
  | "daily_cap"
  | "throttled"
  | "disabled"
  | "not_configured";

/**
 * Reserves the next email to send inside one advisory-locked transaction so the
 * daily cap, min gap, and at-most-once guarantees hold across instances. Returns
 * a job to send (network I/O happens AFTER, outside the lock) or a stop reason.
 */
async function reserveNext(
  dailyCap: number,
  minGapMinutes: number,
  dryRun: boolean,
): Promise<{ job: SendJob | null; reason: TickReason }> {
  if (!db) return { job: null, reason: "not_configured" };

  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${SEND_LOCK_KEY}::bigint)`);

    const isSuppressed = async (email: string): Promise<boolean> => {
      const rows = await tx
        .select({ email: outreachSuppressions.email })
        .from(outreachSuppressions)
        .where(eq(outreachSuppressions.email, email.toLowerCase()))
        .limit(1);
      return rows.length > 0;
    };

    // Global rolling 24h cap, counted by durable sentAt on the audit log.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const capRows = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(outreachSends)
      .where(and(isNotNull(outreachSends.sentAt), gte(outreachSends.sentAt, since)));
    if ((capRows[0]?.n ?? 0) >= dailyCap) return { job: null, reason: "daily_cap" as TickReason };

    // Global minimum spacing between real sends.
    if (!dryRun) {
      const lastRows = await tx
        .select({ sentAt: outreachSends.sentAt })
        .from(outreachSends)
        .where(isNotNull(outreachSends.sentAt))
        .orderBy(desc(outreachSends.sentAt))
        .limit(1);
      const last = lastRows[0]?.sentAt;
      if (last) {
        const gapMin = (Date.now() - new Date(last).getTime()) / 60000;
        if (gapMin < minGapMinutes) return { job: null, reason: "throttled" as TickReason };
      }
    }

    // --- 1. Prefer a due sequence enrollment ---
    const dueEnrollments = await tx
      .select()
      .from(sequenceEnrollments)
      .where(and(eq(sequenceEnrollments.status, "active"), lte(sequenceEnrollments.nextDueAt, new Date())))
      .orderBy(asc(sequenceEnrollments.nextDueAt))
      .limit(5);

    for (const enr of dueEnrollments) {
      const steps = await tx
        .select()
        .from(sequenceSteps)
        .where(eq(sequenceSteps.sequenceId, enr.sequenceId))
        .orderBy(asc(sequenceSteps.stepOrder));
      const step = steps[enr.currentStep];

      // No more steps: complete the enrollment.
      if (!step) {
        await tx.update(sequenceEnrollments).set({ status: "completed", nextDueAt: null }).where(eq(sequenceEnrollments.id, enr.id));
        continue;
      }

      const [lead] = await tx.select().from(leads).where(eq(leads.id, enr.leadId)).limit(1);
      const [template] = await tx.select().from(emailTemplates).where(eq(emailTemplates.id, step.templateId)).limit(1);

      // Advance the pointer BEFORE sending (at-most-once). Compute the next due.
      const nextStep = steps[enr.currentStep + 1];
      const nextDueAt = nextStep ? new Date(Date.now() + nextStep.delayHours * 3600 * 1000) : null;
      await tx
        .update(sequenceEnrollments)
        .set({
          currentStep: enr.currentStep + 1,
          status: nextStep ? "active" : "completed",
          nextDueAt,
        })
        .where(eq(sequenceEnrollments.id, enr.id));

      // Skip silently if the lead became non-emailable / suppressed / template gone.
      if (!lead || !template || !lead.emailable || !lead.email || (await isSuppressed(lead.email))) {
        continue;
      }

      const reserved: OutreachSendInsert = {
        leadId: lead.id,
        enrollmentId: enr.id,
        stepId: step.id,
        templateId: template.id,
        status: "sent",
      };
      if (!dryRun) reserved.sentAt = new Date();
      const [send] = await tx.insert(outreachSends).values(reserved).returning();
      return {
        job: { sendId: send.id, trackingToken: send.trackingToken, lead, template, runId: null, enrollmentId: enr.id, stepId: step.id },
        reason: "sent" as TickReason,
      };
    }

    // --- 2. Else progress an active run ---
    const activeRuns = await tx
      .select()
      .from(outreachRuns)
      .where(eq(outreachRuns.status, "active"))
      .orderBy(asc(outreachRuns.createdAt))
      .limit(5);

    for (const run of activeRuns) {
      const [template] = await tx.select().from(emailTemplates).where(eq(emailTemplates.id, run.templateId)).limit(1);
      if (!template) {
        await tx.update(outreachRuns).set({ status: "completed" }).where(eq(outreachRuns.id, run.id));
        continue;
      }

      // Leads already sent for this run (at-most-once).
      const alreadySent = await tx
        .select({ leadId: outreachSends.leadId })
        .from(outreachSends)
        .where(eq(outreachSends.runId, run.id));
      const sentIds = alreadySent.map((r) => r.leadId);

      const conditions = buildLeadConditions(run.targetFilter as LeadAudienceFilter | null);
      conditions.push(eq(leads.emailable, true));
      if (sentIds.length > 0) conditions.push(notInArray(leads.id, sentIds));
      const whereClause = combineConditions(conditions);

      const candidates = await tx.select().from(leads).where(whereClause).orderBy(asc(leads.createdAt)).limit(10);

      let chosen: Lead | null = null;
      for (const cand of candidates) {
        if (!cand.email) continue;
        if (await isSuppressed(cand.email)) {
          // Record a skipped send so it never reappears, and bump the counter.
          await tx.insert(outreachSends).values({ leadId: cand.id, runId: run.id, templateId: template.id, status: "failed", errorDetail: "suppressed" });
          await tx.update(outreachRuns).set({ skippedCount: run.skippedCount + 1 }).where(eq(outreachRuns.id, run.id));
          continue;
        }
        chosen = cand;
        break;
      }

      if (!chosen) {
        // Nothing left for this run: complete it.
        await tx.update(outreachRuns).set({ status: "completed" }).where(eq(outreachRuns.id, run.id));
        continue;
      }

      const reserved: OutreachSendInsert = {
        leadId: chosen.id,
        runId: run.id,
        templateId: template.id,
        status: "sent",
      };
      if (!dryRun) reserved.sentAt = new Date();
      const [send] = await tx.insert(outreachSends).values(reserved).returning();
      return {
        job: {
          sendId: send.id,
          trackingToken: send.trackingToken,
          lead: chosen,
          template: run.subjectOverride ? { ...template, subject: run.subjectOverride } : template,
          runId: run.id,
          enrollmentId: null,
          stepId: null,
        },
        reason: "sent" as TickReason,
      };
    }

    return { job: null, reason: "empty" as TickReason };
  });
}

async function deliver(job: SendJob, dryRun: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: "no db" };

  const clickTracker = (url: string) => buildClickUrl(job.trackingToken, url);
  const rendered = renderOutreachEmail({
    template: job.template,
    tokens: tokensForLead(job.lead),
    unsubscribeUrl: buildUnsubscribeUrl(job.lead.unsubscribeToken),
    openPixelUrl: dryRun ? null : buildOpenPixelUrl(job.trackingToken),
    clickTracker,
  });

  // Dry run: keep the audit row but mark it so counts stay honest; no Resend call.
  if (dryRun) {
    await db.update(outreachSends).set({ status: "sent", errorDetail: "dry_run" }).where(eq(outreachSends.id, job.sendId));
    return { ok: true };
  }

  const fromEmail = getOutreachFromEmail();
  if (!fromEmail || !job.lead.email) {
    await db.update(outreachSends).set({ status: "failed", errorDetail: "sender or recipient missing" }).where(eq(outreachSends.id, job.sendId));
    return { ok: false, error: "sender or recipient missing" };
  }

  try {
    const { client } = await getUncachableResendClient();
    const from = `${getOutreachSenderName()} <${fromEmail}>`;
    const unsubscribeUrl = buildUnsubscribeUrl(job.lead.unsubscribeToken);
    await client.emails.send({
      from,
      replyTo: getOutreachReplyTo(),
      to: job.lead.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    // Success: stamp the lead's email status / last contacted.
    await db
      .update(leads)
      .set({
        emailStatus: job.lead.emailStatus === "new" ? "contacted" : job.lead.emailStatus,
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, job.lead.id));

    if (job.runId) {
      await db.execute(sql`UPDATE outreach_runs SET sent_count = sent_count + 1 WHERE id = ${job.runId}`);
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    await db.update(outreachSends).set({ status: "failed", errorDetail: message }).where(eq(outreachSends.id, job.sendId));
    // Hard failure: mark the lead failed / non-emailable so we stop trying.
    await db.update(leads).set({ emailStatus: "failed", emailable: false, updatedAt: new Date() }).where(eq(leads.id, job.lead.id));
    if (job.runId) {
      await db.execute(sql`UPDATE outreach_runs SET failed_count = failed_count + 1 WHERE id = ${job.runId}`);
    }
    return { ok: false, error: message };
  }
}

/**
 * Processes a single send (one per tick keeps pacing gentle). Returns the reason
 * so the scheduler/manual trigger can report progress.
 */
export async function processSendingTick(): Promise<TickReason> {
  if (!db) return "not_configured";

  const config = await getOutreachConfig();
  if (!config.enabled) return "disabled";
  if (!config.dryRun && !isOutreachSendable()) return "not_configured";

  const { job, reason } = await reserveNext(config.dailyCap, config.minGapMinutes, config.dryRun);
  if (!job) return reason;

  const result = await deliver(job, config.dryRun);
  return result.ok ? (config.dryRun ? "dry_run" : "sent") : "throttled";
}

/**
 * Enrolls a lead into a sequence (unique per lead+sequence). The first step's
 * delay sets the initial nextDueAt, so a zero-delay first step is due now and
 * sends on the next tick.
 */
export async function enrollLeadInSequence(sequenceId: string, leadId: string): Promise<{ enrolled: boolean; reason?: string }> {
  if (!db) return { enrolled: false, reason: "no db" };

  const existing = await db
    .select({ id: sequenceEnrollments.id })
    .from(sequenceEnrollments)
    .where(and(eq(sequenceEnrollments.sequenceId, sequenceId), eq(sequenceEnrollments.leadId, leadId)))
    .limit(1);
  if (existing.length > 0) return { enrolled: false, reason: "already enrolled" };

  const firstStep = await db
    .select()
    .from(sequenceSteps)
    .where(eq(sequenceSteps.sequenceId, sequenceId))
    .orderBy(asc(sequenceSteps.stepOrder))
    .limit(1);
  const delayHours = firstStep[0]?.delayHours ?? 0;
  const nextDueAt = new Date(Date.now() + delayHours * 3600 * 1000);

  try {
    await db.insert(sequenceEnrollments).values({ sequenceId, leadId, status: "active", currentStep: 0, nextDueAt });
    return { enrolled: true };
  } catch {
    // Unique index race: treat as already enrolled.
    return { enrolled: false, reason: "already enrolled" };
  }
}
