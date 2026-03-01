import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    }

    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await getUserFromDb(session.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { leadId, userId } = body;

    if (!leadId || !userId) {
      return NextResponse.json({ error: "Both leadId and userId are required" }, { status: 400 });
    }

    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadResults[0];
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const userResults = await db.select().from(users).where(eq(users.id, userId));
    const targetUser = userResults[0];
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingPurchase = await db.select().from(leadPurchases).where(eq(leadPurchases.leadId, leadId));
    if (existingPurchase.length > 0) {
      return NextResponse.json({ error: "Lead has already been purchased and recorded" }, { status: 409 });
    }

    const paymentIntents = await stripe.paymentIntents.search({
      query: `metadata["leadId"]:"${leadId}" AND metadata["userId"]:"${userId}" AND status:"succeeded"`,
    });

    if (paymentIntents.data.length === 0) {
      return NextResponse.json(
        { error: "No matching succeeded payment found in Stripe for this lead and user" },
        { status: 404 }
      );
    }

    const paymentIntent = paymentIntents.data[0];

    const [purchase] = await db.insert(leadPurchases).values({
      leadId: lead.id,
      userId: targetUser.id,
      purchasePrice: lead.currentLeadPrice || "0",
      stripePaymentIntentId: paymentIntent.id,
    }).returning();

    const [updatedLead] = await db.update(leads).set({
      status: "purchased",
      purchasedBy: targetUser.id,
      purchasedAt: new Date(),
      purchasePrice: lead.currentLeadPrice,
      stripePaymentIntentId: paymentIntent.id,
    }).where(eq(leads.id, leadId)).returning();

    try {
      const { sendLeadPurchaseConfirmation } = await import("@/server/services/emailNotifications");
      const buyerEmail = targetUser.email || '';
      sendLeadPurchaseConfirmation(
        buyerEmail,
        {
          id: updatedLead.id,
          name: updatedLead.name,
          email: updatedLead.email,
          phone: updatedLead.phone || "",
          city: updatedLead.city,
          serviceType: updatedLead.serviceType,
          finalQuote: updatedLead.finalQuote || "0",
          address: updatedLead.address || undefined,
        }
      ).catch(() => {});
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Payment resolved. Lead ${leadId} is now marked as purchased by user ${userId}.`,
      purchase,
      lead: updatedLead,
      stripePaymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error resolving payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resolve payment" },
      { status: 500 }
    );
  }
}
