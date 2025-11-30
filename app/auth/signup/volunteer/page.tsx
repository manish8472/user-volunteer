import { VolunteerSignupForm } from '@/components/forms/VolunteerSignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Volunteer Signup | Volunteer Platform',
  description: 'Join as a volunteer and start making an impact in your community',
};

export default function VolunteerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <VolunteerSignupForm />
    </div>
  );
}
