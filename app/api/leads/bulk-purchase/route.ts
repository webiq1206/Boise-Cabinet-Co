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

    const user = await getUserFromDb(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (user.role !== "subcontractor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.agreementAccepted) {
      return NextResponse.json(
        { error: "You must accept the legal agreement before purchasing leads" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leadIds, paymentIntentId } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "leadIds must be a non-empty array" }, { status: 400 });
    }

    if (leadIds.length > 50) {
      return NextResponse.json({ error: "Cannot purchase more than 50 leads at once" }, { status: 400 });
    }

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 });
    }

    const allLeads = await Promise.all(
      leadIds.map((id: string) => db!.select().from(leads).where(eq(leads.id, id)))
    );

    const fetchedLeads = allLeads.map((r) => r[0]).filter(Boolean);

    if (fetchedLeads.length !== leadIds.length) {
      return NextResponse.json({ error: "One or more leads not found" }, { status: 404 });
    }

    const unavailable = fetchedLeads.filter((l) => l.status !== "available");
    if (unavailable.length > 0) {
      return NextResponse.json(
        { error: "One or more leads are no longer available", unavailableIds: unavailable.map((l) => l.id) },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment has not been completed" }, { status: 400 });
    }

    if (paymentIntent.metadata?.userId !== user.id) {
      return NextResponse.json({ error: "Payment intent does not match this user" }, { status: 400 });
    }

    const existingPayment = await db.select().from(leadPurchases).where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId));
    if (existingPayment.length > 0) {
      return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });
    }

    const purchases = [];
    const updatedLeads = [];

    for (const lead of fetchedLeads) {
      const [purchase] = await db.insert(leadPurchases).values({
        leadId: lead.id,
        userId: user.id,
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: paymentIntentId,
      }).returning();

      const [updatedLead] = await db.update(leads).set({
        status: "purchased",
        purchasedBy: user.id,
        purchasedAt: new Date(),
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: paymentIntentId,
      }).where(eq(leads.id, lead.id)).returning();

      purchases.push(purchase);
      updatedLeads.push(updatedLead);
    }

    try {
      const { sendLeadPurchasedNotification } = await import("@/server/services/emailNotifications");
      const buyerName = user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const buyerEmail = user.email || '';

      for (const updatedLead of updatedLeads) {
        sendLeadPurchasedNotification(
          {
            id: updatedLead.id,
            name: updatedLead.name,
            email: updatedLead.email,
            phone: updatedLead.phone || "",
            city: updatedLead.city,
            serviceType: updatedLead.serviceType,
            finalQuote: updatedLead.finalQuote || "0",
            address: updatedLead.address || undefined,
            purchasePrice: updatedLead.purchasePrice || updatedLead.currentLeadPrice || "0",
          },
          { name: buyerName, email: buyerEmail }
        ).catch(() => {});
      }
    } catch (e) {}

    return NextResponse.json({ success: true, purchases, leads: updatedLeads });
  } catch (error) {
    console.error("Error bulk purchasing leads:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk purchase leads" },
      { status: 500 }
    );
  }
}
