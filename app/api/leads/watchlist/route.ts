import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { attachOverlapsToLeads } from "@/lib/leadDedupe";

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

  type LeadRow = typeof leads.$inferSelect;
  const watchedLeads: LeadRow[] = [];
  for (const id of watchedIds) {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    if (result[0] && result[0].status === "available") {
      watchedLeads.push(result[0]);
    }
  }

  const withOverlaps = await attachOverlapsToLeads(watchedLeads);

  const masked = withOverlaps.map((lead) => ({
    ...lead,
    name: "***",
    email: "***",
    phone: "***",
    address: "***",
  }));

  return NextResponse.json(masked);
}
