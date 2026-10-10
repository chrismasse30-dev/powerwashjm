import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface BeforeAfterImage {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: string;
  location?: string;
}

interface BeforeAfterComparisonProps {
  images: BeforeAfterImage[];
  title?: string;
  description?: string;
  className?: string;
}

export default function BeforeAfterComparison({
  images,
  title = 'See the Transformation',
  description,
  className = ''
}: BeforeAfterComparisonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">{title}</h2>
            {description && (
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg z-10">
                  BEFORE
                </div>
                <LazyImage
                  src={currentImage.beforeSrc}
                  alt={currentImage.beforeAlt}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>

              <div className="relative">
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg z-10">
                  AFTER
                </div>
                <LazyImage
                  src={currentImage.afterSrc}
                  alt={currentImage.afterAlt}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {currentImage.caption && (
                    <p className="text-gray-700 font-semibold text-lg mb-1">
                      {currentImage.caption}
                    </p>
                  )}
                  {currentImage.location && (
                    <p className="text-gray-500 text-sm">
                      {currentImage.location}
                    </p>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevImage}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-blue-900" />
                    </button>
                    <span className="text-sm text-gray-600 font-medium px-2">
                      {currentIndex + 1} / {images.length}
                    </span>
                    <button
                      onClick={nextImage}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-blue-900" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
