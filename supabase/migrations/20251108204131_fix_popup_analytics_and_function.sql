/*
  # Fix popup_analytics table and function
  
  1. Changes
    - Add missing columns to popup_analytics
    - Create the should_display_popup function with correct column references
    - Add is_active to customer_reviews if missing
    
  2. Security
    - Maintains existing RLS policies
*/

-- Add is_active to customer_reviews if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_reviews' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE customer_reviews ADD COLUMN is_active boolean DEFAULT true;
    UPDATE customer_reviews SET is_active = true WHERE is_active IS NULL;
  END IF;
END $$;

-- Add missing columns to popup_analytics
DO $$
BEGIN
  -- Add shown_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'popup_analytics' AND column_name = 'shown_at'
  ) THEN
    ALTER TABLE popup_analytics ADD COLUMN shown_at timestamptz DEFAULT now();
    -- Backfill with created_at for existing records
    UPDATE popup_analytics SET shown_at = created_at WHERE shown_at IS NULL;
  END IF;

  -- Add clicked if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'popup_analytics' AND column_name = 'clicked'
  ) THEN
    ALTER TABLE popup_analytics ADD COLUMN clicked boolean DEFAULT false;
  END IF;

  -- Add dismissed if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'popup_analytics' AND column_name = 'dismissed'
  ) THEN
    ALTER TABLE popup_analytics ADD COLUMN dismissed boolean DEFAULT false;
  END IF;
END $$;

-- Add index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_popup_analytics_session 
  ON popup_analytics(session_id, shown_at DESC);

-- Create the should_display_popup function
CREATE OR REPLACE FUNCTION should_display_popup(p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_shown_at timestamptz;
  v_frequency_hours integer;
  v_should_show boolean;
BEGIN
  -- Get the active popup configuration
  SELECT frequency_hours
  INTO v_frequency_hours
  FROM popup_configs
  WHERE is_active = true
  LIMIT 1;

  -- If no active popup, don't show
  IF v_frequency_hours IS NULL THEN
    RETURN false;
  END IF;

  -- Get last time popup was shown to this session
  SELECT shown_at
  INTO v_last_shown_at
  FROM popup_analytics 
  WHERE session_id = p_session_id 
    AND event_type = 'shown'
  ORDER BY shown_at DESC 
  LIMIT 1;

  -- If never shown, show it
  IF v_last_shown_at IS NULL THEN
    RETURN true;
  END IF;

  -- Check if enough time has passed since last shown (convert hours to seconds)
  v_should_show := (EXTRACT(EPOCH FROM (now() - v_last_shown_at)) / 3600) >= v_frequency_hours;

  RETURN v_should_show;
END;
$$;
