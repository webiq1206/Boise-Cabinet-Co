import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { desc, eq, and, gte, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";

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

  const masked = allLeads.map((lead) => {
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
