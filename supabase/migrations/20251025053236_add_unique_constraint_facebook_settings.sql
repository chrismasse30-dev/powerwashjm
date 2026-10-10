/*
  # Add unique constraint to facebook_settings table

  This migration adds a unique constraint to ensure only one row exists in the facebook_settings table.
  
  1. Changes
    - Adds a unique constraint on facebook_page_id to prevent duplicate entries
    - This enforces the singleton pattern for Facebook settings
  
  2. Security
    - No RLS changes needed (existing policies remain in place)
*/

-- Add unique constraint to facebook_page_id to prevent duplicates
ALTER TABLE facebook_settings 
ADD CONSTRAINT facebook_settings_page_id_unique 
UNIQUE (facebook_page_id);
