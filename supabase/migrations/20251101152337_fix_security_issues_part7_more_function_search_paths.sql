/*
  # Fix Security Issues - Part 7: More Function Search Paths
  
  1. Purpose
    - Continue fixing search_path on remaining functions
    
  2. Functions Fixed
    - generate_blog_slug
    - increment_blog_view_count
    - set_holiday_lights_status
    - increment_blog_view_count_unique
    - should_send_abandoned_email
*/

-- Fix generate_blog_slug
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug = regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$;

-- Fix increment_blog_view_count
CREATE OR REPLACE FUNCTION increment_blog_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = NEW.slug;
  RETURN NEW;
END;
$$;

-- Fix set_holiday_lights_status
CREATE OR REPLACE FUNCTION set_holiday_lights_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.display_order IS NOT NULL THEN
    NEW.is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix increment_blog_view_count_unique
CREATE OR REPLACE FUNCTION increment_blog_view_count_unique()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

-- Fix should_send_abandoned_email
CREATE OR REPLACE FUNCTION should_send_abandoned_email(quote_record quote_submissions)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    quote_record.is_submitted = false
    AND quote_record.abandoned_email_sent = false
    AND quote_record.email IS NOT NULL
    AND quote_record.email != ''
    AND quote_record.deleted = false
    AND (quote_record.created_at < NOW() - INTERVAL '30 minutes')
  );
END;
$$;
