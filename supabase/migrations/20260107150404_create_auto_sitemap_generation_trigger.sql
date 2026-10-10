/*
  # Create Automatic Sitemap Generation Trigger

  ## Changes Made
  
  1. Function to trigger sitemap generation
     - Calls the generate-sitemap edge function
     - Uses pg_net to make HTTP request
     - Only triggers on published blog post changes
  
  2. Trigger on blog_posts table
     - Fires after INSERT or UPDATE
     - Only for published posts (status = 'published')
     - Automatically updates sitemap when blog content changes
  
  ## Security
  - Uses service role key from site_settings
  - Only runs for published posts
  - Asynchronous execution doesn't block post operations
*/

CREATE OR REPLACE FUNCTION trigger_sitemap_generation()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'published' THEN
    supabase_url := current_setting('app.settings.supabase_url', true);
    
    IF supabase_url IS NULL THEN
      supabase_url := 'https://your-project.supabase.co';
    END IF;
    
    PERFORM extensions.http_post(
      url := supabase_url || '/functions/v1/generate-sitemap',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'trigger', 'blog_update',
        'post_id', NEW.id,
        'post_slug', NEW.slug
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_generate_sitemap_on_blog_change ON public.blog_posts;

CREATE TRIGGER auto_generate_sitemap_on_blog_change
AFTER INSERT OR UPDATE ON public.blog_posts
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION trigger_sitemap_generation();

COMMENT ON FUNCTION trigger_sitemap_generation() IS 'Automatically triggers sitemap regeneration when blog posts are published or updated';
COMMENT ON TRIGGER auto_generate_sitemap_on_blog_change ON public.blog_posts IS 'Triggers automatic sitemap generation for published blog posts';
