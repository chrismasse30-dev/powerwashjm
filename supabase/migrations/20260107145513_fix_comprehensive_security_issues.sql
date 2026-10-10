/*
  # Fix Comprehensive Security Issues

  ## Changes Made
  
  ### 1. Drop Unused Indexes
  - `idx_popup_analytics_popup_config_id` on popup_analytics
  - `idx_quote_submissions_design_saved_by` on quote_submissions
  - `idx_ai_content_generations_blog_post_id` on ai_content_generations
  - `idx_ai_content_generations_user_id` on ai_content_generations
  - `idx_chat_messages_conversation_id` on chat_messages
  - `idx_content_variations_blog_post_id` on content_variations

  ### 2. Replace Overly Permissive RLS Policies
  
  #### Admin-Only Tables (INSERT, UPDATE, DELETE restricted to admin role):
  - ai_prompt_templates
  - blog_categories
  - blog_posts
  - blog_tags
  - email_templates
  - facebook_settings
  - fleet_photos
  - holiday_gallery_photos
  - image_assets
  - popup_configs
  - popup_presets
  - seasonal_cards
  - service_pricing_ranges
  - site_settings
  - sms_templates
  - town_faqs
  - customer_reviews (DELETE only)

  #### Special Access Tables (maintained for functionality):
  - chat_conversations, chat_messages (public INSERT maintained)
  - email_tracking_events (webhook INSERT maintained)
  - estimate_approvals (public INSERT maintained)
  - newsletter_signups (public INSERT maintained)
  - popup_analytics (public INSERT maintained)
  - popup_dismissals (public INSERT maintained)
  - quote_submissions (public INSERT/UPDATE maintained)
  - users (ownership-based access)

  ### 3. Security Notes
  - All admin checks use: `(auth.jwt() ->> 'role') = 'admin'`
  - Public read access maintained where needed
  - Webhook and system functions preserved
  - Users can only modify their own records unless admin
*/

-- =====================================================
-- PART 1: DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_popup_analytics_popup_config_id;
DROP INDEX IF EXISTS idx_quote_submissions_design_saved_by;
DROP INDEX IF EXISTS idx_ai_content_generations_blog_post_id;
DROP INDEX IF EXISTS idx_ai_content_generations_user_id;
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_content_variations_blog_post_id;

-- =====================================================
-- PART 2: FIX RLS POLICIES - AI PROMPT TEMPLATES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert templates" ON public.ai_prompt_templates;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON public.ai_prompt_templates;

CREATE POLICY "Admins can insert templates"
ON public.ai_prompt_templates
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update templates"
ON public.ai_prompt_templates
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 3: FIX RLS POLICIES - BLOG CATEGORIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.blog_categories;

CREATE POLICY "Admins can delete categories"
ON public.blog_categories
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert categories"
ON public.blog_categories
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update categories"
ON public.blog_categories
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 4: FIX RLS POLICIES - BLOG POSTS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.blog_posts;

CREATE POLICY "Admins can delete posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 5: FIX RLS POLICIES - BLOG TAGS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete tags" ON public.blog_tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.blog_tags;
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.blog_tags;

CREATE POLICY "Admins can delete tags"
ON public.blog_tags
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert tags"
ON public.blog_tags
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update tags"
ON public.blog_tags
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 6: FIX RLS POLICIES - CHAT (Keep public access)
-- =====================================================

-- Chat conversations and messages intentionally allow public INSERT
-- This is necessary for the chat functionality to work
-- No changes needed for chat_conversations "Public can create conversations"
-- No changes needed for chat_messages "Public can send messages"

DROP POLICY IF EXISTS "Authenticated can update conversations" ON public.chat_conversations;

CREATE POLICY "Admins can update conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 7: FIX RLS POLICIES - CONTENT VARIATIONS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert variations" ON public.content_variations;
DROP POLICY IF EXISTS "Authenticated users can update variations" ON public.content_variations;

CREATE POLICY "Admins can insert variations"
ON public.content_variations
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update variations"
ON public.content_variations
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 8: FIX RLS POLICIES - CUSTOMER REVIEWS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.customer_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.customer_reviews;

CREATE POLICY "Admins can delete reviews"
ON public.customer_reviews
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert reviews"
ON public.customer_reviews
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 9: FIX RLS POLICIES - EMAIL TEMPLATES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete templates" ON public.email_templates;
DROP POLICY IF EXISTS "Authenticated users can insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON public.email_templates;

CREATE POLICY "Admins can delete templates"
ON public.email_templates
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert templates"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 10: FIX RLS POLICIES - EMAIL TRACKING EVENTS
-- =====================================================

-- Keep webhook INSERT for anon (needed for email tracking)
-- Restrict UPDATE and DELETE to admins

DROP POLICY IF EXISTS "Only authenticated users can delete email events" ON public.email_tracking_events;
DROP POLICY IF EXISTS "Only authenticated users can update email events" ON public.email_tracking_events;

CREATE POLICY "Admins can delete email events"
ON public.email_tracking_events
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update email events"
ON public.email_tracking_events
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 11: FIX RLS POLICIES - ESTIMATE APPROVALS
-- =====================================================

-- Keep public INSERT (needed for approval workflow)
-- No changes needed for "Anyone can insert approval"

-- =====================================================
-- PART 12: FIX RLS POLICIES - FACEBOOK SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete facebook settings" ON public.facebook_settings;
DROP POLICY IF EXISTS "Authenticated users can insert facebook settings" ON public.facebook_settings;
DROP POLICY IF EXISTS "Authenticated users can update facebook settings" ON public.facebook_settings;

CREATE POLICY "Admins can delete facebook settings"
ON public.facebook_settings
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert facebook settings"
ON public.facebook_settings
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update facebook settings"
ON public.facebook_settings
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 13: FIX RLS POLICIES - FLEET PHOTOS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete fleet photos" ON public.fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can insert fleet photos" ON public.fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can update fleet photos" ON public.fleet_photos;

CREATE POLICY "Admins can delete fleet photos"
ON public.fleet_photos
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert fleet photos"
ON public.fleet_photos
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update fleet photos"
ON public.fleet_photos
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 14: FIX RLS POLICIES - HOLIDAY GALLERY PHOTOS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete gallery photos" ON public.holiday_gallery_photos;
DROP POLICY IF EXISTS "Authenticated users can insert gallery photos" ON public.holiday_gallery_photos;
DROP POLICY IF EXISTS "Authenticated users can update gallery photos" ON public.holiday_gallery_photos;

CREATE POLICY "Admins can delete gallery photos"
ON public.holiday_gallery_photos
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert gallery photos"
ON public.holiday_gallery_photos
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update gallery photos"
ON public.holiday_gallery_photos
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 15: FIX RLS POLICIES - IMAGE ASSETS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete image assets" ON public.image_assets;
DROP POLICY IF EXISTS "Authenticated users can insert image assets" ON public.image_assets;
DROP POLICY IF EXISTS "Authenticated users can update image assets" ON public.image_assets;

CREATE POLICY "Admins can delete image assets"
ON public.image_assets
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert image assets"
ON public.image_assets
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update image assets"
ON public.image_assets
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 16: FIX RLS POLICIES - NEWSLETTER SIGNUPS
-- =====================================================

-- Keep public INSERT (needed for newsletter signup form)
-- No changes needed for "Public can signup"

-- =====================================================
-- PART 17: FIX RLS POLICIES - POPUP ANALYTICS
-- =====================================================

-- Keep public INSERT (needed for tracking popup interactions)
-- No changes needed for "Public can insert analytics"

-- =====================================================
-- PART 18: FIX RLS POLICIES - POPUP CONFIGS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete popup configs" ON public.popup_configs;
DROP POLICY IF EXISTS "Authenticated users can insert popup configs" ON public.popup_configs;
DROP POLICY IF EXISTS "Authenticated users can update popup configs" ON public.popup_configs;

CREATE POLICY "Admins can delete popup configs"
ON public.popup_configs
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert popup configs"
ON public.popup_configs
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update popup configs"
ON public.popup_configs
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 19: FIX RLS POLICIES - POPUP DISMISSALS
-- =====================================================

-- Keep public INSERT (needed for tracking popup dismissals)
-- No changes needed for "Public can record dismissals"

-- =====================================================
-- PART 20: FIX RLS POLICIES - POPUP PRESETS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete presets" ON public.popup_presets;
DROP POLICY IF EXISTS "Authenticated users can insert presets" ON public.popup_presets;
DROP POLICY IF EXISTS "Authenticated users can update presets" ON public.popup_presets;

CREATE POLICY "Admins can delete presets"
ON public.popup_presets
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert presets"
ON public.popup_presets
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update presets"
ON public.popup_presets
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 21: FIX RLS POLICIES - QUOTE SUBMISSIONS
-- =====================================================

-- Keep public INSERT and UPDATE (needed for quote submission form)
-- But restrict authenticated UPDATE to admins only

DROP POLICY IF EXISTS "Authenticated can update quotes" ON public.quote_submissions;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON public.quote_submissions;

CREATE POLICY "Admins can update quotes"
ON public.quote_submissions
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Public policies are maintained for form functionality

-- =====================================================
-- PART 22: FIX RLS POLICIES - SEASONAL CARDS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete seasonal cards" ON public.seasonal_cards;
DROP POLICY IF EXISTS "Authenticated users can insert seasonal cards" ON public.seasonal_cards;
DROP POLICY IF EXISTS "Authenticated users can update seasonal cards" ON public.seasonal_cards;

CREATE POLICY "Admins can delete seasonal cards"
ON public.seasonal_cards
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert seasonal cards"
ON public.seasonal_cards
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update seasonal cards"
ON public.seasonal_cards
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 23: FIX RLS POLICIES - SECURITY AUDIT LOG
-- =====================================================

-- Keep system INSERT (needed for audit logging)
-- No changes needed for "System can insert security logs"

-- =====================================================
-- PART 24: FIX RLS POLICIES - SEO ANALYSIS CACHE
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert cache" ON public.seo_analysis_cache;

CREATE POLICY "Admins can insert cache"
ON public.seo_analysis_cache
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 25: FIX RLS POLICIES - SERVICE PRICING RANGES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete pricing" ON public.service_pricing_ranges;
DROP POLICY IF EXISTS "Authenticated users can insert pricing" ON public.service_pricing_ranges;
DROP POLICY IF EXISTS "Authenticated users can update pricing" ON public.service_pricing_ranges;

CREATE POLICY "Admins can delete pricing"
ON public.service_pricing_ranges
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert pricing"
ON public.service_pricing_ranges
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update pricing"
ON public.service_pricing_ranges
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 26: FIX RLS POLICIES - SITE SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.site_settings;

CREATE POLICY "Admins can insert settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 27: FIX RLS POLICIES - SITE SETTINGS AUDIT LOG
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON public.site_settings_audit_log;

CREATE POLICY "Admins can insert audit log"
ON public.site_settings_audit_log
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 28: FIX RLS POLICIES - SMS TEMPLATES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete sms templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Authenticated users can insert sms templates" ON public.sms_templates;
DROP POLICY IF EXISTS "Authenticated users can update sms templates" ON public.sms_templates;

CREATE POLICY "Admins can delete sms templates"
ON public.sms_templates
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert sms templates"
ON public.sms_templates
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update sms templates"
ON public.sms_templates
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 29: FIX RLS POLICIES - TOWN FAQS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can delete town FAQs" ON public.town_faqs;
DROP POLICY IF EXISTS "Authenticated users can insert town FAQs" ON public.town_faqs;
DROP POLICY IF EXISTS "Authenticated users can update town FAQs" ON public.town_faqs;

CREATE POLICY "Admins can delete town FAQs"
ON public.town_faqs
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can insert town FAQs"
ON public.town_faqs
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can update town FAQs"
ON public.town_faqs
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- =====================================================
-- PART 30: FIX RLS POLICIES - USERS
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;

CREATE POLICY "Admins can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Users can update own profile or admins can update any"
ON public.users
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  id = auth.uid() OR (auth.jwt() ->> 'role') = 'admin'
);
