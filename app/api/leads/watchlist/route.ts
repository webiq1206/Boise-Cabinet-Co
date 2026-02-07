import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role === "customer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const watchedIds = parseJsonArray(user.watchedLeads);

  if (watchedIds.length === 0) {
    return NextResponse.json([]);
  }

  const watchedLeads = [];
  for (const id of watchedIds) {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    if (result[0] && result[0].status === "available") {
      const lead = { ...result[0] };
      lead.name = "***";
      lead.email = "***";
      lead.phone = "***";
      lead.address = "***";
      watchedLeads.push(lead);
    }
  }

  return NextResponse.json(watchedLeads);
}
