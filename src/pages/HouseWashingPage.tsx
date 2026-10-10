import React, { useEffect } from 'react';
import { Check, Home, ChevronRight, Shield, Droplets, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';
import ServiceArea from '../components/ServiceArea';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addMultipleStructuredData, createWebPageWithImageSchema } from '../utils/seo';
import { TownLinkedText } from '../components/TownLinkedText';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { getServiceImage } from '../config/serviceImages';

export default function HouseWashingPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const serviceImage = getServiceImage('house-washing');

    updatePageMeta({
      title: 'House Washing RI & MA | Soft Wash Experts - J&M',
      description: 'Professional soft washing for vinyl, cedar & stucco homes. Removes algae & mold in 2-4 hours. Free quotes, fully licensed & insured. Serving RI & MA.',
      keywords: 'house washing RI, house washing Rhode Island, house washing Massachusetts, soft washing, vinyl siding cleaning, cedar siding cleaning, exterior house cleaning, algae removal, mold removal, residential pressure washing, North Smithfield, Providence, Warwick, Cranston, Pawtucket',
      ogTitle: 'House Washing RI & MA | Soft Wash Experts - J&M',
      ogDescription: 'Professional soft washing removes algae & mold in 2-4 hours. Free quotes, fully licensed and insured. Serving RI & MA since 2018.',
      ogImage: serviceImage.url,
      imageAlt: serviceImage.alt,
      imageWidth: serviceImage.width,
      imageHeight: serviceImage.height,
    });

    const enhancedServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'House Washing Service',
      description: 'Professional soft washing for vinyl, cedar, and stucco homes. We remove algae, mold, and mildew in 2-4 hours using biodegradable solutions. Serving 46 towns across Rhode Island and Massachusetts including Providence, Warwick, Cranston, Pawtucket, and North Smithfield.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing',
        telephone: '+1-401-595-0726',
        foundingDate: '2018',
      },
      serviceType: 'Exterior House Washing',
      areaServed: [
        { '@type': 'City', name: 'Providence', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Warwick', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Cranston', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Pawtucket', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'North Smithfield', containedInPlace: { '@type': 'State', name: 'Rhode Island' } }
      ],
      offers: {
        '@type': 'Offer',
        availability: 'InStock',
        availabilityStarts: '2024-01-01'
      },
      additionalType: 'Soft Washing',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'House Washing Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Vinyl Siding Cleaning',
              description: 'Soft wash cleaning for vinyl siding using biodegradable solutions'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Cedar Siding Cleaning',
              description: 'Low-pressure cleaning safe for wood siding'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Stucco House Washing',
              description: 'Gentle cleaning for stucco and masonry exteriors'
            }
          }
        ]
      },
      serviceOutput: 'Clean exterior siding free of algae, mold, and mildew',
      termsOfService: 'Free quotes within 24 hours, fully licensed and insured, completion in 2-4 hours'
    };

    addMultipleStructuredData([
      enhancedServiceSchema,
      createWebPageWithImageSchema({
        title: 'House Washing RI & MA | Soft Wash Experts - J&M',
        description: 'Professional soft washing removes algae & mold in 2-4 hours. Free quotes, fully licensed and insured. Serving RI & MA since 2018.',
        url: 'https://powerwashjm.com/house-washing/',
        image: serviceImage,
      }),
    ]);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/housewash.png)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Home className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Professional Service</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Professional House Washing in Rhode Island & Massachusetts</h1>
            <p className="text-xl text-blue-100 mb-8">
              <TownLinkedText>Expert soft washing for vinyl, cedar, and stucco siding. We remove algae, mold, and mildew in 2-4 hours using biodegradable solutions. Free quotes within 24 hours. Family-owned since 2018, fully licensed and insured, serving 46 towns across RI & MA including Providence, Warwick, Cranston, North Smithfield, and Pawtucket.</TownLinkedText>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <button
                  onClick={scrollToQuote}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-lg mb-3 whitespace-nowrap"
                  aria-label="Scroll to quote form"
                >
                  Get a Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <div className="text-center">
                  <Link to="/financing/" className="text-blue-100 text-sm underline hover:text-white transition-colors hover:bg-white/10 px-2 py-1 rounded">
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
                <span className="text-white"><strong>Family Owned</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>One Day</strong> Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Licensed & Insured</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Increases</strong> Home Value</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose J&M Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Choose J&M for House Washing in Rhode Island & Massachusetts?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Soft Wash Specialists Since 2018</h3>
                <p className="text-gray-700">We use biodegradable solutions and low-pressure techniques (not high-pressure washing) that safely remove algae and mold without damaging vinyl, cedar, or stucco siding.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Complete in 2-4 Hours</h3>
                <p className="text-gray-700">Most house washing projects completed same day. We work efficiently without sacrificing quality, and your home is dry and ready to enjoy by evening.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">46 Towns Across RI & MA</h3>
                <p className="text-gray-700">Serving Providence, Warwick, Cranston, Pawtucket, North Smithfield, Smithfield, Cumberland, Lincoln, Woonsocket, and 37 more communities throughout Rhode Island and Massachusetts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Free Quotes Within 24 Hours</h3>
                <p className="text-gray-700">Family-owned and operated. Fully licensed and insured with comprehensive coverage protecting your property and our team.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spring Cleaning + Process Section - Compact Side by Side */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Spring Cleaning Card */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Fresh Look, Fresh Start for Spring</h2>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                <img
                  src="/SpringCleaning.jpg"
                  alt="Professional house washing service in Rhode Island showing clean white colonial home with pristine siding after spring cleaning"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                  width="1408"
                  height="768"
                  loading="lazy"
                />
                <p className="text-gray-700 text-sm mt-4">
                  Don't let winter salt damage your siding. We'll wash away the grime and prep your property for the outdoor season.
                </p>
              </div>
            </div>

            {/* Process Card */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Soft Wash Process</h2>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
                <img
                  src="https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/service-images/house-wash-process-ri.jpg"
                  alt="House washing process showing before, during soft wash application, and after results"
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                  width="1200"
                  height="400"
                  loading="lazy"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <div className="text-xs font-bold text-blue-900 mb-1">BEFORE</div>
                    <p className="text-xs text-gray-600">Algae & stains</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-blue-900 mb-1">PROCESS</div>
                    <p className="text-xs text-gray-600">Soft wash</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-blue-900 mb-1">AFTER</div>
                    <p className="text-xs text-gray-600">Like new</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Content Block 1: Introduction */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Professional House Washing Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-base leading-relaxed">
            Your home's exterior faces constant assault from Rhode Island's challenging climate. Green algae, black mold, and mildew accumulate on vinyl siding, cedar shakes, and stucco surfaces throughout Providence, Warwick, and surrounding communities. What starts as minor discoloration quickly spreads, particularly on north-facing walls that never fully dry. J&M Power Washing has perfected the art of soft washing homes throughout Rhode Island and Massachusetts, using proven techniques that safely remove organic growth without the risks associated with high-pressure washing. Our approach restores your home's beauty while protecting delicate surfaces, preserving paint, and ensuring your siding maintains its protective qualities for years to come.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-4">Why Professional House Washing?</h2>
              <p className="text-gray-700 text-base mb-3 leading-relaxed">
                Your home's exterior is constantly exposed to the elements. Over time, dirt, mold, mildew, and algae accumulate on siding, causing discoloration and potential damage. Regular house washing not only improves curb appeal but also protects your investment by preventing long-term deterioration.
              </p>
              <p className="text-gray-700 text-base mb-4 leading-relaxed">
                Our soft wash system uses low-pressure water combined with specialized, eco-friendly cleaning solutions to safely remove contaminants without damaging your siding, paint, or landscaping.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Safe for All Surfaces</h3>
                    <p className="text-gray-600 text-sm">Gentle on vinyl, wood, brick, stucco, and all siding materials</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Eco-Friendly Solutions</h3>
                    <p className="text-gray-600 text-sm">Biodegradable cleaning agents that are safe for plants and pets</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Long-Lasting Results</h3>
                    <p className="text-gray-600 text-sm">Our soft wash method kills mold and algae at the root for lasting cleanliness</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">What We Clean</h3>
                <ul className="space-y-2">
                  {[
                    'Vinyl siding',
                    'Wood siding and trim',
                    'Brick and stone exteriors',
                    'Stucco and EIFS',
                    'Aluminum siding',
                    'Painted surfaces',
                    'Soffit and fascia',
                    'Garage doors',
                    'Outdoor fixtures'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900 text-white rounded-xl p-5">
                <h3 className="text-xl font-bold mb-2">100% Satisfaction Guarantee</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  We stand behind our work. If you're not completely satisfied with the results, we'll make it right—no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2: Why Rhode Island Homes Need Regular Washing */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Why Rhode Island Homes Need Regular Washing</h2>
          <p className="text-gray-700 text-base leading-relaxed">
            The coastal climate of Rhode Island creates perfect conditions for organic growth on exterior surfaces. Homes in Cranston, Johnston, and North Providence experience heavy morning dew that keeps north and west-facing walls damp for hours. This persistent moisture, combined with our mild springs and humid summers, turns vinyl siding into a breeding ground for algae, mildew, and atmospheric pollutants. Many homeowners notice their light-colored siding developing a greenish-brown tint within 12-18 months of moving into a new home or completing a professional cleaning. This isn't dirt - it's living organisms feeding on moisture, atmospheric sugars, and microscopic nutrients deposited on surfaces. Without intervention, this growth penetrates siding texture, becomes increasingly difficult to remove, and eventually causes permanent staining that diminishes property value and requires premature replacement.
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Our Process</h2>
            <p className="text-base text-gray-600">Professional, efficient, and thorough</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { step: '1', title: 'Inspection', desc: 'We assess your home and identify problem areas' },
              { step: '2', title: 'Preparation', desc: 'We protect landscaping and close windows/doors' },
              { step: '3', title: 'Soft Washing', desc: 'We apply eco-friendly solution and gently rinse' },
              { step: '4', title: 'Final Check', desc: 'We inspect results and ensure your satisfaction' }
            ].map((item, index) => (
              <div key={index} className="text-center bg-white p-5 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteForm />

      {/* Related Services Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Complete Your Home's Exterior</h2>
            <p className="text-base text-gray-600">Pair house washing with our other professional services</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Link to="/roof-cleaning/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Roof Cleaning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Remove black streaks, moss, and algae from your roof. Essential maintenance that extends roof life and prevents costly repairs.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link to="/gutter-cleaning/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Gutter Cleaning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete interior and exterior gutter cleaning. Protect your home from water damage while restoring curb appeal.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link to="/deck-cleaning/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Deck Restoration</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Professional deck cleaning and restoration. Remove years of weathering, stains, and buildup to restore natural beauty.
              </p>
              <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready to Restore Your Home?</h2>
          <p className="text-lg lg:text-xl text-gray-600 mb-8">
            Call us today for a free estimate or explore our other services
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

      {/* Content Block 3: Our Soft Washing Process */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Soft Washing Process</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            J&M Power Washing uses professional soft washing technology that cleans at the molecular level. We apply biodegradable cleaning solutions at low pressure, typically 100-300 PSI compared to the 3000+ PSI used in pressure washing. This gentle approach safely cleans vinyl, aluminum, cedar shake, stucco, brick, and composite materials without forcing water behind siding or damaging caulking and weather seals. Our cleaning agents break down organic matter, kill spores at the root, and inhibit regrowth for 1-2 years depending on exposure. The process begins with pre-wetting landscaping, followed by solution application, appropriate dwell time for penetration, and a thorough low-pressure rinse. We protect windows, doors, electrical fixtures, and delicate plantings throughout the process, ensuring your property looks better without any damage. For comprehensive exterior care, consider pairing house washing with our <Link to="/gutter-cleaning/" className="text-blue-600 hover:text-blue-800 underline">gutter cleaning services</Link>.
          </p>
        </div>
      </section>

      <ServiceFAQ
        faqs={[
          {
            question: 'How often should I have my house washed?',
            answer: 'We recommend having your house professionally washed once per year. However, homes in areas with heavy tree coverage, high humidity, or facing north may benefit from washing twice a year to prevent algae and mildew buildup.'
          },
          {
            question: 'Is soft washing safe for vinyl and cedar siding?',
            answer: 'Yes! Soft washing is specifically designed to be safe for all types of siding. Unlike pressure washing, which can damage siding, soft washing uses low pressure and professional-grade cleaning solutions to safely remove dirt, algae, and mildew without causing any harm to your home.'
          },
          {
            question: 'Will house washing damage my landscaping?',
            answer: 'No. We take extra care to protect your landscaping, plants, and outdoor furniture. We use environmentally-safe cleaning products and pre-wet all plants and landscaping before washing. Our experienced team ensures your property is protected throughout the entire process.'
          },
          {
            question: 'How long does house washing take?',
            answer: 'Most residential house washing projects are completed in 2-4 hours, depending on the size of your home and the extent of cleaning needed. We work efficiently while maintaining our high standards of quality and safety.'
          },
          {
            question: 'How much does house washing cost?',
            answer: 'House washing typically costs between $300-$600 for most homes, depending on size, condition, and accessibility. We provide free, detailed estimates with no obligation. Factors affecting cost include square footage, number of stories, and amount of algae or mildew present.'
          },
          {
            question: 'Can house washing really increase my home value?',
            answer: 'Yes! Studies show that professional exterior cleaning can increase home value by up to 10%. It significantly improves curb appeal, prevents premature aging of siding, and shows potential buyers that the home has been well-maintained. It\'s one of the highest ROI home improvements you can make.'
          }
        ]}
      />

      <ServiceArea />

      {/* Content Block 4: Service Areas & Guarantees */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Service Areas & Guarantees in Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            <TownLinkedText>
              We've cleaned thousands of homes throughout Rhode Island and southeastern Massachusetts, from historic colonials in Providence's East Side to modern developments in Warwick's suburbs. Our service area includes all major communities: Providence, Warwick, Cranston, Pawtucket, Woonsocket, Cumberland, Lincoln, Smithfield, North Smithfield, and Scituate in Rhode Island, plus southeastern Massachusetts. Every house washing includes detailed surface preparation, complete exterior cleaning including soffits and fascia, and post-service inspection to ensure satisfaction. We're fully insured, use only professional-grade equipment, and back our work with a satisfaction guarantee. Most homes are completed in 2-4 hours with results lasting 1-2 years depending on exposure and surrounding vegetation.
            </TownLinkedText>
          </p>
        </div>
      </section>
    </div>
  );
}
