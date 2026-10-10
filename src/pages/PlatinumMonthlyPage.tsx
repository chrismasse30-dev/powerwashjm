import { Check, ChevronRight, Phone, Mail, Star, Shield, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { updatePageMeta, addStructuredData, createServiceSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function PlatinumMonthlyPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    const canonicalUrl = 'https://powerwashjm.com/commercial/maintenance-programs/monthly-maintenance/';

    updatePageMeta({
      title: 'Professional Power Washing in RI & MA | J & M Power Washing',
      description: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more. Call today for a free estimate!',
      keywords: 'monthly pressure washing, commercial maintenance program, drive-thru cleaning, gas station cleaning, restaurant exterior cleaning, high traffic area maintenance, monthly power washing RI',
      ogTitle: 'Professional Power Washing in RI & MA | J & M Power Washing',
      ogDescription: 'J & M Power Washing offers expert power washing and exterior cleaning for homes and businesses in Rhode Island and Massachusetts. We clean siding, roofs, driveways & more.',
      canonical: canonicalUrl
    });

    addStructuredData(createServiceSchema(
      'Platinum Monthly Maintenance',
      'Premium monthly pressure washing maintenance program for high-traffic commercial properties. Includes drive-thrus, parking areas, entrances, and walkways.',
      'https://powerwashjm.com/commercial/maintenance-programs/monthly-maintenance/'
    ));
  }, []);

  const bestSuitedFor = [
    'Quick-service restaurants and fast-food establishments',
    'Gas stations and convenience stores',
    'Drive-thru banking facilities',
    'High-traffic retail locations',
    'Car washes and auto service centers',
    'Medical facilities with frequent patient traffic',
    'Shopping center anchor stores',
    'Any business with drive-thru or high foot traffic'
  ];

  const keyBenefits = [
    {
      icon: Star,
      title: 'Daily Operational Excellence',
      description: 'Your property remains spotless and inviting every single day. Monthly service ensures oil stains, food spills, and debris never accumulate, maintaining a pristine first impression.'
    },
    {
      icon: Shield,
      title: 'Enhanced Safety & Liability Protection',
      description: 'Regular cleaning removes slippery substances and hazards before they cause accidents. Reduce slip-and-fall risks and demonstrate proactive property maintenance for liability protection.'
    },
    {
      icon: TrendingUp,
      title: 'Maximize Customer Traffic',
      description: 'Clean, well-maintained exteriors attract more customers and encourage longer visits. Studies show customers spend 20% more time at visibly clean establishments.'
    },
    {
      icon: Clock,
      title: 'Predictable Maintenance Costs',
      description: 'Lock in monthly pricing with no surprise expenses. Budget accurately for the year ahead and enjoy priority scheduling that fits your business hours.'
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-900/90"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold text-sm mb-6">
              PREMIUM SERVICE
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Platinum Monthly Maintenance Program
            </h1>
            <p className="text-xl text-blue-100 mb-4 leading-relaxed">
              The ultimate maintenance solution for high-traffic commercial properties that demand daily excellence.
            </p>
            <p className="text-lg text-blue-200 mb-8 leading-relaxed">
              When your business never stops, neither do we. Our Platinum Monthly Program ensures your property maintains the highest standards of cleanliness, safety, and curb appeal every single day. Perfect for drive-thrus, gas stations, and any high-impact commercial area where first impressions are everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-xl"
              >
                Get a Free Assessment
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
              <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Monthly Comprehensive Cleaning</span>
                      <span className="text-gray-600">Complete pressure washing of all exterior surfaces</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Drive-Thru & Parking Area Focus</span>
                      <span className="text-gray-600">Remove oil stains, food spills, and tire marks</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Entrance & Walkway Cleaning</span>
                      <span className="text-gray-600">Keep high-traffic areas safe and spotless</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Dumpster Pad Degreasing</span>
                      <span className="text-gray-600">Eliminate odors and maintain sanitation standards</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Priority Scheduling</span>
                      <span className="text-gray-600">Flexible timing that works around your operations</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Emergency Response Service</span>
                      <span className="text-gray-600">24-hour priority response for urgent cleanups</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Documented Service Reports</span>
                      <span className="text-gray-600">Photo documentation and completion certificates</span>
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
              Key Benefits of Platinum Monthly Maintenance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Invest in your property's appearance, safety, and long-term value with our most comprehensive maintenance program.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-8 border border-blue-100 hover:shadow-xl transition-shadow">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Why Choose Monthly Maintenance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            High-traffic commercial properties face unique challenges. Oil drips, food spills, tire marks, and daily wear create an unsightly and potentially hazardous environment. Our Platinum Monthly Program prevents these issues from ever becoming visible problems.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
            <p className="text-lg text-blue-50 leading-relaxed mb-4">
              <strong className="text-yellow-400">The Challenge:</strong> Drive-thrus and high-traffic areas can accumulate stains and debris within days, creating an unprofessional appearance that drives customers away.
            </p>
            <p className="text-lg text-blue-50 leading-relaxed">
              <strong className="text-yellow-400">Our Solution:</strong> Monthly service keeps your property in pristine condition 365 days a year. You'll never worry about unsightly stains or safety hazards again.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Elevate Your Property's Standards?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Schedule a free, no-obligation property assessment. We'll evaluate your specific needs and provide a customized monthly maintenance plan with transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/commercial#quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
            >
              Get a Free Assessment
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
              <span>Fast response time</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Fully insured</span>
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
              Not sure if Platinum Monthly is right for you? Explore our other maintenance programs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              to="/commercial/maintenance-programs/quarterly-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Gold Quarterly Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                Perfect for most commercial properties seeking balanced, year-round maintenance without the premium frequency.
              </p>
              <span className="text-blue-600 font-semibold flex items-center">
                Learn More
                <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
            <Link
              to="/commercial/maintenance-programs/seasonal-maintenance/"
              className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition-colors group"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Silver Seasonal Maintenance
              </h4>
              <p className="text-gray-600 mb-4">
                Ideal for large facilities and industrial properties that need major seasonal cleaning and long-term protection.
              </p>
              <span className="text-blue-600 font-semibold flex items-center">
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
