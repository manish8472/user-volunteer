# File Upload System

This project implements a secure file upload system using Firebase Storage.

## Overview

The system consists of:
1. **Client-side Component**: `FileUpload` for selecting and uploading files.
2. **Custom Hook**: `useUpload` for managing upload logic, progress, and state.
3. **API Route**: `/api/files/path` for generating secure, unique storage paths.
4. **Service**: `files.api.ts` for interacting with the API and Firebase.

## Setup

### Environment Variables

Ensure the following environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Storage Rules

Configure your Firebase Storage security rules to allow uploads. For example:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /resumes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /avatars/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /documents/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

*Note: Adjust rules based on your specific security requirements (e.g., file size limits, content types).*

## Usage

### FileUpload Component

```tsx
import { FileUpload } from '@/components/forms/FileUpload';

export function MyForm() {
  const handleUploadComplete = (url: string) => {
    console.log('File uploaded:', url);
    // Save url to your form state
  };

  return (
    <FileUpload
      purpose="resume" // 'resume', 'avatar', 'document', or 'general'
      accept=".pdf,.doc,.docx"
      maxSize={5} // MB
      onUploaded={handleUploadComplete}
      label="Upload Resume"
    />
  );
}
```

### useUpload Hook

If you need a custom UI, you can use the hook directly:

```tsx
import { useUpload } from '@/hooks/useUpload';

const { 
  progress, 
  isUploading, 
  error, 
  downloadUrl, 
  startUpload, 
  cancelUpload, 
  retryUpload 
} = useUpload({
  purpose: 'avatar',
  onUploaded: (url) => console.log(url)
});
```

## Architecture

1. **Path Generation**: The client requests a storage path from `/api/files/path`. This ensures filenames are sanitized and unique.
2. **Direct Upload**: The client uploads directly to Firebase Storage using the generated path. This avoids stressing the Next.js server.
3. **Resumable**: Uploads use `uploadBytesResumable` for reliability.
4. **Download URL**: After upload, the public download URL is retrieved and returned.
