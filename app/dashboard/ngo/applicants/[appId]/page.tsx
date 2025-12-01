'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getApplicationById,
  updateApplicationStatus,
  requestVerification,
  type Application,
} from '@/services/ngo.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Shield,
  User,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id && appId) {
      loadApplication();
    }
  }, [user, appId]);

  const loadApplication = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getApplicationById(user.id, appId);
      setApplication(data);
    } catch (error) {
      console.error('Error loading application:', error);
      toast.error('Failed to load application');
      router.push('/dashboard/ngo/applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!user?.id || !application) return;

    try {
      await updateApplicationStatus(user.id, application.id, { status: newStatus });
      toast.success('Application status updated');
      setApplication({ ...application, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleRequestVerification = async () => {
    if (!application) return;

    try {
      setSubmitting(true);
      await requestVerification(application.id, {
        documents: ['ID Proof', 'Address Proof'],
        message: verificationMessage,
      });
      toast.success('Verification request sent to applicant');
      setVerificationDialogOpen(false);
      setVerificationMessage('');
      loadApplication();
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast.error('Failed to send verification request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AuthGuard authorize={['ngo']}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <AuthGuard authorize={['ngo']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/dashboard/ngo/applicants"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applicants
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {application.volunteerSnapshot.name}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Application for: {application.jobTitle}
                </p>
              </div>
              <Badge variant={STATUS_CONFIG[application.status].variant} className="text-base px-4 py-2">
                {STATUS_CONFIG[application.status].label}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="status" className="mb-2 block">
                    Change Status
                  </Label>
                  <Select value={application.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
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
                </div>

                <div className="flex items-end gap-2">
                  <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        Request Verification
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Verification</DialogTitle>
                        <DialogDescription>
                          Request additional verification documents from the applicant
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="verificationMessage">Message to Applicant</Label>
                          <Textarea
                            id="verificationMessage"
                            value={verificationMessage}
                            onChange={(e) => setVerificationMessage(e.target.value)}
                            placeholder="Please provide ID proof and address proof for verification..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setVerificationDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleRequestVerification} disabled={submitting}>
                          {submitting ? 'Sending...' : 'Send Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>

                  {application.resumeUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(application.resumeUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Snapshot */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Snapshot at time of application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${application.volunteerSnapshot.email}`}
                          className="text-sm hover:underline"
                        >
                          {application.volunteerSnapshot.email}
                        </a>
                      </div>
                    </div>
                    {application.volunteerSnapshot.phone && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Phone</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${application.volunteerSnapshot.phone}`}
                            className="text-sm hover:underline"
                          >
                            {application.volunteerSnapshot.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {application.volunteerSnapshot.skills &&
                    application.volunteerSnapshot.skills.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">
                          Skills
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {application.volunteerSnapshot.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {application.volunteerSnapshot.experience && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Experience
                      </Label>
                      <p className="text-sm">{application.volunteerSnapshot.experience}</p>
                    </div>
                  )}

                  {application.volunteerSnapshot.education && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Education
                      </Label>
                      <p className="text-sm">{application.volunteerSnapshot.education}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {application.coverLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                  </CardContent>
                </Card>
              )}

              {/* Custom Question Answers */}
              {application.answers && application.answers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Question Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {application.answers.map((answer, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                        <Label className="text-sm font-medium mb-2 block">
                          {idx + 1}. {answer.question}
                        </Label>
                        <p className="text-sm text-muted-foreground">{answer.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Applied On
                    </Label>
                    <p className="text-sm font-medium">{formatDate(application.appliedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Updated
                    </Label>
                    <p className="text-sm font-medium">{formatDate(application.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.verificationRequested ? (
                    <div className="space-y-3">
                      <Badge variant="warning">Verification Requested</Badge>
                      {application.verificationDocs && application.verificationDocs.length > 0 && (
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Documents Submitted
                          </Label>
                          <div className="space-y-2">
                            {application.verificationDocs.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No verification requested yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resume Preview */}
              {application.resumeUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(application.resumeUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View Resume
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
