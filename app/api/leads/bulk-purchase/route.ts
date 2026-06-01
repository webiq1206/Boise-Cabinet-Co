import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases, creditTransactions } from "@/shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession, getUserFromDb } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function calculateBulkDiscount(count: number): number {
  if (count > 20) return 0.20;
  if (count >= 6) return 0.10;
  if (count >= 2) return 0.05;
  return 0;
}

function distributeCreditsProportionally(fetchedLeads: Array<{ id: string; currentLeadPrice: string | null }>, totalCredits: number): Map<string, number> {
  const result = new Map<string, number>();
  if (totalCredits <= 0) {
    for (const lead of fetchedLeads) result.set(lead.id, 0);
    return result;
  }

  const totalPrice = fetchedLeads.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || "0"), 0);
  if (totalPrice <= 0) {
    for (const lead of fetchedLeads) result.set(lead.id, 0);
    return result;
  }

  let allocated = 0;
  for (let i = 0; i < fetchedLeads.length; i++) {
    const lead = fetchedLeads[i];
    const price = parseFloat(lead.currentLeadPrice || "0");
    if (i === fetchedLeads.length - 1) {
      const remainder = Math.round((totalCredits - allocated) * 100) / 100;
      result.set(lead.id, Math.min(remainder, price));
    } else {
      const share = Math.round((price / totalPrice) * totalCredits * 100) / 100;
      const capped = Math.min(share, price);
      result.set(lead.id, capped);
      allocated += capped;
    }
  }
  return result;
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

    const { assertSubcontractorCanPurchase } = await import("@/lib/compliance/gate");
    const complianceCheck = await assertSubcontractorCanPurchase(session.userId);
    if (!complianceCheck.allowed) {
      return NextResponse.json({ error: complianceCheck.reason }, { status: 403 });
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

    // Idempotent retry path: if this user already recorded purchases for
    // exactly the same set of leads with the same paymentIntentId, return
    // success so a UI retry after a transient backend failure doesn't 400
    // even though the leads are now `purchased`.
    if (paymentIntentId) {
      const priorPayments = await db.select().from(leadPurchases).where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId));
      if (priorPayments.length > 0) {
        const allOwnedByUser = priorPayments.every((p) => p.userId === user.id && !p.refunded);
        const sortedPriorIds = [...priorPayments.map((p) => p.leadId)].sort();
        const sortedRequestIds = [...leadIds].sort();
        if (allOwnedByUser && JSON.stringify(sortedPriorIds) === JSON.stringify(sortedRequestIds)) {
          return NextResponse.json({
            success: true,
            alreadyRecorded: true,
            purchases: priorPayments,
            leads: fetchedLeads,
            creditsUsed: priorPayments.reduce((s, p) => s + parseFloat(p.creditsUsed || "0"), 0),
          });
        }
        return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });
      }
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

    let creditsUsed = 0;
    let stripePaymentId = "credit_purchase";

    if (useCredits && !paymentIntentId) {
      const creditBalance = parseFloat(user.creditBalance || "0");
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
        const allOwned = existingPayment.every((p) => p.userId === user.id && !p.refunded);
        const sortedExistingLeadIds = [...existingPayment.map((p) => p.leadId)].sort();
        const sortedRequestIds2 = [...leadIds].sort();
        if (allOwned && JSON.stringify(sortedExistingLeadIds) === JSON.stringify(sortedRequestIds2)) {
          return NextResponse.json({
            success: true,
            alreadyRecorded: true,
            purchases: existingPayment,
            leads: fetchedLeads,
            creditsUsed: existingPayment.reduce((s, p) => s + parseFloat(p.creditsUsed || "0"), 0),
          });
        }
        return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });
      }

      const creditBalance = parseFloat(user.creditBalance || "0");
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

    const creditAllocation = distributeCreditsProportionally(fetchedLeads, creditsUsed);

    const purchases = [];
    const updatedLeads = [];
    const claimedLeadIds: string[] = [];

    for (const lead of fetchedLeads) {
      const claimResult = await db.update(leads).set({
        status: "purchased",
        purchasedBy: user.id,
        purchasedAt: new Date(),
        purchasePrice: lead.currentLeadPrice,
        stripePaymentIntentId: stripePaymentId,
      }).where(
        and(eq(leads.id, lead.id), eq(leads.status, "available"))
      ).returning();

      if (claimResult.length === 0) {
        for (const claimedId of claimedLeadIds) {
          await db.update(leads).set({ status: "available", purchasedBy: null, purchasedAt: null, purchasePrice: null, stripePaymentIntentId: null }).where(eq(leads.id, claimedId));
        }
        return NextResponse.json(
          { error: "One or more leads are no longer available", unavailableIds: [lead.id] },
          { status: 409 }
        );
      }

      claimedLeadIds.push(lead.id);
      updatedLeads.push(claimResult[0]);
    }

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
        for (const claimedId of claimedLeadIds) {
          await db.update(leads).set({ status: "available", purchasedBy: null, purchasedAt: null, purchasePrice: null, stripePaymentIntentId: null }).where(eq(leads.id, claimedId));
        }
        return NextResponse.json({ error: "Insufficient credit balance" }, { status: 400 });
      }
    }

    try {
      for (const lead of fetchedLeads) {
        const leadCredits = creditAllocation.get(lead.id) || 0;
        const [purchase] = await db.insert(leadPurchases).values({
          leadId: lead.id,
          userId: user.id,
          purchasePrice: lead.currentLeadPrice,
          stripePaymentIntentId: stripePaymentId,
          creditsUsed: String(leadCredits),
        }).returning();

        purchases.push(purchase);
      }
    } catch (insertError) {
      if (creditsUsed > 0) {
        await db.update(users).set({
          creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) + ${String(creditsUsed)}`,
          updatedAt: new Date(),
        }).where(eq(users.id, user.id));
      }
      for (const claimedId of claimedLeadIds) {
        await db.update(leads).set({ status: "available", purchasedBy: null, purchasedAt: null, purchasePrice: null, stripePaymentIntentId: null }).where(eq(leads.id, claimedId));
      }
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
          description: `Bulk purchase: ${fetchedLeads.length} leads`,
          leadPurchaseId: purchases[0]?.id || null,
          balanceAfter: newBalance,
        });
      } catch (auditError) {
        console.error("Failed to record bulk credit transaction audit log:", auditError);
      }
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
    const message = error instanceof Error ? error.message : "Failed to bulk purchase leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
