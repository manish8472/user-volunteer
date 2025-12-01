'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  createJob,
  type CreateJobPayload,
  type CustomQuestion,
  type JobRequirements,
} from '@/services/ngo.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'details' | 'requirements' | 'questions' | 'review';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  deadline: string;
  requirements: JobRequirements;
  customQuestions: CustomQuestion[];
}

const STEPS: { id: Step; title: string; description: string }[] = [
  { id: 'details', title: 'Job Details', description: 'Basic information about the position' },
  {
    id: 'requirements',
    title: 'Requirements',
    description: 'Skills and qualifications needed',
  },
  {
    id: 'questions',
    title: 'Custom Questions',
    description: 'Optional questions for applicants',
  },
  { id: 'review', title: 'Review', description: 'Review and publish' },
];

export default function JobForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    remote: false,
    type: 'volunteer',
    deadline: '',
    requirements: {
      skills: [],
      experience: '',
      education: '',
      availability: '',
    },
    customQuestions: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [newQuestion, setNewQuestion] = useState<Partial<CustomQuestion>>({
    question: '',
    type: 'text',
    required: false,
    options: [],
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'details':
        if (!formData.title.trim()) {
          toast.error('Please enter a job title');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Please enter a job description');
          return false;
        }
        if (!formData.remote && !formData.location.trim()) {
          toast.error('Please enter a location or select remote');
          return false;
        }
        return true;
      case 'requirements':
        if (formData.requirements.skills.length === 0) {
          toast.error('Please add at least one skill');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          skills: [...formData.requirements.skills, skillInput.trim()],
        },
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        skills: formData.requirements.skills.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question?.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const question: CustomQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestion.question,
      type: newQuestion.type || 'text',
      required: newQuestion.required || false,
      options: newQuestion.options || [],
      order: formData.customQuestions.length,
    };

    setFormData({
      ...formData,
      customQuestions: [...formData.customQuestions, question],
    });

    setNewQuestion({
      question: '',
      type: 'text',
      required: false,
      options: [],
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setFormData({
      ...formData,
      customQuestions: formData.customQuestions
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx })),
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...formData.customQuestions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    setFormData({
      ...formData,
      customQuestions: newQuestions.map((q, idx) => ({ ...q, order: idx })),
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateJobPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        remote: formData.remote,
        type: formData.type,
        requirements: formData.requirements,
        customQuestions: formData.customQuestions.length > 0 ? formData.customQuestions : undefined,
        deadline: formData.deadline || undefined,
      };

      const job = await createJob(user.id, payload);
      toast.success('Job created successfully!');
      router.push(`/dashboard/ngo/jobs/${job.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStepIndex
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === currentStepIndex
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}
              >
                {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium">{step.title}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStepIndex].title}</CardTitle>
          <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Details Step */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Community Health Volunteer"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and impact..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    id="remote"
                    type="checkbox"
                    checked={formData.remote}
                    onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="remote">Remote position</Label>
                </div>
              </div>

              {!formData.remote && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              )}
            </div>
          )}

          {/* Requirements Step */}
          {currentStep === 'requirements' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="skills">Required Skills *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Enter a skill and press Enter"
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(idx)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.requirements.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, experience: e.target.value },
                    })
                  }
                  placeholder="Describe required experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={formData.requirements.education}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, education: e.target.value },
                    })
                  }
                  placeholder="e.g., High School Diploma, Bachelor's Degree"
                />
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.requirements.availability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, availability: e.target.value },
                    })
                  }
                  placeholder="e.g., Weekends, 10 hours/week"
                />
              </div>
            </div>
          )}

          {/* Custom Questions Step */}
          {currentStep === 'questions' && (
            <div className="space-y-6">
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium">Add Custom Question</h3>
                <div>
                  <Label htmlFor="newQuestion">Question</Label>
                  <Input
                    id="newQuestion"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="What motivates you to volunteer?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="questionType">Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value: any) => setNewQuestion({ ...newQuestion, type: value })}
                    >
                      <SelectTrigger id="questionType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Text</SelectItem>
                        <SelectItem value="textarea">Long Text</SelectItem>
                        <SelectItem value="select">Single Choice</SelectItem>
                        <SelectItem value="multiselect">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      id="required"
                      type="checkbox"
                      checked={newQuestion.required}
                      onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="required">Required</Label>
                  </div>
                </div>

                <Button type="button" onClick={handleAddQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {formData.customQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Questions</h3>
                  {formData.customQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-3 p-3 bg-card border rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{q.type}</Badge>
                          {q.required && <Badge variant="secondary">Required</Badge>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Job Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Title</dt>
                    <dd className="font-medium">{formData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Description</dt>
                    <dd className="text-sm">{formData.description}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Type</dt>
                      <dd>
                        <Badge>{formData.type}</Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Location</dt>
                      <dd>{formData.remote ? 'Remote' : formData.location}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Skills</dt>
                    <dd className="flex flex-wrap gap-2 mt-1">
                      {formData.requirements.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  {formData.requirements.experience && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Experience</dt>
                      <dd className="text-sm">{formData.requirements.experience}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {formData.customQuestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Custom Questions</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {formData.customQuestions.map((q) => (
                      <li key={q.id} className="text-sm">
                        {q.question} {q.required && <Badge variant="secondary">Required</Badge>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStepIndex < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Job'}
          </Button>
        )}
      </div>
    </div>
  );
}
