/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
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

describe('AuthGuard', () => {
  const mockReplace = jest.fn();
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('Authentication Checks', () => {
    it('should show loading state while checking authentication', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: true,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should call refresh when user is not in store', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to login when user is not authenticated after refresh', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2Fdashboard'
        );
      });
    });

    it('should redirect to custom path when redirectTo is provided', async () => {
      mockRefresh.mockResolvedValue(undefined);

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard redirectTo="/custom-login">
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/custom-login?returnUrl=%2Fdashboard'
        );
      });
    });

    it('should render children when user is authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'test@test.com', role: 'volunteer' as UserRole, name: 'Test User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Authorization', () => {
    it('should render children when user has required role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'admin@test.com', role: 'admin' as UserRole, name: 'Admin User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard authorize={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument();
      });
    });

    it('should render children when user has one of multiple required roles', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'ngo@test.com', role: 'ngo' as UserRole, name: 'NGO User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard authorize={['admin', 'ngo']}>
          <div>NGO Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('NGO Content')).toBeInTheDocument();
      });
    });

    it('should show forbidden page when user does not have required role', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'volunteer@test.com', role: 'volunteer' as UserRole, name: 'Volunteer User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard authorize={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(
          screen.getByText(/You don't have permission to access this page/i)
        ).toBeInTheDocument();
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      });
    });

    it('should render children when no roles are specified (any authenticated user)', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@test.com', role: 'volunteer' as UserRole, name: 'Test User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Any User Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Any User Content')).toBeInTheDocument();
      });
    });

    it('should show forbidden page when user role is null but roles are required', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@test.com', role: null, name: 'Test User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard authorize={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Components', () => {
    it('should render custom loading component when provided', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: true,
      });

      render(
        <AuthGuard loadingComponent={<div>Custom Loading...</div>}>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
    });

    it('should render custom forbidden component when provided', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@test.com', role: 'volunteer' as UserRole, name: 'Test User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard 
          authorize={['admin']}
          forbiddenComponent={<div>Custom Forbidden Page</div>}
        >
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Forbidden Page')).toBeInTheDocument();
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      });
    });
  });

  describe('Return URL Handling', () => {
    it('should include current path as returnUrl in login redirect', async () => {
      mockRefresh.mockResolvedValue(undefined);
      (usePathname as jest.Mock).mockReturnValue('/dashboard/settings');

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2Fdashboard%2Fsettings'
        );
      });
    });

    it('should use root path as returnUrl when on login page', async () => {
      mockRefresh.mockResolvedValue(undefined);
      (usePathname as jest.Mock).mockReturnValue('/auth/login');

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          '/auth/login?returnUrl=%2F'
        );
      });
    });
  });

  describe('Forbidden Page Navigation', () => {
    it('should navigate to home when "Go to Home" button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'user@test.com', role: 'volunteer' as UserRole, name: 'Test User' },
        isAuthenticated: true,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      render(
        <AuthGuard authorize={['admin']}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });

      const homeButton = screen.getByRole('button', { name: /go to home/i });
      homeButton.click();

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Error Handling', () => {
    it('should handle refresh errors gracefully', async () => {
      mockRefresh.mockRejectedValue(new Error('Refresh failed'));

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        refresh: mockRefresh,
        isRefreshing: false,
      });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Auth refresh failed:',
          expect.any(Error)
        );
      });

      consoleLogSpy.mockRestore();
    });
  });
});
