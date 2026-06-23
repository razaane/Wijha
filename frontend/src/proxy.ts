import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/dashboard',
  '/settings',
  '/host',
  // add other protected routes here
];

// Array of paths that should not be accessible if ALREADY authenticated
const authPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('wijha_token')?.value;
  const isLoggedIn = request.cookies.get('is_logged_in')?.value;
  
  // A user is only truly authenticated if BOTH the HttpOnly token and the client indicator exist
  const isAuthenticated = token && isLoggedIn;

  const path = request.nextUrl.pathname;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  
  // Check if the path is an auth path
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // 1. If trying to access a protected route without valid authentication -> Redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    
    const response = NextResponse.redirect(url);
    // If the frontend deleted 'is_logged_in', but 'wijha_token' is still stuck, aggressively delete it
    if (token && !isLoggedIn) {
      response.cookies.delete('wijha_token');
    }
    return response;
  }

  // 2. If trying to access login/register while ALREADY logged in -> Redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on specific paths to optimize performance
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/host/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
