/*
  # Add Second Design Image URL Column

  1. Changes
    - Add `design_file_url_2` column to store the second design image (Photo 2/Side View)
    - This complements the existing `design_file_url` column (Photo 1/Front View)

  2. Purpose
    QuickMeasure tool uploads two images (Photo 1 and Photo 2), but only one URL
    was being saved. This adds support for saving both image URLs.
*/

-- Add second design image URL column
ALTER TABLE quote_submissions 
ADD COLUMN IF NOT EXISTS design_file_url_2 TEXT;

-- Add comment to document the column
COMMENT ON COLUMN quote_submissions.design_file_url_2 IS 'Public URL to second design image (Photo 2/Side View) from QuickMeasure tool';
