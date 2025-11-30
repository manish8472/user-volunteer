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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skills = searchParams.get('skills')?.split(',').filter(Boolean);
  const location = searchParams.get('location');
  const remote = searchParams.get('remote') === 'true';

  let filteredJobs = [...MOCK_JOBS];

  if (skills && skills.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      skills.some(skill => job.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())))
    );
  }

  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (remote) {
    filteredJobs = filteredJobs.filter(job => job.remote);
  }

  const total = filteredJobs.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedJobs = filteredJobs.slice(start, end);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({
    data: paginatedJobs,
    meta: {
      page,
      limit,
      total,
    },
  });
}
