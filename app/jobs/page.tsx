import { Suspense } from 'react';
import { JobFilters as FilterType } from '@/services/jobs.api';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobResults } from '@/components/jobs/JobResults';

// Force dynamic rendering to ensure search params are handled correctly on every request
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams?.limit === 'string' ? parseInt(searchParams.limit) : 10;
  const location = typeof searchParams?.location === 'string' ? searchParams.location : undefined;
  const remote = searchParams?.remote === 'true';
  const skills = typeof searchParams?.skills === 'string' ? searchParams.skills.split(',') : undefined;

  const filters: FilterType = {
    page,
    limit,
    location,
    remote,
    skills,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <JobFilters initialFilters={filters} />
        </aside>
        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Jobs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Find the perfect role to contribute to social causes.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          }>
             <JobResults filters={filters} searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
