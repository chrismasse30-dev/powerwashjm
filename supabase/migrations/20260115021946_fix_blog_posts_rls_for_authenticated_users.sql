/*
  # Fix Blog Posts RLS Policies for Authenticated Users
  
  1. Changes
    - Allow all authenticated users to insert blog posts
    - Allow all authenticated users to update blog posts
    - Allow all authenticated users to delete blog posts
    - Keep public read access for published posts
  
  2. Security
    - Authenticated users can manage all blog content
    - Anonymous users can only view published posts
*/

-- Drop existing restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;

-- Allow authenticated users to insert blog posts
CREATE POLICY "Authenticated users can insert blog posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update blog posts
CREATE POLICY "Authenticated users can update blog posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete blog posts
CREATE POLICY "Authenticated users can delete blog posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- Ensure public can read published posts (recreate if missing)
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR (SELECT auth.uid()) IS NOT NULL);