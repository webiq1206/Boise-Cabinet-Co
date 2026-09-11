import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/shared/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

export async function GET(_request: NextRequest, props: { params: Promise<{ leadId: string }> }) {
  const params = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const rows = await db.select().from(tasks).where(eq(tasks.leadId, params.leadId)).orderBy(desc(tasks.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest, props: { params: Promise<{ leadId: string }> }) {
  const params = await props.params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const [created] = await db
    .insert(tasks)
    .values({
      leadId: params.leadId,
      title: String(body.title),
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: { params: { leadId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if ("completed" in body) updates.completedAt = body.completed ? new Date() : null;
  if ("title" in body) updates.title = String(body.title);
  if ("dueAt" in body) updates.dueAt = body.dueAt ? new Date(body.dueAt) : null;

  const [updated] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, String(body.taskId)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { leadId: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  await db.delete(tasks).where(eq(tasks.id, taskId));
  return NextResponse.json({ success: true });
}
