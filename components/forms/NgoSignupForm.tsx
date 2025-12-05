'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ngoSignupSchema, NgoSignupFormData } from '@/lib/validations/auth.schema';
import { registerNgo, startGoogleOauth } from '@/services/auth.api';
import { sendOtp } from '@/services/otp.api';
import { useAuthStore } from '@/stores/authStore';
import { FormInput } from '@/components/ui/form-input';
import { FormTextarea } from '@/components/ui/form-textarea';
import { Button } from '@/components/ui/button';

interface NgoSignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const NgoSignupForm = ({
  onSuccess,
  redirectTo = '/dashboard',
}: NgoSignupFormProps) => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NgoSignupFormData>({
    resolver: zodResolver(ngoSignupSchema),
  });

  const onSubmit = async (data: NgoSignupFormData) => {
    try {
      setIsLoading(true);
      setApiError('');

      // Send OTP to email
      await sendOtp({
        email: data.email.toLowerCase(),
        purpose: 'signup',
      });

      // Generate slug from organization name
      const slug = data.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Store signup data in session storage (without files - they can't be serialized)
      const signupData = {
        name: data.organizationName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        website: data.website,
        description: data.description,
        registrationNumber: data.registrationNumber,
        slug,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        contactPerson: {
          name: data.contactName,
          email: data.contactEmail,
          phone: data.contactPhone || data.phone || '',
          designation: data.contactDesignation,
        },
      };
      
      sessionStorage.setItem('pendingSignup', JSON.stringify(signupData));
      sessionStorage.setItem('pendingEmail', data.email.toLowerCase());
      sessionStorage.setItem('pendingUserType', 'ngo');
      
      // Note: Documents will need to be re-uploaded after OTP verification
      // Or we could convert to base64 and store (for small files)
      if (documentFiles.length > 0) {
        sessionStorage.setItem('pendingDocumentsNote', 'true');
      }

      // Redirect to OTP verification page
      router.push('/auth/verify-otp');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    startGoogleOauth('ngo');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Organization
          </h2>
          <p className="text-gray-600">
            Join our network of impactful NGOs and connect with volunteers
          </p>
        </div>

        {apiError && (
          <div
            className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Organization Name"
              type="text"
              placeholder="Your Organization Name"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />

            <FormInput
              label="Email"
              type="email"
              placeholder="contact@organization.org"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1234567890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <FormInput
              label="Website (Optional)"
              type="url"
              placeholder="https://yourorg.org"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>

          <FormInput
            label="Registration Number (Optional)"
            type="text"
            placeholder="NGO/Charity Registration Number"
            error={errors.registrationNumber?.message}
            helperText="Your official registration or tax ID number"
            {...register('registrationNumber')}
          />

          <FormTextarea
            label="Organization Description"
            rows={4}
            placeholder="Tell us about your organization's mission and activities..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address Details</h3>
            <div className="space-y-5">
              <FormInput
                label="Street Address"
                type="text"
                placeholder="123 NGO St"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="City"
                  type="text"
                  placeholder="City"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <FormInput
                  label="State"
                  type="text"
                  placeholder="State"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Postal Code"
                  type="text"
                  placeholder="Postal Code"
                  error={errors.postalCode?.message}
                  {...register('postalCode')}
                />
                <FormInput
                  label="Country"
                  type="text"
                  placeholder="Country"
                  defaultValue="India"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person Details</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Contact Name"
                  type="text"
                  placeholder="Full Name"
                  error={errors.contactName?.message}
                  {...register('contactName')}
                />
                <FormInput
                  label="Designation"
                  type="text"
                  placeholder="e.g. Director, Manager"
                  error={errors.contactDesignation?.message}
                  {...register('contactDesignation')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Contact Email"
                  type="email"
                  placeholder="contact@example.com"
                  error={errors.contactEmail?.message}
                  {...register('contactEmail')}
                />
                <FormInput
                  label="Contact Phone"
                  type="tel"
                  placeholder="+1234567890"
                  error={errors.contactPhone?.message}
                  {...register('contactPhone')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Password"
              type="password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              helperText="At least 8 characters"
              {...register('password')}
            />

            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {/* File Upload Section - Placeholder for Module 7 */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supporting Documents (Optional)
            </label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-secondary transition-colors">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex justify-center text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-secondary hover:text-secondary-dark"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Registration certificates, tax documents (PDF, DOC, JPG up to 10MB)
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Note: File upload will be fully implemented in Module 7
                </p>
              </div>
            </div>

            {documentFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Selected files ({documentFiles.length}):
                </p>
                {documentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-danger hover:text-danger-light text-sm ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 mr-2 rounded border-gray-300 text-secondary focus:ring-secondary"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I confirm that I have the authority to register this organization and agree to
              the{' '}
              <a href="/terms" className="text-secondary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-secondary hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            Register Organization
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            type="button"
            className="mt-4 w-full flex items-center justify-center px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="font-medium text-secondary hover:text-secondary-dark transition-colors"
          >
            Sign in
          </a>
        </p>

        <p className="mt-4 text-center text-sm text-gray-600">
          Are you a volunteer?{' '}
          <a
            href="/auth/signup/volunteer"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Register as Volunteer
          </a>
        </p>
      </div>
    </div>
  );
};
