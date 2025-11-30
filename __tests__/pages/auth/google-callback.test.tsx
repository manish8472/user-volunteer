import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as authApi from '@/services/auth.api';
import GoogleCallbackPage from '@/app/auth/google-callback/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/auth.api');

describe('GoogleCallbackPage', () => {
  const mockPush = jest.fn();
  const mockSetAuth = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });

    jest.spyOn(useAuthStore, 'getState').mockReturnValue({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: mockSetAuth,
      clearAuth: jest.fn(),
      updateUser: jest.fn(),
      setRole: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should successfully complete OAuth and redirect to dashboard', async () => {
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'volunteer' as const,
      },
    };

    mockGet.mockReturnValue(null); // No error
    (authApi.refreshAuth as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<GoogleCallbackPage />);

    // Should show loading state
    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();

    // Wait for API call
    await waitFor(() => {
      expect(authApi.refreshAuth).toHaveBeenCalled();
    });

    // Wait for store update
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        mockResponse.accessToken,
        mockResponse.user
      );
    });

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText(/success!/i)).toBeInTheDocument();
    });

    // Fast-forward timer for redirect
    jest.advanceTimersByTime(1000);

    // Should redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to custom path from search params', async () => {
    const customRedirect = '/onboarding';
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'volunteer' as const,
      },
    };

    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return null;
      if (key === 'redirect') return customRedirect;
      return null;
    });

    (authApi.refreshAuth as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(authApi.refreshAuth).toHaveBeenCalled();
    });

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(customRedirect);
    });
  });

  it('should display error when OAuth fails', async () => {
    const errorMessage = 'Authentication failed';
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return encodeURIComponent(errorMessage);
      return null;
    });

    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Should not call refresh API
    expect(authApi.refreshAuth).not.toHaveBeenCalled();

    // Should not update store
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('should display error when refresh API fails', async () => {
    const errorMessage = 'Failed to complete authentication';

    mockGet.mockReturnValue(null);
    (authApi.refreshAuth as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    // Should not update store
    expect(mockSetAuth).not.toHaveBeenCalled();

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should allow retry on error', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return 'OAuth error';
      return null;
    });

    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /back to login/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry button
    retryButton.click();

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});
