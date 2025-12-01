import { renderHook, act } from '@testing-library/react';
import { useUpload } from '@/hooks/useUpload';
import { uploadBytesResumable } from 'firebase/storage';
import { getUploadPath, getDownloadUrl } from '@/services/files.api';

// Mock dependencies
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  storage: {},
}));

jest.mock('@/services/files.api', () => ({
  getUploadPath: jest.fn(),
  getDownloadUrl: jest.fn(),
}));

describe('useUpload', () => {
  const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });
  const mockUploadTask = {
    on: jest.fn(),
    cancel: jest.fn(),
    snapshot: {
      bytesTransferred: 0,
      totalBytes: 100,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getUploadPath as jest.Mock).mockResolvedValue('uploads/hello.png');
    (getDownloadUrl as jest.Mock).mockResolvedValue('https://example.com/hello.png');
    (uploadBytesResumable as jest.Mock).mockReturnValue(mockUploadTask);
  });

  it('should handle successful upload', async () => {
    const onUploaded = jest.fn();
    const { result } = renderHook(() => useUpload({ purpose: 'test', onUploaded }));

    await act(async () => {
      await result.current.startUpload(mockFile);
    });

    expect(result.current.isUploading).toBe(true);
    expect(getUploadPath).toHaveBeenCalledWith({ fileName: 'hello.png', purpose: 'test' });

    // Simulate progress
    // The hook calls uploadTask.on('state_changed', next, error, complete)
    // So arguments are: [0]='state_changed', [1]=next, [2]=error, [3]=complete
    const onStateChanged = mockUploadTask.on.mock.calls[0][1];
    act(() => {
      onStateChanged({ bytesTransferred: 50, totalBytes: 100 });
    });
    expect(result.current.progress).toBe(50);

    // Simulate success
    const onSuccess = mockUploadTask.on.mock.calls[0][3];
    await act(async () => {
      await onSuccess();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.downloadUrl).toBe('https://example.com/hello.png');
    expect(onUploaded).toHaveBeenCalledWith('https://example.com/hello.png');
  });

  it('should handle upload error', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useUpload({ purpose: 'test', onError }));

    await act(async () => {
      await result.current.startUpload(mockFile);
    });

    // Simulate error
    const onFail = mockUploadTask.on.mock.calls[0][2];
    const error = new Error('Upload failed');
    act(() => {
      onFail(error);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });
});
