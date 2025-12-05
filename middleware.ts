import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that are only for unauthenticated users
const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // NOTE: We do NOT check for authentication in middleware because:
  // 1. AccessToken is stored in localStorage (client-side only), not cookies
  // 2. Server only sets refresh_token cookie (different from accessToken)
  // 3. Middleware runs on server/edge and cannot access localStorage
  // 4. Client-side AuthGuard component handles route protection
  // 5. All API endpoints are protected by JWT verification on backend
  
  // Get the refresh token from cookies (only used for auth page redirect)
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect to dashboard if already authenticated and trying to access auth pages
  // We use refresh_token cookie as indicator of authentication
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
