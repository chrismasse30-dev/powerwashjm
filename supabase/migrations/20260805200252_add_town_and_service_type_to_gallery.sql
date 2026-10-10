/*
# Add town and service_type columns to holiday_gallery_photos

1. Modified Tables
   - `holiday_gallery_photos`
     - `town` (text, nullable) — the town slug this photo is associated with (e.g. 'warwick-ri')
     - `service_type` (text, nullable) — the service category (e.g. 'holiday-lights', 'roofline', 'trees-shrubs')

2. New Indexes
   - `idx_gallery_photos_town` on `town` for fast per-town lookups
   - `idx_gallery_photos_service_type` on `service_type` for filtering

3. Notes
   - Both columns are nullable so existing photos continue working without changes.
   - Admins can tag photos with a town to display them on the corresponding town page.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'town'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN town text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'holiday_gallery_photos' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE holiday_gallery_photos ADD COLUMN service_type text DEFAULT 'holiday-lights';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_photos_town ON holiday_gallery_photos(town);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_service_type ON holiday_gallery_photos(service_type);
