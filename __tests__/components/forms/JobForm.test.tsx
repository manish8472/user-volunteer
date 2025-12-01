import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobForm from '@/components/forms/JobForm';
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

describe('JobForm', () => {
  const mockPush = jest.fn();
  const mockUser = { id: 'ngo-123', email: 'ngo@example.com', role: 'ngo' as const };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false,
    });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Step Navigation', () => {
    it('renders the first step (details) by default', () => {
      render(<JobForm />);
      expect(screen.getByText('Job Details')).toBeInTheDocument();
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    it('validates required fields before moving to next step', async () => {
      render(<JobForm />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a job title');
      });
    });

    it('moves to next step when details are valid', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Fill in required details
      await user.type(screen.getByLabelText(/job title/i), 'Community Volunteer');
      await user.type(
        screen.getByLabelText(/description/i),
        'Help our community grow'
      );
      await user.click(screen.getByLabelText(/remote position/i));

      // Click next
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Should now be on requirements step
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByLabelText(/required skills/i)).toBeInTheDocument();
      });
    });

    it('allows going back to previous step', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Fill details and go to step 2
      await user.type(screen.getByLabelText(/job title/i), 'Community Volunteer');
      await user.type(screen.getByLabelText(/description/i), 'Help our community');
      await user.click(screen.getByLabelText(/remote position/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go back
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should be back on details step
      await waitFor(() => {
        expect(screen.getByLabelText(/job title/i)).toHaveValue('Community Volunteer');
      });
    });

    it('navigates through all steps', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Step 1: Details
      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
      await user.click(screen.getByLabelText(/remote position/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Requirements
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });
      
      // Add a skill
      const skillInput = screen.getByPlaceholderText(/enter a skill/i);
      await user.type(skillInput, 'JavaScript{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: Custom Questions
      await waitFor(() => {
        expect(screen.getByText('Custom Questions')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4: Review
      await waitFor(() => {
        expect(screen.getByText('Review')).toBeInTheDocument();
        expect(screen.getByText('Test Job')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('requires job title', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      await user.type(screen.getByLabelText(/description/i), 'Some description');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a job title');
      });
    });

    it('requires description', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a job description');
      });
    });

    it('requires location when not remote', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
      // Don't check remote checkbox
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Please enter a location or select remote'
        );
      });
    });

    it('requires at least one skill in requirements step', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Complete step 1
      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
      await user.click(screen.getByLabelText(/remote position/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Try to skip step 2 without adding skills
      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please add at least one skill');
      });
    });
  });

  describe('Skills Management', () => {
    it('adds skills when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Navigate to requirements
      await user.type(screen.getByLabelText(/job title/i), 'Test');
      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Add skills
      const skillInput = screen.getByPlaceholderText(/enter a skill/i);
      await user.type(skillInput, 'React{Enter}');
      expect(screen.getByText('React')).toBeInTheDocument();

      await user.type(skillInput, 'Node.js{Enter}');
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('removes skills when X is clicked', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Navigate to requirements and add a skill
      await user.type(screen.getByLabelText(/job title/i), 'Test');
      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      const skillInput = screen.getByPlaceholderText(/enter a skill/i);
      await user.type(skillInput, 'React{Enter}');

      // Remove the skill
      const removeButton = screen.getByText('React').parentElement?.querySelector('button');
      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Questions', () => {
    it('adds custom questions', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Navigate to questions step
      await user.type(screen.getByLabelText(/job title/i), 'Test');
      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByPlaceholderText(/enter a skill/i), 'React{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Add a question
      await waitFor(() => {
        expect(screen.getByText('Custom Questions')).toBeInTheDocument();
      });

      const questionInput = screen.getByPlaceholderText(/what motivates you/i);
      await user.type(questionInput, 'Why do you want to volunteer?');
      
      const addButton = screen.getByRole('button', { name: /add question/i });
      await user.click(addButton);

      expect(screen.getByText('1. Why do you want to volunteer?')).toBeInTheDocument();
    });

    it('removes custom questions', async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      // Navigate and add a question
      await user.type(screen.getByLabelText(/job title/i), 'Test');
      await user.type(screen.getByLabelText(/description/i), 'Test');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.type(screen.getByPlaceholderText(/enter a skill/i), 'React{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Custom Questions')).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText(/what motivates you/i),
        'Test question'
      );
      await user.click(screen.getByRole('button', { name: /add question/i }));

      // Find and click delete button
      const deleteButtons = screen.getAllByRole('button');
      const trashButton = deleteButtons.find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );

      if (trashButton) {
        await user.click(trashButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('1. Test question')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits job successfully', async () => {
      const user = userEvent.setup();
      const mockJob = {
        id: 'job-123',
        ngoId: 'ngo-123',
        title: 'Test Job',
        description: 'Test Description',
        location: '',
        remote: true,
        type: 'volunteer' as const,
        requirements: { skills: ['React'] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockCreateJob.mockResolvedValue(mockJob);

      render(<JobForm />);

      // Fill all steps
      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByPlaceholderText(/enter a skill/i), 'React{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Submit
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create job/i }));

      await waitFor(() => {
        expect(mockCreateJob).toHaveBeenCalledWith('ngo-123', expect.objectContaining({
          title: 'Test Job',
          description: 'Test Description',
          remote: true,
        }));
        expect(toast.success).toHaveBeenCalledWith('Job created successfully!');
        expect(mockPush).toHaveBeenCalledWith('/dashboard/ngo/jobs/job-123');
      });
    });

    it('handles submission errors', async () => {
      const user = userEvent.setup();
      mockCreateJob.mockRejectedValue(new Error('API Error'));

      render(<JobForm />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/job title/i), 'Test Job');
      await user.type(screen.getByLabelText(/description/i), 'Test Description');
      await user.click(screen.getByLabelText(/remote/i));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByPlaceholderText(/enter a skill/i), 'React{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.click(screen.getByRole('button', { name: /create job/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to create job. Please try again.'
        );
      });
    });
  });
});
