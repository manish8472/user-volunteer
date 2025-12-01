import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useUpload } from '@/hooks/useUpload';
import { Upload, X, FileText, RefreshCw, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  purpose: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploaded?: (url: string) => void;
  label?: string;
}

export function FileUpload({ purpose, accept, maxSize = 10, onUploaded, label }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { progress, isUploading, error, downloadUrl, startUpload, cancelUpload, retryUpload } = useUpload({
    purpose,
    onUploaded,
  });

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds ${maxSize}MB limit.`);
      return;
    }

    setSelectedFile(file);
    startUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds ${maxSize}MB limit.`);
      return;
    }

    setSelectedFile(file);
    startUpload(file);
  };

  const handleRetry = () => {
    if (selectedFile) {
      retryUpload(selectedFile);
    }
  };

  const handleCancel = () => {
    cancelUpload();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      
      {!selectedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer text-center"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
          />
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept ? `Accepted formats: ${accept}` : 'All files accepted'} (Max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {isImage && previewUrl ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <FileText className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!downloadUrl && (
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                {Math.round(progress)}% Uploading...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between mt-2 text-red-600 bg-red-50 p-2 rounded text-sm">
              <span>Upload failed</span>
              <button 
                onClick={handleRetry}
                className="flex items-center gap-1 text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}

          {downloadUrl && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded text-sm mt-2">
              <CheckCircle className="w-4 h-4" />
              <span>Upload complete</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
