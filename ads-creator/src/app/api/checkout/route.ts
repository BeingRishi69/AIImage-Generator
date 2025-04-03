import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createCheckoutSession, calculatePriceInCents } from '@/app/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await req.json();
    const { credits } = data;
    
    // Validate credits
    if (!credits || isNaN(credits) || credits < 10 || credits > 1000) {
      return NextResponse.json(
        { error: 'Invalid credit amount. Must be between 10 and 1000.' },
        { status: 400 }
      );
    }
    
    // Calculate price in cents
    const priceInCents = calculatePriceInCents(credits);
    
    // Set up success and cancel URLs
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Create checkout session
    const { sessionId, url } = await createCheckoutSession({
      userId: session.user.id as string,
      credits,
      priceInCents,
      successUrl: `${baseUrl}/credits/success`,
      cancelUrl: `${baseUrl}/credits`,
    });
    
    return NextResponse.json({ sessionId, url });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 