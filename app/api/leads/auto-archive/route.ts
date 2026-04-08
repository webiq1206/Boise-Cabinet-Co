import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq, and, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function runAutoArchive() {
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

async function authenticateAdmin(request?: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) {
      return true;
    }
  }

  const session = await getSession();
  if (!session.userId) return false;
  const user = await getUserFromDb(session.userId);
  return user?.role === "admin";
}

export async function POST(request: NextRequest) {
  const isAuthed = await authenticateAdmin(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runAutoArchive();
}

export async function GET(request: NextRequest) {
  const isAuthed = await authenticateAdmin(request);
  if (!isAuthed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return runAutoArchive();
}
