/**
 * Website Image Configuration
 *
 * All images served from local /public folder or CDN
 */

/**
 * Company Logos - PNG files with transparency
 */
export const LOGOS = {
  standard: '/logos/logo.png',
  holiday: '/logos/holidaylogo.png',
};

/**
 * Hero/Banner Images
 */
export const HERO_IMAGES = {
  // Homepage hero background
  home: '/homepagehouse.png',

  // Homepage right-side image
  homeRightSide: '/homepagehouse.png',

  // Holiday lights page
  holidayLights: '/rihouselightswithlogo.webp',

  // Commercial page
  commercial: '/commerical.png',
};

/**
 * Service Showcase Images - "See the Difference" Section
 *
 * Top Row: House Washing | Roof Cleaning | Driveway
 * Bottom Row: Deck | Concrete Wash | Commercial
 */
export const SERVICE_IMAGES = {
  // TOP-LEFT: House Washing
  houseWashing: '/housewash.png',

  // House Washing Process (Before/During/After) - Hosted on Supabase
  houseWashingProcess: 'https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/service-images/house-wash-process-ri.jpg',

  // TOP-MIDDLE: Roof Cleaning
  roofCleaning: '/roofcleaning.png',

  // TOP-RIGHT: Driveway Cleaning
  driveway: '/drivewaywash.png',

  // BOTTOM-LEFT: Deck Restoration
  deckCleaning: '/Deck%20Restoration.png',

  // BOTTOM-MIDDLE: Concrete Wash
  concreteCleaning: '/ConcreteWash.png',

  // BOTTOM-RIGHT: Commercial
  commercial: '/commerical.png',
};

/**
 * "Ready for Every Season" Card Images
 */
export const SEASON_CARDS = {
  // Left card - Power Washing before/after
  powerWashing: '/housewashbeforeandafter.png',

  // Right card - Holiday Lights with logo
  holidayLights: '/rihouselightswithlogo.webp',
};

/**
 * Town/Location Images
 */
export const TOWN_IMAGES = {
  townHall: '/johnston-town-hall.jpg',
  northSmithfield: '/north-smithfield-town-hall.png',
  smithfield: '/smithfield-town-hall.jpg',
  rhodeIsland: '/IMG_3060.jpg',
};

/**
 * Design/Illustration Images
 */
export const DESIGN_IMAGES = {
  measurementGuide: '/image copy copy copy copy copy copy copy copy copy copy copy copy copy.png',
  propertyDiagram: '/hero-properties.png',
};

/**
 * Background Images
 */
export const BACKGROUND_IMAGES = {
  christmasCountdown: '/RI%20House%20XMas%20Lights.png',
};

/**
 * Holiday Package Images
 */
export const HOLIDAY_PACKAGES = {
  tinsel: '/packages/tinselpackage.webp',
  garland: '/packages/garlandpackage.webp',
  gingerbread: '/packages/gingerbreadpackage.webp',
};

/**
 * Helper function to get image URL with fallback
 */
export function getImageUrl(
  category: 'logos' | 'hero' | 'service' | 'town' | 'design' | 'background' | 'season',
  key: string
): string {
  const categories = {
    logos: LOGOS,
    hero: HERO_IMAGES,
    service: SERVICE_IMAGES,
    town: TOWN_IMAGES,
    design: DESIGN_IMAGES,
    background: BACKGROUND_IMAGES,
    season: SEASON_CARDS,
  };

  const categoryImages = categories[category] as Record<string, string>;
  return categoryImages[key] || '/image.png';
}

/**
 * Default fallback image
 */
export const DEFAULT_IMAGE = '/image.png';
