/*
  # Fix Security Issues - Part 2: RLS Policy Performance
  
  1. Purpose
    - Optimize RLS policies by preventing re-evaluation of auth functions
    - Replace auth.uid() with (SELECT auth.uid()) to cache result per query
    
  2. Tables Fixed
    - password_reset_audit
    - ai_content_generations
    
  3. Performance Impact
    - Significantly reduces query execution time at scale
    - Auth function evaluated once per query instead of per row
*/

-- Fix password_reset_audit RLS policies
DROP POLICY IF EXISTS "Admins can read password reset audit logs" ON password_reset_audit;

CREATE POLICY "Admins can read password reset audit logs"
ON password_reset_audit
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.email = (SELECT auth.jwt()->>'email')
    AND users.role = 'admin'
  )
);

-- Fix ai_content_generations RLS policies
DROP POLICY IF EXISTS "Users can view their own generations" ON ai_content_generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON ai_content_generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON ai_content_generations;

CREATE POLICY "Users can view their own generations"
ON ai_content_generations
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own generations"
ON ai_content_generations
FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own generations"
ON ai_content_generations
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
