import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { addCredits, logTransaction } from '../../lib/db/creditsDb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Make sure payment was successful
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ received: true });
      }
      
      // Extract metadata
      const userId = session.metadata?.userId;
      const creditAmount = session.metadata?.creditAmount;
      
      if (!userId || !creditAmount) {
        console.error('Missing metadata in Stripe webhook');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }
      
      // Add credits to user
      try {
        await addCredits(
          userId,
          parseInt(creditAmount),
          'Purchase',
          session.id
        );
        
        // Log transaction
        await logTransaction(
          userId,
          parseInt(creditAmount),
          'purchase',
          `Purchased ${creditAmount} credits`,
          session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          session.id
        );
        
        console.log(`Added ${creditAmount} credits to user ${userId}`);
      } catch (error) {
        console.error('Error adding credits:', error);
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 