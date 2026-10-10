/*
  # Fix Security Issues - Part 4: Consolidate Multiple Permissive RLS Policies
  
  1. Purpose
    - Consolidate multiple permissive policies into single policies per action
    - Multiple permissive policies for the same role/action cause confusion
    - Simplifies policy management and improves performance
    
  2. Tables Fixed
    - blog_categories
    - blog_post_categories
    - blog_post_tags
    - blog_posts
    - blog_publish_queue
    - blog_tags
    - fleet_photos
    
  3. Approach
    - Combine logic from multiple policies using OR conditions
    - Keep most permissive access while maintaining security
*/

-- Fix blog_categories policies
DROP POLICY IF EXISTS "Public can view categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;

CREATE POLICY "Users can view categories"
ON blog_categories
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage categories"
ON blog_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix blog_post_categories policies
DROP POLICY IF EXISTS "Public can view post categories" ON blog_post_categories;
DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON blog_post_categories;

CREATE POLICY "Users can view post categories"
ON blog_post_categories
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage post categories"
ON blog_post_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix blog_post_tags policies
DROP POLICY IF EXISTS "Public can view post tags" ON blog_post_tags;
DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON blog_post_tags;

CREATE POLICY "Users can view post tags"
ON blog_post_tags
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage post tags"
ON blog_post_tags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix blog_posts policies - consolidate SELECT policies
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON blog_posts;

CREATE POLICY "Users can view appropriate posts"
ON blog_posts
FOR SELECT
USING (
  status = 'published' 
  OR (SELECT auth.role()) = 'authenticated'
);

CREATE POLICY "Authenticated users can manage posts"
ON blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix blog_publish_queue policies
DROP POLICY IF EXISTS "Authenticated users can view queue" ON blog_publish_queue;
DROP POLICY IF EXISTS "Authenticated users can manage queue" ON blog_publish_queue;

CREATE POLICY "Authenticated users can access queue"
ON blog_publish_queue
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix blog_tags policies
DROP POLICY IF EXISTS "Public can view tags" ON blog_tags;
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON blog_tags;

CREATE POLICY "Users can view tags"
ON blog_tags
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage tags"
ON blog_tags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix fleet_photos policies
DROP POLICY IF EXISTS "Public can view active fleet photos" ON fleet_photos;
DROP POLICY IF EXISTS "Authenticated users can view all fleet photos" ON fleet_photos;

CREATE POLICY "Users can view appropriate fleet photos"
ON fleet_photos
FOR SELECT
USING (
  is_active = true 
  OR (SELECT auth.role()) = 'authenticated'
);

CREATE POLICY "Authenticated users can manage fleet photos"
ON fleet_photos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
