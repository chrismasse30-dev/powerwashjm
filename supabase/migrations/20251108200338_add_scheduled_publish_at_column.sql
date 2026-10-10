-- Add scheduled_publish_at column to blog_posts table

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN blog_posts.scheduled_publish_at IS 'Timestamp when a scheduled post should be automatically published';
