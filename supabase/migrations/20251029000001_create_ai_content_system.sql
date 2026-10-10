/*
  # AI Content Generation System

  1. New Tables
    - `ai_content_generations` - Track all AI-generated content with metrics
    - `ai_prompt_templates` - Versioned prompt templates for different content types
    - `content_variations` - A/B testing variations for blog content
    - `seo_analysis_cache` - Cache SEO analysis results to reduce processing

  2. Security
    - Enable RLS on all tables
    - Authenticated users can view their own generations
    - Public can view active prompt templates
    - Cache is readable by authenticated users

  3. Features
    - Track SEO scores and readability grades
    - Version control for prompts
    - A/B testing support
    - Performance analytics
*/

-- AI Content Generations Table
CREATE TABLE IF NOT EXISTS ai_content_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  generation_type text NOT NULL,
  prompt_used text NOT NULL,
  input_context jsonb,
  generated_content text NOT NULL,
  seo_score integer,
  readability_grade text,
  token_count integer,
  generation_time_ms integer,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  accepted boolean DEFAULT false
);

-- AI Prompt Templates Table
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  template_type text NOT NULL,
  prompt_text text NOT NULL,
  system_instructions text,
  parameters jsonb,
  version integer DEFAULT 1,
  active boolean DEFAULT true,
  performance_avg_seo_score numeric,
  performance_avg_readability text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content Variations Table (A/B Testing)
CREATE TABLE IF NOT EXISTS content_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  variation_name text NOT NULL,
  content text NOT NULL,
  seo_score integer,
  readability_grade text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  ctr numeric,
  is_winner boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- SEO Analysis Cache Table
CREATE TABLE IF NOT EXISTS seo_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash text UNIQUE NOT NULL,
  primary_keyword text,
  analysis_results jsonb NOT NULL,
  seo_score integer NOT NULL,
  readability_grade text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE ai_content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_content_generations
CREATE POLICY "Users can view their own generations"
  ON ai_content_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON ai_content_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON ai_content_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_prompt_templates
CREATE POLICY "Authenticated users can view active templates"
  ON ai_prompt_templates FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Authenticated users can insert templates"
  ON ai_prompt_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON ai_prompt_templates FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for content_variations
CREATE POLICY "Authenticated users can view variations"
  ON content_variations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert variations"
  ON content_variations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update variations"
  ON content_variations FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for seo_analysis_cache
CREATE POLICY "Authenticated users can view cache"
  ON seo_analysis_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cache"
  ON seo_analysis_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_generations_blog_post ON ai_content_generations(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_content_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_type ON ai_prompt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_content_variations_post ON content_variations(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_seo_cache_hash ON seo_analysis_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_seo_cache_expires ON seo_analysis_cache(expires_at);

-- Seed AI Prompt Templates
INSERT INTO ai_prompt_templates (template_name, template_type, prompt_text, system_instructions, parameters) VALUES

('research_template_v1', 'research',
'You are an expert SEO content researcher. Analyze the given topic and provide comprehensive research insights.',
'Provide detailed, actionable research that helps content creators write authoritative blog posts. Focus on SEO opportunities and user intent.',
'{"temperature": 0.5, "maxOutputTokens": 4000}'::jsonb),

('outline_template_v1', 'outline',
'You are an expert blog post strategist. Create comprehensive, SEO-optimized outlines.',
'Generate outlines that are engaging, well-structured, and optimized for search engines. Include keyword placement suggestions.',
'{"temperature": 0.7, "maxOutputTokens": 3000}'::jsonb),

('draft_template_v1', 'draft',
'You are a professional blog writer specializing in engaging, SEO-optimized content.',
'Write high-quality blog posts that are informative, engaging, and optimized for search engines. Use conversational tone while maintaining professionalism. Include proper HTML formatting.',
'{"temperature": 0.8, "maxOutputTokens": 8000}'::jsonb),

('seo_optimize_template_v1', 'seo_optimize',
'You are an SEO optimization specialist. Improve content for maximum search engine visibility.',
'Enhance existing content with better keyword integration, improved structure, and enhanced readability while maintaining the original message.',
'{"temperature": 0.6, "maxOutputTokens": 8000}'::jsonb),

('meta_tags_template_v1', 'meta_tags',
'You are an SEO metadata specialist. Create compelling, optimized meta tags.',
'Generate meta tags that improve click-through rates while being optimized for search engines. Return structured JSON format.',
'{"temperature": 0.5, "maxOutputTokens": 500}'::jsonb),

('rewrite_template_v1', 'rewrite',
'You are a content improvement specialist. Rewrite content to enhance quality and engagement.',
'Improve content clarity, engagement, and SEO optimization while maintaining the core message and HTML structure.',
'{"temperature": 0.7, "maxOutputTokens": 8000}'::jsonb)

ON CONFLICT (template_name) DO NOTHING;
