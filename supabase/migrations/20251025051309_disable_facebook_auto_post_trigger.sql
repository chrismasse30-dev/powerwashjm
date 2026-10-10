/*
  # Disable Facebook Auto-Post Trigger

  ## Overview
  Temporarily disables the automatic Facebook posting trigger that's preventing blog posts from being saved.

  ## Changes
  1. Drops the auto_post_to_facebook trigger
  2. Drops the trigger_facebook_post function

  ## Reason
  - The trigger was causing blog post saves to fail with 400 errors
  - Missing configuration settings for net.http_post()
  - Facebook posting can be done manually from the Blog Management page instead

  ## Notes
  - This allows blog posts to be created and published without errors
  - Manual Facebook posting functionality remains available
*/

-- Drop the trigger
DROP TRIGGER IF EXISTS auto_post_to_facebook ON blog_posts;

-- Drop the function
DROP FUNCTION IF EXISTS trigger_facebook_post();
