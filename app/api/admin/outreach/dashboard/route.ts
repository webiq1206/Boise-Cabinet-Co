import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sequenceEnrollments, outreachSends, leads, sequences, leadActivities } from "@/shared/schema";
import { sql, eq, and, desc, isNotNull, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { getOutreachConfig, isOutreachSendable } from "@/lib/outreach/config";

export const dynamic = "force-dynamic";

// Aggregated tracking for the outreach Activity tab: queue (enrollments), send
// totals, engagement (opens/clicks), pacing against the daily cap, and a recent
// activity feed joined to the lead.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const config = await getOutreachConfig();

  const enrollRows = await db
    .select({
      status: sequenceEnrollments.status,
      n: sql<number>`count(*)::int`,
      due: sql<number>`count(*) filter (where ${sequenceEnrollments.nextDueAt} <= now())::int`,
    })
    .from(sequenceEnrollments)
    .groupBy(sequenceEnrollments.status);

  const queue = { active: 0, completed: 0, stopped: 0, replied: 0, dueNow: 0 };
  for (const r of enrollRows) {
    if (r.status === "active") {
      queue.active = r.n;
      queue.dueNow = r.due;
    } else if (r.status === "completed") {
      queue.completed = r.n;
    } else if (r.status === "stopped") {
      queue.stopped = r.n;
    } else if (r.status === "replied") {
      queue.replied = r.n;
    }
  }

  const sendAggRows = await db
    .select({
      total: sql<number>`count(*)::int`,
      sent: sql<number>`count(*) filter (where ${outreachSends.status} = 'sent')::int`,
      failed: sql<number>`count(*) filter (where ${outreachSends.status} = 'failed')::int`,
      opened: sql<number>`count(*) filter (where ${outreachSends.openedAt} is not null)::int`,
      clicked: sql<number>`count(*) filter (where ${outreachSends.firstClickedAt} is not null)::int`,
    })
    .from(outreachSends);
  const sends = sendAggRows[0] ?? { total: 0, sent: 0, failed: 0, opened: 0, clicked: 0 };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const capRows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(outreachSends)
    .where(and(isNotNull(outreachSends.sentAt), gte(outreachSends.sentAt, since)));
  const sentLast24 = capRows[0]?.n ?? 0;

  const lastSentRows = await db
    .select({ at: outreachSends.sentAt })
    .from(outreachSends)
    .where(isNotNull(outreachSends.sentAt))
    .orderBy(desc(outreachSends.sentAt))
    .limit(1);
  const lastSentAt = lastSentRows[0]?.at ?? null;
  const nextEligibleAt =
    lastSentAt && config.minGapMinutes > 0
      ? new Date(new Date(lastSentAt).getTime() + config.minGapMinutes * 60_000)
      : null;

  const recent = await db
    .select({
      id: outreachSends.id,
      status: outreachSends.status,
      sentAt: outreachSends.sentAt,
      createdAt: outreachSends.createdAt,
      openCount: outreachSends.openCount,
      clickCount: outreachSends.clickCount,
      openedAt: outreachSends.openedAt,
      firstClickedAt: outreachSends.firstClickedAt,
      errorDetail: outreachSends.errorDetail,
      leadName: leads.name,
      company: leads.companyName,
      email: leads.email,
      city: leads.city,
      sequenceName: sequences.name,
    })
    .from(outreachSends)
    .leftJoin(leads, eq(outreachSends.leadId, leads.id))
    .leftJoin(sequenceEnrollments, eq(outreachSends.enrollmentId, sequenceEnrollments.id))
    .leftJoin(sequences, eq(sequenceEnrollments.sequenceId, sequences.id))
    .orderBy(desc(sql`coalesce(${outreachSends.sentAt}, ${outreachSends.createdAt})`))
    .limit(50);

  // Recent inbound replies, sourced from the CRM timeline rows the webhook writes.
  const replies = await db
    .select({
      id: leadActivities.id,
      createdAt: leadActivities.createdAt,
      message: leadActivities.message,
      detail: leadActivities.detail,
      leadName: leads.name,
      company: leads.companyName,
      email: leads.email,
      city: leads.city,
    })
    .from(leadActivities)
    .leftJoin(leads, eq(leadActivities.leadId, leads.id))
    .where(eq(leadActivities.type, "email_received"))
    .orderBy(desc(leadActivities.createdAt))
    .limit(25);

  return NextResponse.json({
    config: {
      enabled: config.enabled,
      dryRun: config.dryRun,
      dailyCap: config.dailyCap,
      minGapMinutes: config.minGapMinutes,
      sequenceEnabled: config.sequenceEnabled,
      sendable: isOutreachSendable(),
    },
    queue,
    sends,
    pacing: {
      sentLast24,
      remainingToday: Math.max(0, config.dailyCap - sentLast24),
      lastSentAt,
      nextEligibleAt,
    },
    recent,
    replies,
  });
}
