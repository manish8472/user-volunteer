'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

interface ApplyCTAProps {
  jobId: string;
}

export function ApplyCTA({ jobId }: ApplyCTAProps) {
  const { user, isAuthenticated } = useAuthStore();
  
  const isVolunteer = user?.role === 'volunteer';

  if (!isAuthenticated || !isVolunteer) {
    return null;
  }

  const handleApply = () => {
    // Open apply modal (Module 8)
    console.log('Open apply modal for job', jobId);
    alert('Apply modal would open here');
  };

  return (
    <Button size="lg" onClick={handleApply} className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
      Apply Now
    </Button>
  );
}
