'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/stores/authStore';

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
  const { user, isAuthenticated, refresh, isRefreshing } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // If user is not in store, try to refresh from server
      if (!user && !isAuthenticated) {
        try {
          await refresh();
        } catch (error) {
          // Refresh failed, user is not authenticated
          console.log('Auth refresh failed:', error);
        }
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, [user, isAuthenticated, refresh]);

  useEffect(() => {
    // Only run authorization checks after initial auth check is complete
    if (!authChecked) {
      return;
    }

    // If user is not authenticated, redirect to login
    if (!user || !isAuthenticated) {
      // Save the current path to redirect back after login
      const returnUrl = pathname !== redirectTo ? pathname : '/';
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
      router.replace(loginUrl);
      return;
    }

    // If no role requirements, user is authorized
    if (!authorize || authorize.length === 0) {
      setIsAuthorized(true);
      return;
    }

    // Check if user has one of the required roles
    const hasRequiredRole = user.role && authorize.includes(user.role);
    setIsAuthorized(!!hasRequiredRole);
  }, [authChecked, user, isAuthenticated, authorize, router, pathname, redirectTo]);

  // Show loading state while checking auth or refreshing
  if (!authChecked || isRefreshing) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but not authorized (role mismatch)
  if (authChecked && user && isAuthenticated && !isAuthorized) {
    if (forbiddenComponent) {
      return <>{forbiddenComponent}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md p-8 space-y-4 text-center">
          <div className="w-16 h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="pt-4">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default AuthGuard;
