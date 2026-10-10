import { supabase } from '../lib/supabase';

export interface ImageDimensions {
  width: number;
  height: number;
  quality?: number;
}

export const GALLERY_DIMENSIONS = {
  mobile: { width: 600, height: 140 },
  tablet: { width: 900, height: 175 },
  desktop: { width: 1200, height: 210 },
} as const;

/**
 * Generate optimized image URL using Supabase's built-in transformation
 * Falls back to original URL if transformation is not available
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  dimensions: ImageDimensions = GALLERY_DIMENSIONS.desktop
): string {
  try {
    // Extract the file path from the URL
    const url = new URL(originalUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/holiday-gallery\/(.+)/);

    if (!pathMatch) {
      return originalUrl;
    }

    const filePath = pathMatch[1];
    const { width, height, quality = 85 } = dimensions;

    // Use Supabase's render API for image transformation
    const { data } = supabase.storage
      .from('holiday-gallery')
      .getPublicUrl(filePath, {
        transform: {
          width,
          height,
          resize: 'cover',
          quality,
        },
      });

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to generate optimized URL:', error);
    return originalUrl;
  }
}

/**
 * Get responsive srcset for image
 */
export function getResponsiveSrcSet(originalUrl: string): string {
  const mobile = getOptimizedImageUrl(originalUrl, GALLERY_DIMENSIONS.mobile);
  const tablet = getOptimizedImageUrl(originalUrl, GALLERY_DIMENSIONS.tablet);
  const desktop = getOptimizedImageUrl(originalUrl, GALLERY_DIMENSIONS.desktop);

  return `${mobile} 600w, ${tablet} 900w, ${desktop} 1200w`;
}

/**
 * Resize and upload image to storage
 */
export async function resizeAndUploadImage(
  file: File,
  dimensions: ImageDimensions
): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`Resizing image: ${file.name}, size: ${file.size} bytes`);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          throw new Error('Failed to read file as data URL');
        }

        console.log(`File read successfully, creating image...`);
        const img = new Image();

        img.onload = async () => {
          try {
            console.log(`Image loaded: ${img.width}x${img.height}px`);

            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }

            canvas.width = dimensions.width;
            canvas.height = dimensions.height;

            // Calculate scaling to cover the entire canvas
            const scale = Math.max(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            console.log(`Resizing to ${canvas.width}x${canvas.height}, scale: ${scale.toFixed(2)}`);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Convert to blob
            canvas.toBlob(
              async (blob) => {
                try {
                  if (!blob) {
                    throw new Error('Failed to create blob from canvas');
                  }

                  console.log(`Canvas converted to blob: ${blob.size} bytes`);

                  // Upload to Supabase
                  const fileExt = 'jpg';
                  const fileName = `optimized-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                  console.log(`Uploading to Supabase: ${fileName}`);
                  const { data, error } = await supabase.storage
                    .from('holiday-gallery')
                    .upload(fileName, blob, {
                      contentType: 'image/jpeg',
                      upsert: false,
                    });

                  if (error) {
                    console.error('Supabase upload error:', error);
                    reject(error);
                    return;
                  }

                  console.log(`Upload successful:`, data);

                  const { data: urlData } = supabase.storage
                    .from('holiday-gallery')
                    .getPublicUrl(fileName);

                  console.log(`Generated public URL: ${urlData.publicUrl}`);
                  resolve(urlData.publicUrl);
                } catch (error) {
                  console.error('Error in blob upload:', error);
                  reject(error);
                }
              },
              'image/jpeg',
              (dimensions.quality || 85) / 100
            );
          } catch (error) {
            console.error('Error in image processing:', error);
            reject(error);
          }
        };

        img.onerror = (error) => {
          console.error('Failed to load image:', error);
          reject(new Error('Failed to load image'));
        };

        img.src = dataUrl;
      } catch (error) {
        console.error('Error in reader.onload:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('Failed to read file:', error);
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Batch process existing images in storage
 */
export async function batchOptimizeImages(
  imageUrls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: string[]; failed: string[] }> {
  const results = { success: [] as string[], failed: [] as string[] };

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const originalUrl = imageUrls[i];
      console.log(`Processing image ${i + 1}/${imageUrls.length}:`, originalUrl);

      // Fetch original image with mode no-cors to avoid CORS issues
      const response = await fetch(originalUrl, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log(`Fetched blob size: ${blob.size} bytes, type: ${blob.type}`);

      if (blob.size === 0) {
        throw new Error('Fetched blob is empty');
      }

      // Ensure it's an image blob
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid blob type: ${blob.type}`);
      }

      const file = new File([blob], `image-${i}.jpg`, { type: blob.type });

      // Resize and re-upload
      const optimizedUrl = await resizeAndUploadImage(
        file,
        GALLERY_DIMENSIONS.desktop
      );

      console.log(`Successfully optimized to: ${optimizedUrl}`);
      results.success.push(optimizedUrl);
      onProgress?.(i + 1, imageUrls.length);
    } catch (error) {
      console.error(`Failed to optimize image ${i + 1}:`, imageUrls[i], error);
      results.failed.push(imageUrls[i]);
      onProgress?.(i + 1, imageUrls.length);
    }
  }

  return results;
}
