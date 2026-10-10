/**
 * SEO-Optimized Image Alt Text Configuration
 *
 * All alt texts follow SEO best practices:
 * - Descriptive and specific
 * - Include relevant keywords naturally
 * - Include location (Rhode Island, Massachusetts) where appropriate
 * - Describe what's actually in the image
 */

export const LOGO_ALT_TEXT = {
  standard: 'J&M Power Washing logo — soft-wash exterior cleaning serving Rhode Island and Massachusetts',
  holiday: 'J&M Holiday Lights logo — Christmas light installation services in RI and MA',
};

export const HERO_ALT_TEXT = {
  home: 'Two-story colonial home with white vinyl siding after soft-wash algae removal in North Smithfield, Rhode Island',
  homeRightSide: 'Side-by-side before and after of vinyl siding soft-wash cleaning — left side shows green algae and black streaks, right side shows clean white siding',
  holidayLights: 'Rhode Island home with roofline and gutter Christmas lights installed by J&M Holiday Lights team',
  commercial: 'Multi-story commercial building exterior after soft-wash cleaning of brick and EIFS facade in Providence, Rhode Island',
};

export const SERVICE_ALT_TEXT = {
  houseWashing: 'White vinyl siding after soft-wash house washing — algae and mildew removed on a colonial home in Rhode Island',
  houseWashingProcess: 'Soft-wash application on white colonial siding showing green algae removal mid-process in Rhode Island',
  roofCleaning: 'Asphalt shingle roof before and after soft-wash cleaning — black Gloeocapsa Magma streaks and moss removed in Massachusetts',
  driveway: 'Concrete driveway before and after pressure washing — oil stains and embedded grime removed in Rhode Island',
  deckCleaning: 'Weathered wood deck boards before and after pressure washing and staining — gray oxidation removed to reveal natural wood tone',
  concreteCleaning: 'Commercial concrete walkway and parking area after high-pressure cleaning in Rhode Island',
  commercial: 'Commercial building facade after soft-wash cleaning — brick and cladding restored for a business in RI',
};

export const SEASON_CARD_ALT_TEXT = {
  powerWashing: 'Vinyl siding before and after soft-wash algae removal on a two-story home in Rhode Island',
  holidayLights: 'Residential home in Rhode Island with roofline, gutter, and shrub Christmas lights installed for the holiday season',
};

export const TOWN_ALT_TEXT = {
  townHall: 'Johnston Town Hall, Rhode Island — J&M Power Washing serves this community for house washing, roof cleaning, and deck restoration',
  northSmithfield: 'North Smithfield, Rhode Island town center — soft-wash house cleaning and roof treatment service area',
  smithfield: 'Smithfield, Rhode Island town hall — exterior cleaning services available in this community',
  rhodeIsland: 'Rhode Island residential neighborhood — J&M Power Washing serves homes for siding cleaning, gutter cleaning, and holiday lights',
};

export const HOLIDAY_PACKAGE_ALT_TEXT = {
  tinsel: 'Tinsel holiday lights package — roofline and gutter lighting option for RI and MA homes',
  garland: 'Garland holiday lights package — roofline, garland, and accent lighting for homes in RI and MA',
  gingerbread: 'Gingerbread holiday lights package — full roofline, garland, and landscape lighting with custom design and installation',
};

export const FLEET_ALT_TEXT = {
  mainFleet: 'Four J&M Power Washing service trucks lined up — fully equipped for soft-wash and pressure washing jobs across Rhode Island and Massachusetts',
  serviceTruck: 'J&M Power Washing white service truck with soft-wash tanks and hose reels for residential exterior cleaning',
};

export const BEFORE_AFTER_ALT_TEXT = {
  gutter: 'Gutter exterior before and after cleaning — black oxidation streaks removed from white aluminum gutters in Rhode Island',
  roof: 'Asphalt shingle roof before and after soft-wash treatment — dark Gloeocapsa Magma algae bands eliminated',
  house: 'Vinyl siding before and after soft-wash cleaning — green algae and mildew removed on a colonial home in Rhode Island',
};

/**
 * Generate contextual alt text for gallery images
 * @param service - Service type (e.g., "house washing", "roof cleaning")
 * @param location - Optional location
 * @param index - Image number for unique descriptions
 */
export function generateGalleryAltText(
  service: string,
  location?: string,
  index?: number
): string {
  const locationText = location ? ` in ${location}` : ' in Rhode Island and Massachusetts';
  const numberText = index ? ` (example ${index})` : '';
  return `${service} results${locationText}${numberText}`;
}

/**
 * Generate service-specific alt text
 */
export function generateServiceAltText(serviceName: string, detail: string): string {
  return `${serviceName} — ${detail} by J&M Power Washing in Rhode Island and Massachusetts`;
}
