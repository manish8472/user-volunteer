'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FileUpload } from '@/components/forms/FileUpload';
import { applyToJob } from '@/services/applications.api';
import { useToast } from '@/components/ui/use-toast';

const applySchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  resumeUrl: z.string().url('Please upload a valid resume'),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({ jobId, jobTitle, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  const resumeUrl = watch('resumeUrl');

  const onSubmit = async (data: ApplyFormData) => {
    try {
      setIsSubmitting(true);
      await applyToJob(jobId, data);
      
      toast({
        title: 'Application Submitted',
        description: 'Your application has been sent successfully!',
        variant: 'default',
      });
      
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Application failed:', error);
      toast({
        title: 'Application Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeUpload = (url: string) => {
    setValue('resumeUrl', url, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Complete the form below to submit your application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Resume / CV</label>
            <FileUpload
              purpose="resume"
              accept=".pdf,.doc,.docx"
              maxSize={5}
              onUploaded={handleResumeUpload}
              label="Upload Resume"
            />
            {errors.resumeUrl && (
              <p className="text-sm text-red-500">{errors.resumeUrl.message}</p>
            )}
            {resumeUrl && !errors.resumeUrl && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                ✓ Resume attached
              </p>
            )}
          </div>

          <FormTextarea
            label="Cover Letter"
            placeholder="Why are you a good fit for this role?"
            rows={6}
            error={errors.coverLetter?.message}
            {...register('coverLetter')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !resumeUrl}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
