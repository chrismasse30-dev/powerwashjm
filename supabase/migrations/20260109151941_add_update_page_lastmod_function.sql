/*
  # Add Helper Function to Update Page Last Modified Date

  1. Creates a function to easily update last_modified dates
  2. Allows updating single or multiple pages at once
  3. Automatically triggers sitemap regeneration

  Usage:
    SELECT update_page_lastmod('/instant-estimate');
    SELECT update_page_lastmod(ARRAY['/house-washing', '/roof-cleaning']);
*/

-- Function to update last_modified for a single page
CREATE OR REPLACE FUNCTION update_page_lastmod(page_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE page_metadata
  SET last_modified = now(),
      updated_at = now()
  WHERE slug = page_slug;

  IF NOT FOUND THEN
    RAISE NOTICE 'Page % not found in page_metadata table', page_slug;
  END IF;
END;
$$;

-- Function to update last_modified for multiple pages
CREATE OR REPLACE FUNCTION update_page_lastmod(page_slugs text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE page_metadata
  SET last_modified = now(),
      updated_at = now()
  WHERE slug = ANY(page_slugs);
END;
$$;

-- Function to update ALL service pages at once
CREATE OR REPLACE FUNCTION update_all_service_pages_lastmod()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE page_metadata
  SET last_modified = now(),
      updated_at = now()
  WHERE page_type = 'service';
END;
$$;

-- Function to update ALL town pages at once
CREATE OR REPLACE FUNCTION update_all_town_pages_lastmod()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE page_metadata
  SET last_modified = now(),
      updated_at = now()
  WHERE page_type = 'town';
END;
$$;

COMMENT ON FUNCTION update_page_lastmod(text) IS 'Update last_modified date for a single page';
COMMENT ON FUNCTION update_page_lastmod(text[]) IS 'Update last_modified date for multiple pages';
COMMENT ON FUNCTION update_all_service_pages_lastmod() IS 'Update last_modified for all service pages';
COMMENT ON FUNCTION update_all_town_pages_lastmod() IS 'Update last_modified for all town pages';
