/*
  # SEO Optimization Features Database Schema

  1. New Tables
    - `blog_seo_analytics` - Track SEO scores and performance metrics
    - `keyword_suggestions` - Store keyword research and optimization data
    - `internal_link_suggestions` - AI-powered internal linking recommendations
    - `blog_post_views` - Track unique views for accurate analytics
    - `competitive_analysis` - Store competitor content analysis

  2. New Columns
    - `blog_posts.schema_markup` - JSON-LD structured data
    - `blog_posts.primary_keyword` - Main target keyword
    - `blog_posts.secondary_keywords` - Additional keywords
    - `blog_posts.readability_score` - Flesch Reading Ease score
    - `blog_posts.seo_score` - Overall SEO score

  3. Security
    - Enable RLS on all new tables
    - Appropriate policies for authenticated users
*/

-- ==========================================
-- Add SEO columns to blog_posts
-- ==========================================

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS schema_markup jsonb,
  ADD COLUMN IF NOT EXISTS primary_keyword text,
  ADD COLUMN IF NOT EXISTS secondary_keywords text[],
  ADD COLUMN IF NOT EXISTS readability_score numeric,
  ADD COLUMN IF NOT EXISTS seo_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS keyword_density jsonb,
  ADD COLUMN IF NOT EXISTS last_seo_check timestamptz;

-- ==========================================
-- Blog SEO Analytics Table
-- ==========================================

CREATE TABLE IF NOT EXISTS blog_seo_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  seo_score integer NOT NULL DEFAULT 0,
  score_breakdown jsonb DEFAULT '{}',
  features_used text[] DEFAULT '{}',
  time_to_publish interval,
  revision_count integer DEFAULT 0,
  organic_traffic_30d integer DEFAULT 0,
  avg_position numeric,
  clicks_30d integer DEFAULT 0,
  impressions_30d integer DEFAULT 0,
  ctr numeric,
  measured_at timestamptz DEFAULT now()
);

ALTER TABLE blog_seo_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_seo_analytics_authenticated_all"
  ON blog_seo_analytics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_seo_analytics_score ON blog_seo_analytics(seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON blog_seo_analytics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_post ON blog_seo_analytics(blog_post_id);

-- ==========================================
-- Keyword Suggestions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS keyword_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  primary_keyword text NOT NULL,
  secondary_keywords text[] DEFAULT '{}',
  search_volume integer,
  keyword_difficulty integer,
  current_density numeric,
  optimal_density numeric,
  placement_suggestions jsonb DEFAULT '{}',
  lsi_keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE keyword_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "keyword_suggestions_authenticated_all"
  ON keyword_suggestions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_keyword_suggestions_post ON keyword_suggestions(blog_post_id);

-- ==========================================
-- Internal Link Suggestions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS internal_link_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  target_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  anchor_text_suggestion text NOT NULL,
  relevance_score numeric DEFAULT 0,
  seo_value numeric DEFAULT 0,
  context_snippet text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE internal_link_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "internal_link_suggestions_authenticated_all"
  ON internal_link_suggestions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_link_suggestions_source ON internal_link_suggestions(source_post_id);
CREATE INDEX IF NOT EXISTS idx_link_suggestions_target ON internal_link_suggestions(target_post_id);
CREATE INDEX IF NOT EXISTS idx_link_suggestions_status ON internal_link_suggestions(status);

-- ==========================================
-- Blog Post Views Table (Unique tracking)
-- ==========================================

CREATE TABLE IF NOT EXISTS blog_post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  slug text NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_post_views_anon_insert"
  ON blog_post_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "blog_post_views_authenticated_all"
  ON blog_post_views
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blog_views_slug_date ON blog_post_views(slug, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_views_post_date ON blog_post_views(blog_post_id, viewed_at DESC);

-- ==========================================
-- Competitive Analysis Table
-- ==========================================

CREATE TABLE IF NOT EXISTS competitive_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  target_keyword text NOT NULL,
  top_ranking_urls text[] DEFAULT '{}',
  average_word_count integer,
  average_heading_count integer,
  common_topics text[] DEFAULT '{}',
  content_gaps text[] DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  analysis_data jsonb DEFAULT '{}',
  analyzed_at timestamptz DEFAULT now()
);

ALTER TABLE competitive_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitive_analysis_authenticated_all"
  ON competitive_analysis
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_competitive_analysis_post ON competitive_analysis(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_keyword ON competitive_analysis(target_keyword);

-- ==========================================
-- Functions for SEO Operations
-- ==========================================

-- Function to increment unique view count
CREATE OR REPLACE FUNCTION increment_blog_view_count_unique(
  post_slug text,
  viewer_ip text DEFAULT NULL,
  user_agent_str text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  post_id_var uuid;
BEGIN
  -- Get post ID from slug
  SELECT id INTO post_id_var FROM blog_posts WHERE slug = post_slug AND status = 'published' AND deleted = false;

  IF post_id_var IS NULL THEN
    RETURN;
  END IF;

  -- Only increment if this view hasn't been counted in last 24 hours
  IF NOT EXISTS (
    SELECT 1 FROM blog_post_views
    WHERE blog_post_id = post_id_var
      AND (viewer_ip IS NULL OR ip_address = viewer_ip)
      AND viewed_at > now() - interval '24 hours'
  ) THEN
    -- Log the view
    INSERT INTO blog_post_views (blog_post_id, slug, ip_address, user_agent, viewed_at)
    VALUES (post_id_var, post_slug, viewer_ip, user_agent_str, now());

    -- Increment counter
    UPDATE blog_posts
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = post_id_var;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate SEO score
CREATE OR REPLACE FUNCTION calculate_blog_seo_score(post_id_param uuid)
RETURNS integer AS $$
DECLARE
  post_record RECORD;
  score integer := 0;
BEGIN
  SELECT * INTO post_record FROM blog_posts WHERE id = post_id_param;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Title checks (20 points)
  IF post_record.title IS NOT NULL AND LENGTH(post_record.title) >= 10 THEN
    score := score + 10;
  END IF;
  IF LENGTH(post_record.title) <= 60 THEN
    score := score + 10;
  END IF;

  -- Excerpt checks (10 points)
  IF post_record.excerpt IS NOT NULL AND LENGTH(post_record.excerpt) >= 50 THEN
    score := score + 10;
  END IF;

  -- Content checks (20 points)
  IF LENGTH(post_record.content) >= 500 THEN
    score := score + 10;
  END IF;
  IF post_record.content ~ '<h2>' THEN
    score := score + 10;
  END IF;

  -- Featured image (10 points)
  IF post_record.featured_image_url IS NOT NULL AND post_record.featured_image_url != '' THEN
    score := score + 10;
  END IF;

  -- Meta description (10 points)
  IF post_record.meta_description IS NOT NULL AND LENGTH(post_record.meta_description) >= 120 THEN
    score := score + 10;
  END IF;

  -- Schema markup (10 points)
  IF post_record.schema_markup IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Keywords (10 points)
  IF post_record.primary_keyword IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Readability (10 points)
  IF post_record.readability_score IS NOT NULL AND post_record.readability_score >= 60 THEN
    score := score + 10;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update SEO scores for all posts
CREATE OR REPLACE FUNCTION update_all_seo_scores()
RETURNS void AS $$
DECLARE
  post_record RECORD;
  calculated_score integer;
BEGIN
  FOR post_record IN SELECT id FROM blog_posts WHERE deleted = false LOOP
    calculated_score := calculate_blog_seo_score(post_record.id);

    UPDATE blog_posts
    SET seo_score = calculated_score,
        last_seo_check = now()
    WHERE id = post_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
