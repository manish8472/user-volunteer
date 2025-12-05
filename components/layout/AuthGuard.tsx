'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore, UserRole } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Optional array of roles that are allowed to access this component/page.
   * If not provided, any authenticated user can access.
   * If provided, user must have one of the specified roles.
   */
  authorize?: UserRole[];
  /**
   * Optional custom redirect path for unauthenticated users.
   * Defaults to '/auth/login'
   */
  redirectTo?: string;
  /**
   * Optional custom component to show while checking authentication
   */
  loadingComponent?: React.ReactNode;
  /**
   * Optional custom component to show when user is not authorized (role mismatch)
   */
  forbiddenComponent?: React.ReactNode;
}

/**
 * AuthGuard component that protects routes and components based on authentication and role
 * 
 * Usage:
 * ```tsx
 * // Protect any authenticated user
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * 
 * // Protect with specific roles
 * <AuthGuard authorize={['admin', 'ngo']}>
 *   <AdminContent />
 * </AuthGuard>
 * ```
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  authorize,
  redirectTo = '/auth/login',
  loadingComponent,
  forbiddenComponent,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check localStorage directly
    const storedAuth = localStorage.getItem('auth-storage');
    
    if (!storedAuth) {
      console.log('AuthGuard: No auth storage found, redirecting to login');
      const returnUrl = pathname !== redirectTo ? pathname : '/';
      router.replace(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
      setIsAuthorized(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedAuth);
      const { state } = parsed;
      
      // 2. Check if we have a user and token
      if (!state || !state.user || !state.accessToken) {
        console.log('AuthGuard: Invalid auth state, redirecting to login');
        const returnUrl = pathname !== redirectTo ? pathname : '/';
        router.replace(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
        setIsAuthorized(false);
        return;
      }

      // 3. Check roles if required
      if (authorize && authorize.length > 0) {
        const userRole = state.user.role;
        if (!authorize.includes(userRole)) {
          console.log('AuthGuard: Insufficient permissions');
          setIsAuthorized(false); // Will show forbidden component
          return;
        }
      }

      // 4. Success
      setIsAuthorized(true);

    } catch (e) {
      console.error('AuthGuard: Error parsing auth storage', e);
      router.replace(redirectTo);
      setIsAuthorized(false);
    }
  }, [pathname, redirectTo, authorize, router]);

  // Show loading while checking
  if (isAuthorized === null) {
    return loadingComponent ? <>{loadingComponent}</> : (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show forbidden if authorized is false but we have a user (role mismatch)
  // Note: If we redirected, this might briefly flash, but that's okay.
  // We can improve this by checking if we redirected.
  if (isAuthorized === false) {
     // If we are here, it means we either redirected (so this unmounts soon)
     // OR we have a role mismatch.
     // Let's check if we have a user to decide if it's a role mismatch or just not logged in.
     const storedAuth = localStorage.getItem('auth-storage');
     let hasUser = false;
     try {
        if(storedAuth) {
            const parsed = JSON.parse(storedAuth);
            if(parsed.state?.user) hasUser = true;
        }
     } catch {}

     if (hasUser && forbiddenComponent) {
         return <>{forbiddenComponent}</>;
     } else if (hasUser) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p>You do not have permission to view this page.</p>
                    <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-primary text-white rounded">Go Home</button>
                </div>
            </div>
         );
     }
     
     return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
};



export default AuthGuard;
