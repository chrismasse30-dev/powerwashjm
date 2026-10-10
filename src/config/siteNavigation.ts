/**
 * Centralized Navigation Configuration
 *
 * IMPORTANT: This is the single source of truth for all navigation menus.
 * Any changes to services, company links, or navigation structure MUST be made here.
 *
 * Used by:
 * - Desktop navigation (Navigation.tsx)
 * - Mobile services menu (MobileServicesMenuPage.tsx)
 * - Mobile company menu (MobileCompanyMenuPage.tsx)
 * - Footer components
 */

export interface NavigationItem {
  name: string;
  path: string;
  description?: string;
}

/**
 * Main services offered by the company
 * These appear in both desktop and mobile navigation
 */
export const SERVICES_NAVIGATION: NavigationItem[] = [
  { name: 'House Washing', path: '/house-washing/' },
  { name: 'Roof Cleaning', path: '/roof-cleaning/' },
  { name: 'Deck Cleaning', path: '/deck-cleaning/' },
  { name: 'Gutter Cleaning', path: '/gutter-cleaning/' },
  { name: 'Concrete Cleaning', path: '/concrete-cleaning/' },
  { name: 'Holiday Lights', path: '/holiday-lights/' },
  { name: 'HOA & Condo Cleaning', path: '/hoa-condo-cleaning/' },
  { name: 'Fleet Washing', path: '/commercial/fleet-washing/' },
  { name: 'Commercial Solutions', path: '/commercial/' },
];

/**
 * Company information pages
 * These appear in both desktop and mobile navigation
 */
export const COMPANY_NAVIGATION: NavigationItem[] = [
  { name: 'About Us', path: '/about-us/' },
  { name: 'FAQ', path: '/faq/' },
  { name: 'Satisfaction Guarantee', path: '/satisfaction-guarantee/' },
  { name: 'Service Areas', path: '/towns/' },
  { name: 'Blog', path: '/blog' },
];

/**
 * Utility function to validate navigation sync
 * Run this during build to ensure all navigation is properly synchronized
 */
export function validateNavigationSync(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate paths
  const allPaths = [
    ...SERVICES_NAVIGATION.map(s => s.path),
    ...COMPANY_NAVIGATION.map(c => c.path)
  ];

  const duplicates = allPaths.filter((path, index) => allPaths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate navigation paths found: ${duplicates.join(', ')}`);
  }

  // Check for empty names
  const emptyNames = [
    ...SERVICES_NAVIGATION.filter(s => !s.name || s.name.trim() === ''),
    ...COMPANY_NAVIGATION.filter(c => !c.name || c.name.trim() === '')
  ];

  if (emptyNames.length > 0) {
    errors.push(`Navigation items with empty names found`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
