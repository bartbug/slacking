import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/login' || path === '/register';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';

  // If the user is not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated and trying to access public paths
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/channels', request.url));
  }

  // If accessing root path, redirect based on auth status
  if (path === '/') {
    return NextResponse.redirect(new URL(token ? '/channels' : '/login', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/',
    '/channels/:path*',
    '/login',
    '/register'
  ]
}; 