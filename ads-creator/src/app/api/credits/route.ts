import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserCredits, getUserTransactions } from '@/app/lib/db/creditsDb';

export async function GET(req: NextRequest) {
  try {
    // Ensure user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user credits and transaction history
    const userId = session.user.id as string;
    const credits = await getUserCredits(userId);
    
    // Check if transaction history is requested
    const url = new URL(req.url);
    const includeHistory = url.searchParams.get('includeHistory') === 'true';
    
    let transactions = [];
    if (includeHistory) {
      transactions = await getUserTransactions(userId);
    }
    
    // Return credit information
    return NextResponse.json({ 
      credits,
      transactions: includeHistory ? transactions : undefined
    });
    
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit information' },
      { status: 500 }
    );
  }
} 