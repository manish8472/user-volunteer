import axiosInstance from '@/lib/axios';

// ============= Types =============
export interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  order: number;
}

export interface JobRequirements {
  minAge?: number;
  maxAge?: number;
  skills: string[];
  experience?: string;
  education?: string;
  availability?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  requirements: JobRequirements;
  customQuestions?: CustomQuestion[];
  deadline?: string;
}

export interface Job {
  id: string;
  ngoId: string;
  title: string;
  description: string;
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  requirements: JobRequirements;
  customQuestions?: CustomQuestion[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
}

export interface VolunteerSnapshot {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resumeUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  volunteerId: string;
  volunteerSnapshot: VolunteerSnapshot;
  status: 'new' | 'reviewing' | 'shortlisted' | 'selected' | 'rejected';
  coverLetter?: string;
  resumeUrl?: string;
  answers?: { questionId: string; question: string; answer: string }[];
  appliedAt: string;
  updatedAt: string;
  verificationRequested?: boolean;
  verificationDocs?: string[];
}

export interface ApplicationFilters {
  status?: Application['status'];
  jobId?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationsResponse {
  data: Application[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UpdateStatusPayload {
  status: Application['status'];
  notes?: string;
}

export interface VerificationRequestPayload {
  documents: string[];
  message: string;
}

// ============= API Functions =============

/**
 * Create a new job posting
 */
export const createJob = async (ngoId: string, payload: CreateJobPayload): Promise<Job> => {
  try {
    const response = await axiosInstance.post(`/api/ngos/${ngoId}/jobs`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

/**
 * Get all jobs for an NGO
 */
export const getNGOJobs = async (ngoId: string): Promise<Job[]> => {
  try {
    const response = await axiosInstance.get(`/api/ngos/${ngoId}/jobs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NGO jobs:', error);
    throw error;
  }
};

/**
 * Get a specific job by ID
 */
export const getJobById = async (ngoId: string, jobId: string): Promise<Job> => {
  try {
    const response = await axiosInstance.get(`/api/ngos/${ngoId}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

/**
 * Get all applications for an NGO
 */
export const getApplications = async (
  ngoId: string,
  filters: ApplicationFilters = {}
): Promise<ApplicationsResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await axiosInstance.get(
      `/api/ngos/${ngoId}/applications?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * Get a specific application by ID
 */
export const getApplicationById = async (
  ngoId: string,
  applicationId: string
): Promise<Application> => {
  try {
    const response = await axiosInstance.get(
      `/api/ngos/${ngoId}/applications/${applicationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error;
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  ngoId: string,
  applicationId: string,
  payload: UpdateStatusPayload
): Promise<Application> => {
  try {
    const response = await axiosInstance.put(
      `/api/ngos/${ngoId}/applications/${applicationId}/status`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Request verification documents from applicant
 */
export const requestVerification = async (
  applicationId: string,
  payload: VerificationRequestPayload
): Promise<void> => {
  try {
    await axiosInstance.post(`/api/applications/${applicationId}/verification-request`, payload);
  } catch (error) {
    console.error('Error requesting verification:', error);
    throw error;
  }
};
