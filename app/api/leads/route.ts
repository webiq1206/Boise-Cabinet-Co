import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { desc, eq, and, gte, lt, ne, or, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";

async function autoArchiveStaleLeads() {
  if (!db) return;
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    await db.update(leads).set({
      status: "archived",
      updatedAt: new Date(),
    }).where(
      and(
        eq(leads.status, "available"),
        lt(leads.createdAt, sevenDaysAgo)
      )
    );
  } catch (e) {
    console.error("[auto-archive] Error archiving stale leads:", e);
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await getUserFromDb(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  await autoArchiveStaleLeads();

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const city = url.searchParams.get("city");
  const serviceType = url.searchParams.get("serviceType");
  const availableOnly = url.searchParams.get("availableOnly") === "true";

  const conditions: SQL[] = [];

  if (availableOnly) {
    conditions.push(eq(leads.status, "available"));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    conditions.push(gte(leads.createdAt, thirtyDaysAgo));
  } else if (status) {
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

  if (user.role === "admin") {
    return NextResponse.json(allLeads);
  }

  const filtered = allLeads.filter((lead) => {
    if (lead.status === "archived") return false;
    if (lead.status === "purchased" && lead.purchasedBy !== user.id) return false;
    if (lead.status === "declined_admin") return false;
    if (lead.status === "pending_admin") return false;
    return true;
  });

  const masked = filtered.map((lead) => {
    if (lead.purchasedBy === user.id) {
      return lead;
    }
    return {
      ...lead,
      name: "***",
      email: "***",
      phone: "***",
      address: "***",
    };
  });

  return NextResponse.json(masked);
}
