import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachRuns, emailTemplates } from "@/shared/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

// List runs (History tab polls this for progress).
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const rows = await db
    .select({
      id: outreachRuns.id,
      templateId: outreachRuns.templateId,
      templateName: emailTemplates.name,
      subjectOverride: outreachRuns.subjectOverride,
      status: outreachRuns.status,
      sentCount: outreachRuns.sentCount,
      failedCount: outreachRuns.failedCount,
      skippedCount: outreachRuns.skippedCount,
      createdAt: outreachRuns.createdAt,
    })
    .from(outreachRuns)
    .leftJoin(emailTemplates, eq(outreachRuns.templateId, emailTemplates.id))
    .orderBy(desc(outreachRuns.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}

// Create a one-off run (batch blast). The engine picks it up on the next tick.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });

  const [run] = await db
    .insert(outreachRuns)
    .values({
      templateId: body.templateId,
      subjectOverride: body.subjectOverride || null,
      targetFilter: body.filter ?? {},
      batchSize: Number(body.batchSize) || 10,
      dailyCap: Number(body.dailyCap) || 50,
      delaySeconds: Number(body.delaySeconds) || 60,
      status: "active",
    })
    .returning();

  return NextResponse.json(run, { status: 201 });
}

// Pause / resume / complete a run.
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.runId || !body?.status) return NextResponse.json({ error: "runId and status required" }, { status: 400 });

  const [updated] = await db
    .update(outreachRuns)
    .set({ status: body.status })
    .where(eq(outreachRuns.id, body.runId))
    .returning();

  return NextResponse.json(updated);
}
