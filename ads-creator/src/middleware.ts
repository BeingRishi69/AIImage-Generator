import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  const isAuthenticated = !!token;
  
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  
  // Define paths that need authentication
  const authRequiredPaths = ['/', '/gallery'];
  
  // Define paths accessible only for non-authenticated users (like sign in/up pages)
  const authBlockedPaths = ['/auth/signin', '/auth/signup'];

  // Check if the request is for a protected route and the user is not authenticated
  const isProtectedRoute = authRequiredPaths.some(path => 
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
  
  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL the user was trying to access
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check if the request is for an auth page and the user is already authenticated
  const isAuthPage = authBlockedPaths.some(path => pathname === path);
  if (isAuthPage && isAuthenticated) {
    // Redirect already authenticated users away from auth pages
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Only run the middleware on specific paths
export const config = {
  matcher: [
    '/',
    '/gallery/:path*',
    '/auth/signin',
    '/auth/signup',
  ],
}; 