import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases, creditTransactions, quotes } from "@/shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
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

    const { leadId } = await params;
    const body = await request.json();
    const { paymentIntentId, useCredits } = body;

    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadResults[0];

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Idempotent retry path: if this user already recorded a purchase for
    // this lead with the same paymentIntentId, return success so a UI
    // retry after a transient backend failure doesn't 400/409 even though
    // Stripe charged the card and the lead is now `purchased`.
    const existingPurchase = await db.select().from(leadPurchases).where(eq(leadPurchases.leadId, leadId));
    if (existingPurchase.length > 0) {
      const owned = existingPurchase.find(
        (p) =>
          p.userId === user.id &&
          paymentIntentId &&
          p.stripePaymentIntentId === paymentIntentId &&
          !p.refunded
      );
      if (owned) {
        return NextResponse.json({
          success: true,
          alreadyRecorded: true,
          purchase: owned,
          lead,
          creditsUsed: parseFloat(owned.creditsUsed || "0"),
        });
      }
      return NextResponse.json({ error: "Lead has already been purchased" }, { status: 409 });
    }

    if (lead.status !== "available") {
      return NextResponse.json({ error: "Lead is no longer available" }, { status: 400 });
    }

    const leadPrice = parseFloat(lead.currentLeadPrice || "0");
    let creditsUsed = 0;
    let stripePaymentId = "credit_purchase";

    if (useCredits && !paymentIntentId) {
      const creditBalance = parseFloat(user.creditBalance || "0");
      if (creditBalance < leadPrice) {
        return NextResponse.json({ error: "Insufficient credit balance" }, { status: 400 });
      }
      creditsUsed = leadPrice;
    } else if (paymentIntentId) {
      if (!stripe) {
        return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json({ error: "Payment has not been completed" }, { status: 400 });
      }

      if (paymentIntent.metadata?.leadId !== leadId) {
        return NextResponse.json({ error: "Payment intent does not match this lead" }, { status: 400 });
      }

      if (paymentIntent.metadata?.userId !== user.id) {
        return NextResponse.json({ error: "Payment intent does not match this user" }, { status: 400 });
      }

      const existingPayment = await db.select().from(leadPurchases).where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId));
      if (existingPayment.length > 0) {
        return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });
      }

      const creditBalance = parseFloat(user.creditBalance || "0");
      const creditsFromMetadata = parseFloat(paymentIntent.metadata?.creditsToApply || "0");
      creditsUsed = Math.min(creditsFromMetadata, creditBalance, leadPrice);

      const expectedCharge = Math.round((leadPrice - creditsUsed) * 100);
      if (Math.abs(paymentIntent.amount - expectedCharge) > 1) {
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }

      stripePaymentId = paymentIntentId;
    } else {
      return NextResponse.json({ error: "Payment intent ID or credits required" }, { status: 400 });
    }

    const claimResult = await db.update(leads).set({
      status: "purchased",
      purchasedBy: user.id,
      purchasedAt: new Date(),
      purchasePrice: lead.currentLeadPrice,
      stripePaymentIntentId: stripePaymentId,
    }).where(
      and(eq(leads.id, leadId), eq(leads.status, "available"))
    ).returning();

    if (claimResult.length === 0) {
      return NextResponse.json({ error: "Lead is no longer available" }, { status: 409 });
    }

    const updatedLead = claimResult[0];

    if (creditsUsed > 0) {
      const deductResult = await db.update(users).set({
        creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) - ${String(creditsUsed)}`,
        updatedAt: new Date(),
      }).where(
        and(
          eq(users.id, user.id),
          sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) >= ${String(creditsUsed)}`
        )
      ).returning();

      if (deductResult.length === 0) {
        await db.update(leads).set({ status: "available", purchasedBy: null, purchasedAt: null, purchasePrice: null, stripePaymentIntentId: null }).where(eq(leads.id, leadId));
        return NextResponse.json({ error: "Insufficient credit balance" }, { status: 400 });
      }
    }

    let purchase;
    try {
      [purchase] = await db.insert(leadPurchases).values({
        leadId: lead.id,
        userId: user.id,
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: stripePaymentId,
        creditsUsed: String(creditsUsed),
      }).returning();
    } catch (insertError) {
      if (creditsUsed > 0) {
        await db.update(users).set({
          creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) + ${String(creditsUsed)}`,
          updatedAt: new Date(),
        }).where(eq(users.id, user.id));
      }
      await db.update(leads).set({ status: "available", purchasedBy: null, purchasedAt: null, purchasePrice: null, stripePaymentIntentId: null }).where(eq(leads.id, leadId));
      throw insertError;
    }

    if (creditsUsed > 0) {
      try {
        const freshUser = await db.select({ creditBalance: users.creditBalance }).from(users).where(eq(users.id, user.id));
        const newBalance = freshUser[0]?.creditBalance || "0";
        await db.insert(creditTransactions).values({
          userId: user.id,
          amount: String(-creditsUsed),
          type: "purchase_debit",
          description: `Lead purchase: ${lead.serviceType} in ${lead.city}`,
          leadPurchaseId: purchase.id,
          balanceAfter: newBalance,
        });
      } catch (auditError) {
        console.error("Failed to record credit transaction audit log:", auditError);
      }
    }

    try {
      const { sendLeadPurchasedNotification, sendLeadPurchaseConfirmation, sendCustomerStatusUpdate } = await import("@/server/services/emailNotifications");
      const buyerName = user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const buyerEmail = user.email || '';

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
          purchasePrice: updatedLead.purchasePrice || lead.currentLeadPrice || "0",
        },
        { name: buyerName, email: buyerEmail }
      ).catch(() => {});

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

      if (updatedLead.quoteId) {
        const quoteResult = await db.select().from(quotes).where(eq(quotes.id, updatedLead.quoteId));
        const quote = quoteResult[0];
        if (quote) {
          sendCustomerStatusUpdate(quote.email, quote.id, {
            status: 'contact_soon',
            message: "Great news! A team member has been assigned to your project and will be contacting you soon.",
          }).catch(() => {});
        }
      }
    } catch (e) {}

    return NextResponse.json({ success: true, purchase, lead: updatedLead, creditsUsed });
  } catch (error) {
    console.error("Error purchasing lead:", error);
    const message = error instanceof Error ? error.message : "Failed to purchase lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
