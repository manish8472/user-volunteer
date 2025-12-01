import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicantsPage from '@/app/dashboard/ngo/applicants/page';
import { getApplications, updateApplicationStatus } from '@/services/ngo.api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

const mockGetApplications = getApplications as jest.MockedFunction<typeof getApplications>;
const mockUpdateApplicationStatus = updateApplicationStatus as jest.MockedFunction<
  typeof updateApplicationStatus
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Applicant Management Integration', () => {
  const mockPush = jest.fn();
  const mockUser = { id: 'ngo-123', name: 'Test NGO', email: 'ngo@example.com', role: 'ngo' as const };

  const mockApplications = [
    {
      id: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Community Health Volunteer',
      volunteerId: 'vol-1',
      volunteerSnapshot: {
        id: 'vol-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        skills: ['First Aid', 'Communication'],
        experience: '2 years volunteering',
        education: "Bachelor's Degree",
      },
      status: 'new' as const,
      coverLetter: 'I am passionate about healthcare...',
      resumeUrl: 'https://example.com/resume.pdf',
      appliedAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      verificationRequested: false,
    },
    {
      id: 'app-2',
      jobId: 'job-2',
      jobTitle: 'Education Coordinator',
      volunteerId: 'vol-2',
      volunteerSnapshot: {
        id: 'vol-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        skills: ['Teaching', 'Curriculum Design'],
      },
      status: 'shortlisted' as const,
      appliedAt: '2024-01-16T11:00:00Z',
      updatedAt: '2024-01-16T11:00:00Z',
      verificationRequested: false,
    },
  ];

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

  it('loads and displays applicants', async () => {
    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText(/Applied for: Community Health Volunteer/i)).toBeInTheDocument();
    });
  });

  it('filters applicants by status', async () => {
    const user = userEvent.setup();

    // Initial load - all applications
    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click "Shortlisted" filter
    mockGetApplications.mockResolvedValue({
      data: [mockApplications[1]],
      meta: { page: 1, limit: 20, total: 1 },
    });

    const shortlistedTab = screen.getByRole('tab', { name: /shortlisted/i });
    await user.click(shortlistedTab);

    await waitFor(() => {
      expect(mockGetApplications).toHaveBeenCalledWith(
        'ngo-123',
        expect.objectContaining({ status: 'shortlisted' })
      );
    });
  });

  it('changes application status successfully', async () => {
    const user = userEvent.setup();

    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    const updatedApp = { ...mockApplications[0], status: 'selected' as const };
    mockUpdateApplicationStatus.mockResolvedValue(updatedApp);

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the status select for first application
    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[0]; // First application's status select
    await user.click(statusSelect);

    // Wait for dropdown to appear and select "Selected"
    const selectedOption = await screen.findByRole('option', { name: /selected/i });
    await user.click(selectedOption);

    await waitFor(() => {
      expect(mockUpdateApplicationStatus).toHaveBeenCalledWith('ngo-123', 'app-1', {
        status: 'selected',
      });
      expect(toast.success).toHaveBeenCalledWith('Application status updated');
    });
  });

  it('navigates to applicant detail page', async () => {
    const user = userEvent.setup();

    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on the card (not on buttons inside)
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    await user.click(viewDetailsButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/ngo/applicants/app-1');
  });

  it('downloads resume when button is clicked', async () => {
    const user = userEvent.setup();
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const resumeButtons = screen.getAllByRole('button', { name: /resume/i });
    await user.click(resumeButtons[0]);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/resume.pdf',
      '_blank'
    );

    windowOpenSpy.mockRestore();
  });

  it('shows empty state when no applications', async () => {
    mockGetApplications.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText('No applications yet')).toBeInTheDocument();
      expect(
        screen.getByText(/applications for your job postings will appear here/i)
      ).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGetApplications.mockRejectedValue(new Error('API Error'));

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load applications');
    });
  });

  it('shows correct status counts in tabs', async () => {
    mockGetApplications.mockResolvedValue({
      data: mockApplications,
      meta: { page: 1, limit: 20, total: 2 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      // Note: The counts shown depend on the current filtered data
      expect(screen.getByRole('tab', { name: /all \(2\)/i })).toBeInTheDocument();
    });
  });

  it('supports pagination', async () => {
    const user = userEvent.setup();

    // Mock first page
    mockGetApplications.mockResolvedValue({
      data: Array(20).fill(mockApplications[0]),
      meta: { page: 1, limit: 20, total: 25 },
    });

    render(<ApplicantsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });

    // Mock second page
    mockGetApplications.mockResolvedValue({
      data: Array(5).fill(mockApplications[1]),
      meta: { page: 2, limit: 20, total: 25 },
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockGetApplications).toHaveBeenCalledWith(
        'ngo-123',
        expect.objectContaining({ page: 2 })
      );
    });
  });
});
