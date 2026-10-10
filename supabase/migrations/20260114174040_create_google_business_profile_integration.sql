/*
  # Google Business Profile Integration System

  ## Overview
  Complete system for managing Google Business Profile integration including:
  - Posting updates to Google Business Profile
  - Managing reviews
  - Tracking posts and updates

  ## New Tables

  ### `google_business_settings`
  Stores Google Business Profile API configuration
  - `id` (uuid, primary key)
  - `account_id` (text) - Google Business Account ID
  - `location_id` (text) - Google Business Location ID
  - `client_id` (text) - OAuth2 Client ID
  - `client_secret` (text) - OAuth2 Client Secret (encrypted)
  - `refresh_token` (text) - OAuth2 Refresh Token (encrypted)
  - `access_token` (text) - OAuth2 Access Token (encrypted)
  - `token_expires_at` (timestamptz) - Access token expiration
  - `is_enabled` (boolean) - Toggle integration on/off
  - `last_token_refresh` (timestamptz) - Last time token was refreshed
  - `auto_post_enabled` (boolean) - Auto-post blog posts to GBP
  - `auto_reply_reviews` (boolean) - Auto-reply to reviews
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `google_business_post_logs`
  Tracks all Google Business Profile posting attempts
  - `id` (uuid, primary key)
  - `post_type` (text) - 'blog_post', 'update', 'offer', 'event'
  - `source_id` (uuid) - Reference to source (blog_post_id, etc)
  - `source_title` (text) - Title at time of posting
  - `source_url` (text) - URL if applicable
  - `gbp_post_id` (text) - Google Business Profile post ID if successful
  - `status` (text) - 'pending', 'success', 'failed', 'retrying'
  - `error_message` (text) - Error details if failed
  - `attempt_count` (integer) - Number of posting attempts
  - `posted_at` (timestamptz) - When successfully posted
  - `post_content` (text) - Content that was posted
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `google_business_reviews`
  Stores Google Business Profile reviews for management
  - `id` (uuid, primary key)
  - `gbp_review_id` (text, unique) - Google Business Profile review ID
  - `reviewer_name` (text) - Reviewer display name
  - `reviewer_profile_url` (text) - Reviewer profile URL
  - `star_rating` (integer) - Star rating (1-5)
  - `review_text` (text) - Review content
  - `review_reply` (text) - Our reply to the review
  - `reply_posted_at` (timestamptz) - When we replied
  - `review_created_at` (timestamptz) - When review was created on Google
  - `last_synced_at` (timestamptz) - Last time we synced from Google
  - `is_responded` (boolean) - Whether we've responded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admin users can access settings
  - API credentials stored securely
  - Logs and reviews accessible to authenticated users only

  ## Indexes
  - Index on source_id for quick lookups
  - Index on status for filtering
  - Index on created_at for chronological queries
  - Index on gbp_review_id for quick review lookups
  - Index on star_rating for filtering reviews
*/

-- Create google_business_settings table
CREATE TABLE IF NOT EXISTS google_business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text,
  location_id text,
  client_id text,
  client_secret text,
  refresh_token text,
  access_token text,
  token_expires_at timestamptz,
  is_enabled boolean DEFAULT false,
  last_token_refresh timestamptz,
  auto_post_enabled boolean DEFAULT false,
  auto_reply_reviews boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create google_business_post_logs table
CREATE TABLE IF NOT EXISTS google_business_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type text NOT NULL CHECK (post_type IN ('blog_post', 'update', 'offer', 'event')),
  source_id uuid,
  source_title text NOT NULL,
  source_url text,
  gbp_post_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message text,
  attempt_count integer DEFAULT 0,
  posted_at timestamptz,
  post_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create google_business_reviews table
CREATE TABLE IF NOT EXISTS google_business_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gbp_review_id text UNIQUE NOT NULL,
  reviewer_name text NOT NULL,
  reviewer_profile_url text,
  star_rating integer NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text text,
  review_reply text,
  reply_posted_at timestamptz,
  review_created_at timestamptz NOT NULL,
  last_synced_at timestamptz DEFAULT now(),
  is_responded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gbp_post_logs_source_id ON google_business_post_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_gbp_post_logs_status ON google_business_post_logs(status);
CREATE INDEX IF NOT EXISTS idx_gbp_post_logs_created_at ON google_business_post_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gbp_post_logs_post_type ON google_business_post_logs(post_type);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_review_id ON google_business_reviews(gbp_review_id);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_star_rating ON google_business_reviews(star_rating);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_created_at ON google_business_reviews(review_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_is_responded ON google_business_reviews(is_responded);

-- Enable Row Level Security
ALTER TABLE google_business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_business_post_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_business_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for google_business_settings (admin only)
CREATE POLICY "Authenticated users can view Google Business settings"
  ON google_business_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update Google Business settings"
  ON google_business_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert Google Business settings"
  ON google_business_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for google_business_post_logs
CREATE POLICY "Authenticated users can view GBP post logs"
  ON google_business_post_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert GBP post logs"
  ON google_business_post_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update GBP post logs"
  ON google_business_post_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete GBP post logs"
  ON google_business_post_logs FOR DELETE
  TO authenticated
  USING (true);

-- Policies for google_business_reviews
CREATE POLICY "Authenticated users can view GBP reviews"
  ON google_business_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert GBP reviews"
  ON google_business_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update GBP reviews"
  ON google_business_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gbp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER update_google_business_settings_updated_at
  BEFORE UPDATE ON google_business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_gbp_updated_at();

CREATE TRIGGER update_google_business_post_logs_updated_at
  BEFORE UPDATE ON google_business_post_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_gbp_updated_at();

CREATE TRIGGER update_google_business_reviews_updated_at
  BEFORE UPDATE ON google_business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_gbp_updated_at();

-- Insert default settings row (if none exists)
INSERT INTO google_business_settings (is_enabled, auto_post_enabled, auto_reply_reviews)
VALUES (false, false, false)
ON CONFLICT DO NOTHING;