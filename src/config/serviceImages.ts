export interface ServiceImageConfig {
  url: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export const SERVICE_PAGE_IMAGES: Record<string, ServiceImageConfig> = {
  'roof-cleaning': {
    url: '/roofcleaning.png',
    alt: 'Professional Roof Cleaning Services in Rhode Island and Massachusetts - Soft Wash Algae Removal',
    width: 1200,
    height: 630,
    caption: 'Soft wash roof cleaning removing algae and black streaks from asphalt shingles in Rhode Island',
  },
  'house-washing': {
    url: '/housewash.png',
    alt: 'Professional House Washing Services in Rhode Island - Soft Wash Exterior Cleaning',
    width: 1200,
    height: 630,
    caption: 'Soft wash house washing removing dirt, mold, and algae from vinyl and cedar siding',
  },
  'deck-cleaning': {
    url: '/Deck%20Restoration.png',
    alt: 'Professional Deck Cleaning and Restoration Services in Rhode Island',
    width: 1200,
    height: 630,
    caption: 'Professional deck cleaning and restoration bringing weathered wood back to life',
  },
  'concrete-cleaning': {
    url: '/ConcreteWash.png',
    alt: 'Professional Driveway and Concrete Pressure Washing in Rhode Island',
    width: 1200,
    height: 630,
    caption: 'High-pressure concrete cleaning removing oil stains and dirt from driveways',
  },
  'gutter-cleaning': {
    url: '/Gutter.png',
    alt: 'Professional Gutter Cleaning Services in Rhode Island - Interior and Exterior',
    width: 1200,
    height: 630,
    caption: 'Complete gutter cleaning service including interior debris removal and exterior brightening',
  },
  'fleet-washing': {
    url: '/fleettobecleaned.png',
    alt: 'Professional Fleet Washing Services in Rhode Island - Commercial Vehicle Cleaning',
    width: 1200,
    height: 630,
    caption: 'Commercial fleet washing services for trucks, vans, and business vehicles',
  },
  'commercial': {
    url: '/commerical.png',
    alt: 'Professional Commercial Pressure Washing Services in Rhode Island',
    width: 1200,
    height: 630,
    caption: 'Commercial building exterior cleaning and maintenance programs',
  },
  'holiday-lights': {
    url: '/rihouselightswithlogo.png',
    alt: 'Professional Christmas Light Installation Services in Rhode Island',
    width: 1200,
    height: 630,
    caption: 'Professional holiday light installation and design services for residential and commercial properties',
  },
  'hoa-condo': {
    url: '/buildings.PNG',
    alt: 'Professional HOA and Condo Pressure Washing Services in Rhode Island',
    width: 1200,
    height: 630,
    caption: 'HOA and condominium complex exterior cleaning and maintenance services',
  },
};

export function getServiceImage(serviceSlug: string): ServiceImageConfig {
  return SERVICE_PAGE_IMAGES[serviceSlug] || {
    url: '/homepagehouse.png',
    alt: 'Professional Power Washing Services in Rhode Island and Massachusetts',
    width: 1200,
    height: 630,
    caption: 'J&M Power Washing professional exterior cleaning services',
  };
}
