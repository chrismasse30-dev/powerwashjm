/*
  # Fix Security Issues - Part 1: Indexes and Policies

  1. Add missing foreign key indexes
  2. Fix RLS policies
  3. Consolidate duplicate policies
*/

-- ============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- ai_content_generations.user_id
CREATE INDEX IF NOT EXISTS idx_ai_content_generations_user_id 
ON ai_content_generations(user_id);

-- blog_posts.author_id
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id 
ON blog_posts(author_id);

-- email_template_versions.changed_by
CREATE INDEX IF NOT EXISTS idx_email_template_versions_changed_by 
ON email_template_versions(changed_by);

-- email_templates.created_by
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by 
ON email_templates(created_by);

-- email_templates.updated_by
CREATE INDEX IF NOT EXISTS idx_email_templates_updated_by 
ON email_templates(updated_by);

-- ============================================================================
-- PART 2: FIX AUTH RLS INITIALIZATION
-- ============================================================================

-- Fix password_reset_audit RLS policy to use SELECT subquery
DROP POLICY IF EXISTS "Admins can read password reset audit logs" ON password_reset_audit;

CREATE POLICY "Admins can read password reset audit logs"
  ON password_reset_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- PART 3: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- ============================================================================

-- blog_categories: Merge two SELECT policies
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Users can view categories" ON blog_categories;

CREATE POLICY "Authenticated users can read categories"
  ON blog_categories FOR SELECT
  TO authenticated
  USING (true);

-- blog_post_categories: Merge two SELECT policies  
DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON blog_post_categories;
DROP POLICY IF EXISTS "Users can view post categories" ON blog_post_categories;

CREATE POLICY "Authenticated users can read post categories"
  ON blog_post_categories FOR SELECT
  TO authenticated
  USING (true);

-- blog_post_tags: Merge two SELECT policies
DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON blog_post_tags;
DROP POLICY IF EXISTS "Users can view post tags" ON blog_post_tags;

CREATE POLICY "Authenticated users can read post tags"
  ON blog_post_tags FOR SELECT
  TO authenticated
  USING (true);

-- blog_posts: Merge two SELECT policies
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view appropriate posts" ON blog_posts;

CREATE POLICY "Authenticated users can read posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

-- blog_tags: Merge two SELECT policies
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON blog_tags;
DROP POLICY IF EXISTS "Users can view tags" ON blog_tags;

CREATE POLICY "Authenticated users can read tags"
  ON blog_tags FOR SELECT
  TO authenticated
  USING (true);

-- fleet_photos: Consolidate all duplicate policies
DROP POLICY IF EXISTS "Authenticated users can delete fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can manage fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can insert fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can update fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Users can view appropriate fleet photos" ON fleet_photos;

-- Recreate with single, clear policies per action
CREATE POLICY "Authenticated users can select fleet photos"
  ON fleet_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert fleet photos"
  ON fleet_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fleet photos"
  ON fleet_photos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fleet photos"
  ON fleet_photos FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to document security definer views
COMMENT ON VIEW abandoned_email_monitoring IS 
  'SECURITY DEFINER view to allow monitoring abandoned emails. Uses SECURITY DEFINER to bypass RLS for monitoring purposes. Access controlled by view permissions.';

COMMENT ON VIEW quote_status_health IS 
  'SECURITY DEFINER view to provide health metrics for quote submissions. Uses SECURITY DEFINER to aggregate data across all rows. Access controlled by view permissions.';
