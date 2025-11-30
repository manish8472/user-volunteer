import { axiosInstance } from '@/lib/axios';
import { User } from '@/stores/authStore';

// API Response Types
interface AuthResponse {
  accessToken: string;
  user: User;
}

interface RegisterVolunteerData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

interface RegisterNgoData {
  organizationName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  website?: string;
  description?: string;
  registrationNumber?: string;
  documents?: File[];
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new volunteer
 */
export const registerVolunteer = async (data: RegisterVolunteerData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/api/auth/register/volunteer', data);
  return response.data;
};

/**
 * Register a new NGO
 */
export const registerNgo = async (data: RegisterNgoData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/api/auth/register/ngo', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

/**
 * Refresh the authentication token
 */
export const refreshAuth = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/api/auth/refresh');
  return response.data;
};

/**
 * Start Google OAuth flow
 * Redirects to backend which then redirects to Google
 * @param role - The role to register as (volunteer or ngo)
 */
export const startGoogleOauth = (role: 'volunteer' | 'ngo') => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  window.location.href = `${apiUrl}/api/auth/google?role=${role}`;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/api/auth/logout');
};
