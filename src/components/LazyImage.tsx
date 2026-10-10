import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  useWebP?: boolean;
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  useWebP = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const getWebPSrc = (originalSrc: string) => {
    if (!useWebP) return originalSrc;
    const ext = originalSrc.substring(originalSrc.lastIndexOf('.'));
    return originalSrc.replace(ext, '.webp');
  };

  const getFallbackSrc = (originalSrc: string) => {
    return originalSrc;
  };

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (useWebP) {
    return (
      <div className="relative overflow-hidden" style={{ minHeight: height ? `${height}px` : '200px' }}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}
        <picture>
          {isInView && (
            <>
              <source srcSet={getWebPSrc(src)} type="image/webp" />
              <source srcSet={getFallbackSrc(src)} type="image/jpeg" />
            </>
          )}
          <img
            ref={imgRef}
            src={isInView ? getFallbackSrc(src) : undefined}
            alt={alt}
            className={`transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            width={width}
            height={height}
            loading={loading}
            decoding={decoding}
            fetchpriority={fetchPriority}
            onLoad={() => setIsLoaded(true)}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ minHeight: height ? `${height}px` : '200px' }}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        data-src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchpriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
