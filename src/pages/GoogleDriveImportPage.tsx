import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Loader, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

interface UploadResult {
  fileName: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export default function LocalImageUploadPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/employee-login');
    }
  }, [user, isAdmin, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });
    const results: UploadResult[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress({ current: i + 1, total: selectedFiles.length });

      try {
        // Check if file already exists in gallery
        const { data: existingPhotos } = await supabase
          .from('holiday_gallery_photos')
          .select('id')
          .ilike('image_url', `%${file.name}%`);

        if (existingPhotos && existingPhotos.length > 0) {
          results.push({
            fileName: file.name,
            status: 'skipped',
            error: 'Already exists in gallery'
          });
          continue;
        }

        // Upload to Supabase storage
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('holiday-gallery')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          results.push({
            fileName: file.name,
            status: 'failed',
            error: uploadError.message
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('holiday-gallery')
          .getPublicUrl(fileName);

        // Add to gallery database
        const { error: dbError } = await supabase
          .from('holiday_gallery_photos')
          .insert({
            image_url: publicUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            display_order: 999,
            import_source: 'google_drive',
            imported_by: user?.email
          });

        if (dbError) {
          results.push({
            fileName: file.name,
            status: 'failed',
            error: dbError.message
          });
        } else {
          results.push({
            fileName: file.name,
            status: 'success'
          });
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        results.push({
          fileName: file.name,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    setUploadResults(results);
    setShowResults(true);
    setUploading(false);
    setSelectedFiles([]);
  };

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const failedCount = uploadResults.filter(r => r.status === 'failed').length;
  const skippedCount = uploadResults.filter(r => r.status === 'skipped').length;

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Gallery Photos</h1>
          <p className="text-gray-600">
            Upload images from your local device to the holiday lights gallery
          </p>
        </div>

        {showResults && uploadResults.length > 0 && (
          <div className="mb-6 space-y-4">
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Successfully uploaded {successCount} {successCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
              </div>
            )}

            {skippedCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">
                    Skipped {skippedCount} duplicate {skippedCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
              </div>
            )}

            {failedCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">
                    Failed to upload {failedCount} {failedCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {uploadResults.filter(r => r.status === 'failed').map((result, idx) => (
                    <p key={idx} className="text-sm text-red-800">
                      • {result.fileName}: {result.error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowResults(false);
                setUploadResults([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Close Results
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Click to select photos
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG, HEIC up to 10MB each
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Photos ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-700 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">
                    Uploading photos... ({uploadProgress.current} of {uploadProgress.total})
                  </p>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Photo' : 'Photos'}`}
            </button>

            <button
              onClick={() => navigate('/gallery-management')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Go to Gallery
            </button>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Select multiple photos at once using Ctrl/Cmd + Click</li>
            <li>Duplicate photos (same filename) will be automatically skipped</li>
            <li>Uploaded photos will appear in the gallery management page</li>
            <li>You can reorder photos after uploading in gallery management</li>
          </ul>
        </div>
      </div>
      <ReturnToDashboardButton />
    </div>
  );
}
