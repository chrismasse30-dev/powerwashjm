/*
  # Fix Security Issues - Part 8: Final Function Search Paths
  
  1. Purpose
    - Fix remaining functions with mutable search_path
    
  2. Functions Fixed
    - calculate_blog_seo_score
    - detect_quote_duplicates (detection function, not trigger)
    - update_all_seo_scores
    - check_featured_limit
*/

-- Fix calculate_blog_seo_score (keep original parameter name)
CREATE OR REPLACE FUNCTION calculate_blog_seo_score(post_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  score integer := 0;
  post_record blog_posts%ROWTYPE;
BEGIN
  SELECT * INTO post_record FROM blog_posts WHERE id = post_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  IF post_record.meta_title IS NOT NULL AND length(post_record.meta_title) BETWEEN 50 AND 60 THEN
    score := score + 20;
  END IF;
  
  IF post_record.meta_description IS NOT NULL AND length(post_record.meta_description) BETWEEN 150 AND 160 THEN
    score := score + 20;
  END IF;
  
  IF post_record.primary_keyword IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  IF post_record.featured_image_url IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  IF length(post_record.content) > 1000 THEN
    score := score + 15;
  END IF;
  
  IF post_record.schema_markup IS NOT NULL THEN
    score := score + 20;
  END IF;
  
  RETURN score;
END;
$$;

-- Fix detect_quote_duplicates (keep original TABLE return type)
CREATE OR REPLACE FUNCTION detect_quote_duplicates()
RETURNS TABLE(email_address text, record_count bigint, master_id uuid, duplicate_ids text, has_submitted boolean, has_draft boolean, severity text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH duplicates AS (
    SELECT 
      qs.email,
      COUNT(*) as cnt,
      ARRAY_AGG(qs.id ORDER BY 
        CASE WHEN qs.is_submitted THEN 1 ELSE 2 END,
        qs.created_at DESC
      ) as all_ids,
      BOOL_OR(qs.is_submitted) as submitted_exists,
      BOOL_OR(NOT qs.is_submitted AND NOT qs.deleted) as draft_exists
    FROM quote_submissions qs
    WHERE qs.email IS NOT NULL 
      AND qs.email != ''
      AND qs.deleted = false
      AND qs.duplicate_of_id IS NULL
    GROUP BY qs.email
    HAVING COUNT(*) > 1
  )
  SELECT 
    d.email::TEXT,
    d.cnt::BIGINT,
    d.all_ids[1] as master_id,
    array_to_string(d.all_ids[2:array_length(d.all_ids, 1)], ',') as duplicate_ids,
    d.submitted_exists,
    d.draft_exists,
    CASE 
      WHEN d.submitted_exists AND d.draft_exists THEN 'CRITICAL'
      WHEN d.cnt > 2 THEN 'HIGH'
      ELSE 'MEDIUM'
    END::TEXT as severity
  FROM duplicates d;
END;
$$;

-- Fix update_all_seo_scores
CREATE OR REPLACE FUNCTION update_all_seo_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT id FROM blog_posts WHERE deleted = false
  LOOP
    UPDATE blog_posts
    SET seo_score = calculate_blog_seo_score(post_record.id)
    WHERE id = post_record.id;
  END LOOP;
END;
$$;

-- Fix check_featured_limit
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  featured_count integer;
BEGIN
  IF NEW.featured = true THEN
    SELECT COUNT(*) INTO featured_count
    FROM holiday_gallery_photos
    WHERE featured = true
      AND id != NEW.id;
    
    IF featured_count >= 6 THEN
      RAISE EXCEPTION 'Maximum of 6 featured photos allowed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
