/*
  # Consolidate Town FAQs to Top 8 for Maximum SEO Impact
  
  This migration:
  1. Removes all existing town FAQs
  2. Adds exactly 8 carefully selected FAQs per town for maximum SEO impact
  
  The 8 FAQs selected prioritize:
  - High search volume keywords (cost, services)
  - Local SEO (service areas, neighborhoods)
  - Conversion optimization (free estimates, financing)
  - Trust signals (credentials, popular services)
*/

-- First, delete all existing town FAQs
DELETE FROM town_faqs;

-- Insert the top 8 SEO-optimized FAQs for all 46 towns
DO $$
DECLARE
  town_record RECORD;
  towns_data JSON := '[
    {"slug": "warwick-ri", "name": "Warwick", "state": "RI", "neighborhoods": "Conimicut, Cowesett, and Apponaug"},
    {"slug": "cranston-ri", "name": "Cranston", "state": "RI", "neighborhoods": "Meshanticut, Oaklawn, and Knightsville"},
    {"slug": "providence-ri", "name": "Providence", "state": "RI", "neighborhoods": "Federal Hill, East Side, and College Hill"},
    {"slug": "pawtucket-ri", "name": "Pawtucket", "state": "RI", "neighborhoods": "Darlington, Fairlawn, and Slater Park"},
    {"slug": "woonsocket-ri", "name": "Woonsocket", "state": "RI", "neighborhoods": "Bernon Heights, Main St mills, and Social district"},
    {"slug": "north-smithfield-ri", "name": "North Smithfield", "state": "RI", "neighborhoods": "Primrose, Slatersville, and Greene St"},
    {"slug": "cumberland-ri", "name": "Cumberland", "state": "RI", "neighborhoods": "Diamond Hill, Monastery, and Valley Falls"},
    {"slug": "lincoln-ri", "name": "Lincoln", "state": "RI", "neighborhoods": "Limerock, Albion, and Manville"},
    {"slug": "smithfield-ri", "name": "Smithfield", "state": "RI", "neighborhoods": "Greenville, Stillwater, and Esmond"},
    {"slug": "attleboro-ma", "name": "Attleboro", "state": "MA", "neighborhoods": "South Attleboro, Briggs Corner, and Capron Park"},
    {"slug": "franklin-ma", "name": "Franklin", "state": "MA", "neighborhoods": "Horizon Estates, Summer Heights, and Dean College"},
    {"slug": "mansfield-ma", "name": "Mansfield", "state": "MA", "neighborhoods": "East Mansfield, Mansfield Crossing, and West Mansfield"},
    {"slug": "north-attleboro-ma", "name": "North Attleboro", "state": "MA", "neighborhoods": "Falls Pond, Old Town, and Plainville Line"},
    {"slug": "seekonk-ma", "name": "Seekonk", "state": "MA", "neighborhoods": "North Seekonk, Golf Course, and Route 6"},
    {"slug": "east-providence-ri", "name": "East Providence", "state": "RI", "neighborhoods": "Riverside, Rumford, and Kent Heights"},
    {"slug": "johnston-ri", "name": "Johnston", "state": "RI", "neighborhoods": "Simmonsville, Graniteville, and Manton"},
    {"slug": "north-providence-ri", "name": "North Providence", "state": "RI", "neighborhoods": "Centerdale, Fruit Hill, and Geneva"},
    {"slug": "coventry-ri", "name": "Coventry", "state": "RI", "neighborhoods": "Tiogue Lake, Anthony, and Quidnick"},
    {"slug": "west-warwick-ri", "name": "West Warwick", "state": "RI", "neighborhoods": "Arctic, Crompton, and Phenix"},
    {"slug": "bristol-ri", "name": "Bristol", "state": "RI", "neighborhoods": "Hope St, Colt State Park, and Downtown"},
    {"slug": "barrington-ri", "name": "Barrington", "state": "RI", "neighborhoods": "Hampden Meadows, Nayatt, and Rumstick"},
    {"slug": "east-greenwich-ri", "name": "East Greenwich", "state": "RI", "neighborhoods": "Hill & Harbour, Middle Rd, and Main St"},
    {"slug": "tiverton-ri", "name": "Tiverton", "state": "RI", "neighborhoods": "North Tiverton, Stone Bridge, and Fogland Beach"},
    {"slug": "north-kingstown-ri", "name": "North Kingstown", "state": "RI", "neighborhoods": "Wickford, Saunderstown, and Quonset"},
    {"slug": "scituate-ri", "name": "Scituate", "state": "RI", "neighborhoods": "North Scituate, Clayville, and Hope Furnace"},
    {"slug": "glocester-ri", "name": "Glocester", "state": "RI", "neighborhoods": "Chepachet, Harmony, and Putnam Pike"},
    {"slug": "west-greenwich-ri", "name": "West Greenwich", "state": "RI", "neighborhoods": "Nooseneck, Hopkins Hill, and Plain Rd"},
    {"slug": "foster-ri", "name": "Foster", "state": "RI", "neighborhoods": "Moosup Valley, Foster Center, and Mount Hygeia"},
    {"slug": "burrillville-ri", "name": "Burrillville", "state": "RI", "neighborhoods": "Pascoag, Harrisville, and Wallum Lake"},
    {"slug": "central-falls-ri", "name": "Central Falls", "state": "RI", "neighborhoods": "Broad St, Roosevelt Ave, and Downtown Mills"},
    {"slug": "rehoboth-ma", "name": "Rehoboth", "state": "MA", "neighborhoods": "North Rehoboth, Anawan, and Perryville"},
    {"slug": "norton-ma", "name": "Norton", "state": "MA", "neighborhoods": "Norton Center, Chartley, and Wheaton College"},
    {"slug": "blackstone-ma", "name": "Blackstone", "state": "MA", "neighborhoods": "Blackstone Village, Millerville, and Canal District"},
    {"slug": "millville-ma", "name": "Millville", "state": "MA", "neighborhoods": "Millville Center, Route 122, and Blackstone River"},
    {"slug": "uxbridge-ma", "name": "Uxbridge", "state": "MA", "neighborhoods": "Uxbridge Center, North Uxbridge, and Wheelockville"},
    {"slug": "douglas-ma", "name": "Douglas", "state": "MA", "neighborhoods": "Douglas Center, East Douglas, and Wallum Lake"},
    {"slug": "northbridge-ma", "name": "Northbridge", "state": "MA", "neighborhoods": "Whitinsville, Rockdale, and Linwood"},
    {"slug": "grafton-ma", "name": "Grafton", "state": "MA", "neighborhoods": "Grafton Center, South Grafton, and Hassanamisco"},
    {"slug": "sutton-ma", "name": "Sutton", "state": "MA", "neighborhoods": "Sutton Center, Wilkinsonville, and West Sutton"},
    {"slug": "millbury-ma", "name": "Millbury", "state": "MA", "neighborhoods": "Millbury Center, West Millbury, and Route 20"},
    {"slug": "shrewsbury-ma", "name": "Shrewsbury", "state": "MA", "neighborhoods": "Shrewsbury Center, Oak Hill, and Edgemere"},
    {"slug": "bellingham-ma", "name": "Bellingham", "state": "MA", "neighborhoods": "Bellingham Center, South Bellingham, and Lake Street"},
    {"slug": "wrentham-ma", "name": "Wrentham", "state": "MA", "neighborhoods": "Wrentham Center, Sheldonville, and Outlets District"},
    {"slug": "plainville-ma", "name": "Plainville", "state": "MA", "neighborhoods": "Plainville Center, Route 1, and South Street"},
    {"slug": "foxboro-ma", "name": "Foxboro", "state": "MA", "neighborhoods": "Foxboro Center, Lakeview, and Foxboro Stadium"},
    {"slug": "swansea-ma", "name": "Swansea", "state": "MA", "neighborhoods": "Luther''s Corner, Ocean Grove, and Mount Hope Bay"}
  ]'::JSON;
BEGIN
  FOR town_record IN SELECT * FROM json_populate_recordset(null::record, towns_data) AS (slug text, name text, state text, neighborhoods text)
  LOOP
    -- Insert exactly 8 SEO-optimized FAQs per town
    INSERT INTO town_faqs (town_slug, question, answer, display_order, is_active, category) VALUES
    
    -- FAQ 1: Services (High keyword density, describes all offerings)
    (
      town_record.slug,
      'What power washing services does J&M offer in ' || town_record.name || '?',
      'J&M offers comprehensive power washing services throughout ' || town_record.name || ', ' || town_record.state || ', including house washing (soft wash method that''s safe for all siding types), roof cleaning (removes black streaks, algae, and moss without damaging shingles), driveway and concrete cleaning, deck and fence restoration, gutter cleaning, and commercial property cleaning. We serve all of ' || town_record.name || ' including ' || town_record.neighborhoods || '. Our soft washing technique uses low pressure and professional-grade solutions to safely remove dirt, mold, mildew, and organic staining without causing damage to your property.',
      1,
      true,
      'Services'
    ),
    
    -- FAQ 2: Pricing (High search volume, includes financing)
    (
      town_record.slug,
      'How much does power washing cost in ' || town_record.name || '?',
      'Power washing costs in ' || town_record.name || ' vary based on the size of your property and services needed. Most house washing projects range from $350-$800, roof cleaning typically runs $400-$700, and driveway cleaning averages $200-$400. We provide free, no-obligation estimates for all ' || town_record.name || ' residents. Every property is different, so we evaluate factors like square footage, amount of buildup, and accessibility before providing an accurate quote. We also offer flexible financing options to make professional power washing affordable for every budget. Call (401) 595-0726 or request a quote online to get your custom pricing.',
      2,
      true,
      'Pricing'
    ),
    
    -- FAQ 3: Service Areas (Local SEO, neighborhood keywords)
    (
      town_record.slug,
      'What areas of ' || town_record.name || ' does J&M serve?',
      'J&M proudly serves all neighborhoods throughout ' || town_record.name || ', ' || town_record.state || ', including ' || town_record.neighborhoods || ', and everywhere in between. We''re familiar with the unique characteristics and challenges of properties across ' || town_record.name || '—from older historic homes to newer construction. Whether you''re in a residential neighborhood, commercial district, or rural area of ' || town_record.name || ', we bring the same level of professional service and attention to detail. Our local knowledge means we understand the specific environmental factors affecting ' || town_record.name || ' properties, from weather patterns to common exterior cleaning challenges.',
      3,
      true,
      'Service Area'
    ),
    
    -- FAQ 4: Why Choose Us (Trust signals, differentiators, credentials)
    (
      town_record.slug,
      'Why choose J&M for power washing in ' || town_record.name || '?',
      town_record.name || ' residents choose J&M because we''re a local, family-owned company that truly cares about our community. We use the safest soft washing methods (not high pressure that can damage your property), professional-grade solutions that kill organic growth at the root, and we''re fully insured with $2M liability coverage. Our team has extensive experience with ' || town_record.name || ' properties and understands the local environmental challenges. We provide free estimates, show up on time, protect your landscaping, and guarantee your satisfaction. We''re licensed and insured, background-checked, and have hundreds of 5-star reviews from satisfied ' || town_record.name || ' customers. Plus, our work comes with a satisfaction guarantee—if you''re not happy with the results, we''ll make it right.',
      4,
      true,
      'Why Choose Us'
    ),
    
    -- FAQ 5: Scheduling (Conversion-focused)
    (
      town_record.slug,
      'How do I schedule power washing in ' || town_record.name || '?',
      'Scheduling power washing service in ' || town_record.name || ' is easy! Call us at (401) 595-0726 or fill out our online quote form at any time. We''ll typically provide your free estimate within 24 hours. Once approved, most ' || town_record.name || ' jobs can be scheduled within 1-2 weeks, depending on the season. We work around your schedule and will confirm all details before arrival. Our team will contact you the day before service to confirm timing. For ' || town_record.name || ' residents, we can often accommodate same-week service during our slower seasons (fall and early spring). We also offer flexible appointment times including early mornings and weekends.',
      5,
      true,
      'Scheduling'
    ),
    
    -- FAQ 6: Payment & Financing (Removes barriers, conversion-focused)
    (
      town_record.slug,
      'What payment options are available for power washing services in ' || town_record.name || '?',
      'J&M makes professional power washing affordable for all ' || town_record.name || ' homeowners. We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, checks, and cash. For larger projects, we offer flexible financing options through our financing partners—allowing you to break your investment into manageable monthly payments with competitive rates and approved credit. This means you can get your ' || town_record.name || ' home cleaned and protected now, while spreading the cost over time. Ask about our current financing promotions when you schedule your free estimate. Many ' || town_record.name || ' residents use financing for multi-service packages like house washing combined with roof cleaning and driveway sealing. Payment is due upon completion of work.',
      6,
      true,
      'Financing'
    ),
    
    -- FAQ 7: Free Estimates (High conversion value, removes barrier)
    (
      town_record.slug,
      'Do you provide free estimates in ' || town_record.name || '?',
      'Yes! We provide completely free, no-obligation estimates for all ' || town_record.name || ' residents. There''s no charge for us to come out, assess your property, and provide you with a detailed quote. We''ll evaluate the size of your property, the services you need, current condition, and any special considerations. Most estimates are provided within 24 hours of your request. You can request your free estimate by calling (401) 595-0726 or filling out our online quote form. There''s absolutely no pressure to book—we want you to feel confident in your decision. Many ' || town_record.name || ' homeowners get quotes from multiple companies, and we''re happy to answer any questions you have about our services, process, or pricing.',
      7,
      true,
      'Estimates'
    ),
    
    -- FAQ 8: Popular Services (Social proof, additional keywords)
    (
      town_record.slug,
      'What services are most popular in ' || town_record.name || '?',
      'In ' || town_record.name || ', our most popular services are house washing and roof cleaning. Many ' || town_record.name || ' homeowners schedule both services together for maximum curb appeal and protection. House washing removes years of dirt, mold, and mildew from vinyl siding, brick, stucco, and other exterior surfaces. Roof cleaning eliminates black streaks (gloeocapsa magma algae), moss, and lichen that can damage shingles and reduce your roof''s lifespan. Other frequently requested services in ' || town_record.name || ' include driveway and concrete cleaning (removes oil stains, tire marks, and organic growth), deck restoration (brings weathered wood back to life), and gutter cleaning (prevents water damage and foundation issues). Many ' || town_record.name || ' residents also take advantage of our seasonal package deals that bundle multiple services at a discounted rate.',
      8,
      true,
      'Popular Services'
    );

  END LOOP;

  RAISE NOTICE 'Successfully consolidated to 8 SEO-optimized FAQs for all 46 towns!';
END$$;
