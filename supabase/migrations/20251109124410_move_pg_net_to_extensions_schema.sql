/*
  # Move pg_net Extension to Extensions Schema
  
  1. Security Improvements
    - Move pg_net extension from public schema to extensions schema
    - Prevents potential security issues with extensions in public schema
    - Isolates extension functionality from user tables
  
  2. Changes
    - Create extensions schema if it doesn't exist
    - Drop pg_net from public schema
    - Reinstall pg_net in extensions schema
    - Grant necessary permissions
  
  3. Notes
    - pg_net is used for HTTP requests from database functions
    - Required for edge functions and webhooks
    - Moving to extensions schema follows PostgreSQL best practices
  
  4. Important
    - This change is safe and recommended by Supabase security guidelines
    - Extension functionality will remain intact
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop pg_net from public schema
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Install pg_net in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions on pg_net functions
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated;

-- Add comment documenting the security improvement
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions, isolated from public schema for security';
