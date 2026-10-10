import { useState, useEffect } from 'react';
import { PopupService } from '../services/popupService';
import type { PopupConfig, PopupFormData } from '../types/popup';

export function usePopupConfig() {
  const [activeConfig, setActiveConfig] = useState<PopupConfig | null>(null);
  const [allConfigs, setAllConfigs] = useState<PopupConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [active, all] = await Promise.all([
        PopupService.getActiveConfig(),
        PopupService.getAllConfigs(),
      ]);
      setActiveConfig(active);
      setAllConfigs(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configs');
      console.error('Error loading configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const createConfig = async (config: PopupFormData) => {
    try {
      setIsCreating(true);
      setError(null);
      const newConfig = await PopupService.createConfig(config);
      await loadConfigs();
      return newConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create config');
      console.error('Error creating config:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateConfig = async (id: string, config: Partial<PopupFormData>) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updated = await PopupService.updateConfig(id, config);
      await loadConfigs();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
      console.error('Error updating config:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const activateConfig = async (id: string) => {
    try {
      setError(null);
      await PopupService.activateConfig(id);
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate config');
      console.error('Error activating config:', err);
      throw err;
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      setError(null);
      await PopupService.deleteConfig(id);
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete config');
      console.error('Error deleting config:', err);
      throw err;
    }
  };

  return {
    activeConfig,
    allConfigs,
    isLoading,
    isCreating,
    isUpdating,
    error,
    createConfig,
    updateConfig,
    activateConfig,
    deleteConfig,
    refresh: loadConfigs,
  };
}
