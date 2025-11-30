import { Job } from '@/services/jobs.api';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
}

export function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No jobs found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
