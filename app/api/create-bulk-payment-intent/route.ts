import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, isDbAvailable } from '@/lib/db';
import { leads, users } from '@/shared/schema';
import { eq, inArray } from 'drizzle-orm';

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function calculateBulkDiscount(count: number): number {
  if (count > 20) return 0.20;  // 21+ leads: 20% discount
  if (count >= 6) return 0.10;  // 6-20 leads: 10% discount
  if (count >= 2) return 0.05;  // 2-5 leads: 5% discount
  return 0;
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payments are temporarily unavailable (Stripe not configured)' },
        { status: 503 }
      );
    }

    if (!isDbAvailable() || !db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { leadIds, userId } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (leadIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 leads per bulk purchase' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    // Get user from database
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    const user = userResults[0];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (!user.agreementAccepted) {
      return NextResponse.json(
        { error: 'You must accept the legal agreement before purchasing leads' },
        { status: 403 }
      );
    }

    // Fetch all leads and validate
    const leadResults = await db.select().from(leads).where(inArray(leads.id, leadIds));
    
    // Validate all leads exist and are available
    for (const leadId of leadIds) {
      const lead = leadResults.find(l => l.id === leadId);
      if (!lead) {
        return NextResponse.json({ error: `Lead ${leadId} not found` }, { status: 404 });
      }
      if (lead.status !== 'available') {
        return NextResponse.json({ error: `Lead ${leadId} is no longer available` }, { status: 400 });
      }
    }

    // Calculate total with bulk discount
    const subtotal = leadResults.reduce((sum, l) => sum + parseFloat(l.currentLeadPrice || '0'), 0);
    const discountPercent = calculateBulkDiscount(leadResults.length);
    const discountAmount = subtotal * discountPercent;
    const total = subtotal - discountAmount;

    let stripeCustomerId = user.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await db.update(users).set({ stripeCustomerId }).where(eq(users.id, user.id));
    }

    // Create payment intent for the discounted total (amount in cents)
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        leadIds: JSON.stringify(leadIds),
        userId: user.id,
        bulkPurchase: 'true',
        leadsCount: String(leadResults.length),
        discountPercent: String(Math.round(discountPercent * 100)),
      },
      description: `Bulk lead purchase: ${leadResults.length} leads`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      subtotal,
      discountPercent: discountPercent * 100,
      discountAmount,
      total,
      leadsCount: leadResults.length,
    });
  } catch (error) {
    console.error('Error creating bulk payment intent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bulk payment intent' },
      { status: 500 }
    );
  }
}
