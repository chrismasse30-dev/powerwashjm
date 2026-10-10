/*
  # Fix Service Showcase Cards Security Issues

  1. Performance Improvements
    - Fix RLS policy to use subquery for auth.uid()
    - Add search_path to trigger function for security
    - Remove unused index

  2. Policy Optimization
    - Consolidate multiple permissive SELECT policies into one restrictive policy
*/

-- Drop the existing policies
DROP POLICY IF EXISTS "Anyone can view active service showcase cards" ON service_showcase_cards;
DROP POLICY IF EXISTS "Admins can manage service showcase cards" ON service_showcase_cards;

-- Create optimized policies using subqueries
CREATE POLICY "Anyone can view active service showcase cards"
  ON service_showcase_cards
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all service showcase cards"
  ON service_showcase_cards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
      AND users.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (SELECT auth.uid())
      AND users.role = 'admin'
      AND users.deleted_at IS NULL
    )
  );

-- Remove unused index
DROP INDEX IF EXISTS idx_service_showcase_order;

-- Fix trigger function search_path
DROP TRIGGER IF EXISTS set_service_showcase_cards_updated_at ON service_showcase_cards;
DROP FUNCTION IF EXISTS update_service_showcase_cards_updated_at();

CREATE OR REPLACE FUNCTION update_service_showcase_cards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_service_showcase_cards_updated_at
  BEFORE UPDATE ON service_showcase_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_service_showcase_cards_updated_at();