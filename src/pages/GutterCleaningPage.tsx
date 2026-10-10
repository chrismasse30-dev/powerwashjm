import React, { useEffect } from 'react';
import { Check, Trash2, ChevronRight, Shield, Droplets, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';
import ServiceArea from '../components/ServiceArea';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addMultipleStructuredData, createServiceSchema, createWebPageWithImageSchema } from '../utils/seo';
import { TownLinkedText } from '../components/TownLinkedText';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function GutterCleaningPage() {
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
      title: 'Gutter Cleaning RI & MA │ Interior & Exterior – J&M',
      description: 'Professional interior and exterior gutter cleaning in Rhode Island & Massachusetts. Remove clogs, debris, and tiger stripes. Prevent water damage – free quotes.',
      keywords: 'gutter cleaning RI, full gutter cleaning, gutter cleaning service, interior gutter cleaning, exterior gutter cleaning, gutter brightening, tiger stripes removal, gutter stain removal, debris removal, clogged gutters, gutter cleaning Rhode Island, gutter cleaning Massachusetts, North Smithfield, Providence, Warwick, Cranston',
      ogTitle: 'Full Gutter Cleaning Service - Interior & Exterior | J & M Power Washing',
      ogDescription: 'Professional full-service gutter cleaning. We protect your home from water damage and enhance curb appeal with complete interior and exterior gutter maintenance.',
    });

    addMultipleStructuredData([
      createServiceSchema(
        'Full Gutter Cleaning Service',
        'Professional full-service gutter cleaning including interior debris removal and exterior brightening. Complete gutter maintenance to protect your home and enhance curb appeal.',
        'https://powerwashjm.com/gutter-cleaning/'
      ),
      createWebPageWithImageSchema({
        title: 'Full Gutter Cleaning Service - Interior & Exterior | J & M Power Washing',
        description: 'Professional interior and exterior gutter cleaning in Rhode Island & Massachusetts. Remove clogs, debris, and tiger stripes to prevent water damage.',
        url: 'https://powerwashjm.com/gutter-cleaning/',
        image: {
          url: '/Gutter.png',
          alt: 'Professional gutter cleaning service in Rhode Island - interior and exterior',
          width: 1200,
          height: 630,
        },
      })
    ]);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      {/* Hero Section */}
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(https://powerwashjm.com/Gutter.jpg)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Droplets className="w-8 h-8 text-slate-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Protection & Perfection</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Full Gutter Cleaning Service</h1>
            <p className="text-xl text-blue-100 mb-8">
              Complete interior and exterior gutter cleaning. We remove debris and clogs to protect your home from water damage, then brighten the exterior to eliminate tiger stripes and restore curb appeal.
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

      {/* Content Block 1: Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Full Gutter Cleaning Service in Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Clogged gutters represent one of the most dangerous threats to Rhode Island homes, causing foundation damage, basement flooding, ice dams, and fascia rot. Throughout Providence, Warwick, and surrounding communities, gutters accumulate leaves, pine needles, roof granules, and organic debris that block water flow and create overflow problems during our frequent rainstorms. J&M Power Washing provides comprehensive gutter cleaning that goes beyond basic debris removal. We clean the interior channels, flush downspouts, and wash exterior surfaces to remove those stubborn "tiger stripes" that make gutters look permanently stained, restoring both function and appearance.
          </p>
        </div>
      </section>

      {/* Interior Gutter Cleaning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Interior Gutter Cleaning</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Clogged gutters aren't just an eyesore—they're a direct threat to your home's structural integrity. When leaves, twigs, and debris accumulate inside your gutters, water can't flow properly. This overflow causes a cascade of problems that can cost thousands to repair.
              </p>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>The Dangers of Clogged Gutters</span>
                </h3>
                <ul className="space-y-3 text-red-800">
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span><strong>Foundation Damage:</strong> Water pooling causes cracks and structural failure—repairs can cost $10,000+</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span><strong>Basement Flooding:</strong> Overflow directs water into your basement, causing mold and property damage</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span><strong>Fascia & Soffit Rot:</strong> Standing water deteriorates wood trim requiring expensive repairs</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span><strong>Pest Infestations:</strong> Debris-filled gutters become breeding grounds for mosquitoes and rodents</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span><strong>Ice Dams in Winter:</strong> Clogged gutters trap water that freezes, damaging your roof</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Complete Debris Removal</h3>
                    <p className="text-gray-600">Hand-removal of all leaves, twigs, sediment, and organic matter from gutter channels</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Downspout Flushing</h3>
                    <p className="text-gray-600">High-pressure water flushing ensures downspouts are completely clear</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">System Inspection & Haul-Away</h3>
                    <p className="text-gray-600">We check for issues and remove all debris from your property</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Infographic Image - Right side of grid */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
                <div className="flex justify-center">
                  <img
                    src="https://powerwashjm.com/Gutter.png"
                    alt="Infographic showing how clogged gutters lead to foundation damage, flooding, rot, and pest infestations"
                    className="w-full max-w-md rounded-lg shadow-lg mb-4"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center italic">
                  Clogged gutters create a cascade of damage. Protect your investment with professional interior gutter cleaning.
                </p>
              </div>

              <div className="bg-blue-900 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">100% Satisfaction Guarantee</h3>
                <p className="text-blue-100 leading-relaxed">
                  We stand behind our work. If you're not completely satisfied with the results, we'll make it right—no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2: The Rhode Island Gutter Challenge */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">The Rhode Island Gutter Challenge</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Rhode Island's four distinct seasons create unique challenges for gutter systems. Fall brings massive leaf accumulation from the oak, maple, and pine trees common throughout Cranston, Johnston, and Lincoln. Winter's freeze-thaw cycles trap debris in ice, while spring thaws create torrential water flow that exposes clogging problems. Summer humidity promotes decomposition of trapped organic matter, creating acidic sludge that corrodes aluminum gutters from the inside. Homes in wooded areas of Scituate, Glocester, and Burrillville face even greater challenges with pine needles that mat together and resist typical gutter guards. Additionally, the black "tiger stripes" visible on gutter exteriors aren't dirt - they're electrostatic bonding of atmospheric pollutants to aluminum oxidation, requiring specialized cleaning solutions for removal.
          </p>
        </div>
      </section>

      {/* Exterior Gutter Brightening Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="order-2 lg:order-1">
              {/* Before/After Image - Left side of grid */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
                <div className="flex justify-center">
                  <img
                    src="https://powerwashjm.com/beforeandafter/GutterBAA.png"
                    alt="Before and after comparison showing gutter brightening transformation from stained to pristine white"
                    className="w-full max-w-md rounded-lg shadow-md mb-4"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center italic">
                  Our gutter brightening service removes stubborn tiger stripes, oxidation, and stains for a like-new appearance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">What We Remove</h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Tiger Stripes', desc: 'Dark vertical streaks from water runoff' },
                    { name: 'Oxidation', desc: 'Chalky, faded finish from UV exposure' },
                    { name: 'Algae & Mildew', desc: 'Green and black organic growth' },
                    { name: 'Environmental Stains', desc: 'Pollution and grime buildup' },
                    { name: 'Rust Stains', desc: 'Orange discoloration from metal' }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{item.name}:</span>
                        <span className="text-gray-600"> {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Exterior Gutter Brightening</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Over time, gutters accumulate unsightly black streaks ("tiger stripes"), oxidation, algae, and environmental stains. These marks make even well-maintained homes look neglected and are nearly impossible to remove with regular cleaning.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Our specialized exterior gutter brightening service uses professional-grade solutions to safely remove years of buildup, instantly restoring your home's curb appeal.
              </p>

              <h3 className="text-2xl font-bold text-blue-900 mb-6">Why Brighten Your Gutters?</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-gray-900">Instant Curb Appeal:</span>
                    <span className="text-gray-700"> Clean gutters transform your home's appearance in hours</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-gray-900">Increase Property Value:</span>
                    <span className="text-gray-700"> Well-maintained exteriors command higher resale prices</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-gray-900">Extend Gutter Lifespan:</span>
                    <span className="text-gray-700"> Removing contaminants prevents premature deterioration</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-gray-900">Avoid Costly Replacement:</span>
                    <span className="text-gray-700"> Restoration costs a fraction of new gutter installation</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-gray-900">Safe & Non-Damaging:</span>
                    <span className="text-gray-700"> Professional solutions won't harm gutters or landscaping</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600">Professional, efficient, and thorough</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Inspection', desc: 'We assess gutter condition and identify problem areas' },
              { step: '2', title: 'Interior Cleaning', desc: 'Remove all debris and flush downspouts completely' },
              { step: '3', title: 'Exterior Brightening', desc: 'Apply specialized solutions to remove stains and tiger stripes' },
              { step: '4', title: 'Final Check', desc: 'Inspect results, haul away debris, ensure satisfaction' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteForm />

      {/* Related Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Complete Your Home's Protection</h2>
            <p className="text-xl text-gray-600">Pair gutter cleaning with our other exterior services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/house-washing/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">House Washing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Protect your siding and remove mold, mildew, and algae while we're cleaning your gutters. Complete exterior maintenance in one visit.
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
                Remove black streaks, moss, and algae from your roof. Essential maintenance that extends roof life and prevents costly repairs.
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Protect Your Home with Full Gutter Cleaning</h2>
          <p className="text-xl text-gray-600 mb-8">
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

      {/* Content Block 3: Our Complete Gutter Service */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Complete Gutter Service</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            J&M provides the most thorough gutter cleaning available in Rhode Island and Massachusetts. We begin by removing all debris by hand and with specialized gutter scoops, bagging everything for disposal rather than dumping it in your landscaping. Next, we flush all downspouts to ensure complete drainage, identifying and clearing underground drain connections when accessible. Our service includes minor adjustments to gutter pitch when needed and identification of any damage requiring professional repair. The final step sets us apart: exterior gutter brightening. Using professional-grade cleaning solutions, we remove those black tiger stripes that pressure washing alone cannot eliminate, restoring gutters to like-new brightness. This comprehensive approach ensures your gutter system functions properly and looks great, protecting your home's foundation, preventing basement seepage, eliminating mosquito breeding sites, and preventing ice dam formation during Rhode Island's harsh winters. Pair gutter cleaning with our <Link to="/roof-cleaning/" className="text-blue-600 hover:text-blue-800 underline">roof cleaning services</Link> for complete protection.
          </p>
        </div>
      </section>

      <ServiceFAQ
        faqs={[
          {
            question: 'Do you clean the inside and outside of gutters?',
            answer: 'Yes! We provide complete full-service gutter cleaning. This includes removing all debris from inside your gutters, flushing downspouts, AND cleaning the exterior to remove tiger stripes, stains, and oxidation. You get both functional protection and beautiful appearance.'
          },
          {
            question: 'How often should I have my gutters cleaned?',
            answer: 'We recommend gutter cleaning at least twice per year—once in late spring after trees bloom, and once in late fall after leaves drop. Homes with heavy tree coverage or pine trees may benefit from more frequent cleaning (3-4 times per year) to prevent clogs.'
          },
          {
            question: 'What are "tiger stripes" on gutters?',
            answer: 'Tiger stripes are dark vertical streaks on the exterior of gutters caused by water runoff mixed with environmental pollutants, pollen, and oxidation. They\'re extremely difficult to remove with regular cleaning but our specialized gutter brightening service removes them completely.'
          },
          {
            question: 'Will clogged gutters really damage my home?',
            answer: 'Absolutely. Clogged gutters cause water to overflow, which can lead to foundation damage ($10,000+ repairs), basement flooding, rotted fascia and soffit boards, pest infestations, and ice dams in winter. Regular gutter cleaning is essential preventive maintenance that saves you thousands in repairs.'
          },
          {
            question: 'How long does gutter cleaning take?',
            answer: 'Most residential gutter cleaning projects are completed in 2-4 hours, depending on the size of your home, amount of debris, and condition of the exterior. We work efficiently while ensuring thorough cleaning of both interior and exterior surfaces.'
          },
          {
            question: 'Do you haul away the debris?',
            answer: 'Yes! We bag and remove all debris from your property—no mess left behind. Your gutters will be clean, your yard will be clean, and your home will look great.'
          }
        ]}
      />

      {/* Content Block 4: Service Areas & Scheduling */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Service Areas & Scheduling in Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            <TownLinkedText>
              We recommend gutter cleaning twice annually for most Rhode Island homes - once in late fall after leaves drop and again in late spring after tree pollen season. Homes with significant pine tree coverage may benefit from a third mid-summer cleaning. Our service area includes Providence, Warwick, Cranston, Pawtucket, Woonsocket, Cumberland, Lincoln, Smithfield, North Smithfield, and Scituate in Rhode Island, plus southeastern Massachusetts. We serve residential properties of all sizes, from small ranch homes to large colonials with complex rooflines. Commercial gutter cleaning is available for multi-unit properties, retail centers, and small business locations throughout our service area. Every job includes a safety inspection of gutter attachments, detailed debris removal, complete downspout flushing, and exterior cleaning when requested. Free estimates available with same-day quotes in most cases.
            </TownLinkedText>
          </p>
        </div>
      </section>

      <ServiceArea />
    </div>
  );
}
