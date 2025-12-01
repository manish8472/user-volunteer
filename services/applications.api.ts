import axiosInstance from '@/lib/axios';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  organizationName: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplyPayload {
  coverLetter: string;
  resumeUrl: string;
  answers?: { questionId: string; answer: string }[];
}

export const applyToJob = async (jobId: string, payload: ApplyPayload): Promise<Application> => {
  try {
    const response = await axiosInstance.post(`/api/jobs/${jobId}/apply`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error applying to job ${jobId}:`, error);
    throw error;
  }
};

export const getApplicationsForUser = async (): Promise<Application[]> => {
  try {
    const response = await axiosInstance.get('/api/applications/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};
