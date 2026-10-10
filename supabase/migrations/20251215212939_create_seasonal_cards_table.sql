/*
  # Create Seasonal Cards Management System

  1. New Tables
    - `seasonal_cards`
      - `id` (uuid, primary key)
      - `card_position` (text) - 'left' or 'right' to identify which card
      - `title` (text) - Title for the card (e.g., "Power Washing", "Holiday Lights")
      - `subtitle` (text) - Subtitle text shown at top of section
      - `description` (text) - Main description paragraph
      - `link_url` (text) - URL the card links to
      - `image_url` (text) - Main card image URL
      - `bullet_point_1` (text) - First bullet point text
      - `bullet_point_2` (text) - Second bullet point text
      - `bullet_point_3` (text) - Third bullet point text
      - `is_active` (boolean) - Whether this card is currently active
      - `border_color` (text) - Tailwind class for border color
      - `gradient_from` (text) - Tailwind class for gradient start
      - `gradient_to` (text) - Tailwind class for gradient end
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `seasonal_cards` table
    - Add policy for anonymous users to read active cards
    - Add policy for authenticated users to manage cards
*/

-- Create seasonal cards table
CREATE TABLE IF NOT EXISTS seasonal_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_position text NOT NULL CHECK (card_position IN ('left', 'right')),
  title text NOT NULL DEFAULT 'Power Washing',
  subtitle text NOT NULL DEFAULT 'Power Washing & Holiday Lights',
  description text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '/house-washing',
  image_url text NOT NULL DEFAULT '',
  bullet_point_1 text NOT NULL DEFAULT '',
  bullet_point_2 text NOT NULL DEFAULT '',
  bullet_point_3 text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  border_color text DEFAULT 'border-blue-100',
  gradient_from text DEFAULT 'from-blue-50',
  gradient_to text DEFAULT 'to-white',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seasonal_cards ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous users to read active cards
CREATE POLICY "Anyone can view active seasonal cards"
  ON seasonal_cards
  FOR SELECT
  USING (is_active = true);

-- Policy for authenticated users to view all cards
CREATE POLICY "Authenticated users can view all seasonal cards"
  ON seasonal_cards
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert cards
CREATE POLICY "Authenticated users can insert seasonal cards"
  ON seasonal_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update cards
CREATE POLICY "Authenticated users can update seasonal cards"
  ON seasonal_cards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete cards
CREATE POLICY "Authenticated users can delete seasonal cards"
  ON seasonal_cards
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_seasonal_cards_active ON seasonal_cards(is_active, card_position);
CREATE INDEX IF NOT EXISTS idx_seasonal_cards_position ON seasonal_cards(card_position);

-- Insert default cards
INSERT INTO seasonal_cards (card_position, title, subtitle, description, link_url, image_url, bullet_point_1, bullet_point_2, bullet_point_3, border_color, gradient_from, gradient_to, is_active)
VALUES
  (
    'left',
    'Power Washing',
    'Power Washing & Holiday Lights',
    'Professional exterior cleaning services using top-of-the-line equipment and environmentally-safe products. We remove algae, mold, and mildew while preventing maintenance and repair costs.',
    '/house-washing',
    '/beforeandafter/housewashbeforeandafter.png',
    'Vinyl & Cedar Siding Cleaning',
    'Wood Restoration & Staining',
    'Can increase home value up to 10%',
    'border-blue-100',
    'from-blue-50',
    'to-white',
    true
  ),
  (
    'right',
    'Holiday Lights',
    'Power Washing & Holiday Lights',
    'Skip the ladder and let the professionals handle your holiday lighting. From design to installation, maintenance, and removal—we provide a complete, hassle-free service that makes your home shine all season long.',
    '/holiday-lights',
    '/rihouselightswithlogo.png',
    'Full-service design and installation',
    'Professional removal and storage',
    'Commercial-grade lighting options',
    'border-red-100',
    'from-red-50',
    'to-white',
    true
  )
ON CONFLICT DO NOTHING;