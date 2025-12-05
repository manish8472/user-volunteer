'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OtpVerificationForm } from '@/components/forms/OtpVerificationForm';
import { sendOtp, verifyOtp } from '@/services/otp.api';
import { registerVolunteer, registerNgo } from '@/services/auth.api';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get data from session storage
  const [signupData, setSignupData] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<'volunteer' | 'ngo'>('volunteer');

  useEffect(() => {
    // Retrieve stored signup data
    const storedData = sessionStorage.getItem('pendingSignup');
    const storedEmail = sessionStorage.getItem('pendingEmail');
    const storedType = sessionStorage.getItem('pendingUserType') as 'volunteer' | 'ngo';

    if (!storedData || !storedEmail || !storedType) {
      // Redirect back to signup if no data found
      router.push('/auth/signup/volunteer');
      return;
    }

    setSignupData(JSON.parse(storedData));
    setEmail(storedEmail);
    setUserType(storedType);
  }, [router]);

  const handleVerifyOtp = async (otp: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Verify OTP
      const verifyResponse = await verifyOtp({
        email,
        otp,
        purpose: 'signup',
      });

      // Complete registration with verification token
      const registrationData = {
        ...signupData,
        verificationToken: verifyResponse.verificationToken,
      };

      let response;
      if (userType === 'volunteer') {
        response = await registerVolunteer(registrationData);
      } else {
        response = await registerNgo(registrationData);
      }

      // Set auth state
      setAuth(response.accessToken, response.user);

      // Clear session storage
      sessionStorage.removeItem('pendingSignup');
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingUserType');

      // Redirect to login page
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtp({
        email,
        purpose: 'signup',
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to resend OTP';
      setError(message);
      throw err;
    }
  };

  if (!email || !signupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full">
        {error && (
          <div className="max-w-md mx-auto mb-4">
            <div
              className="p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm text-center"
              role="alert"
            >
              {error}
            </div>
          </div>
        )}
        
        <OtpVerificationForm
          email={email}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          isLoading={isLoading}
        />

        <div className="text-center mt-6">
          <button
            onClick={() => {
              sessionStorage.removeItem('pendingSignup');
              sessionStorage.removeItem('pendingEmail');
              sessionStorage.removeItem('pendingUserType');
              router.push(`/auth/signup/${userType}`);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to signup
          </button>
        </div>
      </div>
    </div>
  );
}
