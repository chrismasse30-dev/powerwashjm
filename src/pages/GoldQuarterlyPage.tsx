import { Check, ChevronRight, Phone, Mail, Star, Shield, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { updatePageMeta, addStructuredData, createServiceSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function GoldQuarterlyPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    const canonicalUrl = 'https://powerwashjm.com/commercial/maintenance-programs/quarterly-maintenance/';

    updatePageMeta({
      title: 'Professional Power Washing in RI & MA | J & M Power Washing',
      description: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more. Call today for a free estimate!',
      keywords: 'quarterly pressure washing, commercial maintenance, retail storefront cleaning, office building cleaning, medical facility cleaning, preventative maintenance, quarterly power washing RI',
      ogTitle: 'Professional Power Washing in RI & MA | J & M Power Washing',
      ogDescription: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more.',
      canonical: canonicalUrl
    });

    addStructuredData(createServiceSchema(
      'Gold Quarterly Maintenance',
      'Quarterly pressure washing maintenance program for commercial properties. Includes storefronts, parking areas, sidewalks, and building exteriors.',
      'https://powerwashjm.com/commercial/maintenance-programs/quarterly-maintenance/'
    ));
  }, []);

  const bestSuitedFor = [
    'Retail stores and shopping centers',
    'Professional office buildings',
    'Medical and dental practices',
    'Restaurants and hospitality venues',
    'Banks and financial institutions',
    'Apartment complexes and multi-family properties',
    'Strip malls and plaza storefronts',
    'Service businesses with regular foot traffic'
  ];

  const keyBenefits = [
    {
      icon: Star,
      title: 'Year-Round Professional Appearance',
      description: 'Four comprehensive cleanings per year ensure your property maintains a consistently professional image through all seasons. Never worry about accumulated grime affecting your business reputation.'
    },
    {
      icon: Shield,
      title: 'Preventative Maintenance & Cost Savings',
      description: 'Regular quarterly cleaning prevents permanent staining and surface degradation. Protect your property investment and avoid costly repairs from neglected exterior maintenance.'
    },
    {
      icon: Calendar,
      title: 'Perfect Balance of Value & Frequency',
      description: 'The most popular choice among commercial clients. Quarterly service provides optimal cleanliness at a balanced price point, delivering professional results without premium pricing.'
    },
    {
      icon: TrendingUp,
      title: 'Improved Customer Perception',
      description: 'Clean exteriors signal professionalism and attention to detail. Studies show 76% of customers judge business quality by exterior appearance before ever stepping inside.'
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-amber-800/85 to-orange-900/90"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-bold text-sm mb-6">
              MOST POPULAR
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Gold Quarterly Maintenance Program
            </h1>
            <p className="text-xl text-amber-100 mb-4 leading-relaxed">
              The perfect balance of professional maintenance and value for most commercial properties.
            </p>
            <p className="text-lg text-amber-200 mb-8 leading-relaxed">
              Our Gold Quarterly Program is designed for businesses that understand the importance of consistent curb appeal without the need for monthly service. Four comprehensive cleanings per year keep your property looking professional through every season, protecting your investment and impressing customers year-round.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-amber-400 text-amber-900 rounded-lg font-bold text-lg hover:bg-amber-300 transition-all hover:scale-105 shadow-xl"
              >
                Request a Free Evaluation
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
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What's Included
              </h2>
              <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Seasonal Deep Cleaning</span>
                      <span className="text-gray-600">Comprehensive service four times per year</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Building Exterior Washing</span>
                      <span className="text-gray-600">Storefronts, windows, siding, and architectural features</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Parking & Walkway Maintenance</span>
                      <span className="text-gray-600">Remove seasonal buildup and maintain safe surfaces</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Entrance Area Focus</span>
                      <span className="text-gray-600">Keep customer-facing areas pristine and welcoming</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Scheduled Service Reminders</span>
                      <span className="text-gray-600">Automatic notifications before each quarterly service</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Flexible Scheduling</span>
                      <span className="text-gray-600">Work around your business hours with minimal disruption</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Service Documentation</span>
                      <span className="text-gray-600">Photo reports and completion certificates after each visit</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Discounted Additional Services</span>
                      <span className="text-gray-600">15% off any emergency or extra cleaning needs</span>
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
              Key Benefits of Gold Quarterly Maintenance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The smart choice for businesses seeking consistent professional appearance without premium pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-8 border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="bg-amber-600 text-white p-3 rounded-lg mr-4">
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-900 to-orange-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Quarterly Maintenance Makes Sense
              </h2>
              <p className="text-xl text-amber-100 mb-6 leading-relaxed">
                Most commercial properties don't need monthly service, but they do need more than annual cleaning. Our Gold Quarterly Program hits the sweet spot.
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-amber-300">Spring Renewal</h3>
                  <p className="text-amber-100">Remove winter salt, grime, and pollen buildup. Start the busy season with a fresh, clean appearance.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-amber-300">Summer Refresh</h3>
                  <p className="text-amber-100">Clean off dust, pollen, and summer storm residue. Keep your property looking its best during peak business season.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-amber-300">Fall Preparation</h3>
                  <p className="text-amber-100">Remove leaf stains, organic matter, and prepare for the holiday shopping season.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-2 text-amber-300">Winter Protection</h3>
                  <p className="text-amber-100">Clean before winter weather sets in. Prevent ice buildup on clean, well-maintained surfaces.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 text-gray-900">
              <h3 className="text-2xl font-bold mb-6">The Perfect Frequency</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Too Infrequent (Annual):</span>
                    <span className="text-red-600 font-bold">❌</span>
                  </div>
                  <p className="text-gray-600 text-sm">Allows permanent staining and surface damage. Property looks neglected most of the year.</p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-900">Just Right (Quarterly):</span>
                    <span className="text-green-600 font-bold text-xl">✓</span>
                  </div>
                  <p className="text-gray-700 text-sm font-medium">Prevents buildup, maintains professional appearance, and balances cost with results.</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">More Than Needed (Monthly):</span>
                    <span className="text-gray-400 font-bold">~</span>
                  </div>
                  <p className="text-gray-600 text-sm">Premium service for high-traffic areas. Excellent, but often more frequent than most properties require.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Maintain Professional Standards Year-Round?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Request a free property evaluation and receive a customized quarterly maintenance plan with transparent, locked-in pricing for the entire year.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/commercial#quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white rounded-lg font-bold text-lg hover:bg-amber-700 transition-all hover:scale-105 shadow-lg"
            >
              Request a Free Evaluation
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
              <span>24-hour response guarantee</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Fully insured & bonded</span>
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
              Explore our other maintenance programs to find the perfect fit for your property.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              to="/commercial/maintenance-programs/monthly-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-amber-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600">
                Platinum Monthly Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                Premium service for high-traffic areas like drive-thrus and gas stations that demand daily excellence.
              </p>
              <span className="text-amber-600 font-semibold flex items-center">
                Learn More
                <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              to="/commercial/maintenance-programs/seasonal-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-amber-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600">
                Silver Seasonal Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                Cost-effective solution for large facilities and industrial properties that need major seasonal cleaning.
              </p>
              <span className="text-amber-600 font-semibold flex items-center">
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
