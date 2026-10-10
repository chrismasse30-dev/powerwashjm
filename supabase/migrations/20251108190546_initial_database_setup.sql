/*
  # Initial Database Setup - Complete Schema
  
  This migration creates all core tables for the pressure washing business application.
  
  ## Tables Created
  
  1. **quote_submissions** - Customer quote requests
  2. **users** - Employee/admin user accounts
  3. **holiday_gallery_photos** - Holiday lighting project gallery
  4. **fleet_photos** - Company vehicle photos
  5. **chat_conversations** - Customer service chat system
  6. **chat_messages** - Messages within conversations
  7. **newsletter_signups** - Email newsletter subscribers
  8. **customer_reviews** - Customer testimonials and reviews
  9. **blog_posts** - Blog content management
  10. **blog_categories** - Blog post categories
  11. **blog_tags** - Blog post tags
  12. **site_settings** - Site-wide configuration
  13. **email_templates** - Email notification templates
  14. **popup_configs** - Website popup configurations
  15. **popup_presets** - Saved popup templates
  16. **popup_analytics** - Popup performance tracking
  17. **facebook_settings** - Facebook integration config
  18. **facebook_post_logs** - Facebook posting history
  
  ## Security
  - All tables have RLS enabled
  - Appropriate policies for public, authenticated, and service roles
  - Secure password storage using bcrypt-compatible hashing
  
  ## Performance
  - Indexes on frequently queried columns
  - Foreign key indexes for JOIN optimization
*/

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Quote Submissions Table
CREATE TABLE IF NOT EXISTS quote_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  zip text,
  services text[] DEFAULT '{}',
  property_type text,
  package text,
  sq_ft integer,
  business_name text,
  page_source text,
  submit_email text DEFAULT 'jmpowerwashing@yahoo.com',
  session_id text,
  is_submitted boolean DEFAULT false,
  lead_event text,
  google_drive_folder_id text,
  google_drive_folder_url text,
  design_file_url text,
  design_image_url text,
  second_design_image_url text,
  design_data jsonb,
  status text DEFAULT 'new',
  requires_measurement boolean DEFAULT false,
  abandoned_email_sent boolean DEFAULT false,
  abandoned_email_sent_at timestamptz,
  duplicate_of_id uuid,
  is_duplicate boolean DEFAULT false,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert quotes" ON quote_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can update quotes" ON quote_submissions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public can view quotes" ON quote_submissions FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can view all quotes" ON quote_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update quotes" ON quote_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_created_at ON quote_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_email ON quote_submissions(email);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_session_id ON quote_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_quote_submissions_status ON quote_submissions(status);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  role text DEFAULT 'employee' CHECK (role IN ('admin', 'employee', 'sales')),
  is_active boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update users" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Holiday Gallery Photos
CREATE TABLE IF NOT EXISTS holiday_gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  google_drive_file_id text,
  google_drive_folder_id text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE holiday_gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery" ON holiday_gallery_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage gallery" ON holiday_gallery_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_holiday_gallery_display_order ON holiday_gallery_photos(display_order);

-- Fleet Photos
CREATE TABLE IF NOT EXISTS fleet_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fleet_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view fleet" ON fleet_photos FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage fleet" ON fleet_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Chat System
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  assigned_to uuid,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create conversations" ON chat_conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can view conversations" ON chat_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update conversations" ON chat_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'agent')),
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can send messages" ON chat_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can view messages" ON chat_messages FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Newsletter Signups
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  source text,
  brevo_contact_id text,
  subscribed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can signup" ON newsletter_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can view signups" ON newsletter_signups FOR SELECT TO authenticated USING (true);

-- Customer Reviews
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  service_type text,
  review_date date DEFAULT CURRENT_DATE,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  source text,
  created_by uuid,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON customer_reviews FOR SELECT USING (is_approved = true AND deleted = false);
CREATE POLICY "Authenticated can manage reviews" ON customer_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blog System
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage categories" ON blog_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags" ON blog_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tags" ON blog_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author_id uuid,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  publish_date timestamptz,
  meta_title text,
  meta_description text,
  meta_keywords text[],
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT USING (status = 'published' AND (publish_date IS NULL OR publish_date <= now()));
CREATE POLICY "Authenticated can manage posts" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_date ON blog_posts(publish_date DESC);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  template_type text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active templates" ON email_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage templates" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Popup System
CREATE TABLE IF NOT EXISTS popup_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  cta_text text,
  cta_link text,
  background_color text DEFAULT '#ffffff',
  text_color text DEFAULT '#000000',
  button_color text DEFAULT '#3b82f6',
  button_text_color text DEFAULT '#ffffff',
  display_delay integer DEFAULT 3000,
  is_active boolean DEFAULT false,
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE popup_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active popups" ON popup_configs FOR SELECT USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
);
CREATE POLICY "Authenticated can manage popups" ON popup_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS popup_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  config jsonb NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE popup_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage presets" ON popup_presets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS popup_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id uuid NOT NULL REFERENCES popup_configs(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click', 'close')),
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE popup_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can track events" ON popup_analytics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can view analytics" ON popup_analytics FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_popup_analytics_popup_id ON popup_analytics(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_analytics_event_type ON popup_analytics(event_type);

-- Facebook Integration
CREATE TABLE IF NOT EXISTS facebook_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text UNIQUE NOT NULL,
  page_name text NOT NULL,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  auto_post_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE facebook_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage facebook" ON facebook_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS facebook_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid,
  facebook_post_id text,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  error_message text,
  posted_at timestamptz DEFAULT now()
);

ALTER TABLE facebook_post_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view logs" ON facebook_post_logs FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_submissions_updated_at BEFORE UPDATE ON quote_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_popup_configs_updated_at BEFORE UPDATE ON popup_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();