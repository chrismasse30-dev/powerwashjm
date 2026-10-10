import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight, Home, Building2, Droplets, Wind, Sparkles, Briefcase, Trash2 } from 'lucide-react';
import QuoteForm from './QuoteForm';
import TownFAQ from './TownFAQ';
import { updatePageMeta, addMultipleStructuredData, createBreadcrumbSchema, createServiceSchema } from '../utils/seo';
import { getTownReviews } from '../data/townReviews';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { townsData } from '../data/townsData';
import { holidayLightsTownSlugs } from '../data/holidayLightsTownSlugs';

interface ServiceDetail {
  title: string;
  description: string;
  benefits: string[];
  pricing: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface TownPageProps {
  townName: string;
  state: string;
  stateAbbr: string;
  zipCode: string;
  description: string;
  keywords: string;
  heroImage?: string;
  townSlug: string;
  seoContent?: string;
  mapEmbedUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  coordinates?: { lat: number; lng: number };
  neighborhood1?: string;
  neighborhood2?: string;
  neighborhood3?: string;
  pricingLow?: number;
  pricingHigh?: number;
}

export default function TownPageTemplate({ townName, state, stateAbbr, zipCode, description, keywords, heroImage, townSlug, seoContent, mapEmbedUrl, metaTitle, metaDescription, coordinates, neighborhood1, neighborhood2, neighborhood3, pricingLow, pricingHigh }: TownPageProps) {
  const location = useLocation();
  const reviews = getTownReviews(townSlug);
  const [activeService, setActiveService] = useState<string>('roof-cleaning');
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  const services: Record<string, ServiceDetail> = {
    'roof-cleaning': {
      title: 'Roof Cleaning',
      description: `Professional soft wash roof cleaning in ${townName}. Our eco-friendly process safely removes algae, moss, and black streaks (Gloeocapsa magma) without damaging your shingles. Unlike harsh pressure washing, our method kills organic growth at the root for longer-lasting results.`,
      benefits: [
        `Safe for all shingle types common in ${townName}`,
        'Removes black streaks and algae stains completely',
        'Extends roof life by 3-5 years on average',
        'Biodegradable cleaning solutions',
        'Most jobs completed in 1 day'
      ],
      pricing: `Most ${townName} roofs: $449-$899`,
      icon: Building2,
      path: '/roof-cleaning/'
    },
    'house-washing': {
      title: 'House Washing',
      description: `Transform your ${townName} home with professional soft washing. We safely clean vinyl, cedar, and composite siding without the damage that high-pressure washing can cause. Our process removes dirt, mold, mildew, and algae while protecting your home's exterior.`,
      benefits: [
        `Safe for all siding types in ${townName}`,
        'Increases curb appeal and home value',
        'Removes mold, mildew, and allergens',
        'Protects and extends siding life',
        'Eco-friendly, biodegradable solutions'
      ],
      pricing: `Most ${townName} homes: $349-$799`,
      icon: Home,
      path: '/house-washing/'
    },
    'deck-cleaning': {
      title: 'Deck Cleaning & Restoration',
      description: `Restore your ${townName} deck's natural beauty. We clean and prepare wood and composite decks, removing years of weathering, algae, and grime. Optional staining and sealing services available to protect your investment.`,
      benefits: [
        'Removes embedded dirt and algae',
        'Restores natural wood color',
        'Prepares surface for staining/sealing',
        'Safe for wood and composite materials',
        'Optional: Professional staining services'
      ],
      pricing: `Typical ${townName} decks: $299-$699`,
      icon: Wind,
      path: '/deck-cleaning/'
    },
    'gutter-cleaning': {
      title: 'Full Gutter Cleaning',
      description: `Complete gutter cleaning service in ${townName}. We remove all debris from inside your gutters AND clean the exterior faces. Clogged gutters can cause foundation damage, basement flooding, and landscape erosion.`,
      benefits: [
        'Complete interior debris removal',
        'Exterior face cleaning included',
        'Prevents water damage and flooding',
        'Extends gutter system life',
        'Photo documentation of work completed'
      ],
      pricing: `Most ${townName} homes: $149-$349`,
      icon: Trash2,
      path: '/gutter-cleaning/'
    },
    'concrete-cleaning': {
      title: 'Concrete & Driveway Cleaning',
      description: `Remove oil stains, dirt, and years of buildup from your ${townName} driveway, walkways, and patios. Our high-pressure concrete cleaning restores surfaces to like-new condition, dramatically improving curb appeal.`,
      benefits: [
        'Removes oil stains and tire marks',
        'Eliminates slip hazards from algae',
        'Dramatically improves appearance',
        'Safe for all concrete surfaces',
        'Optional: Sealing services available'
      ],
      pricing: `Typical ${townName} driveways: $199-$499`,
      icon: Droplets,
      path: '/concrete-cleaning/'
    },
    'holiday-lights': {
      title: 'Holiday Light Installation',
      description: `Professional Christmas light installation in ${townName}. Custom designs, commercial-grade LED lights, and hassle-free installation and removal. Transform your home into a holiday showpiece without the ladder work or storage hassles.`,
      benefits: [
        'Custom design consultation included',
        'Commercial-grade LED lights',
        'Professional installation and removal',
        'Midseason maintenance checks',
        'Safe storage until next season'
      ],
      pricing: `${townName} packages: $499-$2,999`,
      icon: Sparkles,
      path: holidayLightsTownSlugs.includes(townSlug) ? '/holiday-lights/' + townSlug + '/' : '/holiday-lights/'
    }
  };

  useEffect(() => {
    updatePageMeta({
      title: metaTitle || `Power Washing ${townName} ${stateAbbr} – Soft Wash & Roof Cleaning │ J&M`,
      description: metaDescription || `${townName} power washing by J&M. Soft wash experts removing black streaks from ${zipCode} homes. Free quote: (401) 595-0726`,
      keywords: `power washing ${townName}, pressure washing ${townName} ${stateAbbr}, house washing ${townName}, soft washing ${townName}, ${keywords}`,
      ogTitle: metaTitle || `Power Washing ${townName} ${stateAbbr} – Soft Wash & Roof Cleaning │ J&M`,
      ogDescription: metaDescription || `${townName} power washing by J&M. Soft wash experts removing black streaks from ${zipCode} homes. Free quote: (401) 595-0726`,
    });

    const breadcrumbs = [
      { name: 'Home', url: 'https://powerwashjm.com/' },
      { name: 'Service Areas', url: 'https://powerwashjm.com/towns/' },
      { name: `${townName}, ${stateAbbr}`, url: `https://powerwashjm.com${location.pathname}` }
    ];

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `J&M Power Washing - ${townName}`,
      description: `Professional power washing and exterior cleaning services in ${townName}, ${state}. ${description}`,
      image: 'https://powerwashjm.com/logos/logo.png',
      '@id': `https://powerwashjm.com${location.pathname}`,
      url: `https://powerwashjm.com${location.pathname}`,
      telephone: '+1-401-595-0726',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: townName,
        addressRegion: stateAbbr,
        postalCode: zipCode,
        addressCountry: 'US',
      },
      areaServed: {
        '@type': 'City',
        name: townName,
        '@id': `https://www.wikidata.org/wiki/${townName.replace(/\s+/g, '_')}`
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: coordinates?.lat || 41.8233,
        longitude: coordinates?.lng || -71.4753
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:00',
        closes: '19:00',
      },
      hasMap: 'https://maps.google.com/?cid=4364751189816519423',
      sameAs: [
        'https://www.facebook.com/profile.php?id=100064067522225',
        'https://www.instagram.com/jmpowerwashing/',
        'https://maps.google.com/?cid=4364751189816519423',
      ],
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Soft Wash Roof Cleaning',
            description: 'Biodegradable soft wash solutions that remove algae, moss, and black streaks without damaging shingles',
            provider: {
              '@type': 'LocalBusiness',
              name: 'J&M Power Washing'
            },
            areaServed: {
              '@type': 'City',
              name: townName,
              containedInPlace: {
                '@type': 'State',
                name: state
              }
            },
            availableChannel: {
              '@type': 'ServiceChannel',
              servicePhone: {
                '@type': 'ContactPoint',
                telephone: '+1-401-595-0726',
                contactType: 'customer service'
              }
            }
          },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            priceCurrency: 'USD',
            price: '0',
            name: 'Free Estimate'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'House Washing',
            description: 'Professional soft wash cleaning for vinyl and cedar siding',
            areaServed: {
              '@type': 'City',
              name: townName
            }
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Deck Cleaning & Restoration',
            description: 'Deck cleaning and staining services',
            areaServed: {
              '@type': 'City',
              name: townName
            }
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Gutter Cleaning',
            description: 'Professional gutter cleaning and debris removal',
            areaServed: {
              '@type': 'City',
              name: townName
            }
          }
        }
      ],
      knowsAbout: ['Soft Washing', 'Roof Cleaning', 'Algae Removal', 'Moss Removal', 'Black Streak Removal', 'House Washing', 'Exterior Cleaning'],
      slogan: '24-hour estimates, $2M insured, family-owned since 2018',
    };

    const schemas = [
      localBusinessSchema,
      createBreadcrumbSchema(breadcrumbs),
      createServiceSchema(
        `Power Washing in ${townName}`,
        `Professional power washing and exterior cleaning services in ${townName}, ${state}. ${description}`,
        `https://powerwashjm.com${location.pathname}`
      )
    ];

    addMultipleStructuredData(schemas);
  }, [townName, state, stateAbbr, zipCode, description, keywords, location.pathname, heroImage]);

  return (
    <div style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: heroImage
            ? `url(${heroImage})`
            : 'url(/homepagehouse.png)'
        }}
      >
        <div className={`absolute inset-0 ${heroImage ? 'bg-blue-900/50' : 'bg-gradient-to-r from-blue-900/95 to-blue-800/95'}`}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Power Washing {townName} {stateAbbr} – J&M Soft Wash & Roof Cleaning
            </h1>
            <p className="text-xl mb-8 text-blue-50 leading-relaxed">
              {description}
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
          </div>
        </div>
      </section>

      {/* CTA Button Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <a
            href="#quote"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-900 text-white rounded-lg font-bold text-lg hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
            Get Your Free Custom Estimate
          </a>
          <p className="text-sm text-gray-600 mt-3">
            Fill out our quick form below for a detailed quote • Most quotes sent within 24 hours
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-50 border-y-4 border-blue-400">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why {townName} Homeowners Choose J&M
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Family-Owned Since 2018</h3>
                <p className="text-gray-700">Local business serving {townName} residents with personalized service and attention to detail.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Soft Wash Specialists</h3>
                <p className="text-gray-700">We use biodegradable solutions and low-pressure techniques that safely remove algae, moss, and black streaks without damaging shingles or siding.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Free Quotes Within 24 Hours</h3>
                <p className="text-gray-700">Quick response time on all estimates. Most jobs completed in 1-2 days after approval.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Fully Licensed & Insured</h3>
                <p className="text-gray-700">Professional service with comprehensive insurance coverage. Your property and our team are fully protected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {seoContent && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">
              Exterior Cleaning Services in {townName}, {state}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {seoContent}
            </p>
          </div>
        </section>
      )}

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t-4 border-blue-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Our Services in {townName}, {stateAbbr}
            </h2>
            <p className="text-xl text-gray-600">
              Click each service to learn more about what we offer in your area
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {Object.entries(services).map(([key, service]) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveService(key)}
                  className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 ${
                    activeService === key
                      ? 'bg-blue-900 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {service.title}
                </button>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl p-8 lg:p-12">
            {activeService && services[activeService] && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  {(() => {
                    const IconComponent = services[activeService].icon;
                    return <IconComponent className="w-12 h-12 text-blue-900" />;
                  })()}
                  <h3 className="text-3xl font-bold text-blue-900">
                    {services[activeService].title} in {townName}
                  </h3>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {services[activeService].description}
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Check className="w-6 h-6 text-green-600" />
                      What's Included
                    </h4>
                    <ul className="space-y-3">
                      {services[activeService].benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-blue-900 mb-4">
                      Pricing & Details
                    </h4>
                    <div className="mb-6">
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        {services[activeService].pricing}
                      </p>
                      <p className="text-sm text-gray-600">
                        Exact pricing depends on size, condition, and accessibility
                      </p>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-blue-900" />
                        <span>Free on-site estimates</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-blue-900" />
                        <span>24-hour quote turnaround</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-blue-900" />
                        <span>Licensed & $2M insured</span>
                      </div>
                    </div>
                    <Link
                      to={services[activeService].path}
                      className="block w-full bg-blue-900 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all"
                    >
                      Learn More About {services[activeService].title}
                    </Link>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                  <p className="text-gray-800 font-semibold mb-2">
                    🏆 Why {townName} Homeowners Choose J&M:
                  </p>
                  <p className="text-gray-700">
                    Family-owned since 2018 • 165 five-star reviews • Same-day service available • Fully licensed RI contractor • $2M liability insurance • Satisfaction guaranteed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">
            Serving All of {townName} & Surrounding Areas
          </h3>
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="400"
              style={{ border: 0, maxWidth: '800px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: '0 auto', display: 'block' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${townName}, ${stateAbbr}`}
            />
          ) : (
            <div className="bg-gray-100 p-8 rounded-xl max-w-2xl mx-auto">
              <p className="text-gray-600">Map URL not available for {townName}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Our Services in {townName}
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive exterior cleaning services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Home, color: 'text-blue-600', title: 'House Washing', desc: 'Professional soft wash cleaning that removes dirt, mold, and mildew without damaging your home\'s exterior.', path: '/house-washing/' },
              { icon: Building2, color: 'text-green-600', title: 'Roof Cleaning', desc: 'Safe, effective roof cleaning that removes algae, moss, and stains while protecting your shingles.', path: '/roof-cleaning/' },
              { icon: Wind, color: 'text-amber-700', title: 'Deck Cleaning', desc: 'Restore your deck\'s natural beauty with our professional cleaning and staining services.', path: '/deck-cleaning/' },
              { icon: Droplets, color: 'text-cyan-600', title: 'Concrete Cleaning', desc: 'Remove oil stains, dirt, and grime from driveways, walkways, and patios.', path: '/concrete-cleaning/' },
              { icon: Droplets, color: 'text-slate-700', title: 'Full Gutter Cleaning', desc: 'Complete interior and exterior gutter cleaning service. We remove debris and clean both inside and outside for optimal function and appearance.', path: '/gutter-cleaning/' },
              { icon: Sparkles, color: 'text-yellow-500', title: holidayLightsTownSlugs.includes(townSlug) ? `Christmas Light Installation in ${townName}` : 'Holiday Lights', desc: 'Professional holiday light installation and removal. Custom designs, premium lights, and hassle-free takedown.', path: holidayLightsTownSlugs.includes(townSlug) ? '/holiday-lights/' + townSlug + '/' : '/holiday-lights/' },
              { icon: Briefcase, color: 'text-indigo-600', title: 'Commercial Services', desc: 'Bank drive-thrus, gas stations, storefronts, and fleet washing.', path: '/commercial/' }
            ].map((service, index) => (
              <Link key={index} to={service.path} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow flex flex-col items-center">
                <div className="mb-6">
                  <service.icon className={`w-16 h-16 ${service.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{service.desc}</p>
                <span className="text-blue-600 font-semibold">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Why Choose J & M in {townName}?
            </h2>
            {pricingLow && pricingHigh && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional exterior cleaning in {townName} starting at ${pricingLow} for standard homes. Most {townName} homeowners invest ${pricingLow}–${pricingHigh} depending on home size and services selected.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local to {townName}</h3>
              <p className="text-gray-600">
                Family-owned and operated — we know {neighborhood1 || townName}, {neighborhood2 || 'downtown'}, and every neighborhood in between
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Licensed & Insured</h3>
              <p className="text-gray-600">
                Fully licensed and insured in {state} for your complete peace of mind
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Same Day Service</h3>
              <p className="text-gray-600">
                Most {townName} jobs completed in a single day — minimal disruption to your schedule
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-600">
                We stand behind every job with our 100% satisfaction guarantee
              </p>
            </div>
          </div>

          {(neighborhood1 || neighborhood2 || neighborhood3) && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                {townName} Neighborhoods We Serve
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our crew is on the road in {townName} every week. We regularly serve homes and businesses in{' '}
                {neighborhood1 && <strong>{neighborhood1}</strong>}
                {neighborhood2 && <>, <strong>{neighborhood2}</strong></>}
                {neighborhood3 && <>, <strong>{neighborhood3}</strong></>}
                , and all surrounding areas of {townName}, {stateAbbr}. Whether you're near the center of town or on the outskirts, we'll come to you with our full equipment setup — no job too big or small in the {zipCode} zip code area.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-8 text-center">
            Real 5-Star Reviews from {townName} Homeowners
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex mb-3">
                  <span className="text-xl text-yellow-500">★★★★★</span>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  "{review.text.split('.')[0]}"
                </h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                  {review.text.split('.').slice(1).join('.').trim()}
                </p>
                <cite className="text-xs text-gray-600 not-italic">
                  — {review.name}, {review.location} (Google {review.date})
                </cite>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://www.google.com/search?q=J+and+M+Power+Washing+Johnston+RI&ludocid=7273927993537504886#lrd=0x89e444b9c7ba14d1:0x64fcb1b21e366a76,1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-xl transition-all hover:scale-105"
            >
              See all 165 five-star reviews on Google →
            </a>
          </div>
        </div>
      </section>

      <section id="quote" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <QuoteForm />
        </div>
      </section>

      <TownFAQ townSlug={townSlug} townName={townName} />

      {/* Nearby Towns - Cross-linking for SEO */}
      {(() => {
        const currentIndex = townsData.findIndex(t => t.slug === townSlug);
        const sameState = townsData.filter(t => t.stateAbbr === stateAbbr && t.slug !== townSlug);
        const nearbyTowns = sameState.slice(0, 8);
        return nearbyTowns.length > 0 ? (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Also Serving Nearby {stateAbbr} Towns
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We provide the same professional services throughout {state}.{' '}
                <Link to="/towns/" className="text-blue-600 hover:text-blue-700 font-medium">View all service areas &rarr;</Link>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {nearbyTowns.map(town => (
                  <Link
                    key={town.slug}
                    to={`/towns/${town.slug}/`}
                    className="px-3 py-2 bg-white border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-all text-center"
                  >
                    {town.name}, {town.stateAbbr}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null;
      })()}

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50 border-t-4 border-green-500">
        <div className="max-w-4xl mx-auto text-center">
          <hr className="mb-8 border-gray-300" />
          <p className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">
            🔥 #1 Rated Power Washing Near Me in {townName} {stateAbbr} — 165 Five-Star Reviews
          </p>
          <p className="text-lg text-gray-800">
            <a
              href="tel:+14015950726"
              className="font-bold text-green-600 hover:text-green-700 underline decoration-2 underline-offset-4 transition-colors"
            >
              Call (401) 595-0726
            </a>
            {' — '}
            <span className="font-semibold text-blue-900">Same-Day Service Available</span>
          </p>
        </div>
      </section>
    </div>
  );
}
