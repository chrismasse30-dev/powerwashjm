/*
  # Fix Holiday Gallery Featured Photo Trigger
  
  1. Issue
    - Trigger function references incorrect column name 'featured'
    - Actual column name is 'is_featured'
    - This causes 400 errors when inserting new gallery photos
  
  2. Changes
    - Update check_featured_limit() function to use correct column name
    - Change 'featured' to 'is_featured' throughout function
*/

-- Drop and recreate the function with correct column name
CREATE OR REPLACE FUNCTION public.check_featured_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  featured_count integer;
BEGIN
  IF NEW.is_featured = true THEN
    SELECT COUNT(*) INTO featured_count
    FROM holiday_gallery_photos
    WHERE is_featured = true
    AND id != NEW.id;

    IF featured_count >= 20 THEN
      RAISE EXCEPTION 'Maximum of 20 featured photos allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
