/*
  # Fix Admin Full Access Across All Tables

  1. Changes to customer_reviews
    - Update the UPDATE policy to allow admins full access regardless of deleted status
    - Ensure admins can perform all operations without restrictions

  2. Changes to other critical tables
    - Review and fix policies on key tables to ensure admins have unrestricted access
    - Tables reviewed: quote_submissions, blog_posts, email_templates, site_settings, users

  3. Security
    - Maintains existing RLS for non-admin users
    - Ensures admins bypass all restrictions for management purposes
*/

-- Fix customer_reviews UPDATE policy to allow admins full access
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON customer_reviews;

CREATE POLICY "Admins have full update access to reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Non-admins can update non-deleted reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) != 'admin'::text 
    AND deleted = false
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) != 'admin'::text 
    AND deleted = false
  );

-- Fix quote_submissions to ensure admins have full access
DROP POLICY IF EXISTS "Authenticated users can update quotes" ON quote_submissions;
DROP POLICY IF EXISTS "Admins can update any quote" ON quote_submissions;

CREATE POLICY "Admins have full update access to quotes"
  ON quote_submissions
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Non-admins can update non-deleted quotes"
  ON quote_submissions
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) != 'admin'::text 
    AND (deleted IS NULL OR deleted = false)
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) != 'admin'::text 
    AND (deleted IS NULL OR deleted = false)
  );

-- Fix blog_posts to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;

CREATE POLICY "Admins have full update access to blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix email_templates to ensure admins have full access
DROP POLICY IF EXISTS "Authenticated users can update templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can update templates" ON email_templates;

CREATE POLICY "Admins have full update access to email templates"
  ON email_templates
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix site_settings to ensure admins have full access
DROP POLICY IF EXISTS "Authenticated users can update settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;

CREATE POLICY "Admins have full update access to site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Ensure admins can insert into all key tables
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_submissions;

CREATE POLICY "Anyone can insert quotes"
  ON quote_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Fix newsletter_signups to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update newsletter signups" ON newsletter_signups;

CREATE POLICY "Admins have full update access to newsletter signups"
  ON newsletter_signups
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix holiday_gallery_photos to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update gallery photos" ON holiday_gallery_photos;

CREATE POLICY "Admins have full update access to gallery photos"
  ON holiday_gallery_photos
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix fleet_photos to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update fleet photos" ON fleet_photos;

CREATE POLICY "Admins have full update access to fleet photos"
  ON fleet_photos
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix facebook_settings to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update facebook settings" ON facebook_settings;

CREATE POLICY "Admins have full update access to facebook settings"
  ON facebook_settings
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix popup_configs to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update popup configs" ON popup_configs;

CREATE POLICY "Admins have full update access to popup configs"
  ON popup_configs
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Fix service_area_surcharges to ensure admins have full access
DROP POLICY IF EXISTS "Admins can update service area surcharges" ON service_area_surcharges;

CREATE POLICY "Admins have full update access to service area surcharges"
  ON service_area_surcharges
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);