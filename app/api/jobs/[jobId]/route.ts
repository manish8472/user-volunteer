import { NextResponse } from 'next/server';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    description: 'We are looking for a Senior Frontend Engineer to join our team...',
    organization: {
      id: 'org1',
      name: 'Tech for Good',
      logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechForGood',
    },
    location: 'San Francisco, CA',
    remote: true,
    skills: ['React', 'TypeScript', 'Next.js'],
    type: 'full-time',
    createdAt: new Date().toISOString(),
    salary: '$120k - $150k',
  },
  {
    id: '2',
    title: 'Volunteer Coordinator',
    description: 'Help us coordinate volunteers for our upcoming events...',
    organization: {
      id: 'org2',
      name: 'Community Helpers',
      logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CommunityHelpers',
    },
    location: 'New York, NY',
    remote: false,
    skills: ['Communication', 'Organization', 'Leadership'],
    type: 'volunteer',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Backend Developer (Go)',
    description: 'Join our backend team building scalable services in Go...',
    organization: {
      id: 'org1',
      name: 'Tech for Good',
      logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechForGood',
    },
    location: 'Remote',
    remote: true,
    skills: ['Go', 'PostgreSQL', 'Docker'],
    type: 'contract',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    salary: '$80/hr',
  },
  {
    id: '4',
    title: 'Social Media Manager',
    description: 'Manage our social media presence and engage with our community...',
    organization: {
      id: 'org3',
      name: 'Green Earth',
      logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GreenEarth',
    },
    location: 'London, UK',
    remote: true,
    skills: ['Social Media', 'Marketing', 'Content Creation'],
    type: 'part-time',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    salary: '£25k - £30k',
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  const job = MOCK_JOBS.find(j => j.id === jobId);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: job });
}
