/*
  # Create Customer Reviews Table

  1. New Tables
    - `customer_reviews`
      - `id` (uuid, primary key)
      - `customer_name` (text) - Name of the reviewer
      - `review_text` (text) - The review content
      - `star_rating` (integer) - Rating out of 5 (validated to be 5 only)
      - `review_date` (text) - Original date from Google (e.g., "2 months ago")
      - `google_review_data` (jsonb) - Original raw data from Google for reference
      - `is_active` (boolean) - Whether review is displayed on site
      - `created_at` (timestamptz) - When review was added to database
      - `created_by` (uuid) - Admin user who added the review
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `customer_reviews` table
    - Add policy for public SELECT access to active reviews
    - Add policy for authenticated admins to INSERT/UPDATE/DELETE reviews

  3. Indexes
    - Index on `is_active` for efficient filtering
    - Index on `created_at` for sorting
*/

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  review_text text NOT NULL,
  star_rating integer NOT NULL CHECK (star_rating = 5),
  review_date text NOT NULL DEFAULT 'Recently',
  google_review_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active reviews"
  ON customer_reviews
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert reviews"
  ON customer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reviews"
  ON customer_reviews
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_active 
  ON customer_reviews(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_reviews_created 
  ON customer_reviews(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();