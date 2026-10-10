/*
# Revoke EXECUTE on SECURITY DEFINER functions from public roles

## Summary
Fixes security issue where SECURITY DEFINER functions are callable via the
PostgREST `/rest/v1/rpc/` endpoint by anon and/or authenticated roles.
These functions are meant to be called only by triggers, pg_cron jobs, or
admin users — not directly from the public API.

## Changes

### Trigger/internal functions — revoke from BOTH anon AND authenticated
These are only fired by database triggers or pg_cron. No client should call them:
- set_holiday_lights_status()
- notify_sold_quote()
- update_page_metadata_updated_at()
- update_service_pricing_updated_at()
- update_service_showcase_cards_updated_at()
- update_site_settings_timestamp()
- update_status_changed_at()
- update_town_faqs_updated_at()
- update_updated_at_column()
- trigger_sitemap_generation()
- auto_approve_sold_quotes()
- auto_expire_old_quoted_leads()
- auto_publish_scheduled_blog_posts()
- retry_failed_confirmation_emails()
- get_abandoned_form_quotes()

### Admin RPC functions — revoke from anon only (authenticated admins need these)
- activate_popup_config(uuid)
- search_quote_submissions(text)
- get_full_name() (all overloads)
- is_admin()
- update_all_service_pages_lastmod()
- update_all_town_pages_lastmod()
- update_page_lastmod(text)
- update_page_lastmod(text[])

### Kept accessible to anon
- should_display_popup(text) — frontend visitors need this to check popup display

## Security
- Prevents unauthorized execution of privileged functions via the REST API
- Triggers and cron jobs are unaffected (they run as table owner / superuser)
- RLS policies referencing is_admin() still work for authenticated users

## Important Notes
1. Trigger functions execute as the trigger owner regardless of EXECUTE grants
2. pg_cron runs as the database owner and bypasses EXECUTE checks
3. is_admin() must remain executable by authenticated for RLS policy evaluation
*/

-- ============================================================
-- PART 1: Trigger/cron functions — revoke from BOTH roles
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.set_holiday_lights_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_sold_quote() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_page_metadata_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_service_pricing_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_service_showcase_cards_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_site_settings_timestamp() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_status_changed_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_town_faqs_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sitemap_generation() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_approve_sold_quotes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_expire_old_quoted_leads() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_publish_scheduled_blog_posts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.retry_failed_confirmation_emails() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_abandoned_form_quotes() FROM anon, authenticated;

-- ============================================================
-- PART 2: Admin RPC functions — revoke from anon only
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.activate_popup_config(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.search_quote_submissions(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_full_name() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_full_name(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_full_name(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_all_service_pages_lastmod() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_all_town_pages_lastmod() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(text[]) FROM anon;
