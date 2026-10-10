/**
 * Centralized Footer Content Configuration
 *
 * This file contains all footer content that appears across the site.
 * Update the tagline here and it will automatically propagate to all footers.
 *
 * Last Updated: 2025-03-15
 */

export const FOOTER_CONTENT = {
  /**
   * Main tagline that appears under the logo in the footer.
   * This is optimized for SEO with location and service keywords.
   */
  tagline: 'J&M Power Washing is a family-owned exterior cleaning company serving Rhode Island and Massachusetts. We specialize in house washing, roof cleaning, gutter cleaning, deck restoration, concrete cleaning, and holiday light installation. Licensed, insured, and proudly serving Providence, Smithfield, Warwick, Attleboro, Franklin, and surrounding areas.',

  /**
   * Alternative shorter tagline (currently not in use)
   */
  taglineShort: 'Professional pressure washing and exterior cleaning services you can trust.',

  /**
   * Copyright text
   */
  copyright: '2025 J & M Power Washing. All rights reserved.',

  /**
   * Company description for structured data
   */
  companyDescription: 'Professional Pressure Washing Services',

  /**
   * License and insurance badge text
   */
  credentials: 'Licensed & Insured',

  /**
   * Service area text
   */
  serviceArea: 'Rhode Island & Massachusetts',

  /**
   * Primary service cities (for local SEO)
   */
  primaryCities: ['Providence', 'Smithfield', 'Warwick', 'Attleboro', 'Franklin'],

  /**
   * Social media links
   */
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100064067522225',
    instagram: 'https://www.instagram.com/jmpowerwashing/',
  },

  /**
   * Newsletter signup heading
   */
  newsletterHeading: 'Sign Up For Our Specials',
} as const;

/**
 * Footer services list
 */
export const FOOTER_SERVICES = [
  { name: 'House Washing', path: '/house-washing/' },
  { name: 'Roof Cleaning', path: '/roof-cleaning/' },
  { name: 'Deck Cleaning', path: '/deck-cleaning/' },
  { name: 'Gutter Cleaning', path: '/gutter-cleaning/' },
  { name: 'Concrete Cleaning', path: '/concrete-cleaning/' },
  { name: 'Holiday Lights Installation', path: '/holiday-lights/' },
  { name: 'Commercial Services', path: '/commercial/' },
] as const;
