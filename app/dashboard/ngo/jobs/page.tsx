'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { getNGOJobs, type Job } from '@/services/ngo.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, MapPin, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function NGOJobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getNGOJobs(user.id);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    router.push('/dashboard/ngo/jobs/create');
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/dashboard/ngo/jobs/${jobId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getJobTypeBadge = (type: Job['type']) => {
    const variants = {
      'full-time': 'default',
      'part-time': 'secondary',
      contract: 'info',
      volunteer: 'success',
    } as const;
    return variants[type] || 'default';
  };

  return (
    <AuthGuard authorize={['ngo']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your organization's job opportunities
              </p>
            </div>
            <Button onClick={handleCreateJob} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start attracting volunteers by creating your first job posting
                  </p>
                  <Button onClick={handleCreateJob}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Job
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewJob(job.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <Badge variant={getJobTypeBadge(job.type)}>
                        {job.type.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{job.remote ? 'Remote' : job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {formatDate(job.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{job.applicationsCount || 0} applicants</span>
                      </div>
                      {job.deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline {formatDate(job.deadline)}</span>
                        </div>
                      )}
                    </div>
                    {job.requirements.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requirements.skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.requirements.skills.length > 5 && (
                          <Badge variant="outline">
                            +{job.requirements.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
