import { getJobs, JobFilters as FilterType, Job } from '@/services/jobs.api';
import { JobList } from '@/components/jobs/JobList';
import { JobPagination } from '@/components/jobs/JobPagination';

interface JobResultsProps {
  filters: FilterType;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function JobResults({ filters, searchParams }: JobResultsProps) {
  let jobs: Job[] = [];
  let meta = { page: 1, limit: 10, total: 0 };
  let error = null;

  try {
    const response = await getJobs(filters);
    jobs = response.data;
    meta = response.meta;
  } catch (err) {
    console.error('Failed to fetch jobs:', err);
    error = 'Failed to load jobs. Please try again later.';
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <>
      <JobList jobs={jobs} />
      <JobPagination 
        currentPage={meta.page} 
        totalPages={totalPages} 
        baseUrl="/jobs" 
        searchParams={searchParams} 
      />
    </>
  );
}
