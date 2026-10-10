/*
# Revoke public EXECUTE on all SECURITY DEFINER functions

## Summary
Revokes EXECUTE permissions from anon and authenticated roles on all
SECURITY DEFINER functions in the public schema that should not be
callable directly via the REST API (/rest/v1/rpc/...).

## Functions affected
- public.should_display_popup(p_session_id text) — revoke from anon + authenticated
- public.activate_popup_config(config_id uuid) — revoke from authenticated
- public.get_abandoned_form_quotes() — revoke from authenticated
- public.get_full_name() — revoke from authenticated
- public.get_full_name(fname text, lname text, email_name text) — revoke from authenticated
- public.get_full_name(user_id uuid) — revoke from authenticated
- public.is_admin() — revoke from authenticated
- public.search_quote_submissions(search_term text) — revoke from authenticated
- public.update_all_service_pages_lastmod() — revoke from authenticated
- public.update_all_town_pages_lastmod() — revoke from authenticated
- public.update_page_lastmod(page_slug text) — revoke from authenticated
- public.update_page_lastmod(page_slugs text[]) — revoke from authenticated

## Security changes
- All listed functions can no longer be invoked via PostgREST RPC endpoints.
- They remain callable internally (triggers, other functions, service_role).

## Important notes
1. These functions are used internally by triggers or other server-side code.
   Revoking public EXECUTE does not break internal usage.
2. The should_display_popup function is also revoked from anon since anonymous
   users should not call SECURITY DEFINER functions directly.
*/

-- Revoke from both anon and authenticated
REVOKE EXECUTE ON FUNCTION public.should_display_popup(text) FROM anon, authenticated;

-- Revoke from authenticated
REVOKE EXECUTE ON FUNCTION public.activate_popup_config(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_abandoned_form_quotes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_full_name() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_full_name(text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_full_name(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_quote_submissions(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_all_service_pages_lastmod() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_all_town_pages_lastmod() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(text[]) FROM anon, authenticated;
