import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadPurchases } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

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
        return { purchase, lead: leadResults[0] || null };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
