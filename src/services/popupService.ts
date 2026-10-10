import { supabase } from '../lib/supabase';
import type { PopupConfig, PopupPreset, PopupFormData, PopupPresetFormData } from '../types/popup';

export class PopupService {
  /**
   * Get the currently active popup configuration
   */
  static async getActiveConfig(): Promise<PopupConfig | null> {
    const { data, error } = await supabase
      .from('popup_configs')
      .select('*')
      .eq('is_active', true)
      .eq('enabled', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get all popup configurations (for employee dashboard)
   */
  static async getAllConfigs(): Promise<PopupConfig[]> {
    const { data, error } = await supabase
      .from('popup_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get a single popup configuration by ID
   */
  static async getConfigById(id: string): Promise<PopupConfig | null> {
    const { data, error } = await supabase
      .from('popup_configs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new popup configuration
   */
  static async createConfig(config: PopupFormData): Promise<PopupConfig> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('popup_configs')
      .insert({
        enabled: config.enabled,
        subheading: config.subheading || null,
        title: config.title,
        body: config.body,
        image_url: config.image_url || null,
        button_text: config.button_text,
        button_link: config.button_link,
        start_date: config.start_date || null,
        end_date: config.end_date || null,
        reappear_hours: config.reappear_hours || 24,
        created_by: user.id,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing popup configuration
   */
  static async updateConfig(
    id: string,
    config: Partial<PopupFormData>
  ): Promise<PopupConfig> {
    console.log('PopupService.updateConfig called with:', { id, config });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData: any = {
      ...config,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Convert empty strings to null
    if (updateData.subheading === '') updateData.subheading = null;
    if (updateData.image_url === '') updateData.image_url = null;
    if (updateData.start_date === '') updateData.start_date = null;
    if (updateData.end_date === '') updateData.end_date = null;

    console.log('Update data prepared:', updateData);

    const { data, error } = await supabase
      .from('popup_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating config:', error);
      throw error;
    }

    console.log('Config updated successfully:', data);
    return data;
  }

  /**
   * Activate a popup configuration (deactivates all others)
   */
  static async activateConfig(id: string): Promise<void> {
    console.log('PopupService.activateConfig called with ID:', id);

    const { error } = await supabase.rpc('activate_popup_config', {
      config_id: id,
    });

    if (error) {
      console.error('Supabase error activating config:', error);
      throw error;
    }

    console.log('Config activated successfully');
  }

  /**
   * Delete a popup configuration
   */
  static async deleteConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('popup_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get all presets
   */
  static async getAllPresets(): Promise<PopupPreset[]> {
    const { data, error } = await supabase
      .from('popup_presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a new preset
   */
  static async createPreset(preset: PopupPresetFormData): Promise<PopupPreset> {
    console.log('PopupService.createPreset called with:', preset);

    const { data: { user } } = await supabase.auth.getUser();
    console.log('User authenticated:', user?.id);

    if (!user) throw new Error('Not authenticated');

    const insertData = {
      name: preset.name,
      subheading: preset.subheading || null,
      title: preset.title,
      body: preset.body,
      image_url: preset.image_url || null,
      button_text: preset.button_text,
      button_link: preset.button_link,
      start_date: preset.start_date || null,
      end_date: preset.end_date || null,
      reappear_hours: preset.reappear_hours || 24,
      tags: preset.tags || [],
      created_by: user.id,
    };

    console.log('Inserting preset data:', insertData);

    const { data, error } = await supabase
      .from('popup_presets')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting preset:', error);
      throw error;
    }

    console.log('Preset created successfully:', data);
    return data;
  }

  /**
   * Update an existing preset
   */
  static async updatePreset(
    id: string,
    preset: Partial<PopupPresetFormData>
  ): Promise<PopupPreset> {
    const updateData: any = { ...preset };

    // Convert empty strings to null
    if (updateData.subheading === '') updateData.subheading = null;
    if (updateData.image_url === '') updateData.image_url = null;
    if (updateData.start_date === '') updateData.start_date = null;
    if (updateData.end_date === '') updateData.end_date = null;

    const { data, error } = await supabase
      .from('popup_presets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a preset
   */
  static async deletePreset(id: string): Promise<void> {
    const { error } = await supabase
      .from('popup_presets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Check if popup should display for current session
   */
  static async shouldDisplayPopup(sessionId: string): Promise<PopupConfig | null> {
    const { data, error } = await supabase.rpc('should_display_popup', {
      p_session_id: sessionId,
    });

    if (error) {
      console.error('Error checking if popup should display:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Record popup dismissal and store in localStorage
   */
  static async dismissPopup(configId: string, sessionId: string, reappearHours: number = 24): Promise<void> {
    const { error } = await supabase
      .from('popup_dismissals')
      .insert({
        popup_config_id: configId,
        session_id: sessionId,
      });

    if (error) {
      console.error('Error dismissing popup:', error);
    }

    const dismissTime = Date.now();
    const dismissData = {
      configId,
      dismissedAt: dismissTime,
      expiresAt: dismissTime + (reappearHours * 60 * 60 * 1000),
    };
    localStorage.setItem('popup_dismissed', JSON.stringify(dismissData));
  }

  /**
   * Check if popup is currently dismissed based on localStorage timer
   */
  static isPopupDismissed(configId: string): boolean {
    try {
      const dismissData = localStorage.getItem('popup_dismissed');
      if (!dismissData) return false;

      const { configId: dismissedId, expiresAt } = JSON.parse(dismissData);

      if (dismissedId !== configId) {
        localStorage.removeItem('popup_dismissed');
        return false;
      }

      const now = Date.now();
      if (now >= expiresAt) {
        localStorage.removeItem('popup_dismissed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking popup dismissal:', error);
      return false;
    }
  }

  /**
   * Track popup analytics
   */
  static async trackEvent(
    configId: string,
    eventType: 'view' | 'click' | 'close',
    sessionId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('popup_analytics')
      .insert({
        popup_config_id: configId,
        event_type: eventType,
        session_id: sessionId,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  /**
   * Get analytics for a specific popup config
   */
  static async getAnalytics(configId: string) {
    const { data, error } = await supabase
      .from('popup_analytics')
      .select('*')
      .eq('popup_config_id', configId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get analytics summary for a popup config
   */
  static async getAnalyticsSummary(configId: string) {
    const analytics = await this.getAnalytics(configId);

    const summary = {
      totalViews: analytics.filter(e => e.event_type === 'view').length,
      totalClicks: analytics.filter(e => e.event_type === 'click').length,
      totalCloses: analytics.filter(e => e.event_type === 'close').length,
      conversionRate: 0,
    };

    if (summary.totalViews > 0) {
      summary.conversionRate = (summary.totalClicks / summary.totalViews) * 100;
    }

    return summary;
  }
}
