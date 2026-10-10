/*
  # Fix Popup Display Function - Critical Bug Fix

  ## Problem
  The `should_display_popup()` function has schema mismatches preventing popups from displaying:
  1. References `pa.popup_id` but column is actually `popup_config_id`
  2. References `pa.action` but column is actually `event_type`
  3. Checks wrong table for dismissals (should use popup_dismissals, not popup_analytics)

  ## Solution
  Recreate the function with correct column names and logic:
  - Use `popup_dismissals` table for dismissal checking
  - Match actual schema column names
  - Properly calculate reappear timing based on dismissed_at + reappear_hours

  ## Impact
  This fixes the homepage popup not displaying issue
*/

-- Drop the broken function
DROP FUNCTION IF EXISTS should_display_popup(text);

-- Create corrected function
CREATE OR REPLACE FUNCTION should_display_popup(p_session_id text)
RETURNS TABLE (
  id uuid,
  enabled boolean,
  subheading text,
  title text,
  body text,
  image_url text,
  button_text text,
  button_link text,
  start_date date,
  end_date date,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid,
  reappear_hours integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
    pc.reappear_hours
  FROM popup_configs pc
  WHERE pc.enabled = true
    AND pc.is_active = true
    AND (pc.start_date IS NULL OR pc.start_date <= CURRENT_DATE)
    AND (pc.end_date IS NULL OR pc.end_date >= CURRENT_DATE)
    AND NOT EXISTS (
      SELECT 1 FROM popup_dismissals pd
      WHERE pd.popup_config_id = pc.id
        AND pd.session_id = p_session_id
        AND (
          pc.reappear_hours IS NULL 
          OR pd.dismissed_at > NOW() - (pc.reappear_hours || ' hours')::INTERVAL
        )
    )
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION should_display_popup(text) TO anon, authenticated;