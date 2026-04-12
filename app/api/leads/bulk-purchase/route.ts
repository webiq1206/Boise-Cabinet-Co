import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases, creditTransactions } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function calculateBulkDiscount(count: number): number {
  if (count > 20) return 0.20;
  if (count >= 6) return 0.10;
  if (count >= 2) return 0.05;
  return 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
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
    const { leadIds, paymentIntentId, useCredits } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "leadIds must be a non-empty array" }, { status: 400 });
    }

    if (leadIds.length > 50) {
      return NextResponse.json({ error: "Cannot purchase more than 50 leads at once" }, { status: 400 });
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

    const subtotal = fetchedLeads.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || "0"), 0);
    const discountPercent = calculateBulkDiscount(fetchedLeads.length);
    const discountAmount = subtotal * discountPercent;
    const totalPrice = Math.round((subtotal - discountAmount) * 100) / 100;
    
    const creditBalance = parseFloat(user.creditBalance || "0");
    let creditsUsed = 0;
    let stripePaymentId = "credit_purchase";

    if (useCredits && !paymentIntentId) {
      if (creditBalance < totalPrice) {
        return NextResponse.json({ error: "Insufficient credit balance" }, { status: 400 });
      }
      creditsUsed = totalPrice;
    } else if (paymentIntentId) {
      if (!stripe) {
        return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json({ error: "Payment has not been completed" }, { status: 400 });
      }

      if (paymentIntent.metadata?.userId !== user.id) {
        return NextResponse.json({ error: "Payment intent does not match this user" }, { status: 400 });
      }

      if (paymentIntent.metadata?.bulkPurchase !== "true") {
        return NextResponse.json({ error: "Payment intent is not a bulk purchase" }, { status: 400 });
      }

      const metaLeadIds = JSON.parse(paymentIntent.metadata?.leadIds || "[]");
      const sortedMetaIds = [...metaLeadIds].sort();
      const sortedRequestIds = [...leadIds].sort();
      if (JSON.stringify(sortedMetaIds) !== JSON.stringify(sortedRequestIds)) {
        return NextResponse.json({ error: "Payment intent lead IDs do not match request" }, { status: 400 });
      }

      const existingPayment = await db.select().from(leadPurchases).where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId));
      if (existingPayment.length > 0) {
        return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });
      }

      const creditsFromMetadata = parseFloat(paymentIntent.metadata?.creditsToApply || "0");
      creditsUsed = Math.min(creditsFromMetadata, creditBalance, totalPrice);

      const expectedCharge = Math.round((totalPrice - creditsUsed) * 100);
      if (Math.abs(paymentIntent.amount - expectedCharge) > 1) {
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }

      stripePaymentId = paymentIntentId;
    } else {
      return NextResponse.json({ error: "Payment intent ID or credits required" }, { status: 400 });
    }

    if (creditsUsed > 0) {
      const newBalance = Math.round((creditBalance - creditsUsed) * 100) / 100;
      if (newBalance < 0) {
        return NextResponse.json({ error: "Insufficient credit balance" }, { status: 400 });
      }
      await db.update(users).set({
        creditBalance: String(newBalance),
        updatedAt: new Date(),
      }).where(eq(users.id, user.id));
    }

    const purchases = [];
    const updatedLeads = [];
    const creditsPerLead = creditsUsed > 0 ? Math.round((creditsUsed / fetchedLeads.length) * 100) / 100 : 0;

    for (const lead of fetchedLeads) {
      const [purchase] = await db.insert(leadPurchases).values({
        leadId: lead.id,
        userId: user.id,
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: stripePaymentId,
        creditsUsed: String(creditsPerLead),
      }).returning();

      const [updatedLead] = await db.update(leads).set({
        status: "purchased",
        purchasedBy: user.id,
        purchasedAt: new Date(),
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: stripePaymentId,
      }).where(eq(leads.id, lead.id)).returning();

      purchases.push(purchase);
      updatedLeads.push(updatedLead);
    }

    if (creditsUsed > 0) {
      const newBalance = Math.round((creditBalance - creditsUsed) * 100) / 100;
      await db.insert(creditTransactions).values({
        userId: user.id,
        amount: String(-creditsUsed),
        type: "purchase_debit",
        description: `Bulk purchase: ${fetchedLeads.length} leads`,
        leadPurchaseId: purchases[0]?.id || null,
        balanceAfter: String(newBalance),
      });
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

    return NextResponse.json({ success: true, purchases, leads: updatedLeads, creditsUsed });
  } catch (error) {
    console.error("Error bulk purchasing leads:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk purchase leads" },
      { status: 500 }
    );
  }
}
