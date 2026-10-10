import { Check, Building2, ChevronRight, Shield, Clock, Users, Award, TrendingUp, Briefcase, Home, Building, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import QuoteForm from '../components/QuoteForm';
import { updatePageMeta, addStructuredData, businessStructuredData } from '../utils/seo';
import { HERO_IMAGES } from '../config/images';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import CrossPromotionBanner from '../components/CrossPromotionBanner';
import CrossPromotionInline from '../components/CrossPromotionInline';
import { TownLinkedText } from '../components/TownLinkedText';

export default function CommercialPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  useEffect(() => {
    updatePageMeta({
      title: 'Commercial Power Washing RI & MA │ Business Cleaning – J&M',
      description: 'Commercial power washing and scheduled maintenance for storefronts, parking lots & buildings in RI and MA. Licensed, insured, and trusted by property managers.',
      keywords: 'commercial pressure washing RI, commercial pressure washing Rhode Island, commercial pressure washing Massachusetts, business exterior cleaning, building washing, storefront cleaning, parking lot cleaning, commercial property maintenance, restaurant cleaning, retail cleaning, property management, facility management, scheduled maintenance, fleet washing, North Smithfield, Providence, Warwick, Cranston, Smithfield, Lincoln',
      ogTitle: 'Commercial Power Washing RI & MA | Scheduled Maintenance | J&M',
      ogDescription: 'Reliable commercial exterior cleaning for property managers and business owners. Scheduled maintenance programs, flexible hours, professional service. Serving RI & MA.',
    });

    addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Commercial Pressure Washing',
      name: 'Commercial Pressure Washing',
      description: 'Professional commercial pressure washing and exterior cleaning services',
      provider: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing & Holiday Lights',
        telephone: '+1-401-595-0726',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '50 Truman St',
          addressLocality: 'Johnston',
          addressRegion: 'RI',
          postalCode: '02919',
          addressCountry: 'US',
        },
      },
      areaServed: [
        { '@type': 'State', name: 'Rhode Island' },
        { '@type': 'State', name: 'Massachusetts' },
      ],
      url: 'https://powerwashjm.com/commercial/',
    });
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/buildings.PNG)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wider">Business Solutions</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Commercial Property Maintenance Solutions</h1>
            <p className="text-xl text-blue-100 mb-8">
              Reliable, professional exterior cleaning for property managers, facility directors, and business owners. Protect your investment and maintain a professional appearance with scheduled maintenance programs designed for minimal disruption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <a href="#quote" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg mb-3 whitespace-nowrap">
                  Get a Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
                <div className="text-center">
                  <Link to="/financing/" className="text-blue-100 text-sm underline hover:text-white transition-colors">
                    We Offer Financing
                  </Link>
                </div>
              </div>
              <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg whitespace-nowrap h-fit">
                Call (401) 595-0726
              </a>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Scheduled Maintenance Programs</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Licensed & Fully Insured</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Flexible Scheduling</strong> (After-Hours Available)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Professional Equipment & Team</strong></span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-700/50">
              <CrossPromotionInline
                text="Have a company fleet?"
                linkText="Check out our Fleet Washing Services"
                linkUrl="/commercial/fleet-washing"
                icon={<Truck className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 1: Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Professional Commercial Power Washing in Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            First impressions determine whether customers enter your business or drive past to competitors. Dirty storefronts, stained sidewalks, and grimy building exteriors signal neglect that undermines customer confidence and employee morale. J&M Power Washing specializes in commercial exterior maintenance throughout Rhode Island and Massachusetts, providing scheduled cleaning programs that keep retail centers, restaurants, medical offices, apartment complexes, and professional buildings looking their best year-round. We understand that business operations cannot pause for cleaning, so our teams work efficiently during off-hours, maintain proper safety protocols, and minimize disruption while delivering professional results that enhance property value and create positive impressions that drive business success.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/fleet/ourfleet4trucks.jpg"
                alt="Our Professional Fleet"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Professional Service Your Business Can Count On</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                As a property manager or facility director, you need reliable partners who understand the unique demands of commercial properties. Our scheduled maintenance programs ensure your property consistently maintains a professional appearance without disrupting your business operations or tenant experience.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                We specialize in working with property management companies, facility directors, retail chains, and multi-unit properties. Our uniformed team, professional-grade equipment, and comprehensive insurance coverage mean you can confidently add us to your preferred vendor list.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Minimize Business Disruption</h3>
                    <p className="text-gray-600">Evening and weekend services available to protect tenant experience and business operations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Comprehensive Insurance</h3>
                    <p className="text-gray-600">Full liability and workers comp coverage - certificates provided upon request</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Reliable & Professional</h3>
                    <p className="text-gray-600">Uniformed crew, marked vehicles, consistent service quality you can depend on</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-blue-100 h-fit">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Commercial Services</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Bank drive-thrus</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Fast food drive-thrus</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Gas stations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Apartment buildings</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Parking lot cleaning</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Storefront washing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <Link to="/commercial/fleet-washing/" className="text-blue-900 text-lg font-semibold hover:text-blue-700 hover:underline">
                    Fleet washing →
                  </Link>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Building exteriors</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">Commercial property maintenance</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-900 text-white rounded-2xl p-8 h-fit">
              <h3 className="text-2xl font-bold mb-6">Property Types</h3>
              <ul className="space-y-4 text-blue-100">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Retail stores and shopping centers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Restaurants and food service</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Office buildings</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Apartment and condo complexes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Hotels and hospitality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Medical facilities</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Industrial properties</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2: Why Commercial Properties Need Professional Maintenance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Why Commercial Properties Need Professional Maintenance</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            <TownLinkedText>
              Commercial properties face greater cleaning challenges than residential homes due to higher traffic volumes, extended exposure to vehicle exhaust, food service waste, and public use patterns that accelerate deterioration. Restaurant exteriors in Providence, Warwick, and Cranston accumulate grease vapor, cooking smoke residue, and dumpster area contamination that standard cleaning cannot address. Retail sidewalks and parking lots collect gum, oil drips, and atmospheric pollutants that create liability risks and undermine curb appeal. Multi-family housing in Pawtucket and Woonsocket suffers from graffiti, smoke staining near entryways, and dumpster area odors that reduce property values and tenant satisfaction. Medical offices and professional buildings must maintain pristine appearances that convey competence and attention to detail. Regular professional cleaning protects property investments, maintains competitive positioning, and prevents minor issues from becoming expensive problems requiring costly restoration.
            </TownLinkedText>
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Why Property Managers Choose Us</h2>
            <p className="text-xl text-gray-600">Reliable partners for commercial property maintenance</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img
                src="/fleet/servicetruck.png"
                alt="Professional Service Truck"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Professional Fleet & Equipment</h3>
                  <p className="text-gray-600">Branded vehicles, commercial-grade equipment, and a professional appearance that reflects well on your property</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Protect Property Value</h3>
                  <p className="text-gray-600">Regular maintenance prevents costly damage from mold, mildew, and buildup - extending the life of building exteriors</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Simplified Vendor Management</h3>
                  <p className="text-gray-600">One point of contact, consistent scheduling, transparent invoicing - we make property management easier</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Scheduled Programs',
                desc: 'Set up recurring service intervals that fit your budget and property needs - monthly, quarterly, or seasonal',
                icon: Clock
              },
              {
                title: 'Insurance & Compliance',
                desc: 'Full liability and workers comp insurance. COI certificates provided immediately upon request',
                icon: Shield
              },
              {
                title: 'Consistent Quality',
                desc: 'Same trained crew, proven processes, quality control checks - reliability you can count on',
                icon: Users
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <CrossPromotionBanner
            variant="prominent"
            title="Have a Fleet? We Clean Vehicles Too"
            description="Complete your commercial maintenance with our mobile fleet washing service. On-site service means zero downtime—we come to your parking lot. Perfect for delivery trucks, service vehicles, and company fleets of 5+."
            benefits={[
              "On-site mobile service (zero vehicle downtime)",
              "Night & weekend scheduling available",
              "Same reliable team as your building services",
              "Save 40% vs. traditional wash bays"
            ]}
            ctaText="Get Fleet Washing Pricing"
            ctaLink="/commercial/fleet-washing"
            icon={<Truck className="w-10 h-10 text-white" />}
            imageSrc="/beforeandafter/truckbeforeandafter.png"
          />
        </div>
      </section>

      <section id="maintenance-programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Scheduled Maintenance Programs</h2>
            <p className="text-xl text-gray-600 mb-4">
              Predictable costs, consistent results, simplified property management
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the service frequency that matches your property type and budget. All programs include after-hours scheduling, professional crews, transparent invoicing, and priority response.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/commercial/maintenance-programs/monthly-maintenance/"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-xs mb-3">
                  PREMIUM
                </div>
                <div className="text-4xl font-bold text-blue-900 mb-2">Platinum Monthly</div>
                <p className="text-gray-700 font-semibold">High-Traffic Areas</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Drive-thrus & gas stations</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quick-service restaurants</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Monthly comprehensive cleaning</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>24-hour emergency response</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-blue-600 font-bold group-hover:text-blue-700 flex items-center justify-center">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-1" />
                </span>
              </div>
            </Link>

            <Link
              to="/commercial/maintenance-programs/quarterly-maintenance/"
              className="group bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-8 border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="inline-block bg-amber-400 text-amber-900 px-4 py-1 rounded-full font-bold text-xs mb-3">
                  MOST POPULAR
                </div>
                <div className="text-4xl font-bold text-amber-900 mb-2">Gold Quarterly</div>
                <p className="text-gray-700 font-semibold">Best Value Option</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Retail stores & offices</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Medical & professional facilities</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Four seasonal cleanings per year</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>15% discount on extra services</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-amber-600 font-bold group-hover:text-amber-700 flex items-center justify-center">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-1" />
                </span>
              </div>
            </Link>

            <Link
              to="/commercial/maintenance-programs/seasonal-maintenance/"
              className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border-2 border-slate-200 hover:border-slate-400 transition-all hover:shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="inline-block bg-slate-300 text-slate-900 px-4 py-1 rounded-full font-bold text-xs mb-3">
                  BEST VALUE
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">Silver Seasonal</div>
                <p className="text-gray-700 font-semibold">Large Properties</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-slate-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Warehouses & industrial</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-slate-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Large commercial complexes</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-slate-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Biannual deep cleaning</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="w-5 h-5 text-slate-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cost-effective maintenance</span>
                </li>
              </ul>
              <div className="text-center">
                <span className="text-slate-600 font-bold group-hover:text-slate-700 flex items-center justify-center">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-1" />
                </span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Not sure which program is right for you? We can help you choose the best option for your property.
            </p>
            <a
              href="#quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
            >
              Get a Free Consultation
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Content Block 3: Our Commercial Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Commercial Services</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            J&M provides comprehensive commercial exterior maintenance including building washing, storefront cleaning, sidewalk and parking lot maintenance, dumpster pad cleaning, awning and canopy washing, drive-through lane maintenance, and graffiti removal. We develop customized maintenance schedules matching your property's needs and budget, from weekly restaurant cleaning to quarterly office building service. Our commercial teams use truck-mounted equipment that provides consistent water pressure and chemical mixing for reliable results, and we maintain proper insurance coverage including general liability, workers compensation, and commercial vehicle policies that protect property owners from risk. Off-hours scheduling minimizes business disruption, and we coordinate with property managers to address changing needs, emergency cleaning requirements, and seasonal services. All work follows OSHA safety standards, and our teams carry proper safety equipment including non-slip footwear, high-visibility clothing, and appropriate PPE for chemical handling. For building exteriors, consider our <Link to="/house-washing/" className="text-blue-600 hover:text-blue-800 underline">professional soft washing services</Link>, or for specialized needs, explore our <Link to="/concrete-cleaning/" className="text-blue-600 hover:text-blue-800 underline">concrete cleaning</Link> and <Link to="/roof-cleaning/" className="text-blue-600 hover:text-blue-800 underline">roof cleaning</Link> solutions.
          </p>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Areas: Rhode Island & Massachusetts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Commercial property cleaning throughout our 30+ mile service radius
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RI</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Rhode Island Commercial Services</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/towns/providence-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Providence</Link>
                <Link to="/towns/warwick-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Warwick</Link>
                <Link to="/towns/cranston-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Cranston</Link>
                <Link to="/towns/pawtucket-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Pawtucket</Link>
                <Link to="/towns/east-providence-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">East Providence</Link>
                <Link to="/towns/woonsocket-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Woonsocket</Link>
                <Link to="/towns/north-smithfield-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">North Smithfield</Link>
                <Link to="/towns/smithfield-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Smithfield</Link>
                <Link to="/towns/cumberland-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Cumberland</Link>
                <Link to="/towns/lincoln-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Lincoln</Link>
                <Link to="/towns/johnston-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Johnston</Link>
                <Link to="/towns/north-providence-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">North Providence</Link>
                <Link to="/towns/coventry-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Coventry</Link>
                <Link to="/towns/west-warwick-ri/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">West Warwick</Link>
              </div>
              <p className="mt-6 text-sm text-gray-600 italic">And all surrounding Rhode Island communities</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MA</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Massachusetts Commercial Services</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/towns/attleboro-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Attleboro</Link>
                <Link to="/towns/north-attleboro-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">North Attleboro</Link>
                <Link to="/towns/franklin-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Franklin</Link>
                <Link to="/towns/mansfield-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Mansfield</Link>
                <Link to="/towns/seekonk-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Seekonk</Link>
                <Link to="/towns/plainville-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Plainville</Link>
                <Link to="/towns/bellingham-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Bellingham</Link>
                <Link to="/towns/wrentham-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Wrentham</Link>
                <Link to="/towns/foxboro-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Foxboro</Link>
                <Link to="/towns/norton-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Norton</Link>
                <Link to="/towns/rehoboth-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Rehoboth</Link>
                <Link to="/towns/swansea-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Swansea</Link>
              </div>
              <p className="mt-6 text-sm text-gray-600 italic">And all surrounding Massachusetts communities</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Don't See Your Location Listed?</h3>
            <p className="text-lg text-gray-700 mb-4">We service many additional communities throughout Rhode Island and Massachusetts for commercial property cleaning.</p>
            <a href="tel:+14015950726" className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
              Call (401) 595-0726 to Confirm Service
            </a>
          </div>
        </div>
      </section>

      <QuoteForm />

      {/* HOA & Property Management Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <Building className="w-16 h-16 mx-auto mb-6 text-blue-300" />
          <h2 className="text-4xl font-bold mb-4">Property Managers & HOA Boards</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            We specialize in multi-family, HOA, and condo complex cleaning. Flexible scheduling, vendor-ready documentation, and professional service designed for property managers.
          </p>
          <Link
            to="/hoa-condo-cleaning/"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            View HOA & Condo Services
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Related Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Residential Services Available</h2>
            <p className="text-xl text-gray-600">We also serve homeowners with professional residential cleaning</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/house-washing/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">House Washing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Professional residential house washing. Soft washing that safely removes mold, mildew, and algae.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link to="/roof-cleaning/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Roof Cleaning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Remove black streaks, moss, and algae. Extend your roof's lifespan with professional cleaning.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link to="/concrete-cleaning/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Concrete Cleaning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Residential driveway and patio cleaning. High-pressure cleaning that removes years of buildup.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Request a Commercial Property Proposal</h2>
          <p className="text-xl text-gray-600 mb-8">
            Get a detailed quote tailored to your property's specific needs and schedule
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all">
              Call (401) 595-0726
            </a>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-900 hover:text-white transition-all">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
