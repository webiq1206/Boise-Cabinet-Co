import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadPurchases } from "@/shared/schema";
import { eq, desc, gte } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { computeOverlaps, type DedupeCandidate } from "@/lib/leadDedupe";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await db
      .select()
      .from(leadPurchases)
      .where(eq(leadPurchases.userId, session.userId))
      .orderBy(desc(leadPurchases.createdAt));

    const results = await Promise.all(
      purchases.map(async (purchase) => {
        const leadResults = await db!.select().from(leads).where(eq(leads.id, purchase.leadId));
        const lead = leadResults[0];
        if (!lead) return null;
        return {
          ...lead,
          purchasePrice: purchase.purchasePrice || lead.purchasePrice,
          purchasedAt: purchase.createdAt || lead.purchasedAt,
        };
      })
    );

    const valid = results.filter(Boolean) as any[];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const candidateRows = await db.select().from(leads).where(gte(leads.createdAt, sevenDaysAgo));
    const candidates: DedupeCandidate[] = candidateRows.map((l) => ({
      id: l.id,
      quoteId: l.quoteId ?? null,
      email: l.email,
      address: l.address ?? null,
      status: l.status,
      createdAt: l.createdAt ?? new Date(),
      purchasedBy: l.purchasedBy ?? null,
    }));
    const targets: DedupeCandidate[] = valid.map((l) => ({
      id: l.id,
      quoteId: l.quoteId ?? null,
      email: l.email,
      address: l.address ?? null,
      status: l.status,
      createdAt: l.createdAt ?? new Date(),
      purchasedBy: l.purchasedBy ?? null,
    }));
    const overlapMap = computeOverlaps(targets, candidates);
    const withOverlaps = valid.map((l) => ({
      ...l,
      possibleDuplicates: overlapMap.get(l.id) ?? [],
    }));

    return NextResponse.json(withOverlaps);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
