import { render, screen } from '@testing-library/react';
import JobsPage from '@/app/jobs/page';
import { JobResults } from '@/components/jobs/JobResults';

// Mock child components
jest.mock('@/components/jobs/JobFilters', () => ({
  JobFilters: () => <div data-testid="job-filters">Filters</div>,
}));

jest.mock('@/components/jobs/JobResults', () => ({
  JobResults: () => <div data-testid="job-results">Job Results</div>,
}));

describe('Jobs Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page structure correctly', async () => {
    const searchParams = Promise.resolve({});
    const ui = await JobsPage({ searchParams });
    render(ui);

    expect(screen.getByText('Explore Jobs')).toBeInTheDocument();
    expect(screen.getByTestId('job-filters')).toBeInTheDocument();
    expect(screen.getByTestId('job-results')).toBeInTheDocument();
  });
});
