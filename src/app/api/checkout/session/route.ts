import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/authOptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to create a checkout session' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { creditAmount, priceUsd, userId } = body;

    // Validate inputs
    if (!creditAmount || !priceUsd || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Make sure the authenticated user is the same as the one in the request
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${creditAmount} Credits for AI Studio`,
              description: `Purchase of ${creditAmount} credits for generating AI product images.`,
            },
            unit_amount: priceUsd * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits`,
      metadata: {
        userId,
        creditAmount: creditAmount.toString(),
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 