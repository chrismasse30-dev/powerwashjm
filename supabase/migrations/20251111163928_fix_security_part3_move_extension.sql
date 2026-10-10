/*
  # Fix Security Issues - Part 3: Move Extension

  1. Extension Management
    - Move pg_trgm extension from public to extensions schema
    - Best practice to keep extensions in dedicated schema
*/

-- Move pg_trgm extension to extensions schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_trgm' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    DROP EXTENSION IF EXISTS pg_trgm CASCADE;
    CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
  ELSE
    CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
  END IF;
END $$;
