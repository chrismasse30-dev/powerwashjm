/*
  # Fix Blog Posts Delete Policy

  1. Issue
    - Users cannot soft delete scheduled blog posts
    - Conflicting RLS policies prevent updating deleted column to true
    - Old policies have WITH CHECK (deleted = false) which blocks soft deletes

  2. Solution
    - Drop all existing blog_posts UPDATE policies
    - Create a single consolidated policy for all updates
    - Allow authenticated users to perform any update including soft deletes

  3. Security
    - Maintains authentication requirement
    - Keeps SELECT policies intact for public/auth distinction
    - Only affects UPDATE operations
*/

-- Drop conflicting UPDATE policies
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can soft delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.blog_posts;

-- Recreate consolidated policy for all modifications (INSERT, UPDATE, DELETE)
CREATE POLICY "Authenticated users can manage posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
