/*
  # Add Reappear Hours to Popup Presets

  1. Changes
    - Add `reappear_hours` column to `popup_presets` table
    - Default value: 24 hours
    - Add check constraint to ensure value is between 1-24
  
  2. Purpose
    - Allows presets to store timer configuration
    - Ensures consistency between configs and presets
*/

-- Add reappear_hours column to popup_presets
ALTER TABLE popup_presets 
ADD COLUMN IF NOT EXISTS reappear_hours integer DEFAULT 24 NOT NULL;

-- Add check constraint
ALTER TABLE popup_presets
ADD CONSTRAINT check_preset_reappear_hours_range 
CHECK (reappear_hours >= 1 AND reappear_hours <= 24);

-- Update existing records
UPDATE popup_presets 
SET reappear_hours = 24 
WHERE reappear_hours IS NULL;
