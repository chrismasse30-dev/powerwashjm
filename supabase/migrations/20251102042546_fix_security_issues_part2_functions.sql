/*
  # Fix Security Issues - Part 2: Function Search Paths

  Fix mutable search_path issues in security definer functions
*/

-- ============================================================================
-- FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Drop and recreate generate_blog_slug with fixed search_path
DROP FUNCTION IF EXISTS generate_blog_slug(TEXT);

CREATE FUNCTION generate_blog_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to lowercase and replace spaces with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and add counter if needed
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Drop and recreate increment_blog_view_count with fixed search_path
DROP FUNCTION IF EXISTS increment_blog_view_count(TEXT);

CREATE FUNCTION increment_blog_view_count(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = post_slug;
END;
$$;

-- Drop and recreate increment_blog_view_count_unique with fixed search_path
DROP FUNCTION IF EXISTS increment_blog_view_count_unique(TEXT, TEXT);

CREATE FUNCTION increment_blog_view_count_unique(post_slug TEXT, viewer_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only increment if this viewer hasn't viewed this post yet
  IF NOT EXISTS (
    SELECT 1 FROM blog_post_views
    WHERE slug = post_slug AND viewer_identifier = viewer_id
  ) THEN
    -- Record the view
    INSERT INTO blog_post_views (slug, viewer_identifier)
    VALUES (post_slug, viewer_id)
    ON CONFLICT (slug, viewer_identifier) DO NOTHING;
    
    -- Increment the counter
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE slug = post_slug;
  END IF;
END;
$$;

-- Drop and recreate should_send_abandoned_email with fixed search_path
DROP FUNCTION IF EXISTS should_send_abandoned_email(UUID);

CREATE FUNCTION should_send_abandoned_email(submission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  submission_record RECORD;
BEGIN
  -- Get the submission details
  SELECT * INTO submission_record
  FROM quote_submissions
  WHERE id = submission_id;
  
  -- Don't send if submission not found
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Don't send if email already sent
  IF submission_record.abandoned_email_sent THEN
    RETURN FALSE;
  END IF;
  
  -- Don't send if form was completed
  IF submission_record.form_completed THEN
    RETURN FALSE;
  END IF;
  
  -- Only send if at least 30 minutes have passed since last update
  IF NOW() - submission_record.updated_at < INTERVAL '30 minutes' THEN
    RETURN FALSE;
  END IF;
  
  -- Only send if less than 48 hours have passed (don't spam old submissions)
  IF NOW() - submission_record.created_at > INTERVAL '48 hours' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION generate_blog_slug(TEXT) IS 
  'Generates URL-safe slug from blog post title with uniqueness check. SECURITY DEFINER with fixed search_path.';

COMMENT ON FUNCTION increment_blog_view_count(TEXT) IS 
  'Increments view count for a blog post by slug. SECURITY DEFINER with fixed search_path.';

COMMENT ON FUNCTION increment_blog_view_count_unique(TEXT, TEXT) IS 
  'Increments view count only if viewer has not viewed this post before. SECURITY DEFINER with fixed search_path.';

COMMENT ON FUNCTION should_send_abandoned_email(UUID) IS 
  'Determines if abandoned form email should be sent for a quote submission. SECURITY DEFINER with fixed search_path.';
