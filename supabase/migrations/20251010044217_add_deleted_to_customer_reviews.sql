/*
  # Add deleted column to customer_reviews table

  1. Changes
    - Add `deleted` boolean column to `customer_reviews` table
    - Default value is false
    - Allow filtering reviews by deleted status for soft delete functionality
  
  2. Purpose
    - Enable soft delete functionality for review management
    - Allow hiding reviews without permanently removing them from database
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_reviews' AND column_name = 'deleted'
  ) THEN
    ALTER TABLE customer_reviews ADD COLUMN deleted boolean DEFAULT false;
  END IF;
END $$;