import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  leads,
  submissions,
  leadQuotes,
  tasks,
  outreachSends,
  sequenceEnrollments,
  sequences,
  emailTemplates,
} from "@/shared/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { deriveEmailable } from "@/lib/crm/leads";

interface TimelineEvent {
  type: string;
  at: string | null;
  label: string;
  detail?: string;
}

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const [lead] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [subs, quotes, leadTasks, sends, enrollments] = await Promise.all([
    db.select().from(submissions).where(eq(submissions.leadId, params.id)).orderBy(desc(submissions.submittedAt)),
    db.select().from(leadQuotes).where(eq(leadQuotes.leadId, params.id)).orderBy(desc(leadQuotes.createdAt)),
    db.select().from(tasks).where(eq(tasks.leadId, params.id)).orderBy(desc(tasks.createdAt)),
    db.select().from(outreachSends).where(eq(outreachSends.leadId, params.id)).orderBy(desc(outreachSends.createdAt)),
    db
      .select({
        id: sequenceEnrollments.id,
        status: sequenceEnrollments.status,
        currentStep: sequenceEnrollments.currentStep,
        nextDueAt: sequenceEnrollments.nextDueAt,
        createdAt: sequenceEnrollments.createdAt,
        sequenceName: sequences.name,
      })
      .from(sequenceEnrollments)
      .leftJoin(sequences, eq(sequenceEnrollments.sequenceId, sequences.id))
      .where(eq(sequenceEnrollments.leadId, params.id)),
  ]);

  // Build a merged, chronological timeline.
  const timeline: TimelineEvent[] = [];
  timeline.push({ type: "created", at: lead.createdAt as unknown as string, label: "Lead created", detail: lead.source ?? undefined });
  for (const s of subs) {
    timeline.push({ type: "submission", at: s.submittedAt as unknown as string, label: `Form submitted: ${s.formType}`, detail: s.sourcePage ?? undefined });
  }
  for (const q of quotes) {
    const range = q.planningRangeLow && q.planningRangeHigh ? `$${q.planningRangeLow} to $${q.planningRangeHigh}` : undefined;
    timeline.push({ type: "quote", at: q.createdAt as unknown as string, label: `Planning range provided`, detail: range });
  }
  for (const e of enrollments) {
    timeline.push({ type: "enrollment", at: e.createdAt as unknown as string, label: `Enrolled in sequence: ${e.sequenceName ?? "Unknown"}`, detail: e.status });
  }
  for (const send of sends) {
    if (send.sentAt) timeline.push({ type: "send", at: send.sentAt as unknown as string, label: "Email sent" });
    if (send.openedAt) timeline.push({ type: "open", at: send.openedAt as unknown as string, label: `Email opened (${send.openCount}x)` });
    if (send.firstClickedAt) timeline.push({ type: "click", at: send.firstClickedAt as unknown as string, label: `Link clicked (${send.clickCount}x)` });
    if (send.status === "failed") timeline.push({ type: "failed", at: send.createdAt as unknown as string, label: "Email failed", detail: send.errorDetail ?? undefined });
  }
  // Notes (status changes / manual notes) are stored on the lead as a jsonb array.
  const notesArr = Array.isArray(lead.notes) ? (lead.notes as Array<{ text: string; addedBy?: string; addedAt?: string }>) : [];
  for (const n of notesArr) {
    timeline.push({ type: "note", at: n.addedAt ?? null, label: "Note", detail: n.text });
  }

  timeline.sort((a, b) => {
    const ta = a.at ? new Date(a.at).getTime() : 0;
    const tb = b.at ? new Date(b.at).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({
    lead,
    submissions: subs,
    quotes,
    tasks: leadTasks,
    sends,
    enrollments,
    timeline,
  });
}

const EDITABLE_FIELDS = [
  "name",
  "companyName",
  "email",
  "phone",
  "website",
  "city",
  "serviceArea",
  "pipelineStage",
  "emailStatus",
  "leadGroup",
  "businessCategory",
] as const;

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const [existing] = await db.select().from(leads).where(eq(leads.id, params.id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  // Appending a note?
  if (typeof body.note === "string" && body.note.trim()) {
    const notesArr = Array.isArray(existing.notes) ? (existing.notes as unknown[]) : [];
    updates.notes = [
      ...notesArr,
      { text: body.note.trim(), addedBy: auth.user?.email ?? "admin", addedAt: new Date().toISOString() },
    ];
  }

  // Recompute emailable when email or emailStatus change.
  const nextEmail = "email" in updates ? (updates.email as string | null) : existing.email;
  const nextEmailStatus = "emailStatus" in updates ? (updates.emailStatus as string) : existing.emailStatus;
  updates.emailable = deriveEmailable(nextEmail, nextEmailStatus);

  const [updated] = await db.update(leads).set(updates).where(eq(leads.id, params.id)).returning();
  return NextResponse.json(updated);
}
