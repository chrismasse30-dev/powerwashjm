import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';
import { imageUploadService } from '../services/imageUploadService';

interface BlogImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export default function BlogImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved
}: BlogImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess(false);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const result = await imageUploadService.uploadImage(file, {
        bucket: 'site-images',
        folder: 'blog-featured',
        maxSizeMB: 5
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.publicUrl) {
        setSuccess(true);
        onImageUploaded(result.publicUrl);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Upload failed');
        setPreviewUrl(currentImageUrl || '');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Upload failed');
      setPreviewUrl(currentImageUrl || '');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setError('');
    setSuccess(false);
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!previewUrl ? (
        <div
          onClick={handleUploadClick}
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Click to upload featured image
              </p>
              <p className="text-sm text-gray-500">
                JPEG, PNG, GIF, or WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 group">
            <img
              src={previewUrl}
              alt="Featured image preview"
              className="w-full h-64 object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <div className="w-32 h-32 mb-4">
                  <svg className="animate-spin h-full w-full text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-white font-medium">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {!uploading && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleUploadClick}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  title="Change image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {success && (
            <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <Check className="w-5 h-5" />
              <span className="font-medium">Image uploaded successfully!</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-1">Image requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Accepted formats: JPEG, PNG, GIF, WebP</li>
          <li>Maximum file size: 5MB</li>
          <li>Recommended dimensions: 1200x630px (16:9 ratio)</li>
        </ul>
      </div>
    </div>
  );
}
