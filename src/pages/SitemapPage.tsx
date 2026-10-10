import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, TreePine, ChevronRight } from 'lucide-react';
import { siteRoutes } from '../config/siteRoutes';
import { updatePageMeta } from '../utils/seo';
import { useEffect } from 'react';

export default function SitemapPage() {
  useEffect(() => {
    updatePageMeta({
      title: 'Site Map | J&M Power Washing - Complete Site Directory',
      description: 'Complete sitemap of J&M Power Washing services, service areas, and resources. Find everything you need for professional power washing in Rhode Island and Massachusetts.',
      keywords: 'sitemap, site map, power washing services, service areas, Rhode Island, Massachusetts',
      url: 'https://powerwashjm.com/sitemap/'
    });
  }, []);

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-40 lg:pt-56">
      <div className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Site Map
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quickly navigate to any page on our website. Find information about our services,
              service areas, maintenance programs, and helpful resources.
            </p>
          </div>

          {/* Services */}
          <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
              Our Services
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {siteRoutes.services.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="group flex items-start gap-2"
                  >
                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </span>
                      <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Service Areas */}
          <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Service Areas ({siteRoutes.serviceAreas.rhodeIsland.length + siteRoutes.serviceAreas.massachusetts.length} Towns)
              </span>
            </h2>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Rhode Island ({siteRoutes.serviceAreas.rhodeIsland.length})</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                {siteRoutes.serviceAreas.rhodeIsland.map((area) => (
                  <li key={area.path}>
                    <Link
                      to={area.path}
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {area.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Massachusetts ({siteRoutes.serviceAreas.massachusetts.length})</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
                {siteRoutes.serviceAreas.massachusetts.map((area) => (
                  <li key={area.path}>
                    <Link
                      to={area.path}
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      {area.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Holiday Lights by Town */}
          <section className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
              <span className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-green-600" />
                Holiday Lights by Town ({siteRoutes.holidayLightsTowns.length} Pages)
              </span>
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
              {siteRoutes.holidayLightsTowns.map((town) => (
                <li key={town.path}>
                  <Link
                    to={town.path}
                    className="text-sm text-gray-700 hover:text-green-600 transition-colors"
                  >
                    {town.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Maintenance Programs + Resources + Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">

            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                Maintenance Programs
              </h2>
              <ul className="space-y-3">
                {siteRoutes.maintenancePrograms.map((program) => (
                  <li key={program.path}>
                    <Link
                      to={program.path}
                      className="group flex items-start gap-2"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors text-sm">
                          {program.name}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">{program.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                Resources & Info
              </h2>
              <ul className="space-y-3">
                {siteRoutes.resources.map((resource) => (
                  <li key={resource.path}>
                    <Link
                      to={resource.path}
                      className="group flex items-start gap-2"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors text-sm">
                          {resource.name}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">{resource.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-blue-900 text-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold border-b border-blue-700 pb-3 mb-5">
                Get Started Today
              </h2>
              <ul className="space-y-3 mb-6">
                {siteRoutes.quickActions.map((action) => (
                  <li key={action.path}>
                    <Link
                      to={action.path}
                      className="group flex items-start gap-2"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium group-hover:text-blue-300 transition-colors text-sm">
                          {action.name}
                        </span>
                        <p className="text-xs text-blue-200 mt-0.5">{action.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-blue-700 pt-4">
                <h3 className="font-semibold text-sm mb-3">Contact Us</h3>
                <div className="space-y-2">
                  <a href="tel:+14015950726" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    (401) 595-0726
                  </a>
                  <a href="mailto:sales@powerwashjm.com" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    sales@powerwashjm.com
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* Footer note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
