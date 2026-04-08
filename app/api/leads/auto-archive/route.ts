import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq, and, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const archived = await db.update(leads).set({
    status: "archived",
    updatedAt: new Date(),
  }).where(
    and(
      eq(leads.status, "available"),
      lt(leads.createdAt, sevenDaysAgo)
    )
  ).returning({ id: leads.id });

  return NextResponse.json({
    success: true,
    archivedCount: archived.length,
    archivedIds: archived.map(l => l.id),
  });
}
