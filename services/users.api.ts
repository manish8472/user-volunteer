import axiosInstance from '@/lib/axios';

// ============= Types =============
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin';
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  availability?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  location?: string;
  profileCompleteness?: number;
}

export interface NGOProfile {
  id: string;
  name: string;
  slug: string;
  email: string;
  description?: string;
  mission?: string;
  logo?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  registrationNumber?: string;
  registrationDocs?: string[];
  foundedYear?: number;
  teamSize?: string;
  areasOfWork?: string[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  availability?: string;
  location?: string;
  avatarUrl?: string;
}

export interface UpdateNGOProfilePayload {
  name?: string;
  description?: string;
  mission?: string;
  logo?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  foundedYear?: number;
  teamSize?: string;
  areasOfWork?: string[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface SignedUrlResponse {
  signedUrl: string;
  fileUrl: string;
  fileName: string;
}

export interface UploadFilePayload {
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: 'resume' | 'avatar' | 'document' | 'logo';
}

// ============= API Functions =============

/**
 * Get current user profile
 */
export const getMe = async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get<UserProfile>('/api/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.put<UserProfile>('/api/users/me', payload);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Get NGO profile by ID
 */
export const getNGOProfile = async (ngoId: string): Promise<NGOProfile> => {
  try {
    const response = await axiosInstance.get<NGOProfile>(`/api/ngos/${ngoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NGO profile:', error);
    throw error;
  }
};

/**
 * Update NGO profile
 */
export const updateNGOProfile = async (
  ngoId: string,
  payload: UpdateNGOProfilePayload
): Promise<NGOProfile> => {
  try {
    const response = await axiosInstance.put<NGOProfile>(`/api/ngos/${ngoId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating NGO profile:', error);
    throw error;
  }
};

/**
 * Get signed URL for file upload
 */
export const getSignedUploadUrl = async (
  payload: UploadFilePayload
): Promise<SignedUrlResponse> => {
  try {
    const response = await axiosInstance.post<SignedUrlResponse>('/api/files/sign', payload);
    return response.data;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

/**
 * Upload file to signed URL
 */
export const uploadFileToSignedUrl = async (
  signedUrl: string,
  file: File
): Promise<void> => {
  try {
    await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload resume and return the URL
 */
export const uploadResume = async (file: File): Promise<string> => {
  try {
    // Step 1: Get signed URL
    const { signedUrl, fileUrl } = await getSignedUploadUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: 'resume',
    });

    // Step 2: Upload file
    await uploadFileToSignedUrl(signedUrl, file);

    // Step 3: Return the file URL
    return fileUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Upload avatar and return the URL
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  try {
    // Step 1: Get signed URL
    const { signedUrl, fileUrl } = await getSignedUploadUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: 'avatar',
    });

    // Step 2: Upload file
    await uploadFileToSignedUrl(signedUrl, file);

    // Step 3: Return the file URL
    return fileUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Calculate profile completeness percentage
 */
export const calculateProfileCompleteness = (profile: Partial<UserProfile>): number => {
  const fields = [
    'name',
    'email',
    'phone',
    'bio',
    'skills',
    'experience',
    'education',
    'availability',
    'resumeUrl',
    'location',
  ];

  const filledFields = fields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value != null && value !== '';
  });

  return Math.round((filledFields.length / fields.length) * 100);
};

/**
 * Get suggestions for completing profile
 */
export const getProfileSuggestions = (profile: Partial<UserProfile>): string[] => {
  const suggestions: string[] = [];

  if (!profile.phone) suggestions.push('Add your phone number');
  if (!profile.bio) suggestions.push('Write a short bio about yourself');
  if (!profile.skills || profile.skills.length === 0) suggestions.push('Add your skills');
  if (!profile.experience) suggestions.push('Describe your experience');
  if (!profile.education) suggestions.push('Add your education details');
  if (!profile.availability) suggestions.push('Specify your availability');
  if (!profile.resumeUrl) suggestions.push('Upload your resume');
  if (!profile.location) suggestions.push('Add your location');

  return suggestions;
};
