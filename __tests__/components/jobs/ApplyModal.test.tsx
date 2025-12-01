import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyModal } from '@/components/jobs/ApplyModal';
import { applyToJob } from '@/services/applications.api';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/services/applications.api');
jest.mock('@/components/ui/use-toast');

// Mock FileUpload component since it's complex
jest.mock('@/components/forms/FileUpload', () => ({
  FileUpload: ({ onUploaded }: { onUploaded: (url: string) => void }) => (
    <button onClick={() => onUploaded('https://example.com/resume.pdf')}>
      Mock Upload
    </button>
  ),
}));

describe('ApplyModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('renders correctly when open', () => {
    render(
      <ApplyModal
        jobId="123"
        jobTitle="Test Job"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Apply for Test Job')).toBeInTheDocument();
    expect(screen.getByText('Submit Application')).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    render(
      <ApplyModal
        jobId="123"
        jobTitle="Test Job"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Try to submit without data
    fireEvent.click(screen.getByText('Submit Application'));

    // Should show validation errors (or button disabled)
    // In our implementation, button is disabled if no resume
    expect(screen.getByText('Submit Application')).toBeDisabled();
  });

  it('submits application successfully', async () => {
    (applyToJob as jest.Mock).mockResolvedValue({});

    render(
      <ApplyModal
        jobId="123"
        jobTitle="Test Job"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Upload resume
    fireEvent.click(screen.getByText('Mock Upload'));

    // Fill cover letter
    const coverLetter = 'This is a test cover letter that needs to be at least 50 characters long so I am typing more words here.';
    fireEvent.change(screen.getByLabelText(/Cover Letter/i), {
      target: { value: coverLetter },
    });

    // Submit
    const submitBtn = screen.getByText('Submit Application');
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(applyToJob).toHaveBeenCalledWith('123', {
        coverLetter,
        resumeUrl: 'https://example.com/resume.pdf',
      });
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Application Submitted',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    (applyToJob as jest.Mock).mockRejectedValue(new Error('Failed'));

    render(
      <ApplyModal
        jobId="123"
        jobTitle="Test Job"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Upload resume
    fireEvent.click(screen.getByText('Mock Upload'));

    // Fill cover letter
    const coverLetter = 'This is a test cover letter that needs to be at least 50 characters long so I am typing more words here.';
    fireEvent.change(screen.getByLabelText(/Cover Letter/i), {
      target: { value: coverLetter },
    });

    // Submit
    const submitBtn = screen.getByText('Submit Application');
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Application Failed',
        variant: 'destructive',
      }));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
