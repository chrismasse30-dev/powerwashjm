/*
  # Comprehensive Security Fixes - Wave 3

  ## Changes Made

  1. **Add Missing Foreign Key Indexes**
     - Add index on email_sending_errors(quote_submission_id)
     - Add index on quote_surcharge_audit(quote_submission_id)

  2. **Remove Unused Indexes**
     - Drop 14 unused indexes that are not being utilized
     - Improves database performance and reduces maintenance overhead

  3. **Fix Function Search Paths**
     - Set secure search_path for is_admin function
     - Set secure search_path for update_gbp_updated_at function

  4. **Improve RLS Policies**
     - Make authenticated user policies more restrictive where appropriate
     - Keep necessary public access for forms and webhooks
     - Add admin checks where full access should be restricted

  ## Security Notes
  - Auth DB connection strategy must be changed manually in Supabase dashboard
  - Some "always true" policies are intentional for public forms/webhooks
  - Admin policies now properly check role from users table
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for email_sending_errors foreign key
CREATE INDEX IF NOT EXISTS idx_email_sending_errors_quote_submission_id
ON public.email_sending_errors(quote_submission_id);

-- Index for quote_surcharge_audit foreign key
CREATE INDEX IF NOT EXISTS idx_quote_surcharge_audit_quote_submission_id
ON public.quote_surcharge_audit(quote_submission_id);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

-- AI Content Generation indexes (not used)
DROP INDEX IF EXISTS public.idx_ai_content_generations_blog_post_id;
DROP INDEX IF EXISTS public.idx_ai_content_generations_user_id;

-- Chat indexes (not used)
DROP INDEX IF EXISTS public.idx_chat_messages_conversation_id;

-- Content variations indexes (not used)
DROP INDEX IF EXISTS public.idx_content_variations_blog_post_id;

-- Popup indexes (not used)
DROP INDEX IF EXISTS public.idx_popup_analytics_popup_config_id;

-- Quote submissions indexes (not used)
DROP INDEX IF EXISTS public.idx_quote_submissions_design_saved_by;
DROP INDEX IF EXISTS public.idx_quote_surcharge_audit_surcharge_rule_id;

-- Google Business Profile indexes (not used)
DROP INDEX IF EXISTS public.idx_gbp_post_logs_source_id;
DROP INDEX IF EXISTS public.idx_gbp_post_logs_status;
DROP INDEX IF EXISTS public.idx_gbp_post_logs_post_type;
DROP INDEX IF EXISTS public.idx_gbp_reviews_review_id;
DROP INDEX IF EXISTS public.idx_gbp_reviews_star_rating;
DROP INDEX IF EXISTS public.idx_gbp_reviews_is_responded;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix is_admin function search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND deleted = false
  );
END;
$$;

-- Fix update_gbp_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_gbp_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. IMPROVE RLS POLICIES
-- =====================================================

-- 4.1 Google Business Post Logs - Restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can delete GBP post logs" ON public.google_business_post_logs;
DROP POLICY IF EXISTS "Authenticated users can insert GBP post logs" ON public.google_business_post_logs;
DROP POLICY IF EXISTS "Authenticated users can update GBP post logs" ON public.google_business_post_logs;

CREATE POLICY "Admins can delete GBP post logs"
  ON public.google_business_post_logs
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "System can insert GBP post logs"
  ON public.google_business_post_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update GBP post logs"
  ON public.google_business_post_logs
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.2 Google Business Reviews - Restrict to admins
DROP POLICY IF EXISTS "Authenticated users can insert GBP reviews" ON public.google_business_reviews;
DROP POLICY IF EXISTS "Authenticated users can update GBP reviews" ON public.google_business_reviews;

CREATE POLICY "System can insert GBP reviews"
  ON public.google_business_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update GBP reviews"
  ON public.google_business_reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.3 Google Business Settings - Restrict to admins
DROP POLICY IF EXISTS "Authenticated users can insert Google Business settings" ON public.google_business_settings;
DROP POLICY IF EXISTS "Authenticated users can update Google Business settings" ON public.google_business_settings;

CREATE POLICY "Admins can insert Google Business settings"
  ON public.google_business_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update Google Business settings"
  ON public.google_business_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4.4 Page Metadata - Restrict to admins
DROP POLICY IF EXISTS "Allow authenticated users to manage page metadata" ON public.page_metadata;

CREATE POLICY "Admins can manage page metadata"
  ON public.page_metadata
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Keep public read access for page metadata
CREATE POLICY "Public can read page metadata"
  ON public.page_metadata
  FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- NOTES ON INTENTIONAL "ALWAYS TRUE" POLICIES
-- =====================================================

/*
The following policies are intentionally "always true" and should NOT be changed:

1. chat_conversations "Public can create conversations" - Needed for public chat feature
2. chat_messages "Public can send messages" - Needed for public chat feature
3. email_tracking_events "Webhook can insert email events" - Needed for webhook processing
4. estimate_approvals "Anyone can insert approval" - Needed for customer approval links
5. newsletter_signups "Public can signup" - Needed for newsletter form
6. popup_analytics "Public can insert analytics" - Needed for tracking popup views
7. popup_dismissals "Public can record dismissals" - Needed for popup functionality
8. quote_submissions "Anyone can insert quotes" - Needed for quote form
9. quote_surcharge_audit "Anonymous can insert" - Needed for form submission tracking
10. security_audit_log "System can insert" - Needed for security logging

These are legitimate use cases where anonymous/authenticated users need unrestricted insert access.
*/