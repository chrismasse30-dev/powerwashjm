import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import GoogleDrivePicker from './GoogleDrivePicker';

interface GoogleDriveButtonProps {
  onImportComplete?: () => void;
}

export default function GoogleDriveButton({ onImportComplete }: GoogleDriveButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPickerOpen(true)}
        className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer w-full text-left"
      >
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900">Import Holiday Photos</h4>
        </div>
        <p className="text-sm text-gray-600">
          Import holiday light photos from shared Google Drive folder
        </p>
      </button>

      {isPickerOpen && (
        <GoogleDrivePicker
          onClose={() => setIsPickerOpen(false)}
          onImportComplete={() => {
            onImportComplete?.();
            setIsPickerOpen(false);
          }}
        />
      )}
    </>
  );
}
