'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { volunteerSignupSchema, VolunteerSignupFormData } from '@/lib/validations/auth.schema';
import { registerVolunteer, startGoogleOauth } from '@/services/auth.api';
import { sendOtp } from '@/services/otp.api';
import { useAuthStore } from '@/stores/authStore';
import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';

interface VolunteerSignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const VolunteerSignupForm = ({
  onSuccess,
  redirectTo = '/dashboard',
}: VolunteerSignupFormProps) => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerSignupFormData>({
    resolver: zodResolver(volunteerSignupSchema),
  });

  const onSubmit = async (data: VolunteerSignupFormData) => {
    try {
      setIsLoading(true);
      setApiError('');

      // Send OTP to email
      await sendOtp({
        email: data.email.toLowerCase(),
        purpose: 'signup',
      });

      // Store signup data in session storage
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        location: {
          city: data.city,
          state: data.state,
          country: data.country,
        },
      };
      
      sessionStorage.setItem('pendingSignup', JSON.stringify(signupData));
      sessionStorage.setItem('pendingEmail', data.email.toLowerCase());
      sessionStorage.setItem('pendingUserType', 'volunteer');

      // Redirect to OTP verification page
      router.push('/auth/verify-otp');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    startGoogleOauth('volunteer');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join as a Volunteer
          </h2>
          <p className="text-gray-600">
            Create your account and start making a difference
          </p>
        </div>

        {apiError && (
          <div
            className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <FormInput
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+1234567890"
            error={errors.phone?.message}
            helperText="Include country code for international numbers"
            {...register('phone')}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            helperText="At least 8 characters with uppercase, lowercase, and number"
            {...register('password')}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput
              label="City"
              type="text"
              placeholder="City"
              error={errors.city?.message}
              {...register('city')}
            />
            <FormInput
              label="State"
              type="text"
              placeholder="State"
              error={errors.state?.message}
              {...register('state')}
            />
            <FormInput
              label="Country"
              type="text"
              placeholder="Country"
              defaultValue="India"
              error={errors.country?.message}
              {...register('country')}
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 mr-2 rounded border-gray-300 text-primary focus:ring-primary"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            Create Account
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            className="mt-4 w-full flex items-center justify-center px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in
          </a>
        </p>

        <p className="mt-4 text-center text-sm text-gray-600">
          Are you an organization?{' '}
          <a
            href="/auth/signup/ngo"
            className="font-medium text-secondary hover:text-secondary-dark transition-colors"
          >
            Register as NGO
          </a>
        </p>
      </div>
    </div>
  );
};
