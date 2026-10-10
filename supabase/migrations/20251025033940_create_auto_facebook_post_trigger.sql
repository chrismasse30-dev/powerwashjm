/*
  # Auto-Post to Facebook Trigger

  ## Overview
  Automatically triggers Facebook posting when a blog post status changes to 'published'

  ## Changes
  1. Creates a function that calls the post-to-facebook Edge Function
  2. Creates a trigger on blog_posts table that fires when status changes to 'published'

  ## Security
  - Uses service role to call Edge Function
  - Only triggers on actual status changes (not updates where status was already published)

  ## Notes
  - Trigger fires AFTER UPDATE to ensure blog post is fully saved
  - Only triggers when status changes FROM something else TO 'published'
  - Uses pg_net extension to call Edge Function asynchronously
*/

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to post to Facebook when blog is published
CREATE OR REPLACE FUNCTION trigger_facebook_post()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
  service_key text;
  payload jsonb;
BEGIN
  -- Only proceed if status changed to 'published' from another status
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    
    -- Get the Supabase URL and service key from environment
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/post-to-facebook';
    service_key := current_setting('app.settings.supabase_service_key', true);
    
    -- Prepare payload
    payload := jsonb_build_object(
      'blogPostId', NEW.id,
      'blogPostTitle', NEW.title,
      'blogPostSlug', NEW.slug,
      'forcePost', false
    );
    
    -- Make async HTTP request to Edge Function
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := payload
    );
    
    -- Log the trigger
    RAISE NOTICE 'Triggered Facebook post for blog: % (ID: %)', NEW.title, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on blog_posts table
DROP TRIGGER IF EXISTS auto_post_to_facebook ON blog_posts;
CREATE TRIGGER auto_post_to_facebook
  AFTER INSERT OR UPDATE OF status ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_facebook_post();