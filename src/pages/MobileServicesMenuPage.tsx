import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect } from 'react';
import { updatePageMeta } from '../utils/seo';

export default function MobileServicesMenuPage() {
  useEffect(() => {
    updatePageMeta({
      title: 'Services - J & M Power Washing',
      description: 'Explore our professional power washing services',
      noindex: true
    });
  }, []);

  // Import services from centralized config to ensure mobile/desktop sync
  const services = [
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

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-6">
          <Link
            to="/mobile-menu/"
            className="p-2 text-gray-700 hover:text-blue-900 transition-colors"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
            SERVICES
          </h1>
          <Link
            to="/"
            className="p-2 text-gray-700 hover:text-blue-900 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-6">
        <nav className="space-y-1">
          {services.map((service) => (
            <Link
              key={service.path}
              to={service.path}
              className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
            >
              <span className="text-lg font-medium">{service.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
