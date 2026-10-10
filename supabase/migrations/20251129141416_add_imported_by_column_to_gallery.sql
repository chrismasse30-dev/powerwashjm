/*
  # Add imported_by column to holiday_gallery_photos

  1. Changes
    - Add `imported_by` column to track which admin imported/uploaded the image
    
  2. Notes
    - Column is nullable to support existing records
    - Stores email or user identifier of the person who uploaded
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'imported_by'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN imported_by text;
    
    COMMENT ON COLUMN holiday_gallery_photos.imported_by 
    IS 'Email or identifier of admin who imported/uploaded the image';
  END IF;
END $$;