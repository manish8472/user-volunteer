'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';
import { UserRole } from '@/stores/authStore';

interface UseRequireAuthOptions {
  /**
   * Optional array of roles that are required.
   * If not provided, any authenticated user can access.
   */
  requiredRoles?: UserRole[];
  /**
   * Optional custom redirect path for unauthenticated users.
   * Defaults to '/auth/login'
   */
  redirectTo?: string;
  /**
   * If true, the hook will not perform any redirects, only return auth state.
   * Useful for conditional rendering instead of automatic redirects.
   * Defaults to false.
   */
  passiveMode?: boolean;
}

interface UseRequireAuthReturn {
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  /**
   * Whether the user has the required role(s)
   */
  isAuthorized: boolean;
  /**
   * Whether the auth check is still loading
   */
  isLoading: boolean;
  /**
   * The current user object, or null if not authenticated
   */
  user: ReturnType<typeof useAuth>['user'];
}

/**
 * Hook to require authentication on a page or component
 * This hook will automatically redirect to login if the user is not authenticated,
 * and can also check for specific roles.
 * 
 * Usage:
 * ```tsx
 * // In a page component - automatic redirect
 * function DashboardPage() {
 *   const { isLoading } = useRequireAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return <div>Dashboard Content</div>;
 * }
 * 
 * // With role requirements
 * function AdminPage() {
 *   const { isLoading, isAuthorized } = useRequireAuth({ 
 *     requiredRoles: ['admin'] 
 *   });
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthorized) return <div>Access Denied</div>;
 *   
 *   return <div>Admin Content</div>;
 * }
 * 
 * // Passive mode - no automatic redirect
 * function ConditionalContent() {
 *   const { isAuthenticated, isLoading } = useRequireAuth({ 
 *     passiveMode: true 
 *   });
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return isAuthenticated ? <PrivateContent /> : <PublicContent />;
 * }
 * ```
 */
export const useRequireAuth = (
  options: UseRequireAuthOptions = {}
): UseRequireAuthReturn => {
  const {
    requiredRoles,
    redirectTo = '/auth/login',
    passiveMode = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, refresh, isRefreshing } = useAuth();

  // Check if user has required role
  const isAuthorized =
    isAuthenticated &&
    (!requiredRoles ||
    requiredRoles.length === 0 ||
    (user?.role && requiredRoles.includes(user.role)) ||
    false);

  const isLoading = isRefreshing || (!user && isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      // If user is not in store but might be authenticated (e.g., page refresh)
      // try to refresh the auth state from the server
      if (!user && !isRefreshing) {
        try {
          await refresh();
        } catch (error) {
          // Refresh failed, user is not authenticated
          if (!passiveMode) {
            const returnUrl = pathname !== redirectTo ? pathname : '/';
            const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
            router.replace(loginUrl);
          }
        }
      }
    };

    if (!isAuthenticated && !isRefreshing && !passiveMode) {
      checkAuth();
    }
  }, [user, isAuthenticated, isRefreshing, refresh, passiveMode, router, pathname, redirectTo]);

  useEffect(() => {
    // Only perform redirects if not in passive mode
    if (passiveMode) {
      return;
    }

    // If refresh is complete and user is still not authenticated, redirect
    if (!isRefreshing && !user && !isAuthenticated) {
      const returnUrl = pathname !== redirectTo ? pathname : '/';
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`;
      router.replace(loginUrl);
    }
  }, [user, isAuthenticated, isRefreshing, router, pathname, redirectTo, passiveMode]);

  return {
    isAuthenticated,
    isAuthorized,
    isLoading,
    user,
  };
};

export default useRequireAuth;
