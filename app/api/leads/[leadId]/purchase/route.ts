import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { leads, users, leadPurchases, quotes } from "@/shared/schema";
import { eq } from "drizzle-orm";
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

    const { leadId } = await params;
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 });
    }

    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadResults[0];

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status !== "available") {
      return NextResponse.json({ error: "Lead is no longer available" }, { status: 400 });
    }

    const existingPurchase = await db.select().from(leadPurchases).where(eq(leadPurchases.leadId, leadId));
    if (existingPurchase.length > 0) {
      return NextResponse.json({ error: "Lead has already been purchased" }, { status: 409 });
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
    }).where(eq(leads.id, leadId)).returning();

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

    return NextResponse.json({ success: true, purchase, lead: updatedLead });
  } catch (error) {
    console.error("Error purchasing lead:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to purchase lead" },
      { status: 500 }
    );
  }
}
