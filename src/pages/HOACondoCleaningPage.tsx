import React, { useEffect } from 'react';
import { Check, Building2, ChevronRight, Shield, Users, Clock, FileText, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addStructuredData } from '../utils/seo';
import { TownLinkedText } from '../components/TownLinkedText';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function HOACondoCleaningPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    updatePageMeta({
      title: 'HOA & Condo Complex Cleaning Services | RI & MA | J&M Power Washing',
      description: 'Expert HOA & condo power washing in RI & MA. Soft washing for roofs, siding, and common areas. Free estimates—call (401) 595-0726!',
      keywords: 'HOA pressure washing, condo roof cleaning, association deck restoration, HOA gutter maintenance, HOA cleaning Rhode Island, condo cleaning Massachusetts, property management cleaning, commercial pressure washing, multi-family building cleaning, apartment complex cleaning, HOA exterior cleaning, condo association cleaning, building washing services, parking lot cleaning, Rhode Island HOA services, Massachusetts condo cleaning',
      ogTitle: 'HOA & Condo Power Washing Services RI MA | Professional Property Cleaning',
      ogDescription: 'Trusted HOA pressure washing & condo roof cleaning for property managers. $2M liability, W-9 ready, night & weekend scheduling. Serving RI & MA since 2018.',
    });

    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://powerwashjm.com/#localbusiness',
      name: 'J&M Power Washing',
      image: 'https://powerwashjm.com/logos/logo.png',
      telephone: '+1-401-595-0726',
      email: 'sales@powerwashjm.com',
      foundingDate: '2018',
      description: 'Professional HOA and condo power washing services in Rhode Island and Massachusetts. Specializing in HOA pressure washing, condo roof cleaning, association deck restoration, and complete exterior maintenance for property managers.',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '50 Truman St',
        addressLocality: 'Johnston',
        addressRegion: 'RI',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '41.9219',
        longitude: '-71.5495'
      },
      url: 'https://powerwashjm.com',
      logo: 'https://powerwashjm.com/logos/logo.png',
      areaServed: [
        { '@type': 'City', name: 'Providence', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Warwick', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Cranston', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Pawtucket', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Smithfield', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'North Smithfield', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Woonsocket', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Cumberland', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Lincoln', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Johnston', containedIn: 'Rhode Island' },
        { '@type': 'City', name: 'Attleboro', containedIn: 'Massachusetts' },
        { '@type': 'City', name: 'Franklin', containedIn: 'Massachusetts' },
        { '@type': 'City', name: 'Bellingham', containedIn: 'Massachusetts' },
        { '@type': 'City', name: 'Uxbridge', containedIn: 'Massachusetts' },
        { '@type': 'State', name: 'Rhode Island' },
        { '@type': 'State', name: 'Massachusetts' }
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'HOA & Condo Power Washing Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'HOA Pressure Washing',
              description: 'Professional pressure washing for HOA communities and common areas'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Condo Roof Cleaning',
              description: 'Safe soft washing for condo roof cleaning without voiding warranties'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Association Deck Restoration',
              description: 'Complete deck restoration for HOA pool decks and common areas'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'HOA Gutter Maintenance',
              description: 'Comprehensive gutter cleaning and maintenance for HOA properties'
            }
          }
        ]
      }
    };

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'HOA & Condo Power Washing Services',
      description: 'Professional exterior cleaning services for HOAs, condominiums, and commercial properties. We handle HOA pressure washing, condo roof cleaning, association deck restoration, building washing, parking lots, walkways, pool decks, and HOA gutter maintenance.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing',
        telephone: '+1-401-595-0726',
        foundingDate: '2018',
      },
      serviceType: 'Commercial Property Cleaning',
      areaServed: [
        { '@type': 'State', name: 'Rhode Island' },
        { '@type': 'State', name: 'Massachusetts' }
      ],
      offers: {
        '@type': 'Offer',
        availability: 'InStock',
        availabilityStarts: '2024-01-01'
      }
    };

    addStructuredData([localBusinessSchema, serviceSchema]);
  }, []);

  const hoaServices = [
    {
      title: 'Building Exterior Washing',
      description: 'Professional soft washing for all siding types - vinyl, brick, stucco, and wood. We remove years of algae, mold, and mildew buildup, restoring your buildings to like-new condition without damaging surfaces.',
      benefit: 'Protects your property investment and keeps residents happy with pristine curb appeal',
      link: '/house-washing'
    },
    {
      title: 'Roof Soft Washing & Algae Removal',
      description: 'Safe, low-pressure roof cleaning that eliminates black streaks, moss, and algae without voiding shingle warranties. Our biodegradable solutions kill growth at the root for lasting results.',
      benefit: 'Extends roof lifespan and eliminates costly emergency replacements',
      link: '/roof-cleaning'
    },
    {
      title: 'Parking Lot & Garage Deep Cleaning',
      description: 'Power washing removes oil stains, tire marks, and grime from parking surfaces. We clean parking garages, surface lots, and loading areas to maintain a professional appearance.',
      benefit: 'Reduces slip hazards and liability while improving first impressions',
      link: '/concrete-cleaning'
    },
    {
      title: 'Dumpster Pad Sanitization',
      description: 'Complete degreasing and sanitization of dumpster enclosures and pads. We eliminate odors, bacteria, and staining that regular maintenance misses.',
      benefit: 'Prevents health code violations and resident complaints about odors'
    },
    {
      title: 'Walkways & Common Area Maintenance',
      description: 'Regular cleaning of sidewalks, courtyards, breezeways, and all pedestrian areas. We remove dirt, gum, stains, and organic growth to keep common spaces safe and inviting.',
      benefit: 'Reduces slip-and-fall liability and maintains attractive gathering spaces'
    },
    {
      title: 'Pool Deck & Amenity Area Cleaning',
      description: 'Specialized cleaning for pool decks, patios, and recreation areas. We remove algae buildup and staining while protecting surrounding landscaping and pool water.',
      benefit: 'Keeps amenities safe, attractive, and ready for resident enjoyment'
    },
    {
      title: 'Monument Signs & Entry Features',
      description: 'Detailed cleaning of community signage, stone monuments, fountains, and entry features. We restore the welcoming first impression that represents your community.',
      benefit: 'Enhances property value and community pride with impressive entryways'
    },
    {
      title: 'Storefront & Retail Space Washing',
      description: 'Commercial-grade cleaning for retail units, office spaces, and mixed-use properties. We clean storefronts, awnings, and window surrounds on your maintenance schedule.',
      benefit: 'Supports tenant satisfaction and lease renewals with well-maintained spaces'
    },
    {
      title: 'Gutter Cleaning & Downspout Flushing',
      description: 'Complete debris removal from gutters and downspouts across all buildings. We prevent water damage and foundation issues with scheduled gutter maintenance.',
      benefit: 'Avoids costly water damage repairs and extends building system life',
      link: '/gutter-cleaning'
    },
    {
      title: 'Stairwell & Balcony Cleaning',
      description: 'Thorough cleaning of exterior stairwells, landings, and balcony railings. We remove spider webs, dirt, and organic buildup from these high-traffic vertical spaces.',
      benefit: 'Maintains resident safety and satisfaction in frequently used areas'
    },
    {
      title: 'Fence & Gate Maintenance Washing',
      description: 'Professional cleaning for vinyl, wood, and metal fencing and gates. We remove mold, mildew, and staining while protecting finishes and landscaping.',
      benefit: 'Preserves expensive perimeter infrastructure and enhances security appeal',
      link: '/deck-cleaning'
    },
    {
      title: 'Tennis & Basketball Court Cleaning',
      description: 'Specialized sports surface cleaning that removes organic growth, leaves, and staining without damaging court surfaces or line markings.',
      benefit: 'Keeps recreational amenities safe and playable year-round'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: '$2M Liability Insurance',
      description: 'Fully insured with certificates provided upon request'
    },
    {
      icon: FileText,
      title: 'W-9 & Vendor Ready',
      description: 'All compliance documentation available immediately'
    },
    {
      icon: Users,
      title: 'Professional Crews',
      description: 'Uniformed, background-checked team members'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Night & weekend service to minimize disruption'
    }
  ];

  const faqs = [
    {
      question: 'How often should HOAs schedule pressure washing services?',
      answer: 'Most HOAs and condo associations in Rhode Island and Massachusetts benefit from annual building washing, bi-annual walkway cleaning, and quarterly parking lot maintenance. High-traffic areas may need more frequent attention. We create custom maintenance schedules based on your property\'s age, location, and board priorities to maintain curb appeal year-round.'
    },
    {
      question: 'What does condo exterior cleaning cost in Rhode Island?',
      answer: 'Condo exterior cleaning costs vary based on building size, services needed, and frequency. Most RI condo associations pay between $2,500-$8,000 annually for comprehensive exterior maintenance including building washing, walkways, and common areas. We provide detailed proposals with transparent pricing and can structure payments to align with your HOA budget cycles.'
    },
    {
      question: 'Do you provide HOA gutter maintenance throughout Rhode Island and Massachusetts?',
      answer: 'Yes, we provide complete HOA gutter maintenance throughout all of Rhode Island and Massachusetts, including Providence, Warwick, Cranston, Pawtucket, Attleboro, Franklin, and surrounding communities. Our service includes debris removal, downspout flushing, and gutter cleaning for multi-unit properties. We can schedule seasonal cleanings to prevent water damage and foundation issues.'
    },
    {
      question: 'Can you handle condo roof cleaning without voiding warranties?',
      answer: 'Absolutely. We specialize in soft washing for condo roof cleaning that safely removes algae, moss, and black streaks without high pressure that can damage shingles or void warranties. Our biodegradable solutions meet manufacturer specifications and extend roof life for Rhode Island and Massachusetts condo associations.'
    },
    {
      question: 'Do you provide your own water for HOA pressure washing?',
      answer: 'Yes, we carry 300+ gallons per truck for HOA pressure washing projects. For larger multi-building communities, we can coordinate site water access with your facility manager to maximize efficiency and minimize costs while maintaining our high cleaning standards.'
    },
    {
      question: 'Can you work nights or weekends to avoid disrupting condo residents?',
      answer: 'Absolutely. We schedule around your residents\' needs. Most HOA and condo jobs are done during off-peak hours - evenings, early mornings, or weekends. We coordinate with your on-site team and provide advance notice to minimize any impact on daily activities.'
    },
    {
      question: 'What payment terms do you offer for HOA and condo associations?',
      answer: 'We offer Net 30 terms for qualified property management companies and HOAs. We can invoice directly to your management company or process through your vendor portal. W-9, certificates of insurance (COI), and all compliance documentation provided upon request.'
    },
    {
      question: 'Do you provide association deck restoration services?',
      answer: 'Yes, we provide complete association deck restoration including cleaning, staining, and sealing for community pool decks, patios, and recreational areas. Our process removes years of grime, algae, and staining while protecting the wood or composite materials for long-lasting results across Rhode Island and Massachusetts HOA communities.'
    }
  ];

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-900 shadow-2xl z-40 lg:hidden">
        <div className="flex items-center justify-between p-3 max-w-screen-xl mx-auto">
          <a
            href="tel:+14015950726"
            className="flex-1 mr-2 inline-flex items-center justify-center px-4 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </a>
          <button
            onClick={scrollToQuote}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Quote
          </button>
        </div>
      </div>

      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Commercial Services</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Reliable Exterior Cleaning for HOAs and Condo Complexes Throughout Rhode Island & Massachusetts</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-4 leading-relaxed">
              As a trusted partner for HOAs and condo associations, J&M Power Washing specializes in community-wide exterior cleaning to maintain curb appeal, meet board standards, and protect property values.
            </p>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
              <TownLinkedText>From HOA pressure washing and condo roof cleaning to association deck restoration and HOA gutter maintenance, we deliver reliable commercial exterior cleaning for property managers and HOA boards throughout Rhode Island and Massachusetts. Fully insured, vendor compliant, with flexible scheduling to minimize tenant disruption.</TownLinkedText>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <button
                  onClick={scrollToQuote}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-lg mb-3 whitespace-nowrap"
                  aria-label="Request commercial quote"
                >
                  Request Commercial Quote
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <div className="text-center">
                  <Link to="/financing/" className="text-blue-100 text-sm underline hover:text-white transition-colors hover:bg-white/10 px-2 py-1 rounded">
                    Net 30 Terms Available
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
                <span className="text-white"><strong>$2M Insurance</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>W-9 Ready</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Licensed & Bonded</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Night & Weekend Scheduling</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Professional Fleet & Equipment</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our commercial-grade fleet is designed specifically for large-scale HOA and condominium properties. With multiple crews and self-contained equipment, we can efficiently handle properties of any size.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Multiple Trucks & Crews</h4>
                    <p className="text-gray-600">Simultaneous service for large properties and scheduled maintenance programs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Self-Contained Systems</h4>
                    <p className="text-gray-600">Each truck carries 300+ gallons, reducing dependency on property water</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Professional Equipment</h4>
                    <p className="text-gray-600">Commercial-grade soft washing systems designed for multi-story buildings</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/fleet/ourfleet4trucks.jpg"
                alt="J&M Power Washing commercial fleet with multiple professional service trucks ready to handle large-scale HOA and condominium property cleaning projects throughout Rhode Island and Massachusetts"
                className="rounded-xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-4 border-2 border-blue-900">
                <p className="text-sm font-bold text-gray-900">Multiple Crews Available</p>
                <p className="text-xs text-gray-600">For Large Properties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Cleaning for HOA Communities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tailored Cleaning for HOA Communities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every HOA and condo association has unique needs. Whether you manage luxury condos, multi-family apartment complexes, or mixed-use properties, we customize our HOA pressure washing and maintenance programs to match your community's requirements, budget, and schedule.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Family Properties</h3>
              <p className="text-gray-600">
                Comprehensive exterior cleaning for apartment complexes, townhome communities, and condo buildings. We handle everything from building washing to parking lot maintenance.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Luxury Condos</h3>
              <p className="text-gray-600">
                Premium condo roof cleaning, entryway restoration, and amenity maintenance that meets the high standards of luxury properties and discerning residents.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Commercial Properties</h3>
              <p className="text-gray-600">
                Professional association deck restoration, storefront cleaning, and complete facility maintenance for mixed-use properties with retail and office spaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Property Managers Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Property Managers & HOA Boards Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We understand the unique needs of commercial property managers and HOA boards. No hassle, no complaints - just reliable service that makes you look good to residents and board members.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-900" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 md:p-10 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Property Managers & HOA Boards Get With J&M</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Flexible scheduling</strong> to minimize resident complaints (nights/weekends available)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Multi-year maintenance contracts</strong> with locked-in pricing</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Certificate of Insurance (COI)</strong> provided upon request</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Board presentation support</strong> with detailed proposals</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Net 30 payment terms</strong> for qualified management companies</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Resident notification letters</strong> before scheduled service</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Multiple crew capacity</strong> for large multi-building communities</p>
                </div>
              </div>
              <div className="flex items-start">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="ml-3">
                  <p className="text-gray-800"><strong>Direct management company</strong> invoicing & portal integration</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Your Properties Are Your Reputation</h3>
                <p className="text-lg text-gray-700 mb-6">
                  As a property manager, you're under constant pressure. Board members expect pristine curb appeal. Tenants complain about dirty sidewalks. Maintenance requests pile up.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  <strong>That's where we come in.</strong> J&M Power Washing handles exterior cleaning so you don't have to. We show up on time, work quietly around your residents, protect your landscaping, and leave your properties looking brand new.
                </p>
                <p className="text-lg text-gray-700 font-semibold">
                  You get the credit. We do the work. No drama. No complaints. Just results.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                  alt="Commercial building exterior"
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive HOA Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Our Complete HOA & Condo Services</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                We understand the pressure you're under. Between board meetings, resident complaints, vendor coordination, and budget constraints, maintaining your property's appearance can feel overwhelming. <strong>That's exactly why we exist.</strong>
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                J&M Power Washing isn't just another vendor on your list—we're your partner in property management success. We take exterior maintenance completely off your plate with reliable, scheduled service that works around your residents' lives. No surprises, no complaints, no stress. Just pristine properties that make you look good to your board and keep residents happy.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hoaServices.map((service, index) => {
              const CardContent = (
                <>
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-blue-900 font-semibold flex items-start">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-2" />
                      <span className="text-sm">{service.benefit}</span>
                    </p>
                  </div>
                  {service.link && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-blue-900 font-semibold text-sm flex items-center">
                        Learn More
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  )}
                </>
              );

              return service.link ? (
                <Link
                  key={index}
                  to={service.link}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-blue-300 block group"
                >
                  {CardContent}
                </Link>
              ) : (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
                >
                  {CardContent}
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-4">Every Service. One Reliable Partner.</h3>
              <p className="text-xl text-blue-100 mb-8">
                Stop coordinating multiple vendors and dealing with scheduling headaches. We provide comprehensive exterior maintenance on your schedule—weekly, monthly, quarterly, or seasonal. One call, one invoice, zero stress.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-2">Scheduled Maintenance</h4>
                  <p className="text-blue-100 text-sm">We show up when we say we will, without you having to remember or remind us</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-2">Resident Communication</h4>
                  <p className="text-blue-100 text-sm">We coordinate advance notice through your preferred channels to minimize disruption</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-2">Flexible Billing</h4>
                  <p className="text-blue-100 text-sm">Net 30 terms, vendor portal compatible, and budget-friendly pricing for ongoing contracts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/fleet/servicetruck.png"
                alt="J&M Power Washing professional service truck equipped with commercial-grade soft washing systems for HOA and condo property maintenance throughout Rhode Island and Massachusetts"
                className="rounded-xl shadow-2xl"
                loading="lazy"
              />
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-900 p-6 rounded-lg">
                <p className="text-base text-gray-700 leading-relaxed"><strong className="text-blue-900">Self-Contained Units:</strong> Each truck carries 300+ gallons of water, eliminating dependency on property water sources for most jobs. Perfect for large communities with limited water access.</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Dedicated Commercial Cleaning Professionals. Proven Reliability.</h2>
              <p className="text-lg text-gray-700 mb-8">
                We are a full-time, dedicated commercial cleaning operation committed to excellence. J&M Power Washing is an established, family-owned business that has partnered with property managers, HOA boards, and condo associations across Rhode Island and Massachusetts since 2018. We provide uniformed, trained crews, comprehensive insurance coverage, and an uncompromising standard of service.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Family Owned Since 2018</h4>
                    <p className="text-gray-600">Reliable service to the property management community</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Safety-First Training</h4>
                    <p className="text-gray-600">OSHA-compliant procedures and ongoing crew education</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Resident Communication</h4>
                    <p className="text-gray-600">We coordinate with your team to notify residents and minimize disruption</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Fully Insured & Bonded</h4>
                    <p className="text-gray-600">$2M general liability with certificates provided upon request</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Simplify Your Property Management?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get a free commercial assessment and see why property managers trust J&M Power Washing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToQuote}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
            >
              Request Commercial Quote
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all"
            >
              Call (401) 595-0726
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Property Managers Say About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by property management companies and HOA boards across Rhode Island and Massachusetts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-2 border-blue-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "J&M has been cleaning our 42-unit condo complex for two years. They coordinate everything with our residents, show up exactly when scheduled, and the property always looks immaculate. Best vendor we've worked with."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">Sarah M.</p>
                <p className="text-sm text-gray-600">Property Manager, Providence, RI</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-2 border-blue-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Professional, insured, and reliable. They handle all our HOA exterior cleaning including our parking lot, walkways, and building washing. The board is thrilled with the curb appeal improvement and zero resident complaints."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">Michael T.</p>
                <p className="text-sm text-gray-600">HOA Board President, Attleboro, MA</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border-2 border-blue-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "We manage multiple properties and J&M handles cleaning for three of them. Their billing is straightforward (Net 30), they work around resident schedules, and they provide all required insurance documentation instantly. Highly recommend for commercial properties."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">Jennifer L.</p>
                <p className="text-sm text-gray-600">Regional Property Manager, Warwick, RI</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8">
            <div className="flex items-center justify-center gap-8 flex-wrap text-white">
              <div>
                <p className="text-4xl font-bold">142+</p>
                <p className="text-blue-100">5-Star Reviews</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-blue-400"></div>
              <div>
                <p className="text-4xl font-bold">500+</p>
                <p className="text-blue-100">Properties Serviced</p>
              </div>
              <div className="hidden sm:block w-px h-16 bg-blue-400"></div>
              <div>
                <p className="text-4xl font-bold">7+ Years</p>
                <p className="text-blue-100">Serving RI & MA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Section - NEW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Serving HOAs & Condos Throughout Rhode Island & Massachusetts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional commercial property cleaning services for multi-family communities, condominium complexes, and HOA properties across our service area
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RI</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Rhode Island HOA & Condo Services</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Massachusetts HOA & Condo Services</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/towns/attleboro-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Attleboro</Link>
                <Link to="/towns/north-attleboro-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">North Attleboro</Link>
                <Link to="/towns/franklin-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Franklin</Link>
                <Link to="/towns/mansfield-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Mansfield</Link>
                <Link to="/towns/seekonk-ma/" className="text-blue-900 hover:text-blue-700 hover:underline font-medium">Seekonk</Link>
                <span className="text-gray-700">Plainville</span>
                <span className="text-gray-700">Bellingham</span>
                <span className="text-gray-700">Wrentham</span>
                <span className="text-gray-700">Foxboro</span>
                <span className="text-gray-700">Norton</span>
                <span className="text-gray-700">Rehoboth</span>
                <span className="text-gray-700">Swansea</span>
              </div>
              <p className="mt-6 text-sm text-gray-600 italic">And all surrounding Massachusetts communities</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Don't See Your City Listed?</h3>
            <p className="text-lg text-gray-700 mb-4">We service many additional communities throughout Rhode Island and Massachusetts.</p>
            <a href="tel:+14015950726" className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
              Call (401) 595-0726 to Confirm Service
            </a>
          </div>
        </div>
      </section>

      <ServiceFAQ
        faqs={faqs}
        title="Frequently Asked Questions for Property Managers"
      />

      <div className="pb-20 lg:pb-0">
        <QuoteForm
          showTitle={true}
          customTitle="Get Your Free Commercial Property Quote"
          customDescription="Fill out the form below and we'll provide a detailed proposal for your HOA, condo association, or commercial property within 24 hours. Serving Rhode Island and Massachusetts property managers since 2018."
        />
      </div>
    </div>
  );
}
