/*
  # Fix Popup Tables Schema Mismatch

  ## Problem
  The popup tables were created with wrong schema:
  - popup_configs has: content, cta_text, cta_link, background_color, etc.
  - popup_presets has: config (jsonb) instead of individual columns
  
  ## Solution
  Drop and recreate with correct schema matching the application code

  ## Changes
  1. Drop existing popup tables
  2. Recreate with correct columns
  3. Re-enable RLS and policies
  4. Create necessary functions
*/

-- Drop existing tables
DROP TABLE IF EXISTS popup_dismissals CASCADE;
DROP TABLE IF EXISTS popup_analytics CASCADE;
DROP TABLE IF EXISTS popup_presets CASCADE;
DROP TABLE IF EXISTS popup_configs CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS activate_popup_config(UUID);
DROP FUNCTION IF EXISTS should_display_popup(TEXT);

-- Create popup_configs table with CORRECT schema
CREATE TABLE popup_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT false,
  subheading TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  button_text TEXT NOT NULL,
  button_link TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create popup_presets table with CORRECT schema
CREATE TABLE popup_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subheading TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  button_text TEXT NOT NULL,
  button_link TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Create popup_analytics table
CREATE TABLE popup_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_config_id UUID REFERENCES popup_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'close')),
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create popup_dismissals table
CREATE TABLE popup_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_config_id UUID REFERENCES popup_configs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(popup_config_id, session_id)
);

-- Create indexes
CREATE INDEX idx_popup_configs_active ON popup_configs(is_active, enabled);
CREATE INDEX idx_popup_configs_dates ON popup_configs(start_date, end_date);
CREATE INDEX idx_popup_analytics_config ON popup_analytics(popup_config_id);
CREATE INDEX idx_popup_analytics_session ON popup_analytics(session_id);
CREATE INDEX idx_popup_dismissals_session ON popup_dismissals(session_id);

-- Enable RLS
ALTER TABLE popup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for popup_configs
CREATE POLICY "Employees can view all popup configs"
  ON popup_configs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees can create popup configs"
  ON popup_configs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Employees can update popup configs"
  ON popup_configs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Employees can delete popup configs"
  ON popup_configs FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Public can view active popup config"
  ON popup_configs FOR SELECT
  TO anon, authenticated
  USING (enabled = true AND is_active = true);

-- RLS Policies for popup_presets
CREATE POLICY "Employees can manage all presets"
  ON popup_presets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for popup_analytics
CREATE POLICY "Public can insert analytics"
  ON popup_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Employees can view analytics"
  ON popup_analytics FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for popup_dismissals
CREATE POLICY "Public can record dismissals"
  ON popup_dismissals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Employees can view dismissals"
  ON popup_dismissals FOR SELECT
  TO authenticated
  USING (true);

-- Create activate_popup_config function
CREATE OR REPLACE FUNCTION activate_popup_config(config_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Deactivate all configs
  UPDATE popup_configs SET is_active = false;
  
  -- Activate the specified config
  UPDATE popup_configs SET is_active = true WHERE id = config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create should_display_popup function
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
