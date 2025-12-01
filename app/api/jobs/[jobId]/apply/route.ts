import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();
    
    // Simulate successful application
    const application = {
      id: crypto.randomUUID(),
      jobId,
      jobTitle: 'Software Engineer Volunteer', // Mock data
      organizationName: 'Tech for Good', // Mock data
      status: 'pending',
      appliedAt: new Date().toISOString(),
      ...body
    };

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
