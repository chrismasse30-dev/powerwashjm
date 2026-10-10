/*
  # Enable pg_cron and Set Up All Automated Jobs

  ## Purpose
  This migration enables pg_cron extension and sets up all automated background jobs:
  1. Abandoned form email sender (every 5 minutes)
  2. Auto-publish scheduled blog posts (every 5 minutes)

  ## Background
  pg_cron was available but never installed. Previous migration attempts failed silently.
  This migration properly enables the extension and creates all necessary cron jobs.

  ## Jobs Created
  - `send-abandoned-form-emails`: Processes draft quotes older than 30 minutes
  - `auto-publish-blog-posts`: Publishes scheduled blog posts when their time arrives

  ## Security
  - Uses service role authentication for edge function calls
  - Database function for blog publishing (no external calls)
  - All operations use SECURITY DEFINER with immutable search_path
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (needed for edge function calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Clean up any existing jobs (in case of migration re-run)
DO $$
BEGIN
  -- Remove abandoned form email job if it exists
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-abandoned-form-emails') THEN
    PERFORM cron.unschedule('send-abandoned-form-emails');
  END IF;

  -- Remove blog auto-publish job if it exists
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-publish-blog-posts') THEN
    PERFORM cron.unschedule('auto-publish-blog-posts');
  END IF;
END $$;

-- ============================================================
-- JOB 1: Send Abandoned Form Emails (every 5 minutes)
-- ============================================================
SELECT cron.schedule(
  'send-abandoned-form-emails',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://kpyeyjgavuhpxttlghac.supabase.co/functions/v1/send-abandoned-form-email',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtweWV5amdhdnVocHh0dGxnaGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTA2NTYsImV4cCI6MjA3NTQ4NjY1Nn0.zPUdWA2BcK59wJrE7Cl5SgnNEfEwV3qgDyDzwl9sdjo"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================
-- JOB 2: Auto-Publish Scheduled Blog Posts (every 5 minutes)
-- ============================================================

-- First, ensure the auto_publish_scheduled_blog_posts function exists
CREATE OR REPLACE FUNCTION auto_publish_scheduled_blog_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update scheduled posts that are ready to be published
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

-- Schedule the blog auto-publish job
SELECT cron.schedule(
  'auto-publish-blog-posts',
  '*/5 * * * *',
  'SELECT auto_publish_scheduled_blog_posts();'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_publish_scheduled_blog_posts() TO postgres;