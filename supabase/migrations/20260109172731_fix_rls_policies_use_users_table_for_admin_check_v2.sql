/*
  # Fix RLS Policies to Check Users Table for Admin Role

  1. Problem
    - Current RLS policies check auth.jwt() ->> 'role' for admin access
    - But the role is stored in the users table, not in JWT claims
    - This causes "row violates row-level security policy" errors

  2. Solution
    - Update all policies to check the users table directly using auth.uid()
    - Ensure admins have full access across all tables
    - Maintain existing security for non-admin users

  3. Tables Updated
    - customer_reviews
    - quote_submissions
    - blog_posts
    - email_templates
    - site_settings
    - newsletter_signups
    - holiday_gallery_photos
    - fleet_photos
    - facebook_settings
    - popup_configs
    - service_area_surcharges
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND deleted_at IS NULL
  );
$$;

-- customer_reviews policies
DROP POLICY IF EXISTS "Admins can insert reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Admins have full update access to reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Non-admins can update non-deleted reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON customer_reviews;

CREATE POLICY "Admins can insert reviews"
  ON customer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Non-admins can update non-deleted reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin() AND deleted = false)
  WITH CHECK (NOT public.is_admin() AND deleted = false);

CREATE POLICY "Admins can delete reviews"
  ON customer_reviews
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- quote_submissions policies
DROP POLICY IF EXISTS "Admins have full update access to quotes" ON quote_submissions;
DROP POLICY IF EXISTS "Non-admins can update non-deleted quotes" ON quote_submissions;

CREATE POLICY "Admins have full update access to quotes"
  ON quote_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Non-admins can update non-deleted quotes"
  ON quote_submissions
  FOR UPDATE
  TO authenticated
  USING (NOT public.is_admin() AND (deleted IS NULL OR deleted = false))
  WITH CHECK (NOT public.is_admin() AND (deleted IS NULL OR deleted = false));

-- blog_posts policies
DROP POLICY IF EXISTS "Admins have full update access to blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- email_templates policies
DROP POLICY IF EXISTS "Admins have full update access to email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can insert email templates" ON email_templates;

CREATE POLICY "Admins can insert email templates"
  ON email_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to email templates"
  ON email_templates
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- site_settings policies
DROP POLICY IF EXISTS "Admins have full update access to site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;

CREATE POLICY "Admins can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- newsletter_signups policies
DROP POLICY IF EXISTS "Admins have full update access to newsletter signups" ON newsletter_signups;

CREATE POLICY "Admins have full update access to newsletter signups"
  ON newsletter_signups
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- holiday_gallery_photos policies
DROP POLICY IF EXISTS "Admins have full update access to gallery photos" ON holiday_gallery_photos;
DROP POLICY IF EXISTS "Admins can insert gallery photos" ON holiday_gallery_photos;
DROP POLICY IF EXISTS "Admins can delete gallery photos" ON holiday_gallery_photos;

CREATE POLICY "Admins can insert gallery photos"
  ON holiday_gallery_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to gallery photos"
  ON holiday_gallery_photos
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete gallery photos"
  ON holiday_gallery_photos
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- fleet_photos policies
DROP POLICY IF EXISTS "Admins have full update access to fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Admins can insert fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Admins can delete fleet photos" ON fleet_photos;

CREATE POLICY "Admins can insert fleet photos"
  ON fleet_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to fleet photos"
  ON fleet_photos
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete fleet photos"
  ON fleet_photos
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- facebook_settings policies
DROP POLICY IF EXISTS "Admins have full update access to facebook settings" ON facebook_settings;
DROP POLICY IF EXISTS "Admins can insert facebook settings" ON facebook_settings;

CREATE POLICY "Admins can insert facebook settings"
  ON facebook_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to facebook settings"
  ON facebook_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- popup_configs policies
DROP POLICY IF EXISTS "Admins have full update access to popup configs" ON popup_configs;
DROP POLICY IF EXISTS "Admins can insert popup configs" ON popup_configs;
DROP POLICY IF EXISTS "Admins can delete popup configs" ON popup_configs;

CREATE POLICY "Admins can insert popup configs"
  ON popup_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to popup configs"
  ON popup_configs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete popup configs"
  ON popup_configs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- service_area_surcharges policies
DROP POLICY IF EXISTS "Admins have full update access to service area surcharges" ON service_area_surcharges;
DROP POLICY IF EXISTS "Admins can insert service area surcharges" ON service_area_surcharges;
DROP POLICY IF EXISTS "Admins can delete service area surcharges" ON service_area_surcharges;

CREATE POLICY "Admins can insert service area surcharges"
  ON service_area_surcharges
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full update access to service area surcharges"
  ON service_area_surcharges
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete service area surcharges"
  ON service_area_surcharges
  FOR DELETE
  TO authenticated
  USING (public.is_admin());