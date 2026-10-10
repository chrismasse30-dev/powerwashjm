/**
 * Image SEO Optimization Utilities
 * Handles filename optimization, alt text generation, and compression
 */

export interface ImageOptimizationResult {
  optimizedUrl: string;
  altText: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export function generateSEOFriendlyFilename(
  originalFilename: string,
  keyword?: string,
  context?: string
): string {
  // Extract extension
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';

  // Generate descriptive part
  let baseName: string;

  if (keyword) {
    baseName = keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  } else if (context) {
    const words = context
      .toLowerCase()
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(w))
      .slice(0, 3)
      .join('-');

    baseName = words || 'image';
  } else {
    baseName = 'blog-image';
  }

  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);

  return `${baseName}-${timestamp}.${ext}`;
}

export function generateAltText(
  filename: string,
  postTitle: string,
  keyword?: string,
  nearbyText?: string
): string {
  // Start with keyword if available
  const parts: string[] = [];

  if (keyword) {
    parts.push(keyword);
  }

  // Extract meaningful context from nearby text
  if (nearbyText) {
    const cleanText = nearbyText
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

    const contextWords = cleanText
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5)
      .join(' ');

    if (contextWords && !parts.includes(contextWords)) {
      parts.push(contextWords);
    }
  }

  // Add post title context if nothing else
  if (parts.length === 0) {
    parts.push(postTitle.slice(0, 50));
  }

  let altText = parts.join(' - ');

  // Ensure it's not too long
  if (altText.length > 125) {
    altText = altText.slice(0, 122) + '...';
  }

  return altText;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<{ blob: Blob; compressedSize: number }> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              compressedSize: blob.size
            });
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsDataURL(file);
  });
}

export function analyzeImageSEO(content: string): {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  imagesMissingAltDetails: Array<{ src: string; index: number }>;
  score: number;
} {
  const imageRegex = /<img[^>]*>/gi;
  const images = content.match(imageRegex) || [];

  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img));
  const imagesWithoutAlt = images.filter(img => !/alt=["'][^"']*["']/i.test(img));

  const imagesMissingAltDetails = imagesWithoutAlt.map((img, index) => {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    return {
      src: srcMatch ? srcMatch[1] : 'unknown',
      index
    };
  });

  const score = images.length > 0
    ? Math.round((imagesWithAlt.length / images.length) * 100)
    : 100;

  return {
    totalImages: images.length,
    imagesWithAlt: imagesWithAlt.length,
    imagesWithoutAlt: imagesWithoutAlt.length,
    imagesMissingAltDetails,
    score
  };
}

export function extractNearbyText(content: string, imageIndex: number): string {
  const images = content.match(/<img[^>]*>/gi) || [];
  if (imageIndex >= images.length) return '';

  const imgTag = images[imageIndex];
  const imgPosition = content.indexOf(imgTag);

  // Get text before and after image
  const before = content.slice(Math.max(0, imgPosition - 200), imgPosition);
  const after = content.slice(imgPosition + imgTag.length, imgPosition + imgTag.length + 200);

  const nearbyText = (before + ' ' + after)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return nearbyText;
}

export function addAltTextToImage(
  imageTag: string,
  altText: string
): string {
  // Check if alt attribute exists
  if (/alt=["'][^"']*["']/i.test(imageTag)) {
    // Replace existing alt
    return imageTag.replace(/alt=["'][^"']*["']/i, `alt="${altText}"`);
  } else {
    // Add alt attribute before closing >
    return imageTag.replace(/>$/, ` alt="${altText}">`);
  }
}

export function optimizeAllImagesInContent(
  content: string,
  postTitle: string,
  keyword?: string
): string {
  const imageRegex = /<img[^>]*>/gi;
  let optimizedContent = content;
  const images = content.match(imageRegex) || [];

  images.forEach((imgTag, index) => {
    // Check if image already has alt text
    if (!/alt=["'][^"']+["']/i.test(imgTag)) {
      // Get nearby text for context
      const nearbyText = extractNearbyText(content, index);

      // Generate alt text
      const altText = generateAltText(
        imgTag.match(/src=["']([^"']+)["']/i)?.[1] || '',
        postTitle,
        keyword,
        nearbyText
      );

      // Add alt text to image
      const optimizedImg = addAltTextToImage(imgTag, altText);
      optimizedContent = optimizedContent.replace(imgTag, optimizedImg);
    }
  });

  return optimizedContent;
}
