import Link from 'next/link';
import { Job } from '@/services/jobs.api';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
            <Link href={`/jobs/${job.id}`}>
              <span className="absolute inset-0" />
              {job.title}
            </Link>
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{job.organization.name}</p>
        </div>
        {job.organization.logo && (
          <img 
            src={job.organization.logo} 
            alt={`${job.organization.name} logo`}
            className="w-12 h-12 rounded-lg object-cover bg-slate-100"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 3).map((skill) => (
          <span 
            key={skill}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
        {job.remote && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Remote
          </span>
        )}
      </div>
    </div>
  );
}
