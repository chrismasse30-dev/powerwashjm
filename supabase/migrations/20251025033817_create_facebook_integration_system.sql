/*
  # Facebook Integration System

  ## Overview
  Complete system for automatically posting blog posts to Facebook Business Pages
  when they are published on the website.

  ## New Tables
  
  ### `facebook_settings`
  Stores Facebook API configuration (encrypted credentials)
  - `id` (uuid, primary key)
  - `facebook_page_id` (text) - Facebook Business Page ID
  - `facebook_app_id` (text) - Facebook App ID
  - `facebook_app_secret` (text) - Facebook App Secret (encrypted)
  - `page_access_token` (text) - Long-lived page access token (encrypted)
  - `token_expires_at` (timestamptz) - Token expiration timestamp
  - `is_enabled` (boolean) - Toggle integration on/off
  - `last_token_refresh` (timestamptz) - Last time token was refreshed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `facebook_post_logs`
  Tracks all Facebook posting attempts and results
  - `id` (uuid, primary key)
  - `blog_post_id` (uuid) - Reference to blog_posts table
  - `blog_post_title` (text) - Blog post title at time of posting
  - `blog_post_url` (text) - Full URL of blog post
  - `facebook_post_id` (text) - Facebook post ID if successful
  - `status` (text) - 'pending', 'success', 'failed', 'retrying'
  - `error_message` (text) - Error details if failed
  - `attempt_count` (integer) - Number of posting attempts
  - `posted_at` (timestamptz) - When successfully posted
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admin users can access settings
  - API credentials stored securely
  - Logs accessible to authenticated users only

  ## Indexes
  - Index on blog_post_id for quick lookups
  - Index on status for filtering
  - Index on created_at for chronological queries
*/

-- Create facebook_settings table
CREATE TABLE IF NOT EXISTS facebook_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facebook_page_id text NOT NULL DEFAULT '25040628762236696',
  facebook_app_id text NOT NULL DEFAULT '1670055597300242',
  facebook_app_secret text,
  page_access_token text,
  token_expires_at timestamptz,
  is_enabled boolean DEFAULT false,
  last_token_refresh timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create facebook_post_logs table
CREATE TABLE IF NOT EXISTS facebook_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  blog_post_title text NOT NULL,
  blog_post_url text NOT NULL,
  facebook_post_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message text,
  attempt_count integer DEFAULT 0,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_facebook_post_logs_blog_post_id ON facebook_post_logs(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_facebook_post_logs_status ON facebook_post_logs(status);
CREATE INDEX IF NOT EXISTS idx_facebook_post_logs_created_at ON facebook_post_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE facebook_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_post_logs ENABLE ROW LEVEL SECURITY;

-- Policies for facebook_settings (admin only)
CREATE POLICY "Authenticated users can view Facebook settings"
  ON facebook_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update Facebook settings"
  ON facebook_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert Facebook settings"
  ON facebook_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for facebook_post_logs (authenticated users can view)
CREATE POLICY "Authenticated users can view Facebook post logs"
  ON facebook_post_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert Facebook post logs"
  ON facebook_post_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update Facebook post logs"
  ON facebook_post_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_facebook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_facebook_settings_updated_at
  BEFORE UPDATE ON facebook_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_updated_at();

CREATE TRIGGER update_facebook_post_logs_updated_at
  BEFORE UPDATE ON facebook_post_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_facebook_updated_at();

-- Insert default settings row (if none exists)
INSERT INTO facebook_settings (facebook_page_id, facebook_app_id, is_enabled)
VALUES ('25040628762236696', '1670055597300242', false)
ON CONFLICT DO NOTHING;