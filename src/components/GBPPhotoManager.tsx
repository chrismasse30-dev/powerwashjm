import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  is_featured: boolean;
  uploaded_at: string;
}

interface GBPPhotoManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function GBPPhotoManager({ onSuccess, onError }: GBPPhotoManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [category, setCategory] = useState<string>('ADDITIONAL');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('holiday_gallery_photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      onError?.('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handlePostPhoto = async () => {
    if (!selectedImage) {
      onError?.('Please select an image first');
      return;
    }

    const image = images.find(img => img.id === selectedImage);
    if (!image) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', { supabaseUrl, hasKey: !!supabaseKey });
      onError?.('Configuration error: Missing Supabase credentials');
      return;
    }

    setPosting(true);
    try {
      const apiUrl = `${supabaseUrl}/functions/v1/post-photo-to-gbp`;
      console.log('Posting to GBP:', { apiUrl, imageUrl: image.image_url, category });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          imageUrl: image.image_url,
          category,
          description: description || image.title,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GBP post error:', { status: response.status, body: errorText });
        throw new Error(`Failed to post photo: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to post photo');
      }

      onSuccess?.('Photo posted to Google Business Profile successfully!');
      setSelectedImage(null);
      setDescription('');
    } catch (error) {
      console.error('Error posting photo:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to post photo');
    } finally {
      setPosting(false);
    }
  };

  const categories = [
    { value: 'ADDITIONAL', label: 'Additional Photos' },
    { value: 'COVER', label: 'Cover Photo' },
    { value: 'PROFILE', label: 'Profile Photo' },
    { value: 'LOGO', label: 'Logo' },
    { value: 'EXTERIOR', label: 'Exterior' },
    { value: 'INTERIOR', label: 'Interior' },
    { value: 'PRODUCT', label: 'Product/Service' },
    { value: 'AT_WORK', label: 'Team at Work' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Post Photos to Google Business Profile</h3>
            <p className="text-sm text-blue-700">
              Select an image from your gallery and post it directly to your Google Business Profile.
              Photos help showcase your work and attract more customers.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gallery Images</h3>
          <p className="text-sm text-gray-600">Select an image to post to Google Business Profile</p>
        </div>

        <button
          onClick={loadImages}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {selectedImage && (
        <div className="bg-white border-2 border-blue-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Selected Image</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how this photo will be categorized on Google
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use the image title
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePostPhoto}
              disabled={posting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Post to Google Business Profile
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedImage(null);
                setDescription('');
              }}
              disabled={posting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No images found in your gallery</p>
          <p className="text-sm text-gray-500 mt-1">Upload images to the gallery first</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image.id)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg ${
                selectedImage === image.id
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedImage === image.id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="p-2 bg-white">
                <p className="text-sm font-medium text-gray-900 truncate">{image.title}</p>
                {image.is_featured && (
                  <p className="text-xs text-blue-600 font-semibold">Featured</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
