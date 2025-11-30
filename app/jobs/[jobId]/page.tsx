import { getJob } from '@/services/jobs.api';
import { JobDetailHeader } from '@/components/jobs/JobDetailHeader';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage(props: PageProps) {
  const params = await props.params;
  const { jobId } = params;
  
  try {
    const { data: job } = await getJob(jobId);
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
        <JobDetailHeader job={job} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About the Role</h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">About the Organization</h3>
                <div className="flex items-center gap-3 mb-4">
                   {job.organization.logo ? (
                    <img src={job.organization.logo} alt={job.organization.name} className="w-12 h-12 rounded-lg bg-slate-100 object-cover" />
                   ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
                      {job.organization.name.charAt(0)}
                    </div>
                   )}
                   <div className="font-medium text-slate-900 dark:text-white">{job.organization.name}</div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {/* Placeholder for org description if available in future */}
                  Organization details would appear here.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching job:', error);
    notFound();
  }
}
