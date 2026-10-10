/*
  # Seed Service Showcase Cards

  Seeds the 6 service cards visible in the homepage "See the Difference" section:
  1. House Washing
  2. Roof Cleaning
  3. Driveway Cleaning
  4. Deck Restoration
  5. Concrete Wash
  6. Commercial

  These cards will rotate daily to keep the homepage fresh.
*/

INSERT INTO service_showcase_cards (service_name, service_slug, image_url, display_order, is_active)
VALUES
  ('House Washing', '/house-washing', '/homepagehouse.png', 1, true),
  ('Roof Cleaning', '/roof-cleaning', '/roofcleaning.png', 2, true),
  ('Driveway Cleaning', '/concrete-cleaning', '/drivewaywash.png', 3, true),
  ('Deck Restoration', '/deck-cleaning', '/Deck Restoration.png', 4, true),
  ('Concrete Wash', '/concrete-cleaning', '/ConcreteWash.png', 5, true),
  ('Commercial', '/commercial', '/commerical.png', 6, true)
ON CONFLICT DO NOTHING;