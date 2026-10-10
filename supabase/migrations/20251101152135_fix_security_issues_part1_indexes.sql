/*
  # Fix Security Issues - Part 1: Foreign Key Indexes
  
  1. Purpose
    - Add missing indexes on foreign key columns for optimal query performance
    - Foreign keys without indexes can cause table scans and poor performance
    
  2. Indexes Added
    - blog_post_categories.category_id
    - blog_post_tags.tag_id
    - blog_publish_queue.post_id
    - customer_reviews.created_by
    - quote_submissions.duplicate_of_id
    
  3. Performance Impact
    - Significantly improves JOIN performance
    - Reduces query execution time
    - Prevents full table scans on foreign key lookups
*/

-- Add index for blog_post_categories.category_id
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category_id 
ON blog_post_categories(category_id);

-- Add index for blog_post_tags.tag_id
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id 
ON blog_post_tags(tag_id);

-- Add index for blog_publish_queue.post_id
CREATE INDEX IF NOT EXISTS idx_blog_publish_queue_post_id 
ON blog_publish_queue(post_id);

-- Add index for customer_reviews.created_by
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_by 
ON customer_reviews(created_by);

-- Add index for quote_submissions.duplicate_of_id
CREATE INDEX IF NOT EXISTS idx_quote_submissions_duplicate_of_id 
ON quote_submissions(duplicate_of_id);
