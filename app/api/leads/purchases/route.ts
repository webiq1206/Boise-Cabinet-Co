import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadPurchases } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { attachOverlapsToLeads } from "@/lib/leadDedupe";

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

    // Exclude refunded purchases — those leads have been reversed (e.g. via
    // an admin duplicate-merge) and should not appear as currently-owned.
    const activePurchases = purchases.filter((p) => !p.refunded);

    const results = await Promise.all(
      activePurchases.map(async (purchase) => {
        const leadResults = await db!.select().from(leads).where(eq(leads.id, purchase.leadId));
        const lead = leadResults[0];
        if (!lead) return null;
        // The buyer must always see the unmasked customer details on a
        // purchase they own. Surface a server error rather than silently
        // returning masked data so the regression cannot come back unnoticed.
        if (
          lead.name === "***" ||
          lead.email === "***" ||
          lead.phone === "***" ||
          lead.address === "***"
        ) {
          // Log full detail server-side for diagnosis; return a generic
          // error message to the client to avoid leaking internal ids.
          console.error(
            `[purchases] Refusing to serve masked contact info for purchased lead ${lead.id} to its buyer ${session.userId}`
          );
          throw new Error("Failed to load purchased lead details");
        }
        return {
          ...lead,
          purchasePrice: purchase.purchasePrice || lead.purchasePrice,
          purchasedAt: purchase.createdAt || lead.purchasedAt,
        };
      })
    );

    type PurchaseLead = NonNullable<(typeof results)[number]>;
    const valid: PurchaseLead[] = results.filter(
      (r): r is PurchaseLead => r !== null
    );

    const withOverlaps = await attachOverlapsToLeads(valid);

    return NextResponse.json(withOverlaps);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
