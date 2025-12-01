import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '@/components/forms/FileUpload';
import { useUpload } from '@/hooks/useUpload';

jest.mock('@/hooks/useUpload');

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.URL.revokeObjectURL = jest.fn();

describe('FileUpload', () => {
  const mockStartUpload = jest.fn();
  const mockCancelUpload = jest.fn();
  const mockRetryUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpload as jest.Mock).mockReturnValue({
      progress: 0,
      isUploading: false,
      error: null,
      downloadUrl: null,
      startUpload: mockStartUpload,
      cancelUpload: mockCancelUpload,
      retryUpload: mockRetryUpload,
    });
  });

  it('renders upload area initially', () => {
    render(<FileUpload purpose="test" />);
    expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument();
  });

  it('starts upload when file is selected', () => {
    const { container } = render(<FileUpload purpose="test" />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockStartUpload).toHaveBeenCalledWith(file);
  });

  it('shows progress when uploading', () => {
    (useUpload as jest.Mock).mockReturnValue({
      progress: 50,
      isUploading: true,
      error: null,
      downloadUrl: null,
      startUpload: mockStartUpload,
      cancelUpload: mockCancelUpload,
      retryUpload: mockRetryUpload,
    });

    const { container } = render(<FileUpload purpose="test" />);
    
    // Select file to enter "selected" state
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('50% Uploading...')).toBeInTheDocument();
  });

  it('shows retry button on error', () => {
    (useUpload as jest.Mock).mockReturnValue({
      progress: 0,
      isUploading: false,
      error: new Error('Failed'),
      downloadUrl: null,
      startUpload: mockStartUpload,
      cancelUpload: mockCancelUpload,
      retryUpload: mockRetryUpload,
    });

    const { container } = render(<FileUpload purpose="test" />);
    
    // Select file to enter "selected" state
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);
    expect(mockRetryUpload).toHaveBeenCalledWith(file);
  });
});
