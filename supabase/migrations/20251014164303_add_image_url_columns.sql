/*
  # Add Image URL Columns to Quote Submissions

  1. Changes
    - Add `estimate_image_url` column to store uploaded estimate/property images
    - Add `measurement_design_url` column to store uploaded measurement/design images
    - Both columns are optional (nullable) text fields

  2. Purpose
    These columns will store public URLs from Supabase Storage buckets when users
    upload images for their quote submissions. The imageUploadService will handle
    uploads and automatically populate these fields.
*/

-- Add estimate image URL column (for property photos, estimates, etc.)
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS estimate_image_url TEXT;

-- Add measurement design URL column (for measurement diagrams, designs, etc.)
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS measurement_design_url TEXT;

-- Add comment to document the columns
COMMENT ON COLUMN quote_submissions.estimate_image_url IS 'Public URL to uploaded estimate or property image from Supabase Storage';
COMMENT ON COLUMN quote_submissions.measurement_design_url IS 'Public URL to uploaded measurement or design image from Supabase Storage';
