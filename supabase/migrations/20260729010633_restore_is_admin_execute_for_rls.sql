/*
# Restore EXECUTE on is_admin() for authenticated role

## Summary
Re-grants EXECUTE on public.is_admin() to the authenticated role.
A prior migration revoked this permission to prevent direct RPC calls,
but this broke all RLS policies that reference is_admin() because
RLS policies evaluate in the calling role's security context.

## Security changes
- GRANT EXECUTE ON public.is_admin() TO authenticated
- The function remains SECURITY DEFINER (runs as postgres), so it
  can still read the users table regardless of caller permissions.
- Direct RPC calls to is_admin() are harmless -- the function only
  returns a boolean indicating whether the caller is an admin.

## Tables affected (policies using is_admin())
- facebook_settings (INSERT, UPDATE, DELETE)
- google_business_settings
- google_business_reviews
- google_business_post_logs
- newsletter_signups
- popup_configs
- quote_submissions
- site_settings
- holiday_gallery_photos
- email_templates
- fleet_photos
- page_metadata
- customer_reviews

## Important notes
1. Without this grant, any authenticated user attempting a write
   operation on the above tables gets a permission denied error
   when the RLS policy tries to evaluate is_admin().
2. is_admin() is SECURITY DEFINER so granting EXECUTE does not
   expose the users table -- it only allows the function to be called.
*/

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
