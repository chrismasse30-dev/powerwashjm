import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { LOGOS } from '../config/images';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmationModal({ isOpen, onClose }: ConfirmationModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(15);
      return;
    }

    // Auto-close timer
    const timer = setTimeout(() => {
      onClose();
    }, 15000);

    // Countdown display
    const countdown = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Animation */}
        <div className="flex justify-center mb-6 animate-bounce-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600 animate-scale-in" />
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src={LOGOS.standard}
            alt="Company Logo"
            className="h-16 w-auto object-contain"
            onError={(e) => {
              // Fallback if standard logo doesn't exist
              const target = e.target as HTMLImageElement;
              target.src = '/logos/logo.png';
            }}
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#000080' }}>
          Thank You!
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-700 text-center mb-6 leading-relaxed">
          Our team will be in touch within 1 business day.
        </p>

        {/* Decorative element */}
        <div className="flex justify-center mb-4">
          <div
            className="h-1 w-24 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #000080 0%, #FFD700 100%)'
            }}
          />
        </div>

        {/* Auto-close countdown */}
        <p className="text-sm text-gray-500 text-center">
          Closing in {timeRemaining} second{timeRemaining !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
