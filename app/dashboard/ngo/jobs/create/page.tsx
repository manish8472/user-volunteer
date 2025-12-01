'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import JobForm from '@/components/forms/JobForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  return (
    <AuthGuard authorize={['ngo']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/dashboard/ngo/jobs"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Create New Job</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details to post a new job opportunity
            </p>
          </div>

          {/* Form */}
          <JobForm />
        </div>
      </div>
    </AuthGuard>
  );
}
