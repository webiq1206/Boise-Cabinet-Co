import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq, and } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const subcontractors = await db.select().from(users).where(
      and(eq(users.role, "subcontractor"), eq(users.isActive, true))
    );

    return NextResponse.json(subcontractors);
  } catch (error) {
    console.error("Error fetching subcontractors:", error);
    return NextResponse.json({ error: "Failed to fetch subcontractors" }, { status: 500 });
  }
}
