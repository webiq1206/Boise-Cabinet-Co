import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  outreachSends,
  outreachRuns,
  leads,
  emailTemplates,
  sequenceEnrollments,
  sequences,
  sequenceSteps,
} from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { renderOutreachEmail, tokensForLead } from "@/server/services/outreachRender";
import { buildUnsubscribeUrl } from "@/lib/crm/urls";

export const dynamic = "force-dynamic";

// Detail view for a single outreach send: status timeline + the exact email
// content that went out. The rendered subject/body are NOT stored per send, so
// we re-render from the template + lead tokens (the same inputs the sender used).
// Links are shown clean (no click-tracking wrapper) and the open pixel is
// omitted so this preview faithfully represents the message as written.
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const [send] = await db.select().from(outreachSends).where(eq(outreachSends.id, params.id)).limit(1);
  if (!send) return NextResponse.json({ error: "Send not found" }, { status: 404 });

  const [lead] = send.leadId
    ? await db.select().from(leads).where(eq(leads.id, send.leadId)).limit(1)
    : [undefined];

  const [template] = send.templateId
    ? await db.select().from(emailTemplates).where(eq(emailTemplates.id, send.templateId)).limit(1)
    : [undefined];

  // Resolve context (sequence step vs one-off run) for human-readable labels and
  // any subject override that applied to a run.
  let context: {
    kind: "sequence" | "run" | null;
    sequenceName: string | null;
    stepOrder: number | null;
    templateName: string | null;
    subjectOverride: string | null;
  } = {
    kind: null,
    sequenceName: null,
    stepOrder: null,
    templateName: template?.name ?? null,
    subjectOverride: null,
  };

  if (send.enrollmentId) {
    const [enr] = await db
      .select()
      .from(sequenceEnrollments)
      .where(eq(sequenceEnrollments.id, send.enrollmentId))
      .limit(1);
    if (enr) {
      const [seq] = await db.select().from(sequences).where(eq(sequences.id, enr.sequenceId)).limit(1);
      context.kind = "sequence";
      context.sequenceName = seq?.name ?? null;
    }
    if (send.stepId) {
      const [step] = await db.select().from(sequenceSteps).where(eq(sequenceSteps.id, send.stepId)).limit(1);
      if (step) context.stepOrder = step.stepOrder + 1;
    }
  } else if (send.runId) {
    const [run] = await db.select().from(outreachRuns).where(eq(outreachRuns.id, send.runId)).limit(1);
    context.kind = "run";
    context.subjectOverride = run?.subjectOverride ?? null;
  }

  // Re-render the email exactly as it was composed.
  let email: { subject: string; html: string; text: string } | null = null;
  if (template && lead) {
    const effectiveTemplate = context.subjectOverride
      ? { ...template, subject: context.subjectOverride }
      : template;
    email = renderOutreachEmail({
      template: effectiveTemplate,
      tokens: tokensForLead(lead, undefined, effectiveTemplate.audience),
      unsubscribeUrl: buildUnsubscribeUrl(lead.unsubscribeToken),
      openPixelUrl: null,
      clickTracker: (u) => u,
    });
  }

  return NextResponse.json({
    send: {
      id: send.id,
      status: send.status,
      sentAt: send.sentAt,
      createdAt: send.createdAt,
      openedAt: send.openedAt,
      firstClickedAt: send.firstClickedAt,
      openCount: send.openCount,
      clickCount: send.clickCount,
      errorDetail: send.errorDetail,
    },
    recipient: lead
      ? {
          name: lead.name ?? null,
          company: lead.companyName ?? null,
          email: lead.email ?? null,
          city: lead.city ?? null,
        }
      : null,
    context,
    email,
  });
}
