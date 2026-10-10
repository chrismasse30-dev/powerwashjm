/*
  # Add Fleet Washing Page Metadata

  1. Changes
    - Adds Fleet Washing service page to page_metadata table for sitemap tracking
    - Sets appropriate priority (0.8) for service page
    - Configures monthly change frequency
*/

INSERT INTO page_metadata (slug, last_modified, change_frequency, priority, page_type)
VALUES ('/commercial/fleet-washing', now(), 'monthly', 0.8, 'service')
ON CONFLICT (slug) DO UPDATE SET
  last_modified = now(),
  updated_at = now();