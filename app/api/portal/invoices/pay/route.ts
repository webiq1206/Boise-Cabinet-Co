import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { db, isDbAvailable } from "@/lib/db";
import { projectInvoices, projects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const bodySchema = z.object({
  invoiceId: z.string(),
  projectId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !isDbAvailable() || !db) {
      return NextResponse.json(
        { error: "Payment processing unavailable" },
        { status: 503 },
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());

    const invoiceRows = await db
      .select()
      .from(projectInvoices)
      .where(eq(projectInvoices.id, body.invoiceId))
      .limit(1);

    const invoice = invoiceRows[0];
    if (!invoice || invoice.projectId !== body.projectId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    const projectRows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, body.projectId))
      .limit(1);

    const project = projectRows[0];
    if (user.role === "customer" && project?.customerUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const amountCents = Math.round(Number(invoice.amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        invoiceId: invoice.id,
        projectId: body.projectId,
        type: "customer_invoice",
      },
      description: invoice.description ?? "Boise Cabinet Co invoice",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: Number(invoice.amount),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Invoice payment error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
