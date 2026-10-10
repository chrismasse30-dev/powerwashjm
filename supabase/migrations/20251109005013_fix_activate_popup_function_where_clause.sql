/*
  # Fix activate_popup_config Function WHERE Clause

  ## Problem
  The activate_popup_config function is failing with "UPDATE requires a WHERE clause" error.
  The function needs to deactivate all configs but the database requires a WHERE clause.

  ## Solution
  Add a WHERE clause to the UPDATE statement that will match all rows.

  ## Changes
  1. Drop and recreate activate_popup_config function with proper WHERE clause
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS activate_popup_config(UUID);

-- Recreate with proper WHERE clause
CREATE OR REPLACE FUNCTION activate_popup_config(config_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Deactivate all configs (use WHERE true to satisfy the WHERE clause requirement)
  UPDATE popup_configs SET is_active = false WHERE id IS NOT NULL;
  
  -- Activate the specified config
  UPDATE popup_configs SET is_active = true WHERE id = config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
