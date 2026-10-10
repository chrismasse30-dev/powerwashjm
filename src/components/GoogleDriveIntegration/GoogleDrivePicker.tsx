import { useEffect, useState } from 'react';
import { X, Download, CheckSquare, Square } from 'lucide-react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import ImportProgressModal from './ImportProgressModal';

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  mimeType: string;
  size: number;
}

interface GoogleDrivePickerProps {
  onClose: () => void;
  onImportComplete?: () => void;
}

export default function GoogleDrivePicker({ onClose, onImportComplete }: GoogleDrivePickerProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, signIn, listFiles, downloadFile } = useGoogleDrive();

  useEffect(() => {
    const loadFiles = async () => {
      try {
        if (!isAuthenticated) {
          await signIn();
        }

        const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
        const driveFiles = await listFiles(folderId);

        const imageFiles = driveFiles.filter((file: DriveFile) =>
          file.mimeType.startsWith('image/')
        );

        setFiles(imageFiles);
        setError(null);
      } catch (error: any) {
        console.error('Failed to load files:', error);
        const errorMessage = error?.message || error?.toString() || 'Failed to load Google Drive files. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [isAuthenticated, signIn, listFiles]);

  const toggleSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAll = () => {
    setSelectedFiles(new Set(files.map(f => f.id)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  const handleImport = async () => {
    if (selectedFiles.size === 0) return;

    const RATE_LIMIT = 25;
    if (selectedFiles.size > RATE_LIMIT) {
      alert(`Please select no more than ${RATE_LIMIT} images at a time`);
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: selectedFiles.size });

    try {
      const selectedFilesList = files.filter(f => selectedFiles.has(f.id));
      let importedCount = 0;

      for (let i = 0; i < selectedFilesList.length; i++) {
        const file = selectedFilesList[i];
        const result = await downloadFile(file.id, file.name);
        if (result) {
          importedCount++;
        }
        setImportProgress({ current: i + 1, total: selectedFiles.size });
      }

      alert(`Successfully imported ${importedCount} images!`);
      onImportComplete?.();
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Some images failed to import. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Google Drive files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import from Google Drive</h2>
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFiles.size} of {files.length} images
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={importing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={importing}
            >
              <CheckSquare className="w-4 h-4" />
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              disabled={importing}
            >
              <Square className="w-4 h-4" />
              Deselect All
            </button>
            <button
              onClick={handleImport}
              disabled={selectedFiles.size === 0 || importing}
              className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Import {selectedFiles.size > 0 ? `(${selectedFiles.size})` : ''}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No images found in the Google Drive folder</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedFiles.has(file.id)
                        ? 'border-purple-600 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => toggleSelection(file.id)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={file.thumbnailLink}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 truncate">{file.name}</p>
                    </div>
                    {selectedFiles.has(file.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {importing && (
        <ImportProgressModal
          current={importProgress.current}
          total={importProgress.total}
        />
      )}
    </>
  );
}
