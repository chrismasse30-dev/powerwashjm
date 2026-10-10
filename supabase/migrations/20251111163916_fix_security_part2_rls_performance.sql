/*
  # Fix Security Issues - Part 2: RLS Performance

  1. RLS Policy Optimization
    - Fix ai_content_generations policies to use (select auth.uid())
    - Prevents re-evaluation of auth.uid() for each row
    - Improves query performance at scale
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own generations" ON ai_content_generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON ai_content_generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON ai_content_generations;

-- Recreate with optimized pattern
CREATE POLICY "Users can view their own generations"
  ON ai_content_generations
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own generations"
  ON ai_content_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own generations"
  ON ai_content_generations
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
