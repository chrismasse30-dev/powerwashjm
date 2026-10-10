/*
  # Fix Blog Posts Anonymous Access
  
  1. Problem
    - Blog posts cannot be fetched by anonymous users
    - Prerendering script fails because it runs as anonymous
    - Public blog page cannot display posts to visitors
  
  2. Solution
    - Add RLS policy to allow anonymous users to read published blog posts
    - Only published and non-deleted posts are accessible
  
  3. Security
    - Anonymous users can only SELECT (read)
    - Only posts with status='published' and deleted=false
    - No ability to insert, update, or delete
*/

-- Allow anonymous users to read published blog posts
CREATE POLICY "Anonymous users can read published posts"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (
    status = 'published' 
    AND deleted = false
  );
