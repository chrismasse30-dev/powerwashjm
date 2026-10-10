/*
  # Add Featured Flag to Gallery Photos

  1. Changes
    - Add `is_featured` boolean column to holiday_gallery_photos
    - Set default value to false
    - Create trigger to enforce 20 featured photos limit

  2. Purpose
    - Allow selection of up to 20 photos to display on Holiday Lights homepage
    - Maintain data integrity with trigger
*/

-- Add is_featured column
ALTER TABLE holiday_gallery_photos 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create function to enforce featured limit
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    IF (SELECT COUNT(*) FROM holiday_gallery_photos WHERE is_featured = true AND id != NEW.id) >= 20 THEN
      RAISE EXCEPTION 'Cannot feature more than 20 photos. Please unfeature another photo first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS enforce_featured_limit ON holiday_gallery_photos;

CREATE TRIGGER enforce_featured_limit
  BEFORE INSERT OR UPDATE ON holiday_gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_featured_limit();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_holiday_gallery_photos_featured 
ON holiday_gallery_photos(is_featured) WHERE is_featured = true;
