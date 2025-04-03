'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Get the current session
export async function auth() {
  const session = await getServerSession();
  return session;
}

// Check if user is authenticated, redirect if not
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  return session;
} 