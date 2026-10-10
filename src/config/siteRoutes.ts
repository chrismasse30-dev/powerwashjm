import { townsData } from '../data/townsData';
import { holidayLightsTownsData } from '../data/holidayLightsTownsData';

export interface RouteItem {
  path: string;
  name: string;
  description: string;
}

export interface RouteCategory {
  title: string;
  routes: RouteItem[];
}

const generateTownRoutes = () => {
  const rhodeIsland = townsData
    .filter(town => town.stateAbbr === 'RI')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(town => ({
      path: `/towns/${town.slug}/`,
      name: `${town.name}, ${town.stateAbbr}`,
      description: `Professional power washing and exterior cleaning services in ${town.name}, ${town.state}`
    }));

  const massachusetts = townsData
    .filter(town => town.stateAbbr === 'MA')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(town => ({
      path: `/towns/${town.slug}/`,
      name: `${town.name}, ${town.stateAbbr}`,
      description: `Expert pressure washing and holiday lighting services in ${town.name}, ${town.state}`
    }));

  return { rhodeIsland, massachusetts };
};

const townRoutes = generateTownRoutes();

export const siteRoutes = {
  services: [
    {
      path: '/house-washing/',
      name: 'House Washing',
      description: 'Professional soft washing that safely removes dirt, mold, and mildew from your home'
    },
    {
      path: '/roof-cleaning/',
      name: 'Roof Cleaning',
      description: 'Remove black streaks, algae, and moss to extend your roof\'s lifespan'
    },
    {
      path: '/deck-cleaning/',
      name: 'Deck Restoration',
      description: 'Restore your deck to like-new condition with our professional cleaning service'
    },
    {
      path: '/gutter-cleaning/',
      name: 'Gutter Cleaning',
      description: 'Thorough cleaning and brightening to keep your gutters functioning properly'
    },
    {
      path: '/concrete-cleaning/',
      name: 'Concrete Cleaning',
      description: 'Powerful pressure washing for driveways, sidewalks, and walkways'
    },
    {
      path: '/holiday-lights/',
      name: 'Holiday Lighting Installation',
      description: 'Professional design, installation, maintenance, and storage of holiday lights'
    },
    {
      path: '/commercial/',
      name: 'Commercial Services',
      description: 'Professional building washing, fleet cleaning, and commercial property maintenance'
    },
    {
      path: '/hoa-condo-cleaning/',
      name: 'HOA & Condo Power Washing',
      description: 'Expert HOA and condo association cleaning services throughout Rhode Island and Massachusetts'
    }
  ],

  serviceAreas: {
    rhodeIsland: townRoutes.rhodeIsland,
    massachusetts: townRoutes.massachusetts
  },

  maintenancePrograms: [
    {
      path: '/silver-seasonal/',
      name: 'Silver Seasonal Plan',
      description: 'Bi-annual maintenance to keep your property looking great year-round'
    },
    {
      path: '/gold-quarterly/',
      name: 'Gold Quarterly Plan',
      description: 'Quarterly service program for consistent property maintenance'
    },
    {
      path: '/platinum-monthly/',
      name: 'Platinum Monthly Plan',
      description: 'Premium monthly maintenance solution for pristine property appearance'
    }
  ],

  resources: [
    {
      path: '/blog',
      name: 'Blog',
      description: 'Tips, guides, and insights about power washing and property maintenance'
    },
    {
      path: '/about-us/',
      name: 'About Us',
      description: 'Learn about our team, mission, and commitment to quality service'
    },
    {
      path: '/faq/',
      name: 'Frequently Asked Questions',
      description: 'Find answers to common questions about our services and process'
    },
    {
      path: '/satisfaction-guarantee/',
      name: 'Satisfaction Guarantee',
      description: 'Our 100% satisfaction promise and commitment to excellence'
    },
    {
      path: '/financing/',
      name: 'Financing Options',
      description: 'Flexible payment plans to make our services affordable for everyone'
    },
    {
      path: '/privacy-policy/',
      name: 'Privacy Policy',
      description: 'How we protect and handle your personal information'
    }
  ],

  quickActions: [
    {
      path: '/get-quote/',
      name: 'Get Free Quote',
      description: 'Request your free, no-obligation estimate today'
    },
    {
      path: '/instant-estimate/',
      name: 'Instant Online Quote',
      description: 'Get an immediate price estimate with our online calculator'
    },
    {
      path: '/',
      name: 'Home',
      description: 'Return to our homepage'
    },
    {
      path: '/customer-portal/',
      name: 'Customer Portal',
      description: 'Access your account and project information'
    }
  ],

  holidayLightsTowns: holidayLightsTownsData.map(town => ({
    path: `/holiday-lights/${town.slug}/`,
    name: `Holiday Lights in ${town.name}, ${town.stateAbbr}`,
    description: `Professional Christmas light installation in ${town.name}, ${town.state}`
  }))
};

export type SiteRoutes = typeof siteRoutes;
