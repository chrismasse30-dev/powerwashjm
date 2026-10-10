import { Upload } from 'lucide-react';

interface ImportProgressModalProps {
  current: number;
  total: number;
}

export default function ImportProgressModal({ current, total }: ImportProgressModalProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <Upload className="w-12 h-12 text-purple-600 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-center mb-4">Importing Images</h3>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{current} of {total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Please wait while we import your images...
        </p>
      </div>
    </div>
  );
}
