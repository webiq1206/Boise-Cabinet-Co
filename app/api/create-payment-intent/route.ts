import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, isDbAvailable } from '@/lib/db';
import { leads, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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
    const { leadId, userId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    // Get lead from database
    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadResults[0];
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status !== 'available') {
      return NextResponse.json({ error: 'Lead is no longer available' }, { status: 400 });
    }

    // Get user from database
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    const user = userResults[0];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Verify user has accepted agreement
    if (!user.agreementAccepted) {
      return NextResponse.json(
        { error: 'You must accept the legal agreement before purchasing leads' },
        { status: 403 }
      );
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to user
      await db.update(users).set({ stripeCustomerId }).where(eq(users.id, user.id));
    }

    // Create payment intent for the lead price (amount is in cents)
    const amountInCents = Math.round(parseFloat(lead.currentLeadPrice || '10') * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        leadId: lead.id,
        userId: user.id,
        serviceType: lead.serviceType || '',
        city: lead.city || '',
      },
      description: `Lead purchase: ${lead.serviceType} in ${lead.city}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
