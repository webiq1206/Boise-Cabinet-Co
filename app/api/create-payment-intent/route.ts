import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, isDbAvailable } from '@/lib/db';
import { leads, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getValidatedSession } from '@/lib/auth';

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!isDbAvailable() || !db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const session = await getValidatedSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = leadResults[0];
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (lead.status !== 'available') {
      return NextResponse.json({ error: 'Lead is no longer available' }, { status: 400 });
    }

    const userResults = await db.select().from(users).where(eq(users.id, session.userId));
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

    const leadPrice = parseFloat(lead.currentLeadPrice || '10');
    const creditBalance = parseFloat(user.creditBalance || '0');
    const creditsToApply = Math.min(creditBalance, leadPrice);
    const amountDue = Math.round((leadPrice - creditsToApply) * 100) / 100;

    if (amountDue <= 0) {
      return NextResponse.json({
        coveredByCredits: true,
        creditsToApply,
        creditBalance,
        amountDue: 0,
        amount: 0,
        leadPrice,
      });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payments are temporarily unavailable (Stripe not configured)' },
        { status: 503 }
      );
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      await db.update(users).set({ stripeCustomerId }).where(eq(users.id, user.id));
    }

    const amountInCents = Math.round(amountDue * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        leadId: lead.id,
        userId: user.id,
        serviceType: lead.serviceType || '',
        city: lead.city || '',
        creditsToApply: String(creditsToApply),
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
      coveredByCredits: false,
      creditsToApply,
      creditBalance,
      amountDue,
      leadPrice,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
