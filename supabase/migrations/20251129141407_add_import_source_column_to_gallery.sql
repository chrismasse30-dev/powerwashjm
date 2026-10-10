/*
  # Add import_source column to holiday_gallery_photos

  1. Changes
    - Add `import_source` column to track the source of uploaded images (manual, google_drive, etc.)
    - Set default value to 'manual' for backward compatibility
    
  2. Notes
    - Column is nullable to support existing records
    - Allows tracking where images come from for better organization
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'import_source'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN import_source text DEFAULT 'manual';
    
    COMMENT ON COLUMN holiday_gallery_photos.import_source 
    IS 'Source of image: manual, google_drive, or other';
  END IF;
END $$;