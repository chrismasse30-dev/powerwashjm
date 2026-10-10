import { useState } from 'react';
import { Trash2, Download, Plus, X, Save } from 'lucide-react';
import { usePopupPresets } from '../../hooks/usePopupPresets';
import { usePopupConfig } from '../../hooks/usePopupConfig';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PopupPresetFormData } from '../../types/popup';

const presetNameSchema = z.object({
  name: z.string().min(1, 'Preset name is required').max(100, 'Preset name must be 100 characters or less'),
});

interface PopupPresetListProps {
  onLoadPreset: (data: any) => void;
  formData: any;
}

export default function PopupPresetList({ onLoadPreset, formData }: PopupPresetListProps) {
  const { presets, isLoading, deletePreset, updatePreset } = usePopupPresets();
  const { activeConfig } = usePopupConfig();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const { createPreset } = usePopupPresets();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ name: string }>({
    resolver: zodResolver(presetNameSchema),
  });

  const handleSaveAsPreset = async (data: { name: string }) => {
    const dataToSave = formData || activeConfig;
    if (!dataToSave) {
      console.error('No config to save');
      return;
    }

    console.log('Saving preset with data:', {
      name: data.name,
      activeConfig
    });

    try {
      await createPreset({
        name: data.name,
        subheading: dataToSave.subheading || '',
        title: dataToSave.title,
        body: dataToSave.body,
        image_url: dataToSave.image_url || '',
        button_text: dataToSave.button_text,
        button_link: dataToSave.button_link,
        start_date: dataToSave.start_date || '',
        end_date: dataToSave.end_date || '',
        tags: [],
      });
      console.log('Preset saved successfully');
      setShowSaveModal(false);
      reset();
    } catch (err) {
      console.error('Error saving preset:', err);
      alert(`Failed to save preset: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleLoadPreset = (preset: any) => {
    onLoadPreset({
      enabled: false,
      subheading: preset.subheading || '',
      title: preset.title,
      body: preset.body,
      image_url: preset.image_url || '',
      button_text: preset.button_text,
      button_link: preset.button_link,
      start_date: preset.start_date || '',
      end_date: preset.end_date || '',
    });
  };

  const handleUpdatePreset = async (presetId: string) => {
    const dataToSave = formData || activeConfig;
    if (!dataToSave) {
      console.error('No config to save');
      return;
    }

    try {
      await updatePreset(presetId, {
        subheading: dataToSave.subheading || '',
        title: dataToSave.title,
        body: dataToSave.body,
        image_url: dataToSave.image_url || '',
        button_text: dataToSave.button_text,
        button_link: dataToSave.button_link,
        start_date: dataToSave.start_date || '',
        end_date: dataToSave.end_date || '',
      });
      setShowUpdateModal(false);
      setSelectedPreset(null);
      alert('Preset updated successfully!');
    } catch (err) {
      console.error('Error updating preset:', err);
      alert(`Failed to update preset: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      try {
        await deletePreset(id);
      } catch (err) {
        console.error('Error deleting preset:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Saved Presets</h2>
        <div className="flex gap-2">
          {(formData || activeConfig) && (
            <>
              <button
                onClick={() => setShowSaveModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Save New
              </button>
              {presets.length > 0 && (
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Update Existing
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      ) : presets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No presets saved yet.</p>
      ) : (
        <div className="space-y-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{preset.name}</h3>
                <p className="text-sm text-gray-500 truncate">{preset.title}</p>
                <span className="text-xs text-gray-400">
                  Saved {new Date(preset.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleLoadPreset(preset)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  title="Load this preset"
                >
                  <Download className="w-4 h-4" />
                  Load
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  title="Delete this preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Save as New Preset</h3>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSaveAsPreset)} className="space-y-4">
              <div>
                <label htmlFor="preset_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Preset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="preset_name"
                  {...register('name')}
                  placeholder="e.g., Holiday Lights 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Existing Preset</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedPreset(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Preset to Update
                </label>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedPreset?.id === preset.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-sm text-gray-500">{preset.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedPreset(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPreset && handleUpdatePreset(selectedPreset.id)}
                  disabled={!selectedPreset}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
