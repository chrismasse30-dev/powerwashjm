import { useState, useEffect } from 'react';
import { PopupService } from '../services/popupService';
import type { PopupPreset, PopupPresetFormData } from '../types/popup';

export function usePopupPresets() {
  const [presets, setPresets] = useState<PopupPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPresets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await PopupService.getAllPresets();
      setPresets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load presets');
      console.error('Error loading presets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const createPreset = async (preset: PopupPresetFormData) => {
    try {
      setIsCreating(true);
      setError(null);
      const newPreset = await PopupService.createPreset(preset);
      await loadPresets();
      return newPreset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preset');
      console.error('Error creating preset:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updatePreset = async (id: string, preset: Partial<PopupPresetFormData>) => {
    try {
      setError(null);
      await PopupService.updatePreset(id, preset);
      await loadPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preset');
      console.error('Error updating preset:', err);
      throw err;
    }
  };

  const deletePreset = async (id: string) => {
    try {
      setError(null);
      await PopupService.deletePreset(id);
      await loadPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preset');
      console.error('Error deleting preset:', err);
      throw err;
    }
  };

  return {
    presets,
    isLoading,
    isCreating,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    refresh: loadPresets,
  };
}
