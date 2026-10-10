/*
  # Comprehensive Security Fixes

  This migration addresses multiple security and performance issues:

  1. **Missing Foreign Key Indexes** (7 fixes)
     - Adds indexes for all unindexed foreign keys to improve query performance

  2. **RLS Performance Optimization** (48 fixes)
     - Wraps auth functions with SELECT to avoid re-evaluation per row

  3. **Remove Unused Indexes** (6 removals)
     - Cleans up indexes that are not being used

  4. **Consolidate Duplicate Policies** (11 fixes)
     - Removes duplicate RLS policies to simplify security model

  5. **Function Search Path Security** (2 fixes)
     - Sets explicit search_path for functions to prevent injection
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ai_content_generations_blog_post_id
  ON public.ai_content_generations(blog_post_id);

CREATE INDEX IF NOT EXISTS idx_ai_content_generations_user_id
  ON public.ai_content_generations(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id
  ON public.chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_content_variations_blog_post_id
  ON public.content_variations(blog_post_id);

CREATE INDEX IF NOT EXISTS idx_popup_analytics_popup_config_id
  ON public.popup_analytics(popup_config_id);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_design_saved_by
  ON public.quote_submissions(design_saved_by);

CREATE INDEX IF NOT EXISTS idx_quote_surcharge_audit_surcharge_rule_id
  ON public.quote_surcharge_audit(surcharge_rule_id);


-- =====================================================
-- PART 2: REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_service_area_surcharges_active;
DROP INDEX IF EXISTS public.idx_quote_surcharge_audit_quote_id;
DROP INDEX IF EXISTS public.idx_quote_surcharge_audit_created_at;
DROP INDEX IF EXISTS public.idx_page_metadata_page_type;
DROP INDEX IF EXISTS public.idx_email_errors_quote_id;
DROP INDEX IF EXISTS public.idx_email_errors_retry;


-- =====================================================
-- PART 3: CONSOLIDATE DUPLICATE RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can insert quotes" ON public.quote_submissions;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins have full update access to blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Non-admins can update non-deleted reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Admins can insert email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public read access to page metadata" ON public.page_metadata;
DROP POLICY IF EXISTS "Non-admins can update non-deleted quotes" ON public.quote_submissions;
DROP POLICY IF EXISTS "Admins can delete service area surcharges" ON public.service_area_surcharges;
DROP POLICY IF EXISTS "Admins can insert service area surcharges" ON public.service_area_surcharges;
DROP POLICY IF EXISTS "Admins have full update access to service area surcharges" ON public.service_area_surcharges;
DROP POLICY IF EXISTS "Admins can insert site settings" ON public.site_settings;


-- =====================================================
-- PART 4: OPTIMIZE RLS POLICIES (Auth Function Wrapping)
-- =====================================================

-- service_area_surcharges
DROP POLICY IF EXISTS "Admins can view surcharges" ON public.service_area_surcharges;
CREATE POLICY "Admins can view surcharges"
  ON public.service_area_surcharges FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert surcharges" ON public.service_area_surcharges;
CREATE POLICY "Admins can insert surcharges"
  ON public.service_area_surcharges FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update surcharges" ON public.service_area_surcharges;
CREATE POLICY "Admins can update surcharges"
  ON public.service_area_surcharges FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can delete surcharges" ON public.service_area_surcharges;
CREATE POLICY "Admins can delete surcharges"
  ON public.service_area_surcharges FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- quote_surcharge_audit
DROP POLICY IF EXISTS "Admins can view surcharge audit" ON public.quote_surcharge_audit;
CREATE POLICY "Admins can view surcharge audit"
  ON public.quote_surcharge_audit FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- ai_prompt_templates
DROP POLICY IF EXISTS "Admins can insert templates" ON public.ai_prompt_templates;
CREATE POLICY "Admins can insert templates"
  ON public.ai_prompt_templates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update templates" ON public.ai_prompt_templates;
CREATE POLICY "Admins can update templates"
  ON public.ai_prompt_templates FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- blog_categories
DROP POLICY IF EXISTS "Admins can delete categories" ON public.blog_categories;
CREATE POLICY "Admins can delete categories"
  ON public.blog_categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert categories" ON public.blog_categories;
CREATE POLICY "Admins can insert categories"
  ON public.blog_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update categories" ON public.blog_categories;
CREATE POLICY "Admins can update categories"
  ON public.blog_categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- blog_posts
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;
CREATE POLICY "Admins can delete posts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
CREATE POLICY "Admins can insert posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
CREATE POLICY "Admins can update posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- blog_tags
DROP POLICY IF EXISTS "Admins can delete tags" ON public.blog_tags;
CREATE POLICY "Admins can delete tags"
  ON public.blog_tags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert tags" ON public.blog_tags;
CREATE POLICY "Admins can insert tags"
  ON public.blog_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update tags" ON public.blog_tags;
CREATE POLICY "Admins can update tags"
  ON public.blog_tags FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- chat_conversations
DROP POLICY IF EXISTS "Admins can update conversations" ON public.chat_conversations;
CREATE POLICY "Admins can update conversations"
  ON public.chat_conversations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- content_variations
DROP POLICY IF EXISTS "Admins can insert variations" ON public.content_variations;
CREATE POLICY "Admins can insert variations"
  ON public.content_variations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update variations" ON public.content_variations;
CREATE POLICY "Admins can update variations"
  ON public.content_variations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- email_templates
DROP POLICY IF EXISTS "Admins can delete templates" ON public.email_templates;
CREATE POLICY "Admins can delete templates"
  ON public.email_templates FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert templates" ON public.email_templates;
CREATE POLICY "Admins can insert templates"
  ON public.email_templates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- email_tracking_events
DROP POLICY IF EXISTS "Admins can delete email events" ON public.email_tracking_events;
CREATE POLICY "Admins can delete email events"
  ON public.email_tracking_events FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update email events" ON public.email_tracking_events;
CREATE POLICY "Admins can update email events"
  ON public.email_tracking_events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- facebook_settings
DROP POLICY IF EXISTS "Admins can delete facebook settings" ON public.facebook_settings;
CREATE POLICY "Admins can delete facebook settings"
  ON public.facebook_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- image_assets
DROP POLICY IF EXISTS "Admins can delete image assets" ON public.image_assets;
CREATE POLICY "Admins can delete image assets"
  ON public.image_assets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert image assets" ON public.image_assets;
CREATE POLICY "Admins can insert image assets"
  ON public.image_assets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update image assets" ON public.image_assets;
CREATE POLICY "Admins can update image assets"
  ON public.image_assets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- popup_presets
DROP POLICY IF EXISTS "Admins can delete presets" ON public.popup_presets;
CREATE POLICY "Admins can delete presets"
  ON public.popup_presets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert presets" ON public.popup_presets;
CREATE POLICY "Admins can insert presets"
  ON public.popup_presets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update presets" ON public.popup_presets;
CREATE POLICY "Admins can update presets"
  ON public.popup_presets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- seasonal_cards
DROP POLICY IF EXISTS "Admins can delete seasonal cards" ON public.seasonal_cards;
CREATE POLICY "Admins can delete seasonal cards"
  ON public.seasonal_cards FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert seasonal cards" ON public.seasonal_cards;
CREATE POLICY "Admins can insert seasonal cards"
  ON public.seasonal_cards FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update seasonal cards" ON public.seasonal_cards;
CREATE POLICY "Admins can update seasonal cards"
  ON public.seasonal_cards FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- seo_analysis_cache
DROP POLICY IF EXISTS "Admins can insert cache" ON public.seo_analysis_cache;
CREATE POLICY "Admins can insert cache"
  ON public.seo_analysis_cache FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- service_pricing_ranges
DROP POLICY IF EXISTS "Admins can delete pricing" ON public.service_pricing_ranges;
CREATE POLICY "Admins can delete pricing"
  ON public.service_pricing_ranges FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert pricing" ON public.service_pricing_ranges;
CREATE POLICY "Admins can insert pricing"
  ON public.service_pricing_ranges FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update pricing" ON public.service_pricing_ranges;
CREATE POLICY "Admins can update pricing"
  ON public.service_pricing_ranges FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- site_settings
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;
CREATE POLICY "Admins can insert settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- site_settings_audit_log
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.site_settings_audit_log;
CREATE POLICY "Admins can insert audit log"
  ON public.site_settings_audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- sms_templates
DROP POLICY IF EXISTS "Admins can delete sms templates" ON public.sms_templates;
CREATE POLICY "Admins can delete sms templates"
  ON public.sms_templates FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert sms templates" ON public.sms_templates;
CREATE POLICY "Admins can insert sms templates"
  ON public.sms_templates FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update sms templates" ON public.sms_templates;
CREATE POLICY "Admins can update sms templates"
  ON public.sms_templates FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- town_faqs
DROP POLICY IF EXISTS "Admins can delete town FAQs" ON public.town_faqs;
CREATE POLICY "Admins can delete town FAQs"
  ON public.town_faqs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can insert town FAQs" ON public.town_faqs;
CREATE POLICY "Admins can insert town FAQs"
  ON public.town_faqs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Admins can update town FAQs" ON public.town_faqs;
CREATE POLICY "Admins can update town FAQs"
  ON public.town_faqs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

-- users
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));

DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON public.users;
CREATE POLICY "Users can update own profile or admins can update any"
  ON public.users FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL))
  WITH CHECK (id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.users WHERE users.id = (SELECT auth.uid()) AND users.role = 'admin' AND users.deleted_at IS NULL));


-- =====================================================
-- PART 5: FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.users WHERE users.id = user_id AND users.role = 'admin' AND users.deleted_at IS NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_page_metadata_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;