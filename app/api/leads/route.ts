import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { desc, eq, and, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { attachOverlapsToLeads } from "@/lib/leadDedupe";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const city = url.searchParams.get("city");
  const serviceType = url.searchParams.get("serviceType");

  const conditions: SQL[] = [];

  if (status) {
    conditions.push(eq(leads.status, status));
  }
  if (city) {
    conditions.push(eq(leads.city, city));
  }
  if (serviceType) {
    conditions.push(eq(leads.serviceType, serviceType));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const allLeads = await db
    .select()
    .from(leads)
    .where(whereClause)
    .orderBy(desc(leads.createdAt));

  const withOverlaps = await attachOverlapsToLeads(allLeads);
  return NextResponse.json(withOverlaps);
}
