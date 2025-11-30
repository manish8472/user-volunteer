import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VolunteerSignupForm } from '@/components/forms/VolunteerSignupForm';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as authApi from '@/services/auth.api';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/auth.api');

describe('VolunteerSignupForm Integration', () => {
  const mockPush = jest.fn();
  const mockSetAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Mock auth store
    useAuthStore.setState = jest.fn();
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

  it('should successfully signup a volunteer with valid data', async () => {
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

    (authApi.registerVolunteer as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<VolunteerSignupForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(
      screen.getByLabelText(/^password/i),
      'Password123'
    );
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Password123'
    );
    await user.click(screen.getByRole('checkbox', { name: /terms/i }));

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Wait for API call and store update
    await waitFor(() => {
      expect(authApi.registerVolunteer).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        phone: '',
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

    render(<VolunteerSignupForm />);

    // Enter invalid email
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur

    // Try to submit
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should see validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    // API should not be called
    expect(authApi.registerVolunteer).not.toHaveBeenCalled();
  });

  it('should display API error message on registration failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';

    (authApi.registerVolunteer as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<VolunteerSignupForm />);

    // Fill in valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /terms/i }));

    // Submit
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Store should not be updated
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should validate password requirements', async () => {
    const user = userEvent.setup();

    render(<VolunteerSignupForm />);

    // Enter weak password
    const passwordInput = screen.getByLabelText(/^password/i);
    await user.type(passwordInput, 'weak');
    await user.tab();

    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should see password validation errors
    await waitFor(() => {
      const errors = screen.queryAllByText(/password/i);
      expect(errors.length).toBeGreaterThan(1); // Label + error messages
    });
  });

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup();

    render(<VolunteerSignupForm />);

    await user.type(screen.getByLabelText(/^password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass123');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/don't match/i)).toBeInTheDocument();
    });

    expect(authApi.registerVolunteer).not.toHaveBeenCalled();
  });
});
