/*
  # Fix Function Search Path Security Issue
  
  1. Security Improvements
    - Recreate `get_full_name` function with immutable search_path
    - Add explicit schema qualification to prevent search_path attacks
    - Ensures function cannot be exploited via search_path manipulation
  
  2. Changes
    - Drop and recreate function with proper security settings
    - Use fully qualified table names (public.users)
    - Maintain existing functionality while hardening security
  
  3. Notes
    - Function remains SECURITY DEFINER for necessary privilege elevation
    - STABLE characteristic maintained (doesn't modify database)
    - search_path explicitly set and cannot be changed at runtime
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_full_name(uuid);

-- Recreate with hardened security settings
CREATE OR REPLACE FUNCTION public.get_full_name(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE
  full_name text;
BEGIN
  -- Use fully qualified table name for security
  SELECT CONCAT(first_name, ' ', last_name)
  INTO full_name
  FROM public.users
  WHERE id = user_id;

  RETURN COALESCE(full_name, 'Unknown User');
END;
$$;

-- Add comment documenting security hardening
COMMENT ON FUNCTION public.get_full_name(uuid) IS 
'Securely retrieves full name for a user. Uses immutable search_path and fully qualified table names to prevent search_path attacks.';
