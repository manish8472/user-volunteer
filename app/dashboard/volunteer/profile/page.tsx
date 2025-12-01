'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getMe,
  updateProfile,
  uploadResume,
  uploadAvatar,
  calculateProfileCompleteness,
  getProfileSuggestions,
  type UserProfile,
  type UpdateProfilePayload,
} from '@/services/users.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TagInput from '@/components/forms/TagInput';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Communication',
  'Teamwork',
  'Leadership',
  'Project Management',
  'Teaching',
  'First Aid',
  'Social Media',
  'Content Writing',
  'Graphic Design',
  'Event Planning',
  'Fundraising',
  'Community Outreach',
];

export default function VolunteerProfilePage() {
  const router = useRouter();
  const { user: authUser, refresh } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    name: '',
    phone: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    availability: '',
    location: '',
  });

  const [completeness, setCompleteness] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      const newCompleteness = calculateProfileCompleteness(profile);
      const newSuggestions = getProfileSuggestions(profile);
      setCompleteness(newCompleteness);
      setSuggestions(newSuggestions);
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        skills: data.skills || [],
        experience: data.experience || '',
        education: data.education || '',
        availability: data.availability || '',
        location: data.location || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      
      // Refresh auth state to update user info
      await refresh();
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingResume(true);
      const resumeUrl = await uploadResume(file);
      
      // Update profile with resume URL
      const updatedProfile = await updateProfile({ ...formData, resumeUrl });
      setProfile(updatedProfile);
      
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const avatarUrl = await uploadAvatar(file);
      
      // Update form data
      setFormData({ ...formData, avatarUrl });
      
      // Update profile
      const updatedProfile = await updateProfile({ ...formData, avatarUrl });
      setProfile(updatedProfile);
      
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <AuthGuard authorize={['volunteer']}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard authorize={['volunteer']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your volunteer profile and preferences
            </p>
          </div>

          {/* Profile Completeness Card */}
          {completeness < 100 && (
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Complete Your Profile
                    </CardTitle>
                    <CardDescription>
                      {completeness}% complete - Add more details to increase your visibility
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{completeness}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggestions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Avatar & Resume */}
            <div className="space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-border"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('avatar')?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.resumeUrl ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Resume uploaded</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.resumeUrl.split('/').pop()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(profile.resumeUrl, '_blank')}
                      >
                        View Resume
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed rounded-md text-center">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No resume uploaded
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                    <Button
                      variant={profile?.resumeUrl ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => document.getElementById('resume')?.click()}
                      disabled={uploadingResume}
                    >
                      {uploadingResume ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF only, max 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="email">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email (read-only)
                      </Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="New York, NY"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="bio">
                        About Me
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself and your interests..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Add skills that you can contribute</CardDescription>
                </CardHeader>
                <CardContent>
                  <TagInput
                    tags={formData.skills || []}
                    onChange={(skills) => setFormData({ ...formData, skills })}
                    label="Skills"
                    placeholder="Type a skill and press Enter"
                    suggestions={COMMON_SKILLS}
                    maxTags={20}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Education</CardTitle>
                  <CardDescription>Your background and qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="experience">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Work Experience
                    </Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Describe your work experience..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="education">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      Education
                    </Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Availability
                    </Label>
                    <Input
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      placeholder="e.g., Weekends, 10 hours/week"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
