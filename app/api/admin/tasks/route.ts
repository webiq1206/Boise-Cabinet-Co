import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, leads } from "@/shared/schema";
import { and, asc, isNull, lte, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

// Tasks that are open (not completed) and due today or overdue, across all leads.
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      id: tasks.id,
      leadId: tasks.leadId,
      title: tasks.title,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      leadName: leads.name,
      companyName: leads.companyName,
    })
    .from(tasks)
    .leftJoin(leads, eq(tasks.leadId, leads.id))
    .where(and(isNull(tasks.completedAt), lte(tasks.dueAt, endOfToday)))
    .orderBy(asc(tasks.dueAt));

  return NextResponse.json(rows);
}
