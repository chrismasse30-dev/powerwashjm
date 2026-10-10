/*
  # Fix should_display_popup to Return All Columns

  1. Problem
    - The function was missing `reappear_hours` in the return type
    - This caused the popup not to display because the frontend couldn't read this required field

  2. Solution
    - Drop and recreate the function with ALL columns from popup_configs table
*/

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
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  reappear_hours INTEGER,
  dismissal_text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.enabled,
    pc.subheading,
    pc.title,
    pc.body,
    pc.image_url,
    pc.button_text,
    pc.button_link,
    pc.start_date,
    pc.end_date,
    pc.is_active,
    pc.created_at,
    pc.updated_at,
    pc.created_by,
    pc.updated_by,
    pc.reappear_hours,
    pc.dismissal_text
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