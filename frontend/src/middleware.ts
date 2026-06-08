import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Array of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/settings',
  // add other protected routes here
];

// Array of paths that should not be accessible if ALREADY authenticated
const authPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('wijha_token')?.value;
  const path = request.nextUrl.pathname;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));
  
  // Check if the path is an auth path
  const isAuthPath = authPaths.some((p) => path.startsWith(p));

  // 1. If trying to access a protected route without a token -> Redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path); // Optional: redirect back after login
    return NextResponse.redirect(url);
  }

  // 2. If trying to access login/register while ALREADY logged in -> Redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on specific paths to optimize performance
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
