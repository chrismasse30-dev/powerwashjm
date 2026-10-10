/*
  # Add google_review_data column to customer_reviews

  1. Changes
    - Add `google_review_data` jsonb column to store raw Google review data
    - This allows storing the complete review information including photos, response data, etc.

  2. Notes
    - Uses jsonb for flexible storage of Google's review structure
    - Nullable to support manually entered reviews without Google data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'google_review_data'
  ) THEN
    ALTER TABLE customer_reviews ADD COLUMN google_review_data jsonb;
  END IF;
END $$;
