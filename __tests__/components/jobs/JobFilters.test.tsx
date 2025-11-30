import { render, screen, fireEvent } from '@testing-library/react';
import { JobFilters } from '@/components/jobs/JobFilters';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('JobFilters', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('renders filter inputs correctly', () => {
    render(<JobFilters />);
    
    expect(screen.getByPlaceholderText(/Type skill & press Enter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/City, Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remote Only/i)).toBeInTheDocument();
  });

  it('adds skills when pressing Enter', () => {
    render(<JobFilters />);
    
    const skillInput = screen.getByPlaceholderText(/Type skill & press Enter/i);
    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');
  });

  it('updates location state', () => {
    render(<JobFilters />);
    
    const locationInput = screen.getByPlaceholderText(/City, Country/i);
    fireEvent.change(locationInput, { target: { value: 'New York' } });

    expect(locationInput).toHaveValue('New York');
  });

  it('updates remote checkbox state', () => {
    render(<JobFilters />);
    
    const remoteCheckbox = screen.getByLabelText(/Remote Only/i);
    fireEvent.click(remoteCheckbox);

    expect(remoteCheckbox).toBeChecked();
  });

  it('applies filters and updates URL', () => {
    render(<JobFilters />);
    
    // Add skill
    const skillInput = screen.getByPlaceholderText(/Type skill & press Enter/i);
    fireEvent.change(skillInput, { target: { value: 'React' } });
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });

    // Set location
    const locationInput = screen.getByPlaceholderText(/City, Country/i);
    fireEvent.change(locationInput, { target: { value: 'New York' } });

    // Set remote
    const remoteCheckbox = screen.getByLabelText(/Remote Only/i);
    fireEvent.click(remoteCheckbox);

    // Click Apply
    fireEvent.click(screen.getByText('Apply Filters'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/jobs?skills=React&location=New+York&remote=true'));
  });

  it('clears filters and resets URL', () => {
    render(<JobFilters initialFilters={{ location: 'London', remote: true, skills: ['Vue'] }} />);
    
    expect(screen.getByDisplayValue('London')).toBeInTheDocument();
    expect(screen.getByLabelText(/Remote Only/i)).toBeChecked();
    expect(screen.getByText('Vue')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear'));

    expect(mockPush).toHaveBeenCalledWith('/jobs');
    expect(screen.getByPlaceholderText(/City, Country/i)).toHaveValue('');
    expect(screen.getByLabelText(/Remote Only/i)).not.toBeChecked();
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();
  });
});
