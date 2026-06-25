import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sequences, sequenceSteps } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if ("name" in body) updates.name = body.name;
  if ("description" in body) updates.description = body.description;
  if ("audience" in body) updates.audience = body.audience;
  if (Object.keys(updates).length > 0) {
    await db.update(sequences).set(updates).where(eq(sequences.id, params.id));
  }

  // Replace the full step set when provided.
  if (Array.isArray(body.steps)) {
    await db.delete(sequenceSteps).where(eq(sequenceSteps.sequenceId, params.id));
    if (body.steps.length > 0) {
      await db.insert(sequenceSteps).values(
        body.steps.map((step: { templateId: string; delayHours: number }, i: number) => ({
          sequenceId: params.id,
          templateId: step.templateId,
          stepOrder: i,
          delayHours: Number(step.delayHours) || 0,
        })),
      );
    }
  }

  const [updated] = await db.select().from(sequences).where(eq(sequences.id, params.id)).limit(1);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  await db.delete(sequenceSteps).where(eq(sequenceSteps.sequenceId, params.id));
  await db.delete(sequences).where(eq(sequences.id, params.id));
  return NextResponse.json({ success: true });
}
