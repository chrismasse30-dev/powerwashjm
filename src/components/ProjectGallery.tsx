import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { galleryService, GalleryPhoto } from '../services/galleryService';


export default function ProjectGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupImageIndex, setPopupImageIndex] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await galleryService.getAllPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load gallery photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = useCallback((photoId: string) => {
    setImageLoaded(prev => ({ ...prev, [photoId]: true }));
  }, []);

  useEffect(() => {
    if (isPaused || photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, photos.length]);

  const handlePrevious = () => {
    setIsPaused(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNext = () => {
    setIsPaused(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const openPopup = (index: number) => {
    setPopupImageIndex(index);
    setPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setPopupOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handlePopupPrevious = () => {
    setPopupImageIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const handlePopupNext = () => {
    setPopupImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!popupOpen) return;

      if (e.key === 'Escape') {
        closePopup();
      } else if (e.key === 'ArrowLeft') {
        handlePopupPrevious();
      } else if (e.key === 'ArrowRight') {
        handlePopupNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popupOpen, photos.length]);

  if (loading) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-600">No photos available</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-3 bg-gray-50">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Project Gallery
            </h2>
            <p className="text-sm text-gray-600">
              Click any image to view full size
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div
              className="relative w-full overflow-hidden rounded-lg shadow-lg bg-white cursor-pointer group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={() => openPopup(currentIndex)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 z-10 flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  {!imageLoaded[photo.id] && index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Holiday Lights Installation'}
                    className="w-full h-auto"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    onLoad={() => handleImageLoad(photo.id)}
                    onError={(e) => {
                      console.error('Failed to load image:', photo.image_url);
                    }}
                    style={{
                      opacity: imageLoaded[photo.id] ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      display: 'block'
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 mt-2">
              <button
                onClick={handlePrevious}
                className="p-1.5 bg-blue-900 text-white rounded-full hover:bg-blue-800 hover:scale-110 active:scale-95 transition-all shadow-md"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-900 w-5'
                        : 'bg-gray-400 hover:bg-gray-600'
                    }`}
                    aria-label={`Go to photo ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="p-1.5 bg-blue-900 text-white rounded-full hover:bg-blue-800 hover:scale-110 active:scale-95 transition-all shadow-md"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {popupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
          onClick={closePopup}
        >
          <button
            onClick={closePopup}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
            aria-label="Close popup"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePopupPrevious();
            }}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePopupNext();
            }}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="max-w-7xl max-h-[90vh] w-full mx-4 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[popupImageIndex].image_url}
              alt={photos[popupImageIndex].title || 'Holiday Lights Installation'}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
            {photos[popupImageIndex].title && (
              <div className="text-center mt-4 text-white text-lg font-semibold">
                {photos[popupImageIndex].title}
              </div>
            )}
            <div className="text-center mt-2 text-white/70 text-sm">
              {popupImageIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
