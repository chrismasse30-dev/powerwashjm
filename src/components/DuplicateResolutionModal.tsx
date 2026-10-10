import { AlertTriangle, RefreshCw, Copy, X } from 'lucide-react';
import { DuplicateMatch } from '../utils/duplicateDetection';

interface DuplicateResolutionModalProps {
  duplicates: DuplicateMatch[];
  onOverwrite: (duplicateId: string) => void;
  onSaveAsNew: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function DuplicateResolutionModal({
  duplicates,
  onOverwrite,
  onSaveAsNew,
  onCancel,
  isProcessing = false
}: DuplicateResolutionModalProps) {
  const primaryDuplicate = duplicates[0];

  const getMatchReasonText = (reason: string) => {
    switch (reason) {
      case 'identical_slug':
        return 'Identical URL slug';
      case 'identical_title':
        return 'Identical title';
      case 'similar_content':
        return 'Similar content';
      default:
        return 'Unknown match';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Duplicate Blog Post Detected</h2>
              <p className="text-orange-100">
                A similar blog post already exists. Choose how you'd like to proceed.
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Existing Post Details:</h3>
          <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                  {primaryDuplicate.title}
                </h4>
                <p className="text-sm text-gray-600 font-mono">
                  /blog/{primaryDuplicate.slug}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(primaryDuplicate.status)}`}>
                {primaryDuplicate.status}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{getMatchReasonText(primaryDuplicate.matchReason)}</span>
              </div>
              {primaryDuplicate.similarity && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">•</span>
                  <span className="font-medium text-orange-600">
                    {primaryDuplicate.similarity}% match
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              Last updated: {new Date(primaryDuplicate.updated_at).toLocaleString()}
            </div>
          </div>

          {duplicates.length > 1 && (
            <p className="mt-3 text-sm text-gray-600">
              + {duplicates.length - 1} more similar post{duplicates.length > 2 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Resolution Options */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Choose an action:</h3>

          {/* Option 1: Overwrite */}
          <button
            onClick={() => onOverwrite(primaryDuplicate.id)}
            disabled={isProcessing}
            className="w-full text-left p-4 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 group-hover:bg-orange-200 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  Replace Existing Post
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                </h4>
                <p className="text-sm text-gray-600">
                  The existing post will be backed up and replaced with your new content.
                  The URL and post ID will remain the same. Previous version will be saved for recovery.
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Save as New */}
          <button
            onClick={onSaveAsNew}
            disabled={isProcessing}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                <Copy className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Save as New Post (Auto-rename)
                </h4>
                <p className="text-sm text-gray-600">
                  Your post will be saved with a modified URL slug (e.g., "-2" appended).
                  Both posts will exist independently. You'll need to manually update the title/slug.
                </p>
              </div>
            </div>
          </button>

          {/* Option 3: Cancel */}
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Cancel and Edit
                </h4>
                <p className="text-sm text-gray-600">
                  Return to the editor to modify the title, URL slug, or content before saving.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800 font-medium">Processing your request...</span>
            </div>
          </div>
        )}

        {/* Warning Footer */}
        <div className="p-4 bg-yellow-50 border-t border-yellow-200 rounded-b-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> If you choose to replace the existing post, a backup version will be created.
              You can recover previous versions from the blog management dashboard if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
