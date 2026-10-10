interface ResponsiveImageProps {
  baseName: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchpriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Responsive image component that uses WebP with fallback
 *
 * Automatically serves:
 * - WebP format (30-50% smaller)
 * - Responsive sizes for mobile/tablet/desktop
 * - JPEG fallback for older browsers
 *
 * Usage:
 * <ResponsiveImage
 *   baseName="homepagehouse"
 *   alt="Professional Power Washing"
 *   loading="eager"
 *   fetchpriority="high"
 * />
 */
export function ResponsiveImage({
  baseName,
  alt,
  className = '',
  loading = 'lazy',
  fetchpriority = 'auto',
  sizes = '(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px',
  width,
  height,
}: ResponsiveImageProps) {
  return (
    <picture>
      <source
        srcSet={`/${baseName}-sm.webp 640w, /${baseName}-md.webp 1024w, /${baseName}-lg.webp 1920w`}
        type="image/webp"
        sizes={sizes}
      />
      <source
        srcSet={`/${baseName}-sm.jpg 640w, /${baseName}-md.jpg 1024w, /${baseName}-lg.jpg 1920w`}
        type="image/jpeg"
        sizes={sizes}
      />
      <img
        src={`/${baseName}-lg.jpg`}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchpriority}
        width={width}
        height={height}
      />
    </picture>
  );
}
