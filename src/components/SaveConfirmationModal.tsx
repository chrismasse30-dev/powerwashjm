import { X, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onSaveAndReturn: () => void;
  onReturnWithoutSaving: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
}

/**
 * SaveConfirmationModal Component
 *
 * Displays a modal dialog asking users if they want to save their changes
 * before navigating away from the current page.
 *
 * Features:
 * - Three action buttons: Save & Return, Return Without Saving, Cancel
 * - Prevents accidental data loss
 * - Keyboard accessible (ESC to close)
 * - Loading state support during save operations
 * - Backdrop click to close
 */
export default function SaveConfirmationModal({
  isOpen,
  onSaveAndReturn,
  onReturnWithoutSaving,
  onCancel,
  isSaving = false,
  hasUnsavedChanges = true
}: SaveConfirmationModalProps) {

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving, onCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSaving ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2
              id="save-modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              {hasUnsavedChanges ? 'Save Your Changes?' : 'Return to Blog Management?'}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-lg leading-relaxed">
            {hasUnsavedChanges ? (
              <>
                You have unsaved changes to your blog post. Would you like to save
                your work before returning to the Blog Management dashboard?
              </>
            ) : (
              <>
                Are you sure you want to return to the Blog Management dashboard?
              </>
            )}
          </p>

          {isSaving && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              <span className="text-blue-700 font-medium">Saving your blog post...</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={onSaveAndReturn}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              aria-label="Save changes and return to blog management"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Return
                </>
              )}
            </button>
          )}

          <button
            onClick={onReturnWithoutSaving}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Return without saving changes"
          >
            <ArrowLeft className="w-5 h-5" />
            {hasUnsavedChanges ? 'Return Without Saving' : 'Return'}
          </button>

          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel and stay on current page"
          >
            Cancel
          </button>
        </div>
      </div>

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
            transform: scale(0.95);
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
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
