import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateJobPage from '@/app/dashboard/ngo/jobs/create/page';
import { createJob } from '@/services/ngo.api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/services/ngo.api');
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockCreateJob = createJob as jest.MockedFunction<typeof createJob>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Job Creation Integration', () => {
  const mockPush = jest.fn();
  const mockUser = { id: 'ngo-123', name: 'Test NGO', email: 'ngo@example.com', role: 'ngo' as const };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      accessToken: 'mock-token',
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
      getUser: jest.fn(() => mockUser),
      isLoggingIn: false,
      isLoggingOut: false,
      isRefreshing: false,
      isFetchingUser: false,
      loginError: null,
      logoutError: null,
      refreshError: null,
      userError: null,
      resetLoginError: jest.fn(),
      resetLogoutError: jest.fn(),
      resetRefreshError: jest.fn(),
    } as any);
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  it('creates a job and redirects to job detail page', async () => {
    const user = userEvent.setup();
    const mockJobId = 'job-456';
    const mockJob = {
      id: mockJobId,
      ngoId: 'ngo-123',
      title: 'Community Health Volunteer',
      description: 'Help provide healthcare services to underserved communities',
      location: 'New York, NY',
      remote: false,
      type: 'volunteer' as const,
      requirements: {
        skills: ['First Aid', 'Communication', 'Empathy'],
        experience: '1 year in healthcare or volunteering',
        education: 'High School Diploma',
        availability: 'Weekends, 10 hours/week',
      },
      customQuestions: [
        {
          id: 'q-1',
          question: 'Why do you want to volunteer in healthcare?',
          type: 'textarea' as const,
          required: true,
          order: 0,
        },
      ],
      deadline: '2024-12-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateJob.mockResolvedValue(mockJob);

    render(<CreateJobPage />);

    // Step 1: Fill job details
    await user.type(
      screen.getByLabelText(/job title/i),
      'Community Health Volunteer'
    );
    await user.type(
      screen.getByLabelText(/description/i),
      'Help provide healthcare services to underserved communities'
    );
    await user.type(screen.getByLabelText(/location/i), 'New York, NY');
    
    // Set deadline
    const deadlineInput = screen.getByLabelText(/application deadline/i);
    await user.type(deadlineInput, '2024-12-31');

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Add requirements
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });

    const skillInput = screen.getByPlaceholderText(/enter a skill/i);
    await user.type(skillInput, 'First Aid{Enter}');
    await user.type(skillInput, 'Communication{Enter}');
    await user.type(skillInput, 'Empathy{Enter}');

    await user.type(
      screen.getByLabelText(/experience/i),
      '1 year in healthcare or volunteering'
    );
    await user.type(screen.getByLabelText(/education/i), 'High School Diploma');
    await user.type(screen.getByLabelText(/availability/i), 'Weekends, 10 hours/week');

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Add custom questions
    await waitFor(() => {
      expect(screen.getByText('Custom Questions')).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/what motivates you/i),
      'Why do you want to volunteer in healthcare?'
    );
    await user.click(screen.getByLabelText(/required/i));
    await user.click(screen.getByRole('button', { name: /add question/i }));

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Review and submit
    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Community Health Volunteer')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create job/i });
    await user.click(createButton);

    // Verify API call
    await waitFor(() => {
      expect(mockCreateJob).toHaveBeenCalledWith(
        'ngo-123',
        expect.objectContaining({
          title: 'Community Health Volunteer',
          description: 'Help provide healthcare services to underserved communities',
          location: 'New York, NY',
          remote: false,
          type: 'volunteer',
          requirements: expect.objectContaining({
            skills: ['First Aid', 'Communication', 'Empathy'],
            experience: '1 year in healthcare or volunteering',
            education: 'High School Diploma',
            availability: 'Weekends, 10 hours/week',
          }),
          customQuestions: expect.arrayContaining([
            expect.objectContaining({
              question: 'Why do you want to volunteer in healthcare?',
              type: 'textarea',
              required: true,
            }),
          ]),
          deadline: '2024-12-31',
        })
      );
    });

    // Verify success toast and redirect
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Job created successfully!');
      expect(mockPush).toHaveBeenCalledWith(`/dashboard/ngo/jobs/${mockJobId}`);
    });
  });

  it('creates a remote job without location', async () => {
    const user = userEvent.setup();
    const mockJob = {
      id: 'job-789',
      ngoId: 'ngo-123',
      title: 'Remote Content Writer',
      description: 'Write engaging content for our blog',
      location: '',
      remote: true,
      type: 'part-time' as const,
      requirements: {
        skills: ['Writing', 'SEO'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCreateJob.mockResolvedValue(mockJob);

    render(<CreateJobPage />);

    // Fill details with remote option
    await user.type(screen.getByLabelText(/job title/i), 'Remote Content Writer');
    await user.type(screen.getByLabelText(/description/i), 'Write engaging content for our blog');
    await user.click(screen.getByLabelText(/remote position/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Add skills
    await waitFor(() => {
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });
    
    const skillInput = screen.getByPlaceholderText(/enter a skill/i);
    await user.type(skillInput, 'Writing{Enter}');
    await user.type(skillInput, 'SEO{Enter}');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Skip custom questions
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Submit
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /create job/i }));

    await waitFor(() => {
      expect(mockCreateJob).toHaveBeenCalledWith(
        'ngo-123',
        expect.objectContaining({
          title: 'Remote Content Writer',
          remote: true,
          location: '',
        })
      );
    });
  });

  it('shows error message when job creation fails', async () => {
    const user = userEvent.setup();
    mockCreateJob.mockRejectedValue(new Error('Network error'));

    render(<CreateJobPage />);

    // Fill minimum required fields
    await user.type(screen.getByLabelText(/job title/i), 'Test Job');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.click(screen.getByLabelText(/remote/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.type(screen.getByPlaceholderText(/enter a skill/i), 'Testing{Enter}');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(screen.getByRole('button', { name: /create job/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create job. Please try again.');
      // Should NOT redirect on error
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('preserves form data when navigating between steps', async () => {
    const user = userEvent.setup();
    render(<CreateJobPage />);

    // Fill step 1
    await user.type(screen.getByLabelText(/job title/i), 'Preserved Job Title');
    await user.type(screen.getByLabelText(/description/i), 'Preserved Description');
    await user.click(screen.getByLabelText(/remote/i));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Fill step 2
    await user.type(screen.getByPlaceholderText(/enter a skill/i), 'Skill 1{Enter}');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }));
    await user.click(screen.getByRole('button', { name: /back/i }));

    // Verify data is preserved
    expect(screen.getByLabelText(/job title/i)).toHaveValue('Preserved Job Title');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Preserved Description');
    expect(screen.getByLabelText(/remote position/i)).toBeChecked();

    // Go forward to step 2
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Verify skills are preserved
    await waitFor(() => {
      expect(screen.getByText('Skill 1')).toBeInTheDocument();
    });
  });
});
