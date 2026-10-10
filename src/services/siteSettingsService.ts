import { supabase } from '../lib/supabase';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  setting_key: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

/**
 * Get a specific site setting by key
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching site setting:', error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error('Error in getSiteSetting:', error);
    return null;
  }
}

/**
 * Get all site settings
 */
export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      console.error('Error fetching all site settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllSiteSettings:', error);
    return [];
  }
}

/**
 * Update a site setting and log the change
 */
export async function updateSiteSetting(
  key: string,
  newValue: string,
  updatedBy: string
): Promise<boolean> {
  try {
    // Get current value for audit log
    const { data: currentData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();

    const oldValue = currentData?.setting_value || null;

    // Update the setting
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        setting_value: newValue,
        updated_by: updatedBy
      })
      .eq('setting_key', key);

    if (updateError) {
      console.error('Error updating site setting:', updateError);
      return false;
    }

    // Log the change to audit log
    const { error: auditError } = await supabase
      .from('site_settings_audit_log')
      .insert({
        setting_key: key,
        old_value: oldValue,
        new_value: newValue,
        changed_by: updatedBy,
        ip_address: null, // Could be populated with actual IP if needed
        user_agent: navigator.userAgent
      });

    if (auditError) {
      console.error('Error logging to audit log:', auditError);
      // Don't fail the update if audit log fails
    }

    return true;
  } catch (error) {
    console.error('Error in updateSiteSetting:', error);
    return false;
  }
}

/**
 * Check if instant estimate page is visible to public
 */
export async function isInstantEstimateVisible(): Promise<boolean> {
  const value = await getSiteSetting('instant_estimate_visible');
  return value === 'true';
}

/**
 * Toggle instant estimate visibility
 */
export async function toggleInstantEstimateVisibility(
  updatedBy: string
): Promise<boolean> {
  const currentValue = await getSiteSetting('instant_estimate_visible');
  const newValue = currentValue === 'true' ? 'false' : 'true';
  return await updateSiteSetting('instant_estimate_visible', newValue, updatedBy);
}

/**
 * Get audit log for a specific setting
 */
export async function getSettingAuditLog(
  settingKey: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('site_settings_audit_log')
      .select('*')
      .eq('setting_key', settingKey)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit log:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSettingAuditLog:', error);
    return [];
  }
}
