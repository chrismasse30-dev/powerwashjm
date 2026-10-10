/*
  # Remove Temporary Popup Migration Policy

  1. Changes
    - Remove temporary anonymous insert policy for popup_configs
    - Restore proper security after data migration

  2. Security
    - Removes the temporary migration policy
    - Popup configs remain secure with authenticated policies
*/

DROP POLICY IF EXISTS "Temp popup migration" ON popup_configs;