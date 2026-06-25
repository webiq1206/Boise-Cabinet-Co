import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sequences, sequenceSteps, emailTemplates } from "@/shared/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const seqs = await db.select().from(sequences).orderBy(asc(sequences.name));
  const ids = seqs.map((s) => s.id);
  const steps = ids.length
    ? await db
        .select({
          id: sequenceSteps.id,
          sequenceId: sequenceSteps.sequenceId,
          templateId: sequenceSteps.templateId,
          stepOrder: sequenceSteps.stepOrder,
          delayHours: sequenceSteps.delayHours,
          templateName: emailTemplates.name,
        })
        .from(sequenceSteps)
        .leftJoin(emailTemplates, eq(sequenceSteps.templateId, emailTemplates.id))
        .where(inArray(sequenceSteps.sequenceId, ids))
        .orderBy(asc(sequenceSteps.stepOrder))
    : [];

  const withSteps = seqs.map((s) => ({
    ...s,
    steps: steps.filter((st) => st.sequenceId === s.id),
  }));

  return NextResponse.json(withSteps);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const [seq] = await db
    .insert(sequences)
    .values({
      name: body.name,
      description: body.description ?? null,
      audience: body.audience || "homeowner",
    })
    .returning();

  const steps: { templateId: string; delayHours: number }[] = Array.isArray(body.steps) ? body.steps : [];
  if (steps.length > 0) {
    await db.insert(sequenceSteps).values(
      steps.map((step, i) => ({
        sequenceId: seq.id,
        templateId: step.templateId,
        stepOrder: i,
        delayHours: Number(step.delayHours) || 0,
      })),
    );
  }

  return NextResponse.json(seq, { status: 201 });
}
