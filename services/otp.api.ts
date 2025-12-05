import { axiosInstance } from '@/lib/axios';

export type OtpPurpose = 'signup' | 'passwordless' | 'password_reset' | 'email_verification';

interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

interface SendOtpResponse {
  message: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  verificationToken: string;
  email: string;
  purpose: OtpPurpose;
}

/**
 * Send OTP to email
 */
export const sendOtp = async (data: SendOtpRequest): Promise<SendOtpResponse> => {
  const response = await axiosInstance.post<SendOtpResponse>('/api/auth/otp/send', data);
  return response.data;
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post<VerifyOtpResponse>('/api/auth/otp/verify', data);
  return response.data;
};
