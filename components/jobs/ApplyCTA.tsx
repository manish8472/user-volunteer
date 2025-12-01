'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { ApplyModal } from './ApplyModal';

interface ApplyCTAProps {
  jobId: string;
}

export function ApplyCTA({ jobId }: ApplyCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  
  const isVolunteer = user?.role === 'volunteer';

  if (!isAuthenticated || !isVolunteer) {
    return null;
  }



  return (
    <>
      <Button 
        size="lg" 
        onClick={() => setIsModalOpen(true)} 
        className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
      >
        Apply Now
      </Button>

      <ApplyModal
        jobId={jobId}
        jobTitle="this position" // Ideally fetch job title or pass it as prop
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Optional: Redirect or refresh
        }}
      />
    </>
  );
}
