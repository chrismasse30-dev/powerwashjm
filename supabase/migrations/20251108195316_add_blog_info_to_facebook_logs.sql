-- Add blog post title and URL to facebook_post_logs

ALTER TABLE facebook_post_logs
ADD COLUMN IF NOT EXISTS blog_post_title TEXT,
ADD COLUMN IF NOT EXISTS blog_post_url TEXT,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1;

-- Update any existing logs to pull data from blog_posts
UPDATE facebook_post_logs fpl
SET 
  blog_post_title = bp.title,
  blog_post_url = 'https://powerwashjm.com/blog/' || bp.slug
FROM blog_posts bp
WHERE fpl.blog_post_id = bp.id
AND fpl.blog_post_title IS NULL;
