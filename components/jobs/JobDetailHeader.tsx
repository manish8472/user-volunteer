import { Job } from '@/services/jobs.api';
import { ApplyCTA } from './ApplyCTA';

interface JobDetailHeaderProps {
  job: Job;
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {job.organization.logo && (
                <img 
                  src={job.organization.logo} 
                  alt={`${job.organization.name} logo`}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{job.title}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">{job.organization.name}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.type}
              </div>
              {job.salary && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.salary}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span 
                  key={skill}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0">
            <ApplyCTA jobId={job.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
