import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Volunteer Platform',
  description: 'Reset your password to regain access to your account',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600">
              No worries! Password reset functionality will be implemented soon.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <p className="text-sm text-amber-800">
              <strong>Coming Soon:</strong> Password reset via email will be available in the next update.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              For now, please contact support if you need to reset your password.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="block text-center px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all"
              >
                Back to Login
              </Link>
              <Link
                href="/contact"
                className="block text-center px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
