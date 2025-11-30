import axiosInstance from '@/lib/axios';

export interface Job {
  id: string;
  title: string;
  description: string;
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  remote: boolean;
  skills: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  createdAt: string;
  salary?: string;
}

export interface JobFilters {
  skills?: string[];
  location?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  data: Job[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Relative path on client
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'; // Absolute path on server
};

export const getJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const params = new URLSearchParams();
  if (filters.skills?.length) params.append('skills', filters.skills.join(','));
  if (filters.location) params.append('location', filters.location);
  if (filters.remote !== undefined) params.append('remote', String(filters.remote));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/jobs?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // SSR: Always fetch fresh data for filters
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const getJob = async (jobId: string): Promise<{ data: Job }> => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/jobs/${jobId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // ISR: Cache job details for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};
