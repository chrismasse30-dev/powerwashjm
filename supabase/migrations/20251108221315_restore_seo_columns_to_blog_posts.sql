/*
  # Restore Missing SEO Columns to blog_posts Table

  1. Changes
    - Add `author_name` column (text) - stores author's display name
    - Add `schema_markup` column (jsonb) - stores structured data for SEO
    - Add `primary_keyword` column (text) - main SEO keyword for the post
    - Add `secondary_keywords` column (text array) - additional SEO keywords
    - Add `readability_score` column (numeric) - Flesch reading ease score
    - Add `seo_score` column (numeric) - overall SEO optimization score
    - Add `keyword_density` column (jsonb) - keyword frequency analysis
    - Add `last_seo_check` column (timestamptz) - last SEO analysis timestamp
    - Rename `featured_image` back to `featured_image_url` for consistency
    - Add `published_at` column (timestamptz) - original publish timestamp
  
  2. Notes
    - These columns are required for SEO Coach and optimization tools
    - All new columns are nullable to preserve existing data
    - Uses IF NOT EXISTS to prevent errors on re-run
*/

-- Add author_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN author_name text;
  END IF;
END $$;

-- Add schema_markup column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'schema_markup'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN schema_markup jsonb;
  END IF;
END $$;

-- Add primary_keyword column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'primary_keyword'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN primary_keyword text;
  END IF;
END $$;

-- Add secondary_keywords column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'secondary_keywords'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN secondary_keywords text[];
  END IF;
END $$;

-- Add readability_score column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'readability_score'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN readability_score numeric;
  END IF;
END $$;

-- Add seo_score column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'seo_score'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN seo_score numeric;
  END IF;
END $$;

-- Add keyword_density column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'keyword_density'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN keyword_density jsonb;
  END IF;
END $$;

-- Add last_seo_check column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'last_seo_check'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN last_seo_check timestamptz;
  END IF;
END $$;

-- Add published_at column if it doesn't exist (separate from publish_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN published_at timestamptz;
  END IF;
END $$;

-- Rename featured_image to featured_image_url if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'featured_image'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE blog_posts RENAME COLUMN featured_image TO featured_image_url;
  END IF;
END $$;

-- Copy publish_date to published_at for existing records
UPDATE blog_posts 
SET published_at = publish_date 
WHERE published_at IS NULL AND publish_date IS NOT NULL;