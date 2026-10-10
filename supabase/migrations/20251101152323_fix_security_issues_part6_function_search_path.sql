/*
  # Fix Security Issues - Part 6: Fix Function Search Path
  
  1. Purpose
    - Set immutable search_path on security-critical functions
    - Prevents search_path manipulation attacks
    - Ensures functions always reference correct schema
    
  2. Functions Fixed
    - All functions with mutable search_path
    - Sets search_path to 'public, pg_temp'
    
  3. Security Impact
    - Prevents schema injection attacks
    - Ensures consistent function behavior
    - Hardens security posture
*/

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_site_settings_timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_blog_updated_at
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_facebook_updated_at
CREATE OR REPLACE FUNCTION update_facebook_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix auto_publish_scheduled_blog_posts
CREATE OR REPLACE FUNCTION auto_publish_scheduled_blog_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blog_posts
  SET 
    status = 'published',
    published_at = scheduled_publish_at,
    updated_at = NOW()
  WHERE 
    status = 'scheduled'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW()
    AND deleted = false;
END;
$$;
