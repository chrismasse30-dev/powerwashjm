/*
  # Fix is_admin() function for Google Business Profile updates
  
  1. Changes
    - Drop and recreate is_admin() function with correct column reference
    - Fix the function to only check deleted_at (not deleted)
    - All dependent policies will automatically use the new function
  
  2. Security
    - Maintains existing admin-only access pattern
    - Uses SECURITY DEFINER to check auth.uid() against users table
*/

-- Drop existing is_admin functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Create the correct is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND deleted_at IS NULL
  );
END;
$$;

-- Recreate all RLS policies that depend on is_admin()

-- customer_reviews policies
DROP POLICY IF EXISTS "Admins can insert reviews" ON customer_reviews;
CREATE POLICY "Admins can insert reviews"
  ON customer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full update access to reviews" ON customer_reviews;
CREATE POLICY "Admins have full update access to reviews"
  ON customer_reviews FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete reviews" ON customer_reviews;
CREATE POLICY "Admins can delete reviews"
  ON customer_reviews FOR DELETE
  TO authenticated
  USING (is_admin());

-- quote_submissions policies
DROP POLICY IF EXISTS "Admins have full update access to quotes" ON quote_submissions;
CREATE POLICY "Admins have full update access to quotes"
  ON quote_submissions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- email_templates policies
DROP POLICY IF EXISTS "Admins have full update access to email templates" ON email_templates;
CREATE POLICY "Admins have full update access to email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- site_settings policies
DROP POLICY IF EXISTS "Admins have full update access to site settings" ON site_settings;
CREATE POLICY "Admins have full update access to site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- newsletter_signups policies
DROP POLICY IF EXISTS "Admins have full update access to newsletter signups" ON newsletter_signups;
CREATE POLICY "Admins have full update access to newsletter signups"
  ON newsletter_signups FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- holiday_gallery_photos policies
DROP POLICY IF EXISTS "Admins can insert gallery photos" ON holiday_gallery_photos;
CREATE POLICY "Admins can insert gallery photos"
  ON holiday_gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full update access to gallery photos" ON holiday_gallery_photos;
CREATE POLICY "Admins have full update access to gallery photos"
  ON holiday_gallery_photos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete gallery photos" ON holiday_gallery_photos;
CREATE POLICY "Admins can delete gallery photos"
  ON holiday_gallery_photos FOR DELETE
  TO authenticated
  USING (is_admin());

-- fleet_photos policies
DROP POLICY IF EXISTS "Admins can insert fleet photos" ON fleet_photos;
CREATE POLICY "Admins can insert fleet photos"
  ON fleet_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full update access to fleet photos" ON fleet_photos;
CREATE POLICY "Admins have full update access to fleet photos"
  ON fleet_photos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete fleet photos" ON fleet_photos;
CREATE POLICY "Admins can delete fleet photos"
  ON fleet_photos FOR DELETE
  TO authenticated
  USING (is_admin());

-- facebook_settings policies
DROP POLICY IF EXISTS "Admins can insert facebook settings" ON facebook_settings;
CREATE POLICY "Admins can insert facebook settings"
  ON facebook_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full update access to facebook settings" ON facebook_settings;
CREATE POLICY "Admins have full update access to facebook settings"
  ON facebook_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- popup_configs policies
DROP POLICY IF EXISTS "Admins can insert popup configs" ON popup_configs;
CREATE POLICY "Admins can insert popup configs"
  ON popup_configs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full update access to popup configs" ON popup_configs;
CREATE POLICY "Admins have full update access to popup configs"
  ON popup_configs FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete popup configs" ON popup_configs;
CREATE POLICY "Admins can delete popup configs"
  ON popup_configs FOR DELETE
  TO authenticated
  USING (is_admin());

-- google_business_post_logs policies
DROP POLICY IF EXISTS "Admins can delete GBP post logs" ON google_business_post_logs;
CREATE POLICY "Admins can delete GBP post logs"
  ON google_business_post_logs FOR DELETE
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update GBP post logs" ON google_business_post_logs;
CREATE POLICY "Admins can update GBP post logs"
  ON google_business_post_logs FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- google_business_reviews policies
DROP POLICY IF EXISTS "Admins can update GBP reviews" ON google_business_reviews;
CREATE POLICY "Admins can update GBP reviews"
  ON google_business_reviews FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- google_business_settings policies
DROP POLICY IF EXISTS "Admins can insert Google Business settings" ON google_business_settings;
CREATE POLICY "Admins can insert Google Business settings"
  ON google_business_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update Google Business settings" ON google_business_settings;
CREATE POLICY "Admins can update Google Business settings"
  ON google_business_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- page_metadata policies
DROP POLICY IF EXISTS "Admins can manage page metadata" ON page_metadata;
CREATE POLICY "Admins can manage page metadata"
  ON page_metadata FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
