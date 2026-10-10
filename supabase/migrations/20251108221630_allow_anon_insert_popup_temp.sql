/*
  # Temporarily Allow Anonymous Inserts for Popup Migration

  1. Changes
    - Add temporary policy to allow anonymous inserts for popup_configs
    - Needed for data migration from old database

  2. Security
    - Temporary policy only
    - Will be removed after migration
*/

DROP POLICY IF EXISTS "Temp popup migration" ON popup_configs;

CREATE POLICY "Temp popup migration"
  ON popup_configs
  FOR INSERT
  TO anon
  WITH CHECK (true);