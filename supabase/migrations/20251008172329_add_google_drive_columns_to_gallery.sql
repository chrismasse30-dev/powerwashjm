/*
  # Add Google Drive Integration Columns to Holiday Gallery Photos

  1. Changes
    - Add `google_drive_file_id` (text, optional) - For tracking Google Drive imports
    - Add `imported_by` (text, optional) - Email of user who imported the photo
    - Add `import_source` (text, default 'manual') - Source of the photo (manual, google_drive, etc.)

  2. Notes
    - These columns support Google Drive integration and tracking upload sources
    - All columns are optional to maintain backward compatibility
    - `import_source` defaults to 'manual' for existing and new manual uploads
*/

-- Add the missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'google_drive_file_id'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN google_drive_file_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'imported_by'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN imported_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'import_source'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN import_source text DEFAULT 'manual' NOT NULL;
  END IF;
END $$;

-- Create index for Google Drive file ID lookups
CREATE INDEX IF NOT EXISTS idx_holiday_gallery_drive_id ON holiday_gallery_photos(google_drive_file_id);
