import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface HolidayLightsPromoModalProps {
  onClose?: () => void;
}

export default function HolidayLightsPromoModal({ onClose }: HolidayLightsPromoModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(() => {
    return sessionStorage.getItem('holidayModalSeen') === 'true';
  });
  const [touchStart, setTouchStart] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't show if already seen in this session OR if on holiday-lights page
    if (hasSeenModal || (location.pathname.replace(/[/]+$/, '') || '/') === '/holiday-lights') return;

    let timer: NodeJS.Timeout;

    const handleScroll = () => {
      // Show after scrolling 200px
      if (window.scrollY > 200 && !hasSeenModal && !isVisible) {
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Show after 3 seconds OR when user scrolls
    timer = setTimeout(() => {
      if (!hasSeenModal && !isVisible) {
        setIsVisible(true);
      }
    }, 3000);

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasSeenModal, isVisible, location.pathname]);

  // Close modal if user navigates to holiday-lights page
  useEffect(() => {
    if ((location.pathname.replace(/[/]+$/, '') || '/') === '/holiday-lights' && isVisible) {
      setIsVisible(false);
      sessionStorage.setItem('holidayModalSeen', 'true');
      setHasSeenModal(true);
    }
  }, [location.pathname, isVisible]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isVisible]);

  const handleClose = () => {
    sessionStorage.setItem('holidayModalSeen', 'true');
    setHasSeenModal(true);
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const handleGetQuote = () => {
    // Close the modal first
    sessionStorage.setItem('holidayModalSeen', 'true');
    setHasSeenModal(true);
    setIsVisible(false);

    // Navigate to holiday lights page after brief delay for animation
    setTimeout(() => {
      navigate('/holiday-lights');
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  // Handle swipe-down gesture on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (touchStart - touchEnd < -80) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="holiday-promo-title"
        aria-describedby="holiday-promo-description"
      >
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button - WCAG compliant 44x44px */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 active:bg-opacity-100 rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close holiday lights promotion"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Content */}
            <div className="w-full md:w-1/2 bg-[#0A2240] relative overflow-hidden flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-[320px] md:min-h-[450px]">
              {/* Falling snow animation - reduced on mobile */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="snowflakes" aria-hidden="true">
                  <div className="snowflake snowflake-lg">❄</div>
                  <div className="snowflake snowflake-md">*</div>
                  <div className="snowflake snowflake-lg">❄</div>
                  <div className="snowflake snowflake-sm">•</div>
                  <div className="snowflake snowflake-md">*</div>
                  <div className="snowflake snowflake-lg">❄</div>
                  {/* Additional snowflakes hidden on mobile */}
                  <div className="snowflake snowflake-sm hidden md:block">•</div>
                  <div className="snowflake snowflake-lg hidden md:block">❄</div>
                  <div className="snowflake snowflake-sm hidden md:block">*</div>
                  <div className="snowflake snowflake-md hidden md:block">•</div>
                  <div className="snowflake snowflake-sm hidden md:block">*</div>
                  <div className="snowflake snowflake-lg hidden md:block">❄</div>
                  <div className="snowflake snowflake-sm hidden md:block">•</div>
                  <div className="snowflake snowflake-md hidden md:block">*</div>
                </div>
              </div>

              {/* Content stack */}
              <div className="relative z-10">
                {/* Urgency indicator */}
                <div className="text-white text-xs sm:text-sm mb-2 md:mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Limited slots available for 2025 season</span>
                </div>

                {/* Main headline - responsive sizing */}
                <h2 id="holiday-promo-title" className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-2 md:mb-4">
                  <span className="text-white">Holiday Lights</span>
                  <br />
                  <span className="text-[#FFE34D]">Installation!</span>
                </h2>

                {/* Desktop subheading */}
                <p id="holiday-promo-description" className="hidden sm:block text-white text-base md:text-lg lg:text-xl leading-relaxed mb-4 md:mb-6 opacity-90">
                  Let us make your home or business sparkle this season. Professional, hassle-free service.
                </p>

                {/* Mobile-specific shorter message */}
                <p className="sm:hidden text-white text-sm leading-relaxed mb-4 opacity-90">
                  Professional holiday lighting service
                </p>

                {/* Satisfaction badge */}
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-white text-xs sm:text-sm font-semibold">✓ 100% Satisfaction Guaranteed</span>
                  </div>
                </div>

                {/* Call-to-action button - optimized for mobile */}
                <button
                  onClick={handleGetQuote}
                  className="inline-block bg-[#D9232D] text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-[#b91c24] active:bg-[#b91c24] transition-all duration-200 shadow-lg active:scale-95 min-h-[48px] w-full sm:w-auto text-center"
                  tabIndex={0}
                >
                  Get Your Free Quote →
                </button>

                {/* Swipe hint for mobile */}
                <div className="md:hidden text-white/50 text-xs text-center mt-4">
                  Swipe down to close
                </div>
              </div>
            </div>

            {/* Right Column - Image with optimized loading */}
            <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[280px] md:min-h-[450px] relative overflow-hidden">
              <img
                src="/rihouselightswithlogo.webp"
                alt="A beautiful suburban house decorated with professional holiday lights at dusk"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        @keyframes snowfall {
          from {
            transform: translateY(0px) translateX(0px);
            opacity: 1;
          }
          to {
            transform: translateY(600px) translateX(20px);
            opacity: 0.2;
          }
        }

        .snowflakes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .snowflake {
          position: absolute;
          top: -10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
          animation: snowfall linear infinite;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
          will-change: transform, opacity;
        }

        .snowflake-lg {
          font-size: 1.8rem;
        }

        .snowflake-md {
          font-size: 1.2rem;
        }

        .snowflake-sm {
          font-size: 0.8rem;
        }

        .snowflake:nth-child(1) {
          left: 10%;
          animation-duration: 10s;
          animation-delay: 0s;
        }

        .snowflake:nth-child(2) {
          left: 20%;
          animation-duration: 8s;
          animation-delay: 2s;
        }

        .snowflake:nth-child(3) {
          left: 30%;
          animation-duration: 7s;
          animation-delay: 0s;
        }

        .snowflake:nth-child(4) {
          left: 50%;
          animation-duration: 11s;
          animation-delay: 3s;
        }

        .snowflake:nth-child(5) {
          left: 70%;
          animation-duration: 9s;
          animation-delay: 1s;
        }

        .snowflake:nth-child(6) {
          left: 85%;
          animation-duration: 10s;
          animation-delay: 4s;
        }

        .snowflake:nth-child(7) {
          left: 15%;
          animation-duration: 12s;
          animation-delay: 1s;
        }

        .snowflake:nth-child(8) {
          left: 40%;
          animation-duration: 8s;
          animation-delay: 2s;
        }

        .snowflake:nth-child(9) {
          left: 55%;
          animation-duration: 13s;
          animation-delay: 5s;
        }

        .snowflake:nth-child(10) {
          left: 65%;
          animation-duration: 7s;
          animation-delay: 1s;
        }

        .snowflake:nth-child(11) {
          left: 80%;
          animation-duration: 10s;
          animation-delay: 3s;
        }

        .snowflake:nth-child(12) {
          left: 90%;
          animation-duration: 9s;
          animation-delay: 4s;
        }

        .snowflake:nth-child(13) {
          left: 95%;
          animation-duration: 14s;
          animation-delay: 2s;
        }

        .snowflake:nth-child(14) {
          left: 45%;
          animation-duration: 8s;
          animation-delay: 6s;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .snowflake {
            font-size: 0.9rem;
          }
          .snowflake-lg {
            font-size: 1.3rem;
          }
          .snowflake-md {
            font-size: 0.9rem;
          }
          .snowflake-sm {
            font-size: 0.6rem;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .snowflake {
            animation: none;
            opacity: 0.3;
          }
          .animate-scale-in {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
