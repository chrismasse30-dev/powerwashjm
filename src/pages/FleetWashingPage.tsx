import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Shield, Clock, Droplets, Award, Wrench, MapPin, ChevronDown, DollarSign, Users, Building2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';
import { updatePageMeta, addStructuredData } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import CrossPromotionBanner from '../components/CrossPromotionBanner';
import CrossPromotionInline from '../components/CrossPromotionInline';

export default function FleetWashingPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showMobileCta, setShowMobileCta] = useState(false);

  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    updatePageMeta({
      title: 'Professional Fleet Washing RI & MA | Mobile Truck Cleaning - J&M',
      description: 'J&M Power Washing offers 24/7 on-site mobile fleet washing in Rhode Island and Massachusetts. Licensed, insured, and reliable. Get a free estimate for your truck fleet today!',
      keywords: 'fleet washing RI, fleet washing Rhode Island, fleet washing Massachusetts, mobile truck washing, truck cleaning, tractor trailer washing, delivery van cleaning, commercial vehicle washing, on-site fleet cleaning, Providence, Warwick, Cranston, Attleboro, Franklin, Mansfield',
      ogTitle: 'Professional Fleet Washing RI & MA | Mobile Truck Cleaning - J&M',
      ogDescription: 'On-site mobile fleet washing services. 24/7 scheduling, environmentally friendly, licensed & insured. Serving RI & MA.',
    });

    addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Fleet Washing',
      name: 'Mobile Fleet Washing',
      description: '24/7 on-site mobile fleet washing services for commercial vehicles',
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
        { '@type': 'City', name: 'Providence', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Warwick', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Cranston', containedInPlace: { '@type': 'State', name: 'Rhode Island' } },
        { '@type': 'City', name: 'Attleboro', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
        { '@type': 'City', name: 'Franklin', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
        { '@type': 'City', name: 'Mansfield', containedInPlace: { '@type': 'State', name: 'Massachusetts' } },
        { '@type': 'State', name: 'Rhode Island' },
        { '@type': 'State', name: 'Massachusetts' },
      ],
      url: 'https://powerwashjm.com/commercial/fleet-washing/',
    });

    const handleScroll = () => {
      const quoteSection = document.getElementById('quote');
      if (quoteSection) {
        const rect = quoteSection.getBoundingClientRect();
        setShowMobileCta(rect.top > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      question: "Do you provide wash documentation for DOT compliance?",
      answer: "Yes, we provide detailed service records for each wash including date, time, vehicle ID, and services performed. Perfect for DOT record-keeping requirements."
    },
    {
      question: "What's your response time for quotes?",
      answer: "We guarantee a detailed quote within 24 hours of your request. Most quotes are provided within 4-6 business hours. For urgent needs, call us directly at (401) 595-0726."
    },
    {
      question: "Can you handle refrigerated trailers and food-grade requirements?",
      answer: "Absolutely. We specialize in food-grade trailer washouts with proper sanitization protocols. We use FDA-approved cleaning agents and follow all food safety regulations."
    },
    {
      question: "Do you offer emergency cleaning services?",
      answer: "Yes, we provide 24/7 emergency cleaning for urgent situations like spills, accidents, or last-minute DOT inspections. Emergency response available within 4 hours."
    },
    {
      question: "What's your minimum fleet size?",
      answer: "We work with fleets of 5+ vehicles. For smaller fleets or one-time cleaning, contact us to discuss options."
    },
    {
      question: "Can we get consolidated invoicing for all vehicles?",
      answer: "Yes, we provide single monthly invoices for all services, itemized by vehicle and date. Perfect for simplified accounting and vendor management."
    },
    {
      question: "Do you provide Certificate of Insurance (COI)?",
      answer: "Yes, we provide COI certificates same-day upon request. We carry comprehensive general liability and workers compensation coverage."
    },
    {
      question: "What happens in bad weather?",
      answer: "We automatically reschedule for weather with no cancellation fees. You'll receive advance notice and priority rescheduling."
    }
  ];

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/fleettobecleaned.png)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wider">Mobile Fleet Solutions</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Zero-Downtime Fleet Washing | We Come to You</h1>
            <p className="text-xl text-blue-100 mb-8">
              On-site mobile fleet washing saves you 40% vs. traditional wash bays. No downtime. No driver wages. No fuel costs. Professional cleaning at your location, on your schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <button
                onClick={scrollToQuote}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Get Fleet Pricing (24hr Response)
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg whitespace-nowrap">
                Call (401) 595-0726
              </a>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>24hr Quote Response</strong> Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>COI Provided</strong> Same-Day</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Zero Downtime</strong> - We Come to You</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white"><strong>Damage Guarantee</strong> - Fully Insured</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-700/50">
              <CrossPromotionInline
                text="Also managing commercial properties?"
                linkText="See our Commercial Building Services"
                linkUrl="/commercial"
                icon={<Building2 className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="trust-bar" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <Clock className="w-8 h-8 text-blue-900 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-900 mb-1">24hr</div>
              <p className="text-gray-700 font-medium">Quote Response Time</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <Shield className="w-8 h-8 text-yellow-900 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-900 mb-1">COI</div>
              <p className="text-gray-700 font-medium">Provided Same-Day</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <MapPin className="w-8 h-8 text-slate-900 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900 mb-1">30+</div>
              <p className="text-gray-700 font-medium">Mile Service Radius</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-blue-900 mb-3">On-Site Mobile Saves You 40%</h2>
            <p className="text-xl text-gray-600">Compare the true cost: Traditional wash bay vs. J&M mobile service</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50">
                <h3 className="text-2xl font-bold text-red-900 mb-6 text-center">Traditional Wash Bay</h3>
                <ul className="space-y-4 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 text-xl">✗</span>
                    <span><strong>$45-75</strong> per truck + labor costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 text-xl">✗</span>
                    <span><strong>2-4 hours</strong> downtime per vehicle</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 text-xl">✗</span>
                    <span><strong>Driver wages</strong> during wash time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 text-xl">✗</span>
                    <span><strong>Fuel costs</strong> to/from facility</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 text-xl">✗</span>
                    <span><strong>Lost revenue</strong> from idle vehicles</span>
                  </li>
                </ul>
                <div className="p-4 bg-red-100 rounded-lg">
                  <p className="font-bold text-red-900 text-lg">True Cost Per Truck:</p>
                  <p className="text-4xl font-bold text-red-900">$95-150</p>
                  <p className="text-sm text-red-700 mt-1">Including all hidden costs</p>
                </div>
              </div>

              <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-lg">BEST VALUE</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-6 text-center">J&M On-Site Mobile</h3>
                <ul className="space-y-4 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span><strong>$55-85</strong> per truck (all inclusive)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span><strong>Zero downtime</strong> - we come to you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span><strong>No driver</strong> labor costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span><strong>No fuel</strong> expense</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span><strong>Vehicles stay</strong> revenue-ready</span>
                  </li>
                </ul>
                <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                  <p className="font-bold text-green-900 text-lg">True Cost Per Truck:</p>
                  <p className="text-4xl font-bold text-green-900">$55-85</p>
                  <p className="text-sm text-green-700 mt-1">Zero hidden costs</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-8 p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <DollarSign className="w-10 h-10 text-yellow-900 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                Typical 10-Truck Fleet Saves <span className="text-green-600">$400-650</span> Per Wash Cycle
              </p>
              <p className="text-gray-600 mt-2">That's <strong>$4,800-7,800 annual savings</strong> with monthly service</p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">What We Clean & How Much It Costs</h2>
            <p className="text-xl text-gray-600">Comprehensive cleaning for all commercial vehicle types</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">On-Site Mobile Service</h3>
              <p className="text-gray-600 mb-3">We come to your location. No need to take vehicles out of service.</p>
              <p className="text-sm font-bold text-blue-900">Average: 30-45 min/vehicle</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Night & Weekend Service</h3>
              <p className="text-gray-600 mb-3">Flexible scheduling including nights and weekends.</p>
              <p className="text-sm font-bold text-blue-900">No extra charge</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Droplets className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Eco-Friendly Process</h3>
              <p className="text-gray-600 mb-3">Water reclamation systems protect the environment.</p>
              <p className="text-sm font-bold text-blue-900">EPA compliant</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Complete Cleaning</h3>
              <p className="text-gray-600 mb-3">Full exterior, undercarriage, and aluminum brightening.</p>
              <p className="text-sm font-bold text-blue-900">Premium available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-3">Fleet Washing Transformation</h2>
            <p className="text-lg text-gray-700">Professional results that protect your brand image</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-200">
            <img
              src="/beforeandafter/truckbeforeandafter.png"
              alt="Commercial fleet truck washing before and after comparison showing professional cleaning results - J&M Power Washing Rhode Island"
              className="w-full h-auto rounded-xl shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <CrossPromotionBanner
            variant="default"
            title="Need Building & Property Cleaning Too?"
            description="Many fleet managers also oversee facility maintenance. We offer comprehensive commercial property cleaning including storefronts, parking lots, loading docks, and building exteriors."
            benefits={[
              "Same reliable team servicing your fleet and buildings",
              "Simplified vendor management with one point of contact",
              "Bundled pricing for fleet + facility services",
              "Consistent scheduling across all locations"
            ]}
            ctaText="View Commercial Services"
            ctaLink="/commercial"
            icon={<Building2 className="w-10 h-10 text-blue-900" />}
            imageSrc="/fleet/servicetruck.png"
          />
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Fleet Vehicle Types We Service</h2>
            <p className="text-xl text-gray-600">Professional cleaning with transparent pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="w-8 h-8 text-blue-900" />
                <h3 className="text-2xl font-bold text-blue-900">Tractor-Trailers & Rigs</h3>
              </div>
              <p className="text-lg font-bold text-blue-900 mb-3">$75-95 per unit</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Professional cleaning for over-the-road trucks, tractor-trailers, and big rigs. Full cab, trailer, wheels, and undercarriage cleaning.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Full cab exterior cleaning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Trailer washing and brightening</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Wheel and rim cleaning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Undercarriage degreasing</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border-2 border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="w-8 h-8 text-blue-900" />
                <h3 className="text-2xl font-bold text-blue-900">Delivery Vans & Box Trucks</h3>
              </div>
              <p className="text-lg font-bold text-blue-900 mb-3">$55-75 per unit</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Keep your delivery fleet looking professional. Perfect for last-mile delivery companies, courier services, and local distribution.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Box truck and cargo van washing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Sprinter and transit van cleaning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Fleet branding protection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Logo and graphics preservation</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border-2 border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <Wrench className="w-8 h-8 text-blue-900" />
                <h3 className="text-2xl font-bold text-blue-900">Heavy Equipment & Construction</h3>
              </div>
              <p className="text-lg font-bold text-blue-900 mb-3">$85-120 per unit</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Construction equipment, dump trucks, and heavy machinery. Remove mud, dirt, and jobsite buildup to maintain equipment value.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Excavators and loaders</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dump trucks and concrete mixers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Utility trucks and service vehicles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">High-pressure degreasing available</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Droplets className="w-8 h-8 text-blue-900" />
                <h3 className="text-2xl font-bold text-blue-900">Trailer Washouts</h3>
              </div>
              <p className="text-lg font-bold text-blue-900 mb-3">$95-150 per unit</p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Interior and exterior trailer cleaning for food-grade, refrigerated, and dry van trailers. DOT compliant with documentation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Interior trailer washouts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Food-grade sanitization</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Refrigerated trailer cleaning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">DOT compliance documentation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-gray-700 text-lg">
              <strong>Volume Discounts Available:</strong> 10+ vehicles receive 10% off | 20+ vehicles receive 15% off | 50+ vehicles - call for custom pricing
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Why 40+ Fleet Managers Trust J&M</h2>
            <p className="text-xl text-gray-600">Over 20 years of experience serving commercial fleets</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">20+ Years Experience</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Family-owned since 2003. We understand fleet maintenance demands and deliver consistent, reliable service every time.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Damage Guarantee</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Comprehensive $2M liability coverage. We pay for any damage. COI certificates provided same-day for your vendor files.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Vendor-Ready Service</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Single monthly invoices, detailed service records, W-9 on file. We make vendor management simple and headache-free.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">What Sets Us Apart</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Fleet Manager Portal (Coming 2025)</h4>
                  <p className="text-gray-600">Online scheduling, photo reports, and invoice management in one place</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Weather Guarantee</h4>
                  <p className="text-gray-600">Automatic rescheduling for weather - no cancellation fees, ever</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Brand Protection Program</h4>
                  <p className="text-gray-600">Special protocols to protect logos, decals, and vehicle graphics</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">24/7 Emergency Service</h4>
                  <p className="text-gray-600">Urgent cleaning available within 4 hours for spills, accidents, or DOT inspections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Fleet Manager FAQs</h2>
            <p className="text-xl text-gray-600">Common questions from commercial clients</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-900 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">Managing Multiple Properties or Locations?</h3>
                  <p className="text-gray-700 text-lg mb-4">
                    Bundle fleet washing with building cleaning for simplified vendor management and preferred pricing.
                  </p>
                  <Link
                    to="/commercial/"
                    className="inline-flex items-center text-blue-900 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Learn About Commercial Programs
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Areas: Rhode Island & Massachusetts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mobile fleet washing throughout our 30+ mile service radius
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">RI</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Rhode Island Fleet Services</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Massachusetts Fleet Services</h3>
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
            <p className="text-lg text-gray-700 mb-4">We service many additional communities throughout Rhode Island and Massachusetts for mobile fleet washing.</p>
            <a href="tel:+14015950726" className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
              Call (401) 595-0726 to Confirm Service
            </a>
          </div>
        </div>
      </section>

      <div className="bg-yellow-50 border-y-4 border-yellow-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-yellow-900" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Limited Monthly Capacity</h3>
              <p className="text-gray-900 text-lg">
                We only accept <strong>3 new fleet contracts per month</strong> to maintain service quality for existing clients.
                Current availability for {new Date().toLocaleString('default', { month: 'long' })} 2025: <strong className="text-yellow-900">1 spot remaining</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <QuoteForm
        hideServices={true}
        defaultServices={['Fleet Services']}
        pageSource="Fleet Washing"
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready to Save 40% on Fleet Cleaning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Get detailed pricing for your fleet size and vehicle types within 24 hours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all">
              Call (401) 595-0726
            </a>
            <Link to="/commercial/" className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-900 hover:text-white transition-all">
              View All Commercial Services
            </Link>
          </div>
        </div>
      </section>

      {showMobileCta && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white shadow-2xl z-50 md:hidden">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="font-bold text-sm">Fleet Washing from $55/truck</p>
              <p className="text-xs text-blue-200">24hr quote response guaranteed</p>
            </div>
            <button
              onClick={scrollToQuote}
              className="px-6 py-3 bg-white text-blue-900 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-blue-50 transition-colors"
            >
              Get Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
