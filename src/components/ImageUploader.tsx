import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { imageUploadService, ImageUploadOptions } from '../services/imageUploadService';

interface ImageUploaderProps {
  bucket: 'holiday-gallery' | 'measurement-designs' | 'estimate-images' | 'fleet-photos';
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onUploadComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  acceptedFormats?: string;
  label?: string;
  className?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ImageUploader({
  bucket,
  folder,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 10,
  onUploadComplete,
  onError,
  acceptedFormats = 'image/*',
  label = 'Upload Images',
  className = ''
}: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesToUpload = Array.from(selectedFiles).slice(0, maxFiles);
    const initialFiles: UploadedFile[] = filesToUpload.map(f => ({
      name: f.name,
      url: '',
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...initialFiles]);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileIndex = files.length + i;

      try {
        const result = await imageUploadService.uploadImage(file, {
          bucket,
          folder,
          maxSizeMB
        });

        if (result.success && result.publicUrl) {
          uploadedUrls.push(result.publicUrl);
          setFiles(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              name: file.name,
              url: result.publicUrl!,
              status: 'success'
            };
            return updated;
          });
        } else {
          setFiles(prev => {
            const updated = [...prev];
            updated[fileIndex] = {
              name: file.name,
              url: '',
              status: 'error',
              error: result.error || 'Upload failed'
            };
            return updated;
          });
          if (onError) {
            onError(result.error || 'Upload failed');
          }
        }
      } catch (error: any) {
        setFiles(prev => {
          const updated = [...prev];
          updated[fileIndex] = {
            name: file.name,
            url: '',
            status: 'error',
            error: error.message || 'Upload failed'
          };
          return updated;
        });
        if (onError) {
          onError(error.message || 'Upload failed');
        }
      }
    }

    if (uploadedUrls.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedUrls);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">{label}</p>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop {multiple ? 'images' : 'an image'} here, or click to select
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose {multiple ? 'Files' : 'File'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Max size: {maxSizeMB}MB per file
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              Uploaded Files ({files.length})
            </h3>
            {files.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.status === 'uploading' && (
                    <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-600 truncate">{file.error}</p>
                    )}
                    {file.status === 'success' && file.url && (
                      <p className="text-xs text-gray-500 truncate">{file.url}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
