/*
  # Add Dismissal Link Text to Popup System

  1. Changes
    - Add `dismissal_text` column to `popup_configs` table
    - Add `dismissal_text` column to `popup_presets` table
    - Update `should_display_popup` function to return the new column

  2. Purpose
    - Allow customizable "Maybe later" or "No thanks" dismissal link text
    - Improves user experience by giving them a polite way to dismiss popups
    - Psychological effect: Users feel more in control, paradoxically making them more likely to engage
*/

-- Add dismissal_text column to popup_configs
ALTER TABLE popup_configs
ADD COLUMN IF NOT EXISTS dismissal_text TEXT DEFAULT 'Maybe later';

-- Add dismissal_text column to popup_presets
ALTER TABLE popup_presets
ADD COLUMN IF NOT EXISTS dismissal_text TEXT DEFAULT 'Maybe later';

-- Drop and recreate should_display_popup function to include dismissal_text
DROP FUNCTION IF EXISTS should_display_popup(TEXT);

CREATE OR REPLACE FUNCTION should_display_popup(p_session_id TEXT)
RETURNS TABLE (
  id UUID,
  enabled BOOLEAN,
  subheading TEXT,
  title TEXT,
  body TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  dismissal_text TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.*
  FROM popup_configs pc
  WHERE pc.enabled = true
    AND pc.is_active = true
    AND (pc.start_date IS NULL OR pc.start_date <= CURRENT_DATE)
    AND (pc.end_date IS NULL OR pc.end_date >= CURRENT_DATE)
    AND NOT EXISTS (
      SELECT 1 FROM popup_dismissals pd
      WHERE pd.popup_config_id = pc.id
      AND pd.session_id = p_session_id
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;