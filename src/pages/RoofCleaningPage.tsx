import React, { useEffect } from 'react';
import { Check, Home, ChevronRight, Shield, Droplets, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuoteForm from '../components/QuoteForm';
import ServiceArea from '../components/ServiceArea';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addMultipleStructuredData, createServiceSchema, createWebPageWithImageSchema } from '../utils/seo';
import { TownLinkedText } from '../components/TownLinkedText';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function RoofCleaningPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  useEffect(() => {
    updatePageMeta({
      title: 'Roof Cleaning RI & MA │ Safe Soft Wash – J&M',
      description: 'Safe soft wash roof cleaning in Rhode Island & Massachusetts. We remove algae, moss, and black streaks without pressure damage. Free estimates – call (401) 595-0726.',
      keywords: 'roof cleaning RI, roof cleaning Rhode Island, soft wash roof cleaning, algae removal, moss removal, lichen removal, black streak removal, Gloeocapsa Magma removal, roof washing, shingle cleaning, asphalt shingle cleaning, Smithfield, Lincoln, Cumberland, Woonsocket, North Smithfield',
      ogTitle: 'Professional Roof Cleaning RI | Soft Wash Experts | J&M Power Washing',
      ogDescription: 'Safe, professional roof cleaning that extends your roof life by 5-10 years. We remove algae, moss, and lichen without damaging shingles. Serving all Rhode Island.',
      ogImage: '/roofcleaning.png',
      imageAlt: 'Professional Roof Cleaning Services in Rhode Island and Massachusetts - Before and After',
      imageWidth: 1200,
      imageHeight: 630,
    });

    addMultipleStructuredData([
      createServiceSchema(
        'Roof Cleaning',
        'Professional soft wash roof cleaning services. Safe removal of algae, moss, and black streaks without damaging your shingles.',
        'https://powerwashjm.com/roof-cleaning/'
      ),
      createWebPageWithImageSchema({
        title: 'Professional Roof Cleaning RI | Soft Wash Experts | J&M Power Washing',
        description: 'Safe, professional roof cleaning that extends your roof life by 5-10 years. We remove algae, moss, and lichen without damaging shingles.',
        url: 'https://powerwashjm.com/roof-cleaning/',
        image: {
          url: '/roofcleaning.png',
          alt: 'Professional Roof Cleaning Services in Rhode Island and Massachusetts - Before and After',
          width: 1200,
          height: 630,
          caption: 'Soft wash roof cleaning removing algae and black streaks from asphalt shingles',
        },
      }),
    ]);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/roofcleaning.png)'
        }}
      >
        <div className="absolute inset-0 bg-slate-800/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Building2 className="w-8 h-8 text-green-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">Specialized Service</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Professional Roof Cleaning</h1>
            <p className="text-xl text-slate-200 mb-8">
              Extend your roof's lifespan and restore its appearance with our specialized low-pressure soft wash system. Safe, effective, and designed specifically for roofing materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <a href="#quote" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-lg mb-3 whitespace-nowrap">
                  Get a Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
                <div className="text-center">
                  <Link to="/financing/" className="text-slate-200 text-sm underline hover:text-white transition-colors">
                    We Offer Financing
                  </Link>
                </div>
              </div>
              <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-lg whitespace-nowrap h-fit">
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
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Safe Roof Cleaning Rhode Island & Massachusetts</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Rhode Island's humid climate creates the perfect breeding ground for roof algae, moss, and black streaks that damage shingles and destroy curb appeal. Homeowners throughout Providence, Warwick, Cranston, and southeastern Massachusetts face this challenge every year. J&M Power Washing specializes in safe, soft wash roof cleaning that eliminates organic growth without the damaging high pressure used by inexperienced contractors. Our proven system removes those unsightly black streaks caused by gloeocapsa magma algae while protecting your roof's integrity and extending its lifespan by years.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Why Clean Your Roof?</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Dark streaks and discoloration on your roof aren't just unsightly—they're caused by algae, moss, and lichen that can actually damage your shingles. These organisms feed on the limestone filler in asphalt shingles, gradually breaking them down and shortening your roof's lifespan.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Our specialized low-pressure soft wash system safely removes these harmful organisms without the damage that high-pressure washing can cause. We use professional-grade, roof-safe cleaning solutions that kill algae and moss at the root.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8">
                <h3 className="text-xl font-bold text-amber-900 mb-2">Did You Know?</h3>
                <p className="text-amber-800">
                  Regular roof cleaning can extend your roof's life by 5-10 years, saving you thousands in premature replacement costs.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Low-Pressure Method</h3>
                    <p className="text-gray-600">We never use high-pressure washing that can damage shingles and void warranties</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Roof-Safe Solutions</h3>
                    <p className="text-gray-600">Professional cleaning agents designed specifically for roofing materials</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Long-Term Protection</h3>
                    <p className="text-gray-600">Our treatment continues working for months after application</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-blue-100 mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Roof Types We Clean</h3>
                <ul className="space-y-4">
                  {[
                    'Asphalt shingles',
                    'Architectural shingles',
                    'Composite shingles',
                    'Cedar shakes',
                    'Tile roofing',
                    'Metal roofing',
                    'Slate roofing'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-900 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Benefits of Roof Cleaning</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Extends roof lifespan by 5-10 years</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Improves curb appeal and home value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Prevents costly premature replacement</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Eliminates harmful algae and moss</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>May lower cooling costs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2: The Rhode Island Roof Cleaning Challenge */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">The Rhode Island Roof Cleaning Challenge</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            The climate in Rhode Island and southeastern Massachusetts presents unique challenges for homeowners. Our proximity to the ocean brings moisture-laden air inland, while our four distinct seasons create freeze-thaw cycles that accelerate roof deterioration. North-facing roof sections in towns like Smithfield, North Smithfield, and Lincoln stay damp longer, promoting faster algae colonization. Many homeowners in Woonsocket, Cumberland, and Johnston notice their neighbors' roofs developing the same black streaks within months of each other - this isn't coincidence. It's gloeocapsa magma algae spreading through airborne spores across entire neighborhoods. Once established, this bacteria feeds on the limestone filler in asphalt shingles, literally consuming your roof while reducing its reflective properties and increasing cooling costs.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-blue-900 mb-6 text-center">What Are Those Ugly Black Streaks on My Roof?</h2>

          <div className="mb-8 flex justify-center">
            <img
              src="https://powerwashjm.com/Section%201%20Black%20Streaks%20(Gloeocapsa%20Magma).png"
              alt="Black algae streaks (Gloeocapsa Magma) on asphalt roof shingles in Rhode Island"
              className="w-full max-w-2xl rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Those black streaks you see, especially on the north side of your roof, aren't dirt or soot. They are a living algae called Gloeocapsa Magma. This algae is airborne and thrives in moist, shaded areas, feeding on the limestone filler in your asphalt shingles. Left untreated, it not only looks bad but eats away at your shingles, shortening your roof's life.
          </p>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            <strong className="text-blue-900">Our Solution:</strong> Our soft wash system uses a 100% biodegradable, eco-friendly solution that eliminates Gloeocapsa Magma at the root, restoring your roof's appearance instantly without damaging the shingles.
          </p>

          <h2 className="text-4xl font-bold text-blue-900 mb-6 mt-12 text-center">The Dangers of Roof Moss in New England</h2>

          <div className="mb-8 flex justify-center">
            <img
              src="https://powerwashjm.com/Section%202%20Moss.png"
              alt="Roof moss growth damage on New England home shingles in Rhode Island"
              className="w-full max-w-2xl rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Moss is more than a cosmetic issue. It acts like a sponge, holding onto water. In Rhode Island winters, this trapped moisture freezes and expands, lifting your shingles and causing "frost damage." This can lead to cracks, water leaks, and premature roof failure. Its root system also anchors firmly into the shingle, dislodging the protective granules.
          </p>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            <strong className="text-blue-900">Our Solution:</strong> Never use a power washer on moss—it will rip your shingles off. Our soft wash process safely kills the moss, which will then naturally detach and be washed away by the rain, leaving your shingles unharmed.
          </p>

          <h2 className="text-4xl font-bold text-blue-900 mb-6 mt-12 text-center">How Lichen Can Damage Your Shingles</h2>

          <div className="mb-8 flex justify-center">
            <img
              src="https://powerwashjm.com/Section%203%20Lichen.png"
              alt="Lichen growth on roof shingles showing white scaly patches and damage"
              className="w-full max-w-2xl rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Lichen (the flat, green, or gray "scaly" patches) is a combination of algae and fungus. It has a tough, root-like structure that penetrates the shingle, and it releases acids that break down the asphalt and granules. It is one of the most destructive organisms for your roof.
          </p>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            <strong className="text-blue-900">Our Solution:</strong> Our soft wash process is the only way to safely kill lichen. Once treated, it will die, turn white, and be gently rinsed away by the rain over the following weeks, stopping any further damage.
          </p>
        </div>
      </section>

      {/* Content Block 3: Our Soft Wash Roof Cleaning Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Soft Wash Roof Cleaning Process</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Unlike pressure washing, which can damage shingles and void warranties, our soft wash roof cleaning system uses low-pressure application of professional-grade biocides specifically formulated for roof cleaning. We apply our cleaning solution at garden-hose pressure, allowing the chemicals to do the work rather than relying on force. This EPA-approved treatment kills algae, moss, and lichen at the root level, preventing regrowth for 2-3 years in most cases. The process is safe for all roofing materials including asphalt shingles, architectural shingles, and even delicate slate or cedar shake roofs found on historic homes throughout Providence and Newport. Our technicians are trained to identify problem areas, adjust treatment concentrations for different roof types, and ensure complete coverage without overspray onto landscaping or painted surfaces. Professional roof cleaning also complements our <Link to="/house-washing/" className="text-blue-600 hover:text-blue-800 underline">house washing services</Link> for complete exterior home restoration.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">See the Roof Cleaning Transformation</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our safe soft wash roof cleaning removes years of black streaks, algae, moss, and lichen without damaging your shingles or voiding warranties. See the dramatic difference professional roof cleaning makes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-blue-200">
            <div className="max-w-5xl mx-auto">
              <img
                src="https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/beforeandafter/roof-cleaning-final.png"
                alt="Before and after comparison showing dirty roof with black streaks and algae on left transformed to clean restored roof on right after professional soft wash cleaning in Rhode Island"
                className="rounded-xl shadow-2xl w-full"
                loading="lazy"
              />
              <div className="mt-6 text-center">
                <p className="text-gray-700 text-lg font-semibold">
                  Professional Roof Soft Wash Cleaning
                </p>
                <p className="text-gray-600 mt-2">
                  Serving residential and commercial properties throughout Rhode Island & Massachusetts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceFAQ
        faqs={[
          {
            question: "What's the difference between soft washing and power washing a roof?",
            answer: "Power washing uses high pressure, which can strip granules, break shingles, and void your roof's warranty. We only use soft washing, which relies on a specialized, eco-friendly cleaning solution (applied with the same pressure as a garden hose) to kill the growth at its root without any risk of damage."
          },
          {
            question: "Is your roof cleaning solution safe for my pets, plants, and family?",
            answer: "Yes. Our solution is 100% biodegradable. We take great care to pre-rinse all surrounding landscaping and do a final rinse afterward, ensuring your plants and property are perfectly safe."
          },
          {
            question: "How often do I need my roof cleaned in Rhode Island?",
            answer: "Most roofs in our area need to be cleaned every 3-5 years, depending on factors like shade from trees and the direction your home faces."
          },
          {
            question: "What towns do you provide roof cleaning in?",
            answer: "We proudly provide professional roof cleaning services throughout Rhode Island and Southern Massachusetts, including North Smithfield, Smithfield, Lincoln, Cumberland, Woonsocket, Providence, Cranston, Warwick, Pawtucket, and many more communities."
          }
        ]}
        title="Roof Cleaning Frequently Asked Questions"
      />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Roof Cleaning Process</h2>
            <p className="text-xl text-gray-600">Safe, thorough, and warranty-friendly</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Roof Inspection', desc: 'We carefully assess your roof condition and identify problem areas' },
              { step: '2', title: 'Pre-Treatment', desc: 'We apply specialized roof-safe cleaning solution' },
              { step: '3', title: 'Gentle Rinse', desc: 'Low-pressure rinse removes algae, moss, and stains' },
              { step: '4', title: 'Post-Treatment', desc: 'Optional treatment prevents regrowth for months' }
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

      {/* Content Block 4: Benefits & Service Areas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Professional Roof Cleaning Service Areas in RI & MA</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            <TownLinkedText>
              Professional roof cleaning delivers immediate visual transformation and long-term protection. Clean roofs reflect more sunlight, reducing attic temperatures and lowering air conditioning costs during Rhode Island's humid summers. Insurance companies recognize well-maintained roofs, and many homeowners see premium reductions after documentation of professional cleaning. Real estate agents throughout Warwick, Cranston, and Pawtucket recommend roof cleaning before listings, knowing it's one of the highest-ROI improvements for curb appeal. We proudly serve all of Rhode Island including Providence, Warwick, Cranston, Pawtucket, Woonsocket, Cumberland, Lincoln, Smithfield, and North Smithfield, plus southeastern Massachusetts communities. Every job includes a free inspection, detailed estimate, and our satisfaction guarantee backed by 100+ five-star reviews from neighbors throughout the region.
            </TownLinkedText>
          </p>
        </div>
      </section>

      <QuoteForm />

      {/* Related Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Complete Exterior Protection</h2>
            <p className="text-xl text-gray-600">Pair roof cleaning with our other essential services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/house-washing/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">House Washing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Protect your siding and remove mold, mildew, and algae. Complete exterior maintenance starts with clean walls.
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Protect Your Investment Today</h2>
          <p className="text-xl text-gray-600 mb-8">
            Don't wait until damage is done. Schedule your professional roof cleaning now.
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
