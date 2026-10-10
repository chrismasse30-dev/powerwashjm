import { X } from 'lucide-react';
import { DESIGN_IMAGES } from '../config/images';

interface DesignGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DesignGuideModal({ isOpen, onClose }: DesignGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Design Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Team Note: Image Requirements for Accurate Length Confirmation
            </h3>
            <p className="text-blue-800 leading-relaxed">
              To accurately confirm total lengths for our measurement tool, we require at least two distinct images:
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full text-center leading-8 mr-2">1</span>
                Front View
              </h4>
              <p className="text-gray-700 ml-10">
                An image captured directly from the front, similar to the provided example.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full text-center leading-8 mr-2">2</span>
                Side View
              </h4>
              <p className="text-gray-700 ml-10">
                An image captured directly from a side angle (either left or right) of the structure.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">
              <strong className="text-yellow-900">Important:</strong> These multiple perspectives are crucial for our tool to correctly triangulate points and overcome the limitations of 2D perspective in a single image. This will enable us to confirm measurements between Point A and Point B with greater precision.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Visual Guide for Clarity
            </h4>
            <img
              src={DESIGN_IMAGES.measurementGuide}
              alt="Front and side view measurement guide showing how to properly capture images for accurate 3D length confirmation"
              className="w-full rounded-lg shadow-lg border border-gray-200"
            />
            <p className="text-center text-sm text-gray-600 mt-3">
              REQUIRED: Both Front & Side Views for Accurate 3D Length Confirmation (Point A to Point B)
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
