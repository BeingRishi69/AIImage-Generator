import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { addCredits } from '@/app/lib/db/creditsDb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe webhook secret is not set' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Ensure this is a credit purchase
      if (session.metadata?.type === 'credit_purchase') {
        const userId = session.metadata.userId;
        const credits = parseInt(session.metadata.credits);
        
        // Add credits to the user's account
        await addCredits(
          userId,
          credits,
          `Purchased ${credits} credits`,
          'purchase',
          session.payment_intent,
          session.id
        );
        
        console.log(`Added ${credits} credits to user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Stripe webhook needs raw body, so we disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}; 