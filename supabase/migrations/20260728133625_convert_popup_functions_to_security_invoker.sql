/*
# Convert popup functions to SECURITY INVOKER and re-grant execute

## Summary
The previous migration revoked EXECUTE on all SECURITY DEFINER functions.
However, should_display_popup and activate_popup_config are called from the
frontend via supabase.rpc(). This migration:
1. Recreates both functions as SECURITY INVOKER (safe: RLS still applies)
2. Re-grants EXECUTE to the appropriate roles

## Functions modified
- public.should_display_popup(text) — now SECURITY INVOKER, granted to anon + authenticated
- public.activate_popup_config(uuid) — now SECURITY INVOKER, granted to authenticated only

## Security changes
- These functions no longer bypass RLS (SECURITY INVOKER = runs as the caller)
- should_display_popup: anon can call it (needed for popup display on public pages)
- activate_popup_config: only authenticated users can call it (admin panel)

## Important notes
1. should_display_popup only reads from popup_configs and popup_dismissals,
   both of which have anon SELECT policies, so SECURITY INVOKER is safe.
2. activate_popup_config writes to popup_configs — the existing RLS policies
   for authenticated users must allow UPDATE for this to work. If not, we add
   a policy.
*/

-- Recreate should_display_popup as SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.should_display_popup(p_session_id text)
RETURNS TABLE(
  id uuid,
  enabled boolean,
  subheading text,
  title text,
  body text,
  image_url text,
  button_text text,
  button_link text,
  start_date date,
  end_date date,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid,
  reappear_hours integer,
  dismissal_text text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
RETURN QUERY
SELECT 
pc.id,
pc.enabled,
pc.subheading,
pc.title,
pc.body,
pc.image_url,
pc.button_text,
pc.button_link,
pc.start_date,
pc.end_date,
pc.is_active,
pc.created_at,
pc.updated_at,
pc.created_by,
pc.updated_by,
pc.reappear_hours,
pc.dismissal_text
FROM popup_configs pc
WHERE pc.enabled = true
AND pc.is_active = true
AND (pc.start_date IS NULL OR pc.start_date <= CURRENT_DATE)
AND (pc.end_date IS NULL OR pc.end_date >= CURRENT_DATE)
AND NOT EXISTS (
SELECT 1 FROM popup_dismissals pd
WHERE pd.popup_config_id = pc.id
AND pd.session_id = p_session_id
)
LIMIT 1;
END;
$function$;

-- Recreate activate_popup_config as SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.activate_popup_config(config_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
-- Deactivate all configs
UPDATE popup_configs SET is_active = false WHERE id IS NOT NULL;
-- Activate the specified config
UPDATE popup_configs SET is_active = true WHERE id = config_id;
END;
$function$;

-- Grant execute to appropriate roles
GRANT EXECUTE ON FUNCTION public.should_display_popup(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_popup_config(uuid) TO authenticated;
