import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, purpose } = body;

    if (!fileName || !purpose) {
      return NextResponse.json(
        { error: 'Missing fileName or purpose' },
        { status: 400 }
      );
    }

    // Generate a unique path based on purpose
    const uniqueId = crypto.randomUUID();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    let folder = 'uploads';
    if (purpose === 'resume') folder = 'resumes';
    if (purpose === 'avatar') folder = 'avatars';
    if (purpose === 'document') folder = 'documents';

    const storagePath = `${folder}/${uniqueId}-${sanitizedFileName}`;

    return NextResponse.json({ storagePath });
  } catch (error) {
    console.error('Error generating upload path:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
