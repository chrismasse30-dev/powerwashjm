import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface RelatedService {
  title: string;
  path: string;
  description: string;
}

interface RelatedServicesLinksProps {
  currentService: string;
  className?: string;
}

const allServices: Record<string, RelatedService> = {
  'house-washing': {
    title: 'House Washing',
    path: '/house-washing/',
    description: 'Professional soft wash cleaning for vinyl and cedar siding'
  },
  'roof-cleaning': {
    title: 'Roof Cleaning',
    path: '/roof-cleaning/',
    description: 'Safe roof cleaning to remove algae, moss, and black streaks'
  },
  'deck-cleaning': {
    title: 'Deck Cleaning',
    path: '/deck-cleaning/',
    description: 'Deck cleaning, restoration, and staining services'
  },
  'concrete-cleaning': {
    title: 'Concrete Cleaning',
    path: '/concrete-cleaning/',
    description: 'Driveway and concrete pressure washing'
  },
  'gutter-cleaning': {
    title: 'Gutter Cleaning',
    path: '/gutter-cleaning/',
    description: 'Interior and exterior gutter cleaning services'
  },
  'fleet-washing': {
    title: 'Fleet Washing',
    path: '/fleet-washing/',
    description: 'Commercial fleet and vehicle washing services'
  },
  'holiday-lights': {
    title: 'Holiday Lights',
    path: '/holiday-lights/',
    description: 'Professional Christmas light installation and removal'
  },
  'hoa-condo': {
    title: 'HOA & Condo Cleaning',
    path: '/hoa-condo-cleaning/',
    description: 'Exterior cleaning for HOAs and condo associations'
  }
};

/**
 * Related Services Component for Internal Linking
 *
 * Benefits:
 * - Improves SEO through internal linking
 * - Reduces bounce rate
 * - Helps users discover other services
 * - Spreads page authority across site
 */
export function RelatedServicesLinks({ currentService, className = '' }: RelatedServicesLinksProps) {
  // Get 3 related services (excluding current)
  const relatedServices = Object.entries(allServices)
    .filter(([key]) => key !== currentService)
    .slice(0, 3)
    .map(([, service]) => service);

  if (relatedServices.length === 0) return null;

  return (
    <aside className={`bg-blue-50 border-l-4 border-blue-900 p-6 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Related Services
      </h2>
      <p className="text-gray-700 mb-4">
        Looking for other exterior cleaning services? We offer comprehensive solutions:
      </p>
      <div className="space-y-3">
        {relatedServices.map((service) => (
          <Link
            key={service.path}
            to={service.path}
            className="flex items-start p-4 bg-white rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {service.description}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-900 mt-1 ml-3 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          to="/get-quote/"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Get a Free Estimate for Any Service
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </aside>
  );
}
