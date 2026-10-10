/*
  # Create Blog Post Versions Table for Version History
  
  1. New Tables
    - `blog_post_versions`
      - `id` (uuid, primary key) - Unique version ID
      - `original_post_id` (uuid, foreign key) - References the original blog post
      - `version_number` (integer) - Sequential version number
      - `title` (text) - Post title at time of version
      - `slug` (text) - Post slug at time of version
      - `content` (text) - Full content at time of version
      - `excerpt` (text) - Excerpt at time of version
      - `author_name` (text) - Author at time of version
      - `featured_image_url` (text) - Featured image at time of version
      - `status` (text) - Status at time of version
      - `meta_description` (text) - Meta description at time of version
      - `primary_keyword` (text) - Primary keyword at time of version
      - `seo_score` (integer) - SEO score at time of version
      - `schema_markup` (jsonb) - Schema markup at time of version
      - `created_at_original` (timestamptz) - Original post creation date
      - `archived_at` (timestamptz) - When this version was archived
      
  2. Security
    - Enable RLS on `blog_post_versions` table
    - Add policies for authenticated users to:
      - View all versions of posts
      - Create new versions (system-generated)
      - Restore versions (update original post)
    
  3. Indexes
    - Index on `original_post_id` for fast lookups
    - Index on `version_number` for sorting
    - Composite index on (original_post_id, version_number) for efficient queries
    
  4. Constraints
    - Foreign key to blog_posts table
    - Unique constraint on (original_post_id, version_number)
*/

-- Create blog_post_versions table
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  author_name text,
  featured_image_url text,
  status text DEFAULT 'draft',
  meta_description text,
  primary_keyword text,
  seo_score integer DEFAULT 0,
  schema_markup jsonb,
  created_at_original timestamptz,
  archived_at timestamptz DEFAULT now(),
  
  -- Ensure unique version numbers per post
  CONSTRAINT unique_post_version UNIQUE (original_post_id, version_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_original_id 
  ON blog_post_versions(original_post_id);

CREATE INDEX IF NOT EXISTS idx_blog_post_versions_version_number 
  ON blog_post_versions(version_number);

CREATE INDEX IF NOT EXISTS idx_blog_post_versions_archived_at 
  ON blog_post_versions(archived_at DESC);

-- Enable Row Level Security
ALTER TABLE blog_post_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all versions
CREATE POLICY "Authenticated users can view all versions"
  ON blog_post_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create versions (for backups)
CREATE POLICY "Authenticated users can create versions"
  ON blog_post_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can delete versions
CREATE POLICY "Authenticated users can delete versions"
  ON blog_post_versions
  FOR DELETE
  TO authenticated
  USING (true);

-- Add helpful comment
COMMENT ON TABLE blog_post_versions IS 'Stores historical versions of blog posts for backup and recovery purposes';
