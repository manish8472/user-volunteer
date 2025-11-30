# Server-Side Authentication Guide

This document describes how to implement authentication protection for server-side rendered (SSR) and statically generated (ISR/SSG) pages using Next.js middleware and server components.

## Table of Contents

1. [Overview](#overview)
2. [Next.js Middleware Setup](#nextjs-middleware-setup)
3. [Server Component Authentication](#server-component-authentication)
4. [Route Protection Patterns](#route-protection-patterns)
5. [Examples](#examples)
6. [Best Practices](#best-practices)

---

## Overview

While `AuthGuard` and `useRequireAuth` work great for **client-side** protection, they cannot protect server-rendered pages from being sent to unauthenticated users. For true SSR/ISR protection, you need:

1. **Next.js Middleware** - Runs before the request reaches your page, can redirect based on cookies/tokens
2. **Server Component Checks** - Verify auth in Server Components or API routes

---

## Next.js Middleware Setup

Create a `middleware.ts` file in the root of your project (same level as `app/` directory).

### Basic Middleware Example

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const authRoutes = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the access token from cookies
  // Note: The cookie name should match what your auth API sets
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect to login if trying to access protected route without token
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already authenticated and trying to access auth pages
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Advanced Middleware with Role Checking

To check user roles, you'll need to decode the JWT token in middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // install: pnpm add jose

const ADMIN_ROUTES = ['/admin'];
const NGO_ROUTES = ['/ngo'];
const PROTECTED_ROUTES = ['/dashboard', '/profile'];

interface TokenPayload {
  userId: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin';
  exp: number;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Verify token and get user data
  const user = accessToken ? await verifyToken(accessToken) : null;
  
  // Check if route requires authentication
  const requiresAuth = [...PROTECTED_ROUTES, ...ADMIN_ROUTES, ...NGO_ROUTES]
    .some(route => pathname.startsWith(route));
  
  // Redirect to login if not authenticated
  if (requiresAuth && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check role-based access
  if (user) {
    // Admin routes
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    
    // NGO routes
    if (NGO_ROUTES.some(route => pathname.startsWith(route)) && user.role !== 'ngo') {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Server Component Authentication

For Server Components, you can check authentication status directly:

### Using Cookies in Server Components

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

async function getUser() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(accessToken, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/auth/login?returnUrl=/dashboard');
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
```

### Create a Reusable Helper

```typescript
// lib/auth-server.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface ServerUser {
  userId: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin';
}

/**
 * Get the current user from server-side cookies
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<ServerUser | null> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(accessToken, secret);
    return payload as ServerUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Require authentication in a server component
 * Throws an error if not authenticated (will be caught by error boundary)
 */
export async function requireAuth(): Promise<ServerUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require specific role(s) in a server component
 */
export async function requireRole(
  allowedRoles: Array<'volunteer' | 'ngo' | 'admin'>
): Promise<ServerUser> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  
  return user;
}
```

---

## Route Protection Patterns

### Pattern 1: Middleware + Client Guard (Recommended)

Best for: Most protected pages

```typescript
// Middleware handles initial redirect
// middleware.ts - protects /dashboard

// app/dashboard/page.tsx
'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
```

### Pattern 2: Server Component with Redirect

Best for: SSR pages that need user data

```typescript
// app/profile/page.tsx
import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?returnUrl=/profile');
  }
  
  return <ProfileContent user={user} />;
}
```

### Pattern 3: useRequireAuth Hook

Best for: Client components that need auth state

```typescript
// app/settings/page.tsx
'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function SettingsPage() {
  const { isLoading, user } = useRequireAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return <SettingsContent user={user} />;
}
```

---

## Examples

### Example 1: Protected Dashboard Route

```typescript
// middleware.ts
const protectedRoutes = ['/dashboard'];

// app/dashboard/page.tsx
'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </AuthGuard>
  );
}
```

### Example 2: Admin-Only Page

```typescript
// middleware.ts
const ADMIN_ROUTES = ['/admin'];

// app/admin/page.tsx
'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard authorize={['admin']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        {/* Admin content */}
      </div>
    </AuthGuard>
  );
}
```

### Example 3: SSR Page with User Data

```typescript
// app/profile/page.tsx
import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login?returnUrl=/profile');
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### Example 4: Conditional Rendering

```typescript
// app/page.tsx
'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useRequireAuth({ 
    passiveMode: true 
  });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <AuthenticatedHome />
      ) : (
        <PublicHome />
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. **Use Middleware for Critical Routes**
Always use middleware for routes that should never be accessed without authentication (e.g., admin panels, sensitive data).

### 2. **Layer Your Protection**
Use both middleware AND client-side guards for defense in depth:
- Middleware: Prevents the server from sending protected pages
- AuthGuard/useRequireAuth: Handles client-side navigation and state changes

### 3. **Handle Return URLs**
Always pass a `returnUrl` parameter when redirecting to login, so users can be sent back to their intended destination:

```typescript
// In middleware or guard
const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(pathname)}`;

// In login page
const searchParams = useSearchParams();
const returnUrl = searchParams.get('returnUrl') || '/';
// After successful login: router.push(returnUrl);
```

### 4. **Secure Your Cookies**
When setting cookies from your API:

```typescript
// API route
res.setHeader('Set-Cookie', [
  `accessToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`,
]);
```

### 5. **Use Environment Variables**
Store your JWT secret in environment variables:

```env
# .env.local
JWT_SECRET=your-super-secret-key-here
```

### 6. **Handle Token Expiration**
Implement token refresh logic in your axios interceptor:

```typescript
// lib/axios.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await fetch('/api/auth/refresh', { method: 'POST' });
        return axiosInstance(error.config);
      } catch {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 7. **Test Your Protection**
Test both:
- Authenticated access (should work)
- Unauthenticated access (should redirect)
- Wrong role access (should show forbidden)
- Token expiration (should refresh or redirect)

### 8. **Consider ISR/SSG Implications**
For pages using `generateStaticParams` or ISR:
- Don't rely solely on server-side checks (page is cached)
- Use client-side protection (AuthGuard) to verify on the client
- Or use dynamic rendering: `export const dynamic = 'force-dynamic'`

---

## Summary

- **Client-Side Protection**: Use `AuthGuard` component or `useRequireAuth` hook
- **Server-Side Protection**: Use Next.js middleware for route-level protection
- **SSR Pages**: Use `getCurrentUser()` helper to get auth state in Server Components
- **Best Approach**: Combine middleware + client guards for layered security
- **Role-Based**: Pass `authorize` prop to `AuthGuard` or check roles in middleware

For most use cases, using **middleware for the initial redirect** + **AuthGuard for client-side protection** provides the best user experience and security.
