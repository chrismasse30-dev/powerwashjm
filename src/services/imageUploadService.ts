import { supabase } from '../lib/supabase';

export interface ImageUploadOptions {
  bucket: 'holiday-gallery' | 'measurement-designs' | 'estimate-images' | 'fleet-photos' | 'site-images';
  folder?: string;
  generateThumbnail?: boolean;
  maxSizeMB?: number;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  path?: string;
  error?: string;
  fileName?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const imageUploadService = {
  async uploadImage(
    file: File,
    options: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    try {
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image'
        };
      }

      const maxSize = (options.maxSizeMB || 10) * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size must be less than ${options.maxSizeMB || 10}MB`
        };
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      const { data, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          error: uploadError.message
        };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        publicUrl,
        path: filePath,
        fileName: file.name
      };
    } catch (error: any) {
      console.error('Image upload exception:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  },

  async uploadMultipleImages(
    files: File[],
    options: ImageUploadOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      if (onProgress) {
        onProgress(i + 1, files.length);
      }

      const result = await this.uploadImage(files[i], options);
      results.push(result);
    }

    return results;
  },

  async deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete exception:', error);
      return false;
    }
  },

  async uploadToHolidayGallery(
    file: File,
    metadata: {
      title?: string;
      description?: string;
      display_order?: number;
      is_featured?: boolean;
    } = {}
  ): Promise<{ success: boolean; photo?: any; error?: string }> {
    try {
      const uploadResult = await this.uploadImage(file, {
        bucket: 'holiday-gallery',
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      const { data: photo, error: dbError } = await supabase
        .from('holiday_gallery_photos')
        .insert({
          image_url: uploadResult.publicUrl,
          title: metadata.title || file.name,
          description: metadata.description || '',
          display_order: metadata.display_order || 0,
          is_featured: metadata.is_featured || false,
          import_source: 'local_upload'
        })
        .select()
        .single();

      if (dbError) {
        await this.deleteImage('holiday-gallery', uploadResult.path!);
        return {
          success: false,
          error: dbError.message
        };
      }

      return {
        success: true,
        photo
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload to gallery'
      };
    }
  },

  async uploadFleetPhoto(
    file: File,
    metadata: {
      vehicle_name?: string;
      description?: string;
      display_order?: number;
    } = {}
  ): Promise<{ success: boolean; photo?: any; error?: string }> {
    try {
      const uploadResult = await this.uploadImage(file, {
        bucket: 'fleet-photos',
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      const { data: photo, error: dbError } = await supabase
        .from('fleet_photos')
        .insert({
          image_url: uploadResult.publicUrl,
          vehicle_name: metadata.vehicle_name || file.name,
          description: metadata.description || '',
          display_order: metadata.display_order || 0
        })
        .select()
        .single();

      if (dbError) {
        await this.deleteImage('fleet-photos', uploadResult.path!);
        return {
          success: false,
          error: dbError.message
        };
      }

      return {
        success: true,
        photo
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload fleet photo'
      };
    }
  },

  async uploadEstimateImage(
    file: File,
    quoteSubmissionId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const uploadResult = await this.uploadImage(file, {
        bucket: 'estimate-images',
        folder: quoteSubmissionId
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      const { error: updateError } = await supabase
        .from('quote_submissions')
        .update({
          estimate_image_url: uploadResult.publicUrl
        })
        .eq('id', quoteSubmissionId);

      if (updateError) {
        await this.deleteImage('estimate-images', uploadResult.path!);
        return {
          success: false,
          error: updateError.message
        };
      }

      return {
        success: true,
        url: uploadResult.publicUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload estimate image'
      };
    }
  },

  async uploadMeasurementDesign(
    file: File,
    quoteSubmissionId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const uploadResult = await this.uploadImage(file, {
        bucket: 'measurement-designs',
        folder: quoteSubmissionId
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      const { error: updateError } = await supabase
        .from('quote_submissions')
        .update({
          measurement_design_url: uploadResult.publicUrl
        })
        .eq('id', quoteSubmissionId);

      if (updateError) {
        await this.deleteImage('measurement-designs', uploadResult.path!);
        return {
          success: false,
          error: updateError.message
        };
      }

      return {
        success: true,
        url: uploadResult.publicUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload measurement design'
      };
    }
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
};
