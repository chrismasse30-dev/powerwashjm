/*
  # Add Google Drive Integration Columns

  1. Changes
    - Add `google_drive_file_id` column to track original Google Drive file
    - Add `imported_by` column to track which admin imported the image
    - Add `import_source` column to differentiate between upload types

  2. Security
    - No policy changes needed - existing RLS policies apply
*/

ALTER TABLE holiday_gallery_photos
ADD COLUMN IF NOT EXISTS google_drive_file_id text,
ADD COLUMN IF NOT EXISTS imported_by text,
ADD COLUMN IF NOT EXISTS import_source text DEFAULT 'manual_upload';

CREATE INDEX IF NOT EXISTS idx_holiday_gallery_drive_id
ON holiday_gallery_photos(google_drive_file_id);

COMMENT ON COLUMN holiday_gallery_photos.google_drive_file_id
IS 'Original Google Drive file ID for tracking and preventing duplicates';

COMMENT ON COLUMN holiday_gallery_photos.imported_by
IS 'Email of admin who imported the image';

COMMENT ON COLUMN holiday_gallery_photos.import_source
IS 'Source of image: manual_upload, google_drive, or other';
