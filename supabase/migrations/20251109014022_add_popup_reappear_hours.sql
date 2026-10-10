/*
  # Add Reappear Hours Timer to Popup Management

  1. Changes
    - Add `reappear_hours` column to `popup_configs` table
    - Default value: 24 hours
    - Allows values from 1 to 24
    - Add check constraint to ensure value is between 1-24
  
  2. Purpose
    - Prevents popup from showing again to same visitor within specified hours
    - Configurable timer from 1-24 hours
    - Improves user experience by controlling popup frequency
*/

-- Add reappear_hours column to popup_configs
ALTER TABLE popup_configs 
ADD COLUMN IF NOT EXISTS reappear_hours integer DEFAULT 24 NOT NULL;

-- Add check constraint to ensure value is between 1-24
ALTER TABLE popup_configs
ADD CONSTRAINT check_reappear_hours_range 
CHECK (reappear_hours >= 1 AND reappear_hours <= 24);

-- Update existing records to have default value
UPDATE popup_configs 
SET reappear_hours = 24 
WHERE reappear_hours IS NULL;
