'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getApplications,
  updateApplicationStatus,
  type Application,
  type ApplicationFilters,
} from '@/services/ngo.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, FileText, Calendar, Mail, Phone, Download } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'all' | Application['status'];

const STATUS_CONFIG: Record<
  Application['status'],
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' }
> = {
  new: { label: 'New', variant: 'info' },
  reviewing: { label: 'Reviewing', variant: 'warning' },
  shortlisted: { label: 'Shortlisted', variant: 'secondary' },
  selected: { label: 'Selected', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'default' },
};

export default function ApplicantsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadApplications();
    }
  }, [user, statusFilter, page]);

  const loadApplications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const filters: ApplicationFilters = {
        page,
        limit: 20,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await getApplications(user.id, filters);
      setApplications(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    if (!user?.id) return;

    try {
      await updateApplicationStatus(user.id, applicationId, { status: newStatus });
      toast.success('Application status updated');
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewApplication = (appId: string) => {
    router.push(`/dashboard/ngo/applicants/${appId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: applications.length,
      new: 0,
      shortlisted: 0,
      selected: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <AuthGuard authorize={['ngo']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applicants</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage applications for your job postings
            </p>
          </div>

          {/* Quick Filters */}
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="new">New ({statusCounts.new})</TabsTrigger>
              <TabsTrigger value="shortlisted">
                Shortlisted ({statusCounts.shortlisted})
              </TabsTrigger>
              <TabsTrigger value="selected">Selected ({statusCounts.selected})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Applications List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Users className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">
                    Applications for your job postings will appear here
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card
                  key={application.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewApplication(application.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {application.volunteerSnapshot.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied for: {application.jobTitle}
                        </p>
                      </div>
                      <Badge variant={STATUS_CONFIG[application.status].variant}>
                        {STATUS_CONFIG[application.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{application.volunteerSnapshot.email}</span>
                      </div>
                      {application.volunteerSnapshot.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{application.volunteerSnapshot.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {formatDate(application.appliedAt)}</span>
                      </div>
                    </div>

                    {application.volunteerSnapshot.skills &&
                      application.volunteerSnapshot.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {application.volunteerSnapshot.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                          {application.volunteerSnapshot.skills.length > 5 && (
                            <Badge variant="outline">
                              +{application.volunteerSnapshot.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Select
                        value={application.status}
                        onValueChange={(value: Application['status']) =>
                          handleStatusChange(application.id, value)
                        }
                      >
                        <SelectTrigger className="w-40" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="selected">Selected</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      {application.resumeUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(application.resumeUrl, '_blank');
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(application.id);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
