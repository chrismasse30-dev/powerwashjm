/*
  # Create Town FAQs System

  1. New Tables
    - `town_faqs`
      - `id` (uuid, primary key)
      - `town_slug` (text, references town pages)
      - `question` (text, the FAQ question)
      - `answer` (text, the FAQ answer)
      - `display_order` (integer, for ordering FAQs)
      - `is_active` (boolean, to enable/disable FAQs)
      - `category` (text, optional grouping like 'services', 'pricing', 'scheduling')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `town_faqs` table
    - Add policy for public read access (anonymous users can view active FAQs)
    - Add policy for authenticated admin users to manage FAQs

  3. Indexes
    - Index on town_slug for fast lookups
    - Index on is_active and display_order for efficient queries
*/

-- Create town_faqs table
CREATE TABLE IF NOT EXISTS town_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  town_slug text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE town_faqs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_town_faqs_town_slug ON town_faqs(town_slug);
CREATE INDEX IF NOT EXISTS idx_town_faqs_active_order ON town_faqs(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_town_faqs_category ON town_faqs(category);

-- RLS Policies
-- Allow anonymous users to read active FAQs
CREATE POLICY "Anyone can view active town FAQs"
  ON town_faqs
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Allow authenticated users to read all FAQs
CREATE POLICY "Authenticated users can view all town FAQs"
  ON town_faqs
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert FAQs
CREATE POLICY "Authenticated users can insert town FAQs"
  ON town_faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update FAQs
CREATE POLICY "Authenticated users can update town FAQs"
  ON town_faqs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete FAQs
CREATE POLICY "Authenticated users can delete town FAQs"
  ON town_faqs
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_town_faqs_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_town_faqs_updated_at ON town_faqs;
CREATE TRIGGER set_town_faqs_updated_at
  BEFORE UPDATE ON town_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_town_faqs_updated_at();