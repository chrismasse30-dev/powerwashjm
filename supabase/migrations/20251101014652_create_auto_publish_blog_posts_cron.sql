/*
  # Create Automated Blog Post Publishing System
  
  1. Purpose
    - Automatically publish blog posts when their scheduled_publish_at time arrives
    - Runs every 5 minutes to check for posts ready to publish
    
  2. How It Works
    - Finds posts with status='scheduled' and scheduled_publish_at <= current time
    - Updates their status to 'published' and sets published_at to the scheduled time
    - Ensures posts publish exactly when intended
    
  3. Cron Schedule
    - Runs every 5 minutes (cron expression pattern)
    - Provides near-real-time publishing (max 5 minute delay)
    
  4. Security
    - Uses database-level function to prevent unauthorized publishing
    - Only affects posts with scheduled status and past scheduled_publish_at
*/

-- Create function to auto-publish scheduled blog posts
CREATE OR REPLACE FUNCTION auto_publish_scheduled_blog_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Schedule the cron job to run every 5 minutes
SELECT cron.schedule(
  'auto-publish-blog-posts',
  '*/5 * * * *',
  'SELECT auto_publish_scheduled_blog_posts();'
);
