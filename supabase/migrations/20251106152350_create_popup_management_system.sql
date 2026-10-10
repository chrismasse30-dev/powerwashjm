/*
  # Create Popup Management System

  1. New Tables
    - `popup_configs`
      - `id` (uuid, primary key)
      - `enabled` (boolean) - Whether popup is active
      - `subheading` (text) - Optional subheading text
      - `title` (text) - Main popup title
      - `body` (text) - Popup body content
      - `image_url` (text) - URL to popup image
      - `button_text` (text) - CTA button text
      - `button_link` (text) - CTA button URL
      - `start_date` (date) - Optional start date for scheduling
      - `end_date` (date) - Optional end date for scheduling
      - `is_active` (boolean) - Only one config can be active at a time
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - References users table
      - `updated_by` (uuid) - References users table

    - `popup_presets`
      - `id` (uuid, primary key)
      - `name` (text) - Preset name for easy identification
      - `subheading` (text)
      - `title` (text)
      - `body` (text)
      - `image_url` (text)
      - `button_text` (text)
      - `button_link` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `tags` (text array) - For categorization
      - `created_at` (timestamptz)
      - `created_by` (uuid)

    - `popup_analytics`
      - `id` (uuid, primary key)
      - `popup_config_id` (uuid) - References popup_configs
      - `event_type` (text) - 'view', 'click', or 'close'
      - `user_ip` (text)
      - `user_agent` (text)
      - `session_id` (text)
      - `created_at` (timestamptz)

    - `popup_dismissals`
      - `id` (uuid, primary key)
      - `popup_config_id` (uuid) - References popup_configs
      - `session_id` (text) - Unique session identifier
      - `dismissed_at` (timestamptz)
      - Unique constraint on (popup_config_id, session_id)

  2. Security
    - Enable RLS on all tables
    - Employees can manage popup_configs and popup_presets
    - Public can view active popup_configs
    - Public can write to popup_analytics and popup_dismissals (for tracking)

  3. Functions
    - `activate_popup_config(config_id)` - Activates one config, deactivates others
    - `should_display_popup(session_id, current_date)` - Checks if popup should show
*/

-- Create popup_configs table
CREATE TABLE IF NOT EXISTS popup_configs (
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
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create popup_presets table
CREATE TABLE IF NOT EXISTS popup_presets (
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
  created_by UUID REFERENCES auth.users(id)
);

-- Create popup_analytics table
CREATE TABLE IF NOT EXISTS popup_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_config_id UUID REFERENCES popup_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'close')),
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create popup_dismissals table
CREATE TABLE IF NOT EXISTS popup_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_config_id UUID REFERENCES popup_configs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(popup_config_id, session_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_popup_configs_active ON popup_configs(is_active, enabled);
CREATE INDEX IF NOT EXISTS idx_popup_configs_dates ON popup_configs(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_popup_analytics_config ON popup_analytics(popup_config_id);
CREATE INDEX IF NOT EXISTS idx_popup_analytics_session ON popup_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_popup_dismissals_session ON popup_dismissals(session_id);

-- Enable Row Level Security
ALTER TABLE popup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE popup_dismissals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for popup_configs

-- Employees can view all popup configs
CREATE POLICY "Employees can view all popup configs"
  ON popup_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can create popup configs
CREATE POLICY "Employees can create popup configs"
  ON popup_configs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can update popup configs
CREATE POLICY "Employees can update popup configs"
  ON popup_configs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can delete popup configs
CREATE POLICY "Employees can delete popup configs"
  ON popup_configs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Public can view active popup config
CREATE POLICY "Public can view active popup config"
  ON popup_configs FOR SELECT
  TO anon, authenticated
  USING (enabled = true AND is_active = true);

-- RLS Policies for popup_presets

-- Employees can view all presets
CREATE POLICY "Employees can view all presets"
  ON popup_presets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can create presets
CREATE POLICY "Employees can create presets"
  ON popup_presets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can update presets
CREATE POLICY "Employees can update presets"
  ON popup_presets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- Employees can delete presets
CREATE POLICY "Employees can delete presets"
  ON popup_presets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- RLS Policies for popup_analytics

-- Public can insert analytics events
CREATE POLICY "Public can insert analytics events"
  ON popup_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Employees can view analytics
CREATE POLICY "Employees can view analytics"
  ON popup_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'employee')
    )
  );

-- RLS Policies for popup_dismissals

-- Public can insert dismissals
CREATE POLICY "Public can insert dismissals"
  ON popup_dismissals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can view dismissals by session
CREATE POLICY "Public can view dismissals by session"
  ON popup_dismissals FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to activate a popup config
CREATE OR REPLACE FUNCTION activate_popup_config(config_id UUID)
RETURNS void AS $$
BEGIN
  -- Deactivate all configs
  UPDATE popup_configs SET is_active = false;

  -- Activate the specified config
  UPDATE popup_configs
  SET is_active = true, updated_at = NOW()
  WHERE id = config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if popup should display
CREATE OR REPLACE FUNCTION should_display_popup(
  p_session_id TEXT,
  p_current_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  id UUID,
  subheading TEXT,
  title TEXT,
  body TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.subheading,
    pc.title,
    pc.body,
    pc.image_url,
    pc.button_text,
    pc.button_link
  FROM popup_configs pc
  WHERE pc.enabled = true
    AND pc.is_active = true
    AND (pc.start_date IS NULL OR pc.start_date <= p_current_date)
    AND (pc.end_date IS NULL OR pc.end_date >= p_current_date)
    AND NOT EXISTS (
      SELECT 1 FROM popup_dismissals pd
      WHERE pd.popup_config_id = pc.id
      AND pd.session_id = p_session_id
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
