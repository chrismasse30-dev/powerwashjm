/*
  # Temporary Policy to Allow FAQ Seeding

  This migration temporarily allows anonymous users to insert town FAQs
  for seeding purposes. This policy should be removed after seeding.
*/

-- Temporarily allow anonymous users to insert FAQs for seeding
CREATE POLICY "Temporary: Allow anon to insert town FAQs for seeding"
  ON town_faqs
  FOR INSERT
  TO anon
  WITH CHECK (true);
