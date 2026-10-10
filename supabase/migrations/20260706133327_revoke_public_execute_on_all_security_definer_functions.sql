-- Revoke EXECUTE from PUBLIC on all SECURITY DEFINER functions in public schema.
-- PostgreSQL grants EXECUTE to PUBLIC by default on new functions, so previous
-- revokes from named roles alone were insufficient.

-- ============================================================
-- TRIGGER FUNCTIONS (invoked by trigger mechanism, not via RPC)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_approve_sold_quotes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_sold_quote() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_holiday_lights_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_sitemap_generation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_page_metadata_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_service_pricing_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_service_showcase_cards_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_site_settings_timestamp() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_status_changed_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_town_faqs_updated_at() FROM PUBLIC;

-- ============================================================
-- CRON / BACKGROUND FUNCTIONS (called by pg_cron scheduler)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.auto_expire_old_quoted_leads() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_publish_scheduled_blog_posts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.retry_failed_confirmation_emails() FROM PUBLIC;

-- ============================================================
-- is_admin() - used in RLS policies, must be callable by authenticated
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- should_display_popup(text) - called from frontend by anon visitors
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.should_display_popup(p_session_id text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.should_display_popup(p_session_id text) TO anon, authenticated;

-- ============================================================
-- ADMIN RPC FUNCTIONS - only accessible to authenticated users
-- (further guarded by is_admin() checks inside the function)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.activate_popup_config(config_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_popup_config(config_id uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.search_quote_submissions(search_term text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_quote_submissions(search_term text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_full_name(fname text, lname text, email_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_full_name(fname text, lname text, email_name text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_full_name() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_full_name() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_full_name(user_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_full_name(user_id uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_abandoned_form_quotes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_abandoned_form_quotes() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(page_slug text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_page_lastmod(page_slug text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_page_lastmod(page_slugs text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_page_lastmod(page_slugs text[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_all_service_pages_lastmod() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_all_service_pages_lastmod() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_all_town_pages_lastmod() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_all_town_pages_lastmod() TO authenticated;