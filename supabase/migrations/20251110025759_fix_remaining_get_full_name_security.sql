/*
  # Fix Remaining get_full_name Function Security Issue
  
  ## Issue:
  There's a get_full_name(fname, lname, email_name) function variant that doesn't have 
  SECURITY DEFINER or fixed search_path set.
  
  ## Fix:
  Drop and recreate with proper security settings
*/

-- Drop the insecure version
DROP FUNCTION IF EXISTS public.get_full_name(text, text, text);

-- Recreate with proper security settings
CREATE FUNCTION public.get_full_name(fname text, lname text, email_name text)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Return the first non-null value in priority order
  RETURN COALESCE(
    NULLIF(TRIM(fname || ' ' || lname), ''),
    NULLIF(TRIM(fname), ''),
    NULLIF(TRIM(lname), ''),
    email_name,
    'Unknown User'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_full_name(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_full_name(text, text, text) TO anon;