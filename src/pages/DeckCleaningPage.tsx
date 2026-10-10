import { Check, Fence, ChevronRight, Shield, Droplets, Sun, Home, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import QuoteForm from '../components/QuoteForm';
import BeforeAfterComparison from '../components/BeforeAfterComparison';
import ServiceArea from '../components/ServiceArea';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addMultipleStructuredData, createServiceSchema, createWebPageWithImageSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function DeckCleaningPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  useEffect(() => {
    updatePageMeta({
      title: 'Deck, Fence & Gate Cleaning RI & MA │ Wood Restoration – J&M',
      description: 'Expert deck, fence & gate cleaning, staining & restoration. Clean wood, vinyl & composite surfaces. Serving RI & MA residential & commercial properties.',
      keywords: 'deck cleaning RI, fence cleaning Rhode Island, gate cleaning, deck staining, fence power washing, wood restoration, deck refinishing, fence restoration, vinyl fence cleaning, wood fence cleaning, composite deck cleaning, commercial fence cleaning, HOA fence cleaning, North Smithfield, Providence, Warwick, Cranston, Attleboro MA, Franklin MA',
      ogTitle: 'Professional Deck Cleaning & Restoration RI & MA | J&M Power Washing',
      ogDescription: 'Expert deck, fence & gate cleaning, staining & sealing. Restore beauty, prevent rot for wood, vinyl & composite surfaces. Residential & commercial services in RI & MA.',
    });

    addMultipleStructuredData([
      createServiceSchema(
        'Deck Cleaning',
        'Professional deck cleaning and wood restoration services. Expert pressure washing, staining, and sealing to restore and protect your deck.',
        'https://powerwashjm.com/deck-cleaning/'
      ),
      createWebPageWithImageSchema({
        title: 'Deck, Fence & Gate Cleaning RI & MA │ Wood Restoration – J&M',
        description: 'Expert deck, fence & gate cleaning, staining & restoration. Clean wood, vinyl & composite surfaces. Serving RI & MA residential & commercial properties.',
        url: 'https://powerwashjm.com/deck-cleaning/',
        image: {
          url: '/beforeandafter/after-Deck.png',
          alt: 'Professional deck cleaning and restoration before and after in Rhode Island',
          width: 1200,
          height: 630,
        },
      }),
    ]);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/beforeandafter/after-Deck.png)'
        }}
      >
        <div className="absolute inset-0 bg-amber-800/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Wind className="w-8 h-8 text-amber-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Restoration Service</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Deck, Fence & Gate Cleaning</h1>
            <p className="text-xl text-amber-100 mb-8">
              Professional deck, fence, and gate cleaning, restoration, staining, and sealing services. We safely remove dirt, mold, and mildew from wood, vinyl, and composite surfaces—serving both residential and commercial properties throughout Rhode Island and Massachusetts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <a href="#quote" className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-900 rounded-lg font-semibold text-lg hover:bg-amber-50 transition-all hover:scale-105 shadow-lg mb-3 whitespace-nowrap">
                  Get a Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
                <div className="text-center">
                  <Link to="/financing/" className="text-amber-100 text-sm underline hover:text-white transition-colors">
                    We Offer Financing
                  </Link>
                </div>
              </div>
              <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-900 rounded-lg font-semibold text-lg hover:bg-amber-50 transition-all hover:scale-105 shadow-lg whitespace-nowrap h-fit">
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
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Professional Deck Restoration in Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Wood decks throughout Rhode Island and Massachusetts face relentless assault from sun, rain, snow, and humidity that cause graying, splintering, and accelerated deterioration. What was once beautiful cedar, pressure-treated pine, or exotic hardwood fades to weathered gray within a single season without proper maintenance. J&M Power Washing specializes in complete deck restoration including deep cleaning, surface preparation, staining, and sealing that returns aged decks to like-new condition. Serving Providence, Warwick, Cranston, and all surrounding communities, we've restored thousands of decks using proven techniques that prepare surfaces properly, apply premium stains correctly, and deliver results that last for years rather than months.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Restore Your Outdoor Living Space</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Your deck is constantly exposed to rain, sun, dirt, and foot traffic. Over time, this takes a toll, causing wood to gray, composite materials to stain, and surfaces to become slippery with algae and mildew. Professional deck cleaning not only restores beauty but also helps prevent premature deterioration.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                We use carefully calibrated pressure and specialized cleaning solutions designed for each deck material—whether wood, composite, or PVC—to safely remove buildup without causing damage.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Material-Specific Approach</h3>
                    <p className="text-gray-600">Customized cleaning for wood, composite, and vinyl decking</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Deep Cleaning Power</h3>
                    <p className="text-gray-600">Removes embedded dirt, mold, mildew, and algae</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sun className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Prep for Staining</h3>
                    <p className="text-gray-600">Professional cleaning prepares wood for sealing and staining</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-blue-100 mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Surfaces We Clean</h3>
                <ul className="space-y-4">
                  {[
                    'Wood decks (cedar, pine, pressure-treated)',
                    'Composite decking (Trex, TimberTech, etc.)',
                    'PVC and vinyl decking',
                    'Deck railings and stairs',
                    'Pergolas and gazebos',
                    'Outdoor furniture',
                    'Fences (wood, vinyl, composite)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-800 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Why Clean Your Deck?</h3>
                <ul className="space-y-3 text-amber-100">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prevents wood rot and decay</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Eliminates slippery algae buildup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Restores natural wood color</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Increases property value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prepares surface for sealing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Deck Cleaning Process</h2>
            <p className="text-xl text-gray-600">Thorough, safe, and effective restoration</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Assessment', desc: 'We identify your deck material and condition' },
              { step: '2', title: 'Pre-Treatment', desc: 'Apply specialized cleaning solution' },
              { step: '3', title: 'Pressure Wash', desc: 'Carefully calibrated pressure removes buildup' },
              { step: '4', title: 'Inspection', desc: 'Final check ensures complete satisfaction' }
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

      <BeforeAfterComparison
        images={[
          {
            beforeSrc: '/beforeandafter/before-Deck.png',
            afterSrc: '/beforeandafter/after-Deck.png',
            beforeAlt: 'Dark weathered wooden deck with visible dirt, mold stains, and debris before professional pressure washing service in Rhode Island',
            afterAlt: 'Clean restored wooden deck with natural wood color revealed after professional pressure washing and deck cleaning service in Rhode Island',
            caption: 'Professional Deck Cleaning & Restoration',
            location: 'Rhode Island'
          }
        ]}
        title="See the Transformation"
        description="Professional deck cleaning removes years of dirt, mold, and weathering to restore your outdoor living space. Our expert team uses the right pressure and cleaning solutions to bring your deck back to life."
        className="bg-gradient-to-br from-amber-50 to-orange-50"
      />

      {/* Fence & Gate Cleaning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Fence className="w-10 h-10 text-amber-600" />
              <h2 className="text-4xl font-bold text-blue-900">Professional Fence & Gate Cleaning</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Restore your property's perimeter with expert fence and gate power washing services for residential and commercial properties
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">Why Clean Your Fence?</h3>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Fences and gates face constant exposure to weather, dirt, mildew, and organic growth that deteriorate appearance and shorten lifespan. Whether you have wood privacy fencing, vinyl picket fences, or commercial chain-link with privacy slats, professional cleaning removes buildup, restores original color, and prepares surfaces for staining or sealing.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Our specialized fence cleaning process uses the correct pressure and techniques for each material type—gentle enough to prevent damage while powerful enough to remove years of accumulated grime, mold, and algae.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Wood Fence Cleaning & Restoration</h4>
                    <p className="text-gray-600">Remove gray weathering, mold, and mildew from cedar, pine, and pressure-treated wood fencing. Prepare surfaces for staining to extend fence life by years.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Vinyl & PVC Fence Cleaning</h4>
                    <p className="text-gray-600">Eliminate green algae, black mold stains, and dirt from white and colored vinyl fencing. Safe soft washing restores brilliant white appearance without damaging material.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Chain-Link & Metal Fence Cleaning</h4>
                    <p className="text-gray-600">Remove rust stains, oxidation, and organic growth from chain-link, aluminum, and wrought iron fencing. Ideal for commercial properties and HOA communities.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Composite Fence Cleaning</h4>
                    <p className="text-gray-600">Safely clean Trex, TimberTech, and other composite fencing materials without causing surface damage or voiding manufacturer warranties.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Gate Cleaning & Maintenance</h4>
                    <p className="text-gray-600">Clean and restore entry gates, driveway gates, pool gates, and garden gates. Includes hinges, latches, and hardware cleaning.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200 mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Fence Types We Clean</h3>
                <ul className="space-y-3">
                  {[
                    'Wood Privacy Fences',
                    'Cedar Picket Fences',
                    'Vinyl & PVC Fencing',
                    'Chain-Link Fences',
                    'Composite Fencing',
                    'Aluminum & Wrought Iron',
                    'Split Rail Fences',
                    'Pool & Safety Fencing',
                    'Commercial Security Fences',
                    'HOA & Property Perimeter Fencing',
                    'Decorative Garden Fences',
                    'Entry & Driveway Gates'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Benefits of Fence Cleaning</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Restores curb appeal and property value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Extends fence lifespan by years</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prevents rot and deterioration</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Removes harmful mold and mildew</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prepares wood for staining/sealing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Improves neighborhood aesthetics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fence Before/After Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 md:p-12 border-2 border-blue-200">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-blue-900 mb-4">See the Difference: Professional Fence Cleaning</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform weathered, stained fencing back to like-new condition with our expert power washing services
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <img
                src="/beforeandafter/fencebeforeandafter.png"
                alt="Before and after comparison showing dirty weathered wood fence transformed to clean natural wood color through professional power washing in Rhode Island"
                className="rounded-xl shadow-2xl w-full"
                loading="lazy"
              />
              <div className="mt-6 text-center">
                <p className="text-gray-700 text-lg font-semibold">
                  Professional fence cleaning removes years of dirt, mold, and weathering
                </p>
                <p className="text-gray-600 mt-2">
                  Serving residential and commercial properties throughout Rhode Island & Massachusetts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Fence Cleaning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Commercial Fence & Gate Cleaning Services</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Property managers, HOA boards, and facility managers trust J&M Power Washing for commercial fence cleaning across Rhode Island and Massachusetts. We handle large-scale projects including apartment complexes, condo associations, office parks, retail centers, and industrial facilities.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Our commercial fence cleaning services include flexible scheduling (nights and weekends available), Net 30 billing terms, comprehensive liability insurance with certificates provided upon request, and minimal disruption to tenants and operations.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Multi-Property Contracts</h4>
                    <p className="text-gray-600">Scheduled maintenance for property management companies with multiple locations</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">HOA & Condo Communities</h4>
                    <p className="text-gray-600">Perimeter fencing, pool enclosures, and community entrance gates</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Commercial & Industrial Properties</h4>
                    <p className="text-gray-600">Security fencing, chain-link perimeters, and loading dock areas</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/hoa-condo-cleaning/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Learn About Commercial Services
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Why Choose J&M for Fence Cleaning?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 mb-1">Material-Specific Expertise</h4>
                    <p className="text-gray-600">We adjust pressure and cleaning solutions based on fence material to prevent damage</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-blue-900" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 mb-1">Complete Property Service</h4>
                    <p className="text-gray-600">Combine fence cleaning with house washing, deck restoration, and concrete cleaning</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-blue-900" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 mb-1">Safe for Landscaping</h4>
                    <p className="text-gray-600">Eco-friendly cleaning solutions that won't harm your plants, grass, or gardens</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sun className="w-6 h-6 text-blue-900" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 mb-1">7+ Years Experience</h4>
                    <p className="text-gray-600">Family-owned business serving RI & MA since 2018 with hundreds of satisfied customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 3: Our Complete Deck Restoration Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Complete Deck Restoration Process</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Professional deck restoration requires multiple steps performed in proper sequence. We begin with assessment of existing stain or sealer, determining whether stripping is necessary. Next comes deep cleaning using specialized deck washing solutions that lift embedded dirt, remove mildew, and open wood grain for optimal stain penetration. We use controlled pressure - enough to clean effectively without damaging wood fibers or creating furring that causes premature stain failure. After cleaning, wood must dry completely, typically requiring 48-72 hours in Rhode Island's humid climate. Once dry, we apply premium penetrating oil-based or water-based stains in your choice of transparent, semi-transparent, or solid colors. Our application technique ensures even coverage, proper penetration, and professional results that enhance wood beauty while providing maximum UV and moisture protection. Most decks are ready for full use within 24-48 hours of final stain application, with results lasting 2-4 years depending on exposure and product selection. Pair deck restoration with our <Link to="/house-washing/" className="text-blue-600 hover:text-blue-800 underline">house washing services</Link> for complete property enhancement.
          </p>
        </div>
      </section>

      {/* Content Block 4: Service Areas & Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Service Areas & Options in RI & MA</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            We restore wood decks, composite deck substructures, railings, pergolas, gazebos, and outdoor wood furniture throughout Rhode Island and southeastern Massachusetts. Our service area includes <Link to="/towns/providence-ri/" className="text-blue-600 hover:text-blue-800 underline">Providence</Link>, <Link to="/towns/warwick-ri/" className="text-blue-600 hover:text-blue-800 underline">Warwick</Link>, <Link to="/towns/cranston-ri/" className="text-blue-600 hover:text-blue-800 underline">Cranston</Link>, <Link to="/towns/pawtucket-ri/" className="text-blue-600 hover:text-blue-800 underline">Pawtucket</Link>, <Link to="/towns/woonsocket-ri/" className="text-blue-600 hover:text-blue-800 underline">Woonsocket</Link>, <Link to="/towns/cumberland-ri/" className="text-blue-600 hover:text-blue-800 underline">Cumberland</Link>, <Link to="/towns/lincoln-ri/" className="text-blue-600 hover:text-blue-800 underline">Lincoln</Link>, <Link to="/towns/smithfield-ri/" className="text-blue-600 hover:text-blue-800 underline">Smithfield</Link>, <Link to="/towns/north-smithfield-ri/" className="text-blue-600 hover:text-blue-800 underline">North Smithfield</Link>, and <Link to="/towns/scituate-ri/" className="text-blue-600 hover:text-blue-800 underline">Scituate</Link> in Rhode Island, plus southeastern Massachusetts. We work with leading stain manufacturers including TWP, Ready Seal, Cabot, and Sherwin-Williams to provide options matching every budget and aesthetic preference. Every restoration includes detailed surface inspection, customer consultation on stain selection, professional cleaning, proper drying time, expert stain application, and post-project walkthrough to ensure complete satisfaction.
          </p>
        </div>
      </section>

      <ServiceFAQ
        faqs={[
          {
            question: 'How often should I have my deck cleaned?',
            answer: 'Most decks in Rhode Island benefit from annual cleaning due to our humid climate and seasonal weather. High-traffic decks or those in shaded areas with more moisture may need cleaning every 6-9 months. Regular cleaning prevents buildup of mold, mildew, and algae that can permanently damage wood fibers.'
          },
          {
            question: 'Will power washing damage my deck?',
            answer: 'When done incorrectly, yes. Thats why we use controlled soft washing techniques with adjustable pressure settings appropriate for each material. Our technicians are trained to clean effectively without causing furring, splintering, or surface damage. We adjust our approach for wood, composite, and vinyl materials.'
          },
          {
            question: 'How long does deck cleaning take?',
            answer: 'A typical residential deck takes 2-4 hours to clean properly. This includes preparation, cleaning, and ensuring proper drainage. If staining or sealing is included, additional time is needed for drying (48-72 hours) and application. We always provide accurate time estimates during your free consultation.'
          },
          {
            question: 'Do you offer deck staining and sealing services?',
            answer: 'Yes! We provide complete deck restoration including cleaning, staining, and sealing. We work with premium brands like TWP, Ready Seal, Cabot, and Sherwin-Williams. You can choose from transparent, semi-transparent, or solid stain options in various colors to match your homes aesthetic.'
          },
          {
            question: 'Can you clean composite decking like Trex or TimberTech?',
            answer: 'Composite decking requires special care and we are fully trained in proper composite cleaning techniques. We use lower pressure settings and specialized cleaning solutions safe for composite materials. Regular cleaning keeps composite decks looking new and prevents mold growth in the surface texture.'
          },
          {
            question: 'What is the best time of year to clean my deck in Rhode Island?',
            answer: 'Spring and early fall are ideal for deck cleaning in Rhode Island. Spring cleaning removes winter buildup before outdoor entertaining season, while fall cleaning prepares your deck for winter. We recommend avoiding cleaning during extreme heat or when temperatures drop below 50 degrees for best results.'
          }
        ]}
        title="Deck Cleaning Frequently Asked Questions"
      />

      <QuoteForm />

      {/* Related Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Complete Outdoor Maintenance</h2>
            <p className="text-xl text-gray-600">Pair deck cleaning with our other outdoor services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/house-washing/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">House Washing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Protect your siding and remove mold, mildew, and algae. Complete your home's exterior transformation.
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
                Professional driveway and patio cleaning. Remove stains, oil, and buildup for a complete outdoor refresh.
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
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready to Enjoy Your Deck Again?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Transform your outdoor space with professional deck cleaning
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

      <ServiceArea />
    </div>
  );
}
