'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { refreshAuth } from '@/services/auth.api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params (backend might redirect with error)
        const error = searchParams.get('error');
        if (error) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          return;
        }

        // Call refresh endpoint to get token and user data from the cookie
        // The backend should have set the refresh_token cookie after Google OAuth
        const response = await refreshAuth();
        
        setAuth(response.accessToken, response.user);
        setStatus('success');

        // Redirect based on user role or to dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        
        // Small delay to show success message
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 
          'Failed to complete authentication. Please try again.'
        );
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <svg
                className="animate-spin h-16 w-16 text-primary"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">
              Please wait while we authenticate your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600">
              You've been authenticated successfully. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-danger"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
