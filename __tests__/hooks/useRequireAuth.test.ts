/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/stores/authStore';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useRequireAuth', () => {
  const mockReplace = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('Authentication State', () => {
    it('should return loading state while refreshing', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: true,
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should return authenticated state when user exists', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        role: 'volunteer' as UserRole,
        name: 'Test User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should attempt refresh when user is not in store', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to login when user is not authenticated', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2Fdashboard'
        );
      });
    });
  });

  describe('Role-Based Authorization', () => {
    it('should authorize user with required role', () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'admin' as UserRole,
        name: 'Admin User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() =>
        useRequireAuth({ requiredRoles: ['admin'] })
      );

      expect(result.current.isAuthorized).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should authorize user with one of multiple required roles', () => {
      const mockUser = {
        id: '1',
        email: 'ngo@test.com',
        role: 'ngo' as UserRole,
        name: 'NGO User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() =>
        useRequireAuth({ requiredRoles: ['admin', 'ngo'] })
      );

      expect(result.current.isAuthorized).toBe(true);
    });

    it('should not authorize user without required role', () => {
      const mockUser = {
        id: '1',
        email: 'volunteer@test.com',
        role: 'volunteer' as UserRole,
        name: 'Volunteer User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() =>
        useRequireAuth({ requiredRoles: ['admin'] })
      );

      expect(result.current.isAuthorized).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should authorize any authenticated user when no roles specified', () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        role: 'volunteer' as UserRole,
        name: 'Test User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isAuthorized).toBe(true);
    });

    it('should not authorize when user role is null', () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        role: null,
        name: 'Test User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() =>
        useRequireAuth({ requiredRoles: ['admin'] })
      );

      expect(result.current.isAuthorized).toBe(false);
    });
  });

  describe('Passive Mode', () => {
    it('should not redirect in passive mode when user is not authenticated', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth({ passiveMode: true }));

      // Wait a bit to ensure no redirect happens
      await waitFor(() => {
        expect(mockRefresh).not.toHaveBeenCalled();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should return auth state in passive mode without redirecting', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() => useRequireAuth({ passiveMode: true }));

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAuthorized).toBe(false);
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should work with role checking in passive mode', () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        role: 'volunteer' as UserRole,
        name: 'Test User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const { result } = renderHook(() =>
        useRequireAuth({
          passiveMode: true,
          requiredRoles: ['admin'],
        })
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAuthorized).toBe(false);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Custom Redirect Path', () => {
    it('should redirect to custom path when provided', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() =>
        useRequireAuth({ redirectTo: '/custom-login' })
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/custom-login?returnUrl=%2Fdashboard'
        );
      });
    });
  });

  describe('Return URL Handling', () => {
    it('should include current path as returnUrl', async () => {
      mockRefresh.mockResolvedValue(undefined);
      (usePathname as jest.Mock).mockReturnValue('/protected/page');

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2Fprotected%2Fpage'
        );
      });
    });

    it('should use root as returnUrl when on login page', async () => {
      mockRefresh.mockResolvedValue(undefined);
      (usePathname as jest.Mock).mockReturnValue('/auth/login');

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2F'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should redirect to login when refresh fails', async () => {
      mockRefresh.mockRejectedValue(new Error('Refresh failed'));

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2Fdashboard'
        );
      });
    });

    it('should not redirect on refresh failure in passive mode', async () => {
      mockRefresh.mockRejectedValue(new Error('Refresh failed'));

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      renderHook(() => useRequireAuth({ passiveMode: true }));

      // Wait a bit to ensure no redirect happens
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('Hook Updates', () => {
    it('should update when user state changes', () => {
      const { result, rerender } = renderHook(() => useRequireAuth());

      // Initially no user
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      rerender();

      expect(result.current.isAuthenticated).toBe(false);

      // User logs in
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        role: 'volunteer' as UserRole,
        name: 'Test User',
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      rerender();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
