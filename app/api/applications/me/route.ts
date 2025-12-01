import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock applications data
    const applications = [
      {
        id: '1',
        jobId: 'job-1',
        jobTitle: 'Community Outreach Volunteer',
        organizationName: 'Local Helpers',
        status: 'pending',
        appliedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        resumeUrl: 'https://example.com/resume.pdf'
      },
      {
        id: '2',
        jobId: 'job-2',
        jobTitle: 'Web Developer',
        organizationName: 'Code for Cause',
        status: 'reviewing',
        appliedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        resumeUrl: 'https://example.com/resume.pdf'
      },
      {
        id: '3',
        jobId: 'job-3',
        jobTitle: 'Event Coordinator',
        organizationName: 'Green Earth',
        status: 'accepted',
        appliedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        resumeUrl: 'https://example.com/resume.pdf'
      }
    ];

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
