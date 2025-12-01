import { useState, useRef, useCallback } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, UploadTask, UploadTaskSnapshot } from 'firebase/storage';
import { getUploadPath, getDownloadUrl } from '@/services/files.api';

interface UseUploadOptions {
  purpose: string;
  onUploaded?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useUpload({ purpose, onUploaded, onError }: UseUploadOptions) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const uploadTaskRef = useRef<UploadTask | null>(null);

  const startUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    try {
      const storagePath = await getUploadPath({ fileName: file.name, purpose });
      const storageRef = ref(storage, storagePath);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTaskRef.current = uploadTask;

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressValue);
        },
        (error) => {
          console.error('Upload failed:', error);
          setError(error);
          setIsUploading(false);
          if (onError) onError(error);
        },
        async () => {
          try {
            const url = await getDownloadUrl(storagePath);
            setDownloadUrl(url);
            setIsUploading(false);
            if (onUploaded) onUploaded(url);
          } catch (err) {
            console.error('Failed to get download URL:', err);
            setError(err instanceof Error ? err : new Error('Failed to get download URL'));
            setIsUploading(false);
            if (onError) onError(err instanceof Error ? err : new Error('Failed to get download URL'));
          }
        }
      );
    } catch (err) {
      console.error('Failed to start upload:', err);
      setError(err instanceof Error ? err : new Error('Failed to start upload'));
      setIsUploading(false);
      if (onError) onError(err instanceof Error ? err : new Error('Failed to start upload'));
    }
  }, [purpose, onUploaded, onError]);

  const cancelUpload = useCallback(() => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      setIsUploading(false);
      setProgress(0);
    }
  }, []);

  const retryUpload = useCallback((file: File) => {
    startUpload(file);
  }, [startUpload]);

  return {
    progress,
    isUploading,
    error,
    downloadUrl,
    startUpload,
    cancelUpload,
    retryUpload
  };
}
