/*
  # Seed Page Metadata
  
  Populates the page_metadata table with all pages from the sitemap.
  Sets initial last_modified dates and priorities based on page type.
*/

INSERT INTO page_metadata (slug, last_modified, change_frequency, priority, page_type) VALUES
  -- Homepage
  ('/', now(), 'weekly', 1.0, 'homepage'),
  
  -- Blog
  ('/blog', now(), 'weekly', 0.9, 'blog'),
  
  -- Main Service Pages
  ('/house-washing', now(), 'monthly', 0.9, 'service'),
  ('/holiday-lights', now(), 'monthly', 0.9, 'service'),
  ('/roof-cleaning', now(), 'monthly', 0.8, 'service'),
  ('/deck-cleaning', now(), 'monthly', 0.8, 'service'),
  ('/concrete-cleaning', now(), 'monthly', 0.8, 'service'),
  ('/gutter-cleaning', now(), 'monthly', 0.8, 'service'),
  ('/commercial', now(), 'monthly', 0.8, 'service'),
  ('/hoa-condo-cleaning', now(), 'monthly', 0.9, 'service'),
  
  -- Commercial Maintenance Programs
  ('/commercial/maintenance-programs/monthly-maintenance', now(), 'monthly', 0.7, 'service'),
  ('/commercial/maintenance-programs/quarterly-maintenance', now(), 'monthly', 0.7, 'service'),
  ('/commercial/maintenance-programs/seasonal-maintenance', now(), 'monthly', 0.7, 'service'),
  
  -- Quote & Estimate Pages
  ('/instant-estimate', now(), 'monthly', 0.9, 'tool'),
  ('/get-quote', now(), 'monthly', 0.9, 'tool'),
  ('/complete-quote', now(), 'monthly', 0.6, 'tool'),
  
  -- Towns Overview
  ('/towns', now(), 'monthly', 0.8, 'town'),
  
  -- Information Pages
  ('/about-us', now(), 'monthly', 0.8, 'info'),
  ('/financing', now(), 'monthly', 0.7, 'info'),
  ('/faq', now(), 'monthly', 0.7, 'info'),
  ('/customer-portal', now(), 'monthly', 0.6, 'info'),
  ('/privacy-policy', now(), 'yearly', 0.3, 'info'),
  ('/satisfaction-guarantee', now(), 'monthly', 0.8, 'info'),
  ('/sitemap', now(), 'monthly', 0.4, 'info'),
  
  -- Rhode Island Towns
  ('/towns/warwick-ri', now(), 'monthly', 0.8, 'town'),
  ('/towns/cranston-ri', now(), 'monthly', 0.8, 'town'),
  ('/towns/providence-ri', now(), 'monthly', 0.8, 'town'),
  ('/towns/pawtucket-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/east-providence-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/woonsocket-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/north-smithfield-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/smithfield-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/cumberland-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/lincoln-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/coventry-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/johnston-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/north-providence-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/central-falls-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/west-warwick-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/burrillville-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/scituate-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/west-greenwich-ri', now(), 'monthly', 0.6, 'town'),
  ('/towns/foster-ri', now(), 'monthly', 0.5, 'town'),
  ('/towns/glocester-ri', now(), 'monthly', 0.5, 'town'),
  ('/towns/barrington-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/bristol-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/east-greenwich-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/north-kingstown-ri', now(), 'monthly', 0.7, 'town'),
  ('/towns/tiverton-ri', now(), 'monthly', 0.6, 'town'),
  
  -- Massachusetts Towns
  ('/towns/attleboro-ma', now(), 'monthly', 0.7, 'town'),
  ('/towns/franklin-ma', now(), 'monthly', 0.7, 'town'),
  ('/towns/mansfield-ma', now(), 'monthly', 0.7, 'town'),
  ('/towns/foxboro-ma', now(), 'monthly', 0.7, 'town'),
  ('/towns/shrewsbury-ma', now(), 'monthly', 0.7, 'town'),
  ('/towns/blackstone-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/uxbridge-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/northbridge-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/grafton-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/millbury-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/bellingham-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/wrentham-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/north-attleboro-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/seekonk-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/swansea-ma', now(), 'monthly', 0.6, 'town'),
  ('/towns/millville-ma', now(), 'monthly', 0.5, 'town'),
  ('/towns/douglas-ma', now(), 'monthly', 0.5, 'town'),
  ('/towns/sutton-ma', now(), 'monthly', 0.5, 'town'),
  ('/towns/plainville-ma', now(), 'monthly', 0.5, 'town'),
  ('/towns/rehoboth-ma', now(), 'monthly', 0.5, 'town'),
  ('/towns/norton-ma', now(), 'monthly', 0.6, 'town')
ON CONFLICT (slug) DO NOTHING;