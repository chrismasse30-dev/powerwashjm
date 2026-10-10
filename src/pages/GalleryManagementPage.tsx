// alt-text editor build marker
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Trash2, Plus, Zap, CheckSquare, Square, Filter, RefreshCw, Upload, X, Loader, CheckCircle, AlertCircle, Star, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import PhotoNameFixer from '../components/PhotoNameCleanup';
import AltTextEditor, { isPlaceholderAlt } from '../components/AltTextPanel';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

interface GalleryPhoto {
  id: string;
  image_url: string;
  title: string;
  display_order: number;
  is_featured: boolean;
  town?: string | null;
  service_type?: string | null;
}

const HOLIDAY_TOWNS = [
  { slug: 'warwick-ri', label: 'Warwick, RI' },
  { slug: 'cranston-ri', label: 'Cranston, RI' },
  { slug: 'providence-ri', label: 'Providence, RI' },
  { slug: 'pawtucket-ri', label: 'Pawtucket, RI' },
  { slug: 'woonsocket-ri', label: 'Woonsocket, RI' },
  { slug: 'north-smithfield-ri', label: 'North Smithfield, RI' },
  { slug: 'cumberland-ri', label: 'Cumberland, RI' },
  { slug: 'lincoln-ri', label: 'Lincoln, RI' },
  { slug: 'smithfield-ri', label: 'Smithfield, RI' },
  { slug: 'east-providence-ri', label: 'East Providence, RI' },
  { slug: 'johnston-ri', label: 'Johnston, RI' },
  { slug: 'north-providence-ri', label: 'North Providence, RI' },
  { slug: 'coventry-ri', label: 'Coventry, RI' },
  { slug: 'west-warwick-ri', label: 'West Warwick, RI' },
  { slug: 'bristol-ri', label: 'Bristol, RI' },
  { slug: 'barrington-ri', label: 'Barrington, RI' },
  { slug: 'east-greenwich-ri', label: 'East Greenwich, RI' },
  { slug: 'tiverton-ri', label: 'Tiverton, RI' },
  { slug: 'north-kingstown-ri', label: 'North Kingstown, RI' },
  { slug: 'scituate-ri', label: 'Scituate, RI' },
  { slug: 'glocester-ri', label: 'Glocester, RI' },
  { slug: 'west-greenwich-ri', label: 'West Greenwich, RI' },
  { slug: 'foster-ri', label: 'Foster, RI' },
  { slug: 'burrillville-ri', label: 'Burrillville, RI' },
  { slug: 'central-falls-ri', label: 'Central Falls, RI' },
];

interface UploadResult {
  fileName: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

type FilterType = 'all' | 'not-in-gallery' | 'in-gallery';

export default function GalleryManagementPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [bulkTown, setBulkTown] = useState<string>('');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/employee-login');
      return;
    }
    loadData();
  }, [user, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      let files: any[] = [];
      try {
        const { data, error: storageError } = await supabase
          .storage
          .from('holiday-gallery')
          .list('', {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (storageError) {
          console.error('Storage error:', storageError);
          console.warn('Storage list failed, will only show gallery photos');
          files = [];
        } else {
          files = data || [];
        }
      } catch (err) {
        console.error('Storage list exception:', err);
        console.warn('Storage list failed, will only show gallery photos');
        files = [];
      }

      const imageFiles = (files || []).filter(file => {
        if (file.name === '.emptyFolderPlaceholder') return false;
        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|heic|bmp|svg|tiff|tif)$/i.test(file.name);
        const hasImageMimeType = file.metadata?.mimetype?.startsWith('image/');
        return hasImageExtension || hasImageMimeType;
      });

      console.log('Total files found:', files?.length || 0);
      console.log('Image files after filtering:', imageFiles.length);
      console.log('Files:', files?.map(f => ({ name: f.name, metadata: f.metadata })));

      setStorageFiles(imageFiles);

      const { data: photos, error: dbError } = await supabase
        .from('holiday_gallery_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (dbError) throw dbError;
      setGalleryPhotos(photos || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setMessage({
        type: 'error',
        text: `Failed to load gallery data: ${error.message || 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    setLocalFiles(prev => [...prev, ...imageFiles]);
  };

  const removeLocalFile = (index: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (localFiles.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    const demoSession = localStorage.getItem('demo_session');
    const hasAuth = !!session || !!demoSession;

    console.log('Upload auth check:', {
      hasRealSession: !!session,
      hasDemoSession: !!demoSession,
      hasAuth,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      user: user?.email,
      isAdmin
    });

    if (!hasAuth && !user) {
      setMessage({
        type: 'error',
        text: 'You must be logged in to upload photos. Please refresh the page and try again.'
      });
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: localFiles.length });
    const results: UploadResult[] = [];

    for (let i = 0; i < localFiles.length; i++) {
      const file = localFiles[i];
      setUploadProgress({ current: i + 1, total: localFiles.length });

      try {
        const timestamp = Date.now();
        const sanitizedName = file.name
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/--+/g, '-');
        const fileName = `${timestamp}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('holiday-gallery')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          results.push({
            fileName: file.name,
            status: 'failed',
            error: uploadError.message
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('holiday-gallery')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('holiday_gallery_photos')
          .insert({
            image_url: publicUrl,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            display_order: 999,
            import_source: 'manual'
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
        }

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
    setLocalFiles([]);
    await loadData();
  };

  const toggleFileSelection = (fileName: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileName)) {
      newSelection.delete(fileName);
    } else {
      newSelection.add(fileName);
    }
    setSelectedFiles(newSelection);
  };

  const toggleSelectAll = () => {
    const visibleFiles = getFilteredFiles();
    const visibleFileNames = new Set(visibleFiles.map(f => f.name));
    const allVisibleSelected = visibleFiles.every(f => selectedFiles.has(f.name));

    if (allVisibleSelected) {
      const newSelection = new Set(
        Array.from(selectedFiles).filter(name => !visibleFileNames.has(name))
      );
      setSelectedFiles(newSelection);
    } else {
      const newSelection = new Set([...selectedFiles, ...visibleFileNames]);
      setSelectedFiles(newSelection);
    }
  };

  const toggleGalleryPhotoSelection = (id: string) => {
    const newSelection = new Set(selectedGalleryPhotos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedGalleryPhotos(newSelection);
  };

  const toggleSelectAllGalleryPhotos = () => {
    if (selectedGalleryPhotos.size === galleryPhotos.length) {
      setSelectedGalleryPhotos(new Set());
    } else {
      setSelectedGalleryPhotos(new Set(galleryPhotos.map(p => p.id)));
    }
  };

  const isFileInGallery = (fileName: string): boolean => {
    const url = supabase.storage.from('holiday-gallery').getPublicUrl(fileName).data.publicUrl;
    return galleryPhotos.some(photo => photo.image_url === url);
  };

  const getFilteredFiles = (): StorageFile[] => {
    if (filter === 'all') return storageFiles;
    if (filter === 'not-in-gallery') {
      return storageFiles.filter(file => !isFileInGallery(file.name));
    }
    if (filter === 'in-gallery') {
      return storageFiles.filter(file => isFileInGallery(file.name));
    }
    return storageFiles;
  };

  const importSelectedToGallery = async () => {
    if (selectedFiles.size === 0) return;

    try {
      setImporting(true);
      setMessage(null);

      const existingUrls = new Set(galleryPhotos.map(p => p.image_url));
      let imported = 0;
      let skipped = 0;

      for (const fileName of Array.from(selectedFiles)) {
        const { data: urlData } = supabase.storage
          .from('holiday-gallery')
          .getPublicUrl(fileName);

        if (existingUrls.has(urlData.publicUrl)) {
          skipped++;
          continue;
        }

        const { error } = await supabase
          .from('holiday_gallery_photos')
          .insert({
            image_url: urlData.publicUrl,
            title: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/^\d+-/, ''),
            display_order: 999,
            import_source: 'manual'
          });

        if (!error) {
          imported++;
        }
      }

      setMessage({
        type: 'success',
        text: `Successfully imported ${imported} photos. ${skipped > 0 ? `Skipped ${skipped} duplicates.` : ''}`
      });

      setSelectedFiles(new Set());
      await loadData();
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ type: 'error', text: 'Failed to import photos' });
    } finally {
      setImporting(false);
    }
  };

  const deletePhoto = async (id: string, deleteFromStorage = false) => {
    const photo = galleryPhotos.find(p => p.id === id);
    if (!photo) return;

    const confirmMsg = deleteFromStorage
      ? 'Are you sure you want to remove this photo from the gallery AND permanently delete it from storage? This cannot be undone.'
      : 'Are you sure you want to remove this photo from the gallery? (The file will remain in storage)';

    if (!confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('holiday_gallery_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (deleteFromStorage) {
        const fileName = photo.image_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('holiday-gallery')
            .remove([fileName]);

          if (storageError) {
            console.error('Storage delete error:', storageError);
            setMessage({ type: 'success', text: 'Photo removed from gallery, but failed to delete from storage' });
            await loadData();
            return;
          }
        }
        setMessage({ type: 'success', text: 'Photo removed from gallery and deleted from storage' });
      } else {
        setMessage({ type: 'success', text: 'Photo removed from gallery' });
      }

      await loadData();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: 'Failed to delete photo' });
    }
  };

  const deleteSelectedGalleryPhotos = async (deleteFromStorage = false) => {
    if (selectedGalleryPhotos.size === 0) return;

    const confirmMsg = deleteFromStorage
      ? `Are you sure you want to remove ${selectedGalleryPhotos.size} photos from the gallery AND permanently delete them from storage? This cannot be undone.`
      : `Are you sure you want to remove ${selectedGalleryPhotos.size} photos from the gallery? (Files will remain in storage)`;

    if (!confirm(confirmMsg)) return;

    try {
      const selectedPhotos = galleryPhotos.filter(p => selectedGalleryPhotos.has(p.id));

      const { error } = await supabase
        .from('holiday_gallery_photos')
        .delete()
        .in('id', Array.from(selectedGalleryPhotos));

      if (error) throw error;

      if (deleteFromStorage) {
        const fileNames = selectedPhotos
          .map(p => p.image_url.split('/').pop())
          .filter((name): name is string => !!name);

        if (fileNames.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('holiday-gallery')
            .remove(fileNames);

          if (storageError) {
            console.error('Storage delete error:', storageError);
            setMessage({ type: 'success', text: `Removed ${selectedGalleryPhotos.size} photos from gallery, but some failed to delete from storage` });
            setSelectedGalleryPhotos(new Set());
            await loadData();
            return;
          }
        }
        setMessage({ type: 'success', text: `Successfully removed ${selectedGalleryPhotos.size} photos from gallery and deleted from storage` });
      } else {
        setMessage({ type: 'success', text: `Successfully removed ${selectedGalleryPhotos.size} photos from gallery` });
      }

      setSelectedGalleryPhotos(new Set());
      await loadData();
    } catch (error) {
      console.error('Batch delete failed:', error);
      setMessage({ type: 'error', text: 'Failed to delete photos' });
    }
  };

  const deleteStorageFileInternal = async (fileName: string) => {
    const { data: { publicUrl } } = supabase.storage.from('holiday-gallery').getPublicUrl(fileName);
    const photoToDelete = galleryPhotos.find(p => p.image_url === publicUrl);

    if (photoToDelete) {
      const { error: dbError } = await supabase
        .from('holiday_gallery_photos')
        .delete()
        .eq('id', photoToDelete.id);

      if (dbError) throw dbError;
    }

    const { error: storageError } = await supabase.storage
      .from('holiday-gallery')
      .remove([fileName]);

    if (storageError) throw storageError;
  };

  const deleteStorageFile = async (fileName: string) => {
    if (!confirm('Are you sure you want to permanently delete this file from storage? This action cannot be undone.')) return;

    try {
      await deleteStorageFileInternal(fileName);
      setMessage({ type: 'success', text: 'File deleted from storage and database' });
      await loadData();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: 'Failed to delete file' });
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('holiday_gallery_photos')
        .update({ is_featured: !currentState })
        .eq('id', id);

      if (error) {
        if (error.message.includes('more than 20')) {
          setMessage({
            type: 'error',
            text: 'Cannot feature more than 20 photos. Please unfeature another photo first.'
          });
        } else {
          throw error;
        }
        return;
      }

      setMessage({
        type: 'success',
        text: !currentState ? 'Photo featured on homepage' : 'Photo removed from featured'
      });
      await loadData();
    } catch (error) {
      console.error('Toggle featured failed:', error);
      setMessage({ type: 'error', text: 'Failed to update featured status' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <div className="text-gray-600">Loading gallery data...</div>
        </div>
      </div>
    );
  }

  const filteredFiles = getFilteredFiles();
  const filesNotInGallery = storageFiles.filter(file => !isFileInGallery(file.name));
  const filesInGallery = storageFiles.filter(file => isFileInGallery(file.name));
  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const failedCount = uploadResults.filter(r => r.status === 'failed').length;
  const skippedCount = uploadResults.filter(r => r.status === 'skipped').length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
          <p className="text-gray-600">Upload, manage, and organize holiday lights gallery photos</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {showResults && uploadResults.length > 0 && (
          <div className="mb-6 space-y-4">
            {successCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Successfully uploaded {successCount} {successCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
              </div>
            )}

            {skippedCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Photos</h2>

          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
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

          {localFiles.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Photos ({localFiles.length})
                </h3>
                <button
                  onClick={() => setLocalFiles([])}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-80 overflow-y-auto p-2">
                {localFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeLocalFile(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
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
                    Uploading and adding to gallery... ({uploadProgress.current} of {uploadProgress.total})
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

          <button
            onClick={handleUpload}
            disabled={localFiles.length === 0 || uploading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : `Upload & Add to Gallery ${localFiles.length > 0 ? `(${localFiles.length})` : ''}`}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Storage Bucket Files ({storageFiles.length})
              </h2>
              <p className="text-sm text-gray-600">
                Files in holiday-gallery storage bucket •
                <span className="text-green-700 font-medium"> {filesInGallery.length} in gallery</span> •
                <span className="text-orange-700 font-medium"> {filesNotInGallery.length} not in gallery</span>
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({storageFiles.length})
            </button>
            <button
              onClick={() => setFilter('not-in-gallery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'not-in-gallery'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not in Gallery ({filesNotInGallery.length})
            </button>
            <button
              onClick={() => setFilter('in-gallery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in-gallery'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Gallery ({filesInGallery.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {failedImages.size > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`Are you sure you want to permanently delete ${failedImages.size} files with no preview from storage? This action cannot be undone.`)) return;

                  setImporting(true);
                  try {
                    for (const fileName of Array.from(failedImages)) {
                      await deleteStorageFileInternal(fileName);
                    }
                    setMessage({
                      type: 'success',
                      text: `Successfully removed ${failedImages.size} broken images from storage and database`
                    });
                    setFailedImages(new Set());
                    await loadData();
                  } catch (error) {
                    console.error('Cleanup failed:', error);
                    setMessage({ type: 'error', text: 'Failed to clean up some broken images' });
                  } finally {
                    setImporting(false);
                  }
                }}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                Delete Broken Images ({failedImages.size})
              </button>
            )}
            {filteredFiles.length > 0 && (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={importing}
                >
                  {filteredFiles.every(f => selectedFiles.has(f.name)) ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  {filteredFiles.every(f => selectedFiles.has(f.name)) ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={importSelectedToGallery}
                  disabled={selectedFiles.size === 0 || importing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  {importing ? 'Importing...' : `Import ${selectedFiles.size > 0 ? `(${selectedFiles.size})` : 'Selected'}`}
                </button>
                {selectedFiles.size > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to permanently delete ${selectedFiles.size} files from storage? This will also remove them from the database.`)) return;
                      setImporting(true);
                      try {
                        for (const fileName of Array.from(selectedFiles)) {
                          await deleteStorageFileInternal(fileName);
                        }
                        setMessage({ type: 'success', text: `Successfully deleted ${selectedFiles.size} files from storage and database` });
                        setSelectedFiles(new Set());
                        await loadData();
                      } catch (error) {
                        console.error('Batch delete failed:', error);
                        setMessage({ type: 'error', text: 'Failed to delete some files' });
                      } finally {
                        setImporting(false);
                      }
                    }}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete from Storage ({selectedFiles.size})
                  </button>
                )}
              </>
            )}
          </div>

          {storageFiles.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No image files found in storage bucket</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload photos using the section above. Files must have image extensions (.jpg, .png, etc.)
              </p>
              <button
                onClick={loadData}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Refresh to check again
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No files match this filter</p>
              <p className="text-sm text-gray-500 mt-2">
                Try changing the filter to see more files
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredFiles.filter(file => !failedImages.has(file.name)).map((file) => {
                const { data: { publicUrl } } = supabase.storage.from('holiday-gallery').getPublicUrl(file.name);
                const url = publicUrl;
                const isSelected = selectedFiles.has(file.name);
                const isInGallery = isFileInGallery(file.name);

                return (
                  <div
                    key={file.name}
                    className="relative rounded-lg overflow-hidden group"
                  >
                    <div className={`border-4 rounded-lg overflow-hidden cursor-pointer ${
                      isInGallery ? 'border-green-500' : 'border-gray-200'
                    } ${
                      isSelected
                        ? 'ring-4 ring-blue-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-blue-300'
                    }`}
                    onClick={() => toggleFileSelection(file.name)}>
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                          onError={() => {
                          setFailedImages(prev => new Set(prev).add(file.name));
                        }}
                      />
                    </div>

                      <div
                        className="absolute top-2 left-2 z-20 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.name);
                        }}
                      >
                        {isSelected ? (
                          <div className="bg-blue-600 text-white rounded-lg p-2 shadow-lg hover:bg-blue-700 transition-colors">
                            <CheckSquare className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="bg-white bg-opacity-95 text-gray-700 rounded-lg p-2 border-2 border-gray-300 shadow-md hover:bg-gray-50 hover:border-gray-400 transition-colors">
                            <Square className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        {isInGallery && (
                          <div className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            In Gallery
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStorageFile(file.name);
                          }}
                          className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Delete from storage (and gallery if present)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-700 truncate font-medium" title={file.name}>
                        {file.name}
                      </p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <PhotoNameFixer onApplied={loadData} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Gallery Photos ({galleryPhotos.length})
            </h2>
            <p className="text-sm text-gray-600">
              Photos currently displayed on the public gallery page •
              <span className="text-yellow-700 font-medium"> {galleryPhotos.filter(p => p.is_featured).length}/20 featured on homepage</span>
            </p>
            {(() => {
              const described = galleryPhotos.filter((p) => !isPlaceholderAlt(p.title)).length;
              return (
                <p className="text-sm text-gray-600 mt-1">
                  Alt text: <span className="font-medium text-green-700">{described}</span> descriptive •{' '}
                  <span className="font-medium text-amber-700">{galleryPhotos.length - described}</span> still generic. Click any caption below to write a real description.
                </p>
              );
            })()}
          </div>

          {galleryPhotos.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={toggleSelectAllGalleryPhotos}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {selectedGalleryPhotos.size === galleryPhotos.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {selectedGalleryPhotos.size === galleryPhotos.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedGalleryPhotos.size > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <select
                      value={bulkTown}
                      onChange={(e) => setBulkTown(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Select town...</option>
                      <option value="__clear__">-- Clear town --</option>
                      {HOLIDAY_TOWNS.map(t => (
                        <option key={t.slug} value={t.slug}>{t.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (!bulkTown) return;
                        const townValue = bulkTown === '__clear__' ? null : bulkTown;
                        try {
                          const { error } = await supabase
                            .from('holiday_gallery_photos')
                            .update({ town: townValue })
                            .in('id', Array.from(selectedGalleryPhotos));
                          if (error) throw error;
                          setMessage({ type: 'success', text: `Tagged ${selectedGalleryPhotos.size} photos with ${townValue || 'no town'}` });
                          setBulkTown('');
                          setSelectedGalleryPhotos(new Set());
                          await loadData();
                        } catch (err: any) {
                          setMessage({ type: 'error', text: err.message });
                        }
                      }}
                      disabled={!bulkTown}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <MapPin className="w-5 h-5" />
                      Tag Town ({selectedGalleryPhotos.size})
                    </button>
                  </div>
                  <button
                    onClick={() => deleteSelectedGalleryPhotos(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Remove from Gallery ({selectedGalleryPhotos.size})
                  </button>
                  <button
                    onClick={() => deleteSelectedGalleryPhotos(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete from Storage ({selectedGalleryPhotos.size})
                  </button>
                </>
              )}
              {failedImages.size > 0 && (
                <button
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to remove ${failedImages.size} images with preview unavailable? This will clean up all broken images.`)) return;

                    try {
                      const { error } = await supabase
                        .from('holiday_gallery_photos')
                        .delete()
                        .in('id', Array.from(failedImages));

                      if (error) throw error;

                      setMessage({
                        type: 'success',
                        text: `Successfully removed ${failedImages.size} broken images from gallery`
                      });
                      setFailedImages(new Set());
                      await loadData();
                    } catch (error) {
                      console.error('Cleanup failed:', error);
                      setMessage({ type: 'error', text: 'Failed to clean up broken images' });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Clean Up Broken Images ({failedImages.size})
                </button>
              )}
            </div>
          )}

          {galleryPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No photos in gallery</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload photos above or select from storage bucket to import
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {galleryPhotos.filter(photo => !failedImages.has(photo.id)).map((photo) => {
                const isSelected = selectedGalleryPhotos.has(photo.id);
                return (
                <div
                  key={photo.id}
                  className={`border-2 rounded-lg overflow-hidden relative group cursor-pointer ${
                    isSelected ? 'border-blue-500 ring-4 ring-blue-500 ring-offset-2' : 'border-green-500'
                  }`}
                  onClick={() => toggleGalleryPhotoSelection(photo.id)}
                >
                  <div className="relative">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(photo.id));
                      }}
                    />
                  </div>
                  <div className="absolute top-2 left-2" onClick={(e) => {
                    e.stopPropagation();
                    toggleGalleryPhotoSelection(photo.id);
                  }}>
                    {isSelected ? (
                      <div className="bg-blue-600 text-white rounded-lg p-2 shadow-lg">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="bg-white bg-opacity-95 text-gray-700 rounded-lg p-2 border-2 border-gray-300 shadow-md">
                        <Square className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFeatured(photo.id, photo.is_featured);
                      }}
                      className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ${
                        photo.is_featured
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                      title={photo.is_featured ? 'Remove from featured' : 'Feature on homepage'}
                    >
                      <Star className={`w-4 h-4 ${photo.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(photo.id, false);
                      }}
                      className="bg-orange-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-700 shadow-lg"
                      title="Remove from gallery (keep in storage)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.shiftKey || confirm('Delete from storage too?')) {
                          deletePhoto(photo.id, true);
                        } else {
                          deletePhoto(photo.id, false);
                        }
                      }}
                      className="bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                      title="Delete from storage (hold Shift to skip confirmation)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 items-end justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {photo.is_featured && (
                        <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}
                      {photo.town && (
                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {HOLIDAY_TOWNS.find(t => t.slug === photo.town)?.label || photo.town}
                        </div>
                      )}
                    </div>
                    <select
                      value={photo.town || ''}
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        e.stopPropagation();
                        const val = e.target.value || null;
                        const { error } = await supabase
                          .from('holiday_gallery_photos')
                          .update({ town: val })
                          .eq('id', photo.id);
                        if (error) {
                          setMessage({ type: 'error', text: error.message });
                        } else {
                          await loadData();
                        }
                      }}
                      className="text-xs bg-white/90 backdrop-blur border border-gray-300 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer max-w-[120px]"
                      title="Assign to a town page"
                    >
                      <option value="">No town</option>
                      {HOLIDAY_TOWNS.map(t => (
                        <option key={t.slug} value={t.slug}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  </div>
                  <div className="p-2">
                    <AltTextEditor
                      photoId={photo.id}
                      value={photo.title || ''}
                      onSaved={(id, next) =>
                        setGalleryPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, title: next } : p)))
                      }
                    />
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
      <ReturnToDashboardButton />
    </div>
  );
}
