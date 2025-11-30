import { NgoSignupForm } from '@/components/forms/NgoSignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NGO Registration | Volunteer Platform',
  description: 'Register your organization and connect with passionate volunteers',
};

export default function NgoSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <NgoSignupForm />
    </div>
  );
}
