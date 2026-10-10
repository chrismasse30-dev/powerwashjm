import { Check, ChevronRight, Phone, Mail, Star, Shield, DollarSign, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { updatePageMeta, addStructuredData, createServiceSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function SilverSeasonalPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    const canonicalUrl = 'https://powerwashjm.com/commercial/maintenance-programs/seasonal-maintenance/';

    updatePageMeta({
      title: 'Professional Power Washing in RI & MA | J & M Power Washing',
      description: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more. Call today for a free estimate!',
      keywords: 'seasonal pressure washing, industrial cleaning, warehouse cleaning, manufacturing facility cleaning, large property maintenance, biannual power washing, seasonal maintenance RI',
      ogTitle: 'Professional Power Washing in RI & MA | J & M Power Washing',
      ogDescription: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more.',
      canonical: canonicalUrl
    });

    addStructuredData(createServiceSchema(
      'Silver Seasonal Maintenance',
      'Seasonal pressure washing maintenance program for large commercial and industrial properties. Comprehensive deep cleaning twice per year.',
      'https://powerwashjm.com/commercial/maintenance-programs/seasonal-maintenance/'
    ));
  }, []);

  const bestSuitedFor = [
    'Warehouses and distribution centers',
    'Manufacturing and industrial facilities',
    'Large commercial complexes and office parks',
    'Storage facilities and logistics centers',
    'Agricultural and processing plants',
    'Municipal buildings and government facilities',
    'Schools, universities, and educational campuses',
    'Properties with 50,000+ sq ft of exterior space'
  ];

  const keyBenefits = [
    {
      icon: DollarSign,
      title: 'Maximum Cost Efficiency',
      description: 'Ideal for large properties where frequent cleaning isn\'t necessary. Two comprehensive cleanings per year provide excellent value while maintaining professional standards and protecting your investment.'
    },
    {
      icon: Building2,
      title: 'Large-Scale Property Expertise',
      description: 'We specialize in managing extensive commercial and industrial properties. Our team has the equipment, experience, and capacity to handle facilities of any size efficiently and thoroughly.'
    },
    {
      icon: Shield,
      title: 'Long-Term Asset Protection',
      description: 'Biannual deep cleaning prevents permanent damage from industrial pollutants, weather exposure, and environmental contaminants. Extend the life of your building\'s exterior surfaces and coatings.'
    },
    {
      icon: Star,
      title: 'Minimal Business Disruption',
      description: 'Scheduled maintenance during optimal times means no interference with daily operations. We work weekends, nights, or during slow periods to keep your business running smoothly.'
    }
  ];

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/Gemini_Generated_Image_n4ng9zn4ng9zn4ng.png)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-gray-900/90"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-slate-300 text-slate-900 px-4 py-2 rounded-full font-bold text-sm mb-6">
              BEST VALUE
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Silver Seasonal Maintenance Program
            </h1>
            <p className="text-xl text-slate-100 mb-4 leading-relaxed">
              Cost-effective, comprehensive maintenance designed for large commercial and industrial properties.
            </p>
            <p className="text-lg text-slate-200 mb-8 leading-relaxed">
              Our Silver Seasonal Program delivers exceptional value for properties that require major deep cleaning twice per year. Perfect for warehouses, manufacturing facilities, and large commercial complexes, this program provides thorough seasonal cleaning without the frequency premium. Protect your investment and maintain professional standards with strategic, scheduled maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-300 text-slate-900 rounded-lg font-bold text-lg hover:bg-slate-200 transition-all hover:scale-105 shadow-xl"
              >
                Schedule a Free Consultation
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="tel:+14015950726"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call 401-595-0726
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                This Program is Best Suited For
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <ul className="space-y-4">
                  {bestSuitedFor.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 bg-slate-100 border-2 border-slate-300 rounded-xl p-6">
                <p className="text-gray-700 font-semibold mb-2">
                  <Building2 className="w-5 h-5 inline mr-2 text-slate-600" />
                  Ideal Property Size:
                </p>
                <p className="text-gray-600">
                  Properties with 50,000+ square feet of exterior surfaces, large parking areas, loading docks, and multiple building faces.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What's Included
              </h2>
              <div className="bg-slate-50 rounded-xl border-2 border-slate-300 p-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Biannual Deep Cleaning</span>
                      <span className="text-gray-600">Comprehensive service twice per year (Spring & Fall)</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Complete Exterior Surface Cleaning</span>
                      <span className="text-gray-600">Building facades, walls, siding, and metal surfaces</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Loading Dock & Bay Cleaning</span>
                      <span className="text-gray-600">Remove industrial buildup, grease, and grime</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Parking Lot & Pavement Washing</span>
                      <span className="text-gray-600">Large-scale parking areas, drives, and access roads</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Equipment Washing</span>
                      <span className="text-gray-600">Exterior cleaning of fixed equipment and structures</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Dumpster & Waste Area Sanitization</span>
                      <span className="text-gray-600">Deep cleaning and deodorizing of waste management areas</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Flexible Off-Hours Scheduling</span>
                      <span className="text-gray-600">Weekend, night, or shutdown period service available</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Comprehensive Documentation</span>
                      <span className="text-gray-600">Before/after photos, detailed service reports, compliance records</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-slate-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Volume Pricing Discount</span>
                      <span className="text-gray-600">Special rates for large-scale properties and multi-location contracts</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Key Benefits of Silver Seasonal Maintenance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic maintenance that protects large-scale investments without breaking the budget.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="bg-slate-700 text-white p-3 rounded-lg mr-4">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Strategic Seasonal Approach
              </h2>
              <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                Large properties don't need constant attention, but they do need strategic, thorough cleaning at key times of the year. Our seasonal approach maximizes results while minimizing costs.
              </p>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-slate-300 flex items-center">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">SPRING</span>
                    Spring Deep Clean (March-May)
                  </h3>
                  <p className="text-slate-200">
                    Remove winter salt, road grime, and organic buildup. Prepare your property for the active season with a fresh, clean start. Address any winter damage before it becomes permanent.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-slate-300 flex items-center">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm mr-3">FALL</span>
                    Fall Protection Clean (September-November)
                  </h3>
                  <p className="text-slate-200">
                    Remove summer dust, industrial residue, and organic matter. Prepare surfaces for winter weather to prevent freeze-thaw damage. Clean before leaves and debris create permanent staining.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 text-gray-900">
              <h3 className="text-2xl font-bold mb-6">Why Twice a Year is Enough</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-bold mb-2">Industrial & Warehouse Properties</h4>
                  <p className="text-gray-600 text-sm">
                    These properties prioritize function over constant aesthetic maintenance. Seasonal cleaning maintains professional standards without unnecessary frequency.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-bold mb-2">Large Surface Areas</h4>
                  <p className="text-gray-600 text-sm">
                    Extensive properties (50,000+ sq ft) benefit more from thorough deep cleaning twice per year than frequent light cleaning.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-bold mb-2">Budget-Conscious Operations</h4>
                  <p className="text-gray-600 text-sm">
                    Maximize maintenance budget efficiency while still protecting your investment and maintaining compliance standards.
                  </p>
                </div>
                <div className="bg-slate-100 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <strong className="text-slate-900">Pro Tip:</strong> Many facility managers combine our Silver Seasonal Program with spot cleaning for high-traffic areas, creating a hybrid approach that maximizes value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Real-World Results: Seasonal Maintenance in Action
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl font-bold text-slate-700 mb-2">150,000</div>
              <div className="text-gray-600 font-semibold mb-3">sq ft warehouse facility</div>
              <p className="text-gray-600 text-sm">
                Maintained pristine condition with biannual service. Saved 60% compared to quarterly program while meeting all compliance requirements.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl font-bold text-slate-700 mb-2">5-Year</div>
              <div className="text-gray-600 font-semibold mb-3">Partnership Achievement</div>
              <p className="text-gray-600 text-sm">
                Manufacturing client prevented $45,000 in exterior repairs through consistent seasonal maintenance. ROI: 12x their investment.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-4xl font-bold text-slate-700 mb-2">Zero</div>
              <div className="text-gray-600 font-semibold mb-3">Operational Disruption</div>
              <p className="text-gray-600 text-sm">
                Distribution center cleaned during weekend shifts. 100% uptime maintained while achieving complete exterior restoration.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Protect Your Investment with Strategic Maintenance?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Schedule a free consultation and site assessment. We'll evaluate your property, recommend the optimal cleaning schedule, and provide transparent pricing for your seasonal maintenance plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/commercial#quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-700 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-lg"
            >
              Schedule a Free Consultation
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call 401-595-0726
            </a>
          </div>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>Same-day quotes</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>$5M liability coverage</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Compare Our Maintenance Programs
            </h3>
            <p className="text-gray-600">
              Discover if a higher-frequency program better suits your property's needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              to="/commercial/maintenance-programs/monthly-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-slate-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-slate-700">
                Platinum Monthly Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                Premium monthly service for high-traffic commercial areas that demand daily operational excellence.
              </p>
              <span className="text-slate-700 font-semibold flex items-center">
                Learn More
                <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              to="/commercial/maintenance-programs/quarterly-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-slate-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-slate-700">
                Gold Quarterly Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                The most popular choice for retail and professional properties seeking year-round professional appearance.
              </p>
              <span className="text-slate-700 font-semibold flex items-center">
                Learn More
                <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
