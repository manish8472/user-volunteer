import { LoginForm } from '@/components/forms/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Volunteer Platform',
  description: 'Sign in to your account to connect with opportunities and make a difference',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
