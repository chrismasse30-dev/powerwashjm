/*
  # Fix All Security Issues

  ## Problems Addressed
  1. Remove unused indexes that add overhead without providing performance benefits
  2. Fix multiple permissive RLS policies by consolidating them
  3. Fix function search_path mutability issues

  ## Changes
  1. Drop unused indexes (11 total)
  2. Consolidate RLS policies to avoid multiple permissive policies
  3. Fix update_updated_at_column function search_path

  ## Security Notes
  - Removed indexes are not being used by queries
  - Consolidated policies prevent potential security bypasses
  - Fixed search_path prevents SQL injection risks
*/

-- =====================================================
-- PART 1: Drop Unused Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_quote_submissions_email;
DROP INDEX IF EXISTS idx_quote_submissions_session_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_popup_configs_active;
DROP INDEX IF EXISTS idx_popup_configs_dates;
DROP INDEX IF EXISTS idx_popup_analytics_config;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_popup_analytics_session;
DROP INDEX IF EXISTS idx_popup_dismissals_session;
DROP INDEX IF EXISTS idx_site_settings_key;
DROP INDEX IF EXISTS idx_audit_log_setting_key;

-- =====================================================
-- PART 2: Fix Multiple Permissive Policies
-- =====================================================

-- Fix blog_categories policies
DROP POLICY IF EXISTS "Authenticated can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view categories"
  ON blog_categories FOR SELECT
  TO anon
  USING (true);

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Authenticated can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;

CREATE POLICY "Authenticated users can manage posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

-- Fix blog_tags policies
DROP POLICY IF EXISTS "Authenticated can manage tags" ON blog_tags;
DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;

CREATE POLICY "Authenticated users can manage tags"
  ON blog_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view tags"
  ON blog_tags FOR SELECT
  TO anon
  USING (true);

-- Fix customer_reviews policies (use is_approved, not status)
DROP POLICY IF EXISTS "Authenticated can manage reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON customer_reviews;

CREATE POLICY "Authenticated users can manage reviews"
  ON customer_reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view approved reviews"
  ON customer_reviews FOR SELECT
  TO anon
  USING (is_approved = true AND deleted = false);

-- Fix email_templates policies
DROP POLICY IF EXISTS "Authenticated can manage templates" ON email_templates;
DROP POLICY IF EXISTS "Public can view active templates" ON email_templates;

CREATE POLICY "Authenticated users can manage templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active templates"
  ON email_templates FOR SELECT
  TO anon
  USING (is_active = true);

-- Fix fleet_photos policies
DROP POLICY IF EXISTS "Authenticated can manage fleet" ON fleet_photos;
DROP POLICY IF EXISTS "Public can view fleet" ON fleet_photos;

CREATE POLICY "Authenticated users can manage fleet"
  ON fleet_photos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view fleet"
  ON fleet_photos FOR SELECT
  TO anon
  USING (true);

-- Fix holiday_gallery_photos policies
DROP POLICY IF EXISTS "Authenticated can manage gallery" ON holiday_gallery_photos;
DROP POLICY IF EXISTS "Public can view gallery" ON holiday_gallery_photos;

CREATE POLICY "Authenticated users can manage gallery"
  ON holiday_gallery_photos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view gallery"
  ON holiday_gallery_photos FOR SELECT
  TO anon
  USING (true);

-- Fix popup_configs policies
DROP POLICY IF EXISTS "Employees can view all popup configs" ON popup_configs;
DROP POLICY IF EXISTS "Public can view active popup config" ON popup_configs;
DROP POLICY IF EXISTS "Employees can create popup configs" ON popup_configs;
DROP POLICY IF EXISTS "Employees can update popup configs" ON popup_configs;
DROP POLICY IF EXISTS "Employees can delete popup configs" ON popup_configs;

-- Single comprehensive policy for authenticated users
CREATE POLICY "Authenticated users manage popup configs"
  ON popup_configs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can only view active, enabled configs
CREATE POLICY "Public can view active popup config"
  ON popup_configs FOR SELECT
  TO anon
  USING (enabled = true AND is_active = true);

-- =====================================================
-- PART 3: Fix Function Search Path
-- =====================================================

-- Drop and recreate update_updated_at_column with immutable search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Recreate triggers that were dropped with CASCADE
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'quote_submissions', 
      'users', 
      'blog_posts', 
      'popup_configs',
      'site_settings',
      'email_templates'
    )
  LOOP
    BEGIN
      EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
          BEFORE UPDATE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      ', r.tablename, r.tablename);
    EXCEPTION
      WHEN duplicate_object THEN
        NULL; -- Trigger already exists, skip
    END;
  END LOOP;
END $$;
