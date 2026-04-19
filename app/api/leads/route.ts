import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { desc, eq, and, gte, lt, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { attachOverlaps, type DedupeCandidate } from "@/lib/leadDedupe";

async function getOverlapCandidates(): Promise<DedupeCandidate[]> {
  if (!db) return [];
  // Pull all leads regardless of age/status so the badge surfaces every
  // historical overlap, not just recent ones.
  const rows = await db.select().from(leads);
  return rows.map((l) => ({
    id: l.id,
    quoteId: l.quoteId ?? null,
    email: l.email,
    address: l.address ?? null,
    status: l.status,
    createdAt: l.createdAt ?? new Date(),
    purchasedBy: l.purchasedBy ?? null,
  }));
}

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

  const candidates = await getOverlapCandidates();

  const toCandidate = (l: (typeof allLeads)[number]): DedupeCandidate => ({
    id: l.id,
    quoteId: l.quoteId ?? null,
    email: l.email,
    address: l.address ?? null,
    status: l.status,
    createdAt: l.createdAt ?? new Date(),
    purchasedBy: l.purchasedBy ?? null,
  });

  if (user.role === "admin") {
    const targets = allLeads.map(toCandidate);
    const overlaps = attachOverlaps(targets, candidates);
    const overlapMap = new Map(overlaps.map((o) => [o.id, o.possibleDuplicates]));
    return NextResponse.json(
      allLeads.map((l) => ({ ...l, possibleDuplicates: overlapMap.get(l.id) ?? [] }))
    );
  }

  const filtered = allLeads.filter((lead) => {
    if (lead.status === "archived") return false;
    if (lead.status === "purchased" && lead.purchasedBy !== user.id) return false;
    if (lead.status === "declined_admin") return false;
    if (lead.status === "pending_admin") return false;
    return true;
  });

  const targets = filtered.map(toCandidate);
  const overlaps = attachOverlaps(targets, candidates);
  const overlapMap = new Map(overlaps.map((o) => [o.id, o.possibleDuplicates]));
  const withOverlaps = filtered.map((l) => ({
    ...l,
    possibleDuplicates: overlapMap.get(l.id) ?? [],
  }));

  const masked = withOverlaps.map((lead) => {
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
