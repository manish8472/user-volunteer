import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/forms/LoginForm';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as authApi from '@/services/auth.api';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/auth.api');

describe('LoginForm Integration', () => {
  const mockPush = jest.fn();
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
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

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'volunteer' as const,
      },
    };

    (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginForm />);

    // Fill in credentials
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify API call
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password123',
      });
    });

    // Verify auth store was updated
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        mockResponse.accessToken,
        mockResponse.user
      );
    });

    // Verify redirection
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display validation error for invalid email', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/password/i), 'password');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should display error for empty password', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    // Leave password empty

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should display API error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';

    (authApi.login as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to custom path when provided', async () => {
    const user = userEvent.setup();
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

    (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginForm redirectTo={customRedirect} />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(customRedirect);
    });
  });

  it('should call onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockResponse = {
      accessToken: 'test-token',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'volunteer' as const,
      },
    };

    (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<LoginForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
