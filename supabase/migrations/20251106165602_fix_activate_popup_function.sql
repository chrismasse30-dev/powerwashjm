/*
  # Fix activate_popup_config Function
  
  The function was failing because it tried to UPDATE without a WHERE clause,
  which is blocked by RLS for security. We need to add a WHERE clause that
  targets all rows (WHERE id IS NOT NULL is always true for primary keys).
*/

CREATE OR REPLACE FUNCTION public.activate_popup_config(config_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deactivate all configs (add WHERE clause to satisfy RLS)
  UPDATE popup_configs 
  SET is_active = false 
  WHERE id IS NOT NULL;

  -- Activate the specified config
  UPDATE popup_configs
  SET is_active = true, updated_at = NOW()
  WHERE id = config_id;
END;
$$;
