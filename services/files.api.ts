import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface GetUploadPathParams {
  fileName: string;
  purpose: string;
}

export const getUploadPath = async ({ fileName, purpose }: GetUploadPathParams): Promise<string> => {
  const response = await fetch('/api/files/path', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName, purpose }),
  });

  if (!response.ok) {
    throw new Error('Failed to get upload path');
  }

  const data = await response.json();
  return data.storagePath;
};

export const getDownloadUrl = async (storagePath: string): Promise<string> => {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
};
