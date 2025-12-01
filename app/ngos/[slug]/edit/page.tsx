'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import {
  getNGOProfile,
  updateNGOProfile,
  uploadAvatar,
  type NGOProfile,
  type UpdateNGOProfilePayload,
} from '@/services/users.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TagInput from '@/components/forms/TagInput';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  FileText,
  Upload,
  ExternalLink,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const AREAS_OF_WORK_SUGGESTIONS = [
  'Education',
  'Healthcare',
  'Environment',
  'Animal Welfare',
  'Women Empowerment',
  'Child Welfare',
  'Elderly Care',
  'Disaster Relief',
  'Community Development',
  'Skill Development',
  'Poverty Alleviation',
  'Clean Water',
  'Sanitation',
  'Sustainable Development',
];

export default function EditNGOProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateNGOProfilePayload>({
    name: '',
    description: '',
    mission: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    foundedYear: undefined,
    teamSize: '',
    areasOfWork: [],
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getNGOProfile(user.id);
      
      // Verify ownership - user must own this NGO
      if (data.slug !== slug) {
        toast.error('You do not have permission to edit this NGO profile');
        router.push('/dashboard');
        return;
      }

      setProfile(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        mission: data.mission || '',
        website: data.website || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        foundedYear: data.foundedYear,
        teamSize: data.teamSize || '',
        areasOfWork: data.areasOfWork || [],
        socialLinks: data.socialLinks || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
        },
      });
    } catch (error) {
      console.error('Error loading NGO profile:', error);
      toast.error('Failed to load NGO profile');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const updatedProfile = await updateNGOProfile(user.id, formData);
      setProfile(updatedProfile);
      toast.success('NGO profile updated successfully!');
    } catch (error) {
      console.error('Error saving NGO profile:', error);
      toast.error('Failed to save NGO profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const logoUrl = await uploadAvatar(file);
      
      setFormData({ ...formData, logo: logoUrl });
      
      if (user?.id) {
        const updatedProfile = await updateNGOProfile(user.id, { ...formData, logo: logoUrl });
        setProfile(updatedProfile);
      }
      
      toast.success('Logo updated!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <AuthGuard authorize={['ngo']}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading NGO profile...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard authorize={['ngo']}>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Link
              href={`/ngos/${slug}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to NGO Profile
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Edit NGO Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organization's public profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Logo & Registration */}
            <div className="space-y-6">
              {/* Logo Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    {profile?.logo ? (
                      <img
                        src={profile.logo}
                        alt="NGO Logo"
                        className="w-32 h-32 rounded-lg object-cover border-4 border-border"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center border-4 border-border">
                        <Building2 className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('logo')?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.registrationNumber && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Registration Number
                      </Label>
                      <p className="text-sm font-medium">{profile.registrationNumber}</p>
                    </div>
                  )}
                  
                  {profile?.registrationDocs && profile.registrationDocs.length > 0 ? (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Documents
                      </Label>
                      {profile.registrationDocs.map((doc, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full mb-2"
                          onClick={() => window.open(doc, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Document {idx + 1}
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No registration documents uploaded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your organization's essential details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Organization Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Hope Foundation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      placeholder="Our mission is to..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">About Us</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your organization, its history, and impact..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="foundedYear">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Founded Year
                      </Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        value={formData.foundedYear || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            foundedYear: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="teamSize">
                        <Users className="w-4 h-4 inline mr-2" />
                        Team Size
                      </Label>
                      <Input
                        id="teamSize"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        placeholder="10-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas of Work</CardTitle>
                  <CardDescription>Causes and sectors you focus on</CardDescription>
                </CardHeader>
                <CardContent>
                  <TagInput
                    tags={formData.areasOfWork || []}
                    onChange={(areasOfWork) => setFormData({ ...formData, areasOfWork })}
                    label="Focus Areas"
                    placeholder="Type an area and press Enter"
                    suggestions={AREAS_OF_WORK_SUGGESTIONS}
                    maxTags={10}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How people can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
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

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="website">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.org"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="NY"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.socialLinks?.facebook || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialLinks: {
                              ...formData.socialLinks,
                              facebook: e.target.value,
                            },
                          })
                        }
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialLinks: {
                              ...formData.socialLinks,
                              twitter: e.target.value,
                            },
                          })
                        }
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.socialLinks?.linkedin || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialLinks: {
                              ...formData.socialLinks,
                              linkedin: e.target.value,
                            },
                          })
                        }
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.socialLinks?.instagram || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            socialLinks: {
                              ...formData.socialLinks,
                              instagram: e.target.value,
                            },
                          })
                        }
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push(`/ngos/${slug}`)}>
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
