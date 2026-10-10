import { Check, Wind, ChevronRight, Shield, Sparkles, Zap, Home, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import QuoteForm from '../components/QuoteForm';
import ServiceArea from '../components/ServiceArea';
import ServiceFAQ from '../components/ServiceFAQ';
import { updatePageMeta, addMultipleStructuredData, createServiceSchema, createWebPageWithImageSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function ConcreteCleaningPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  useEffect(() => {
    updatePageMeta({
      title: 'Concrete Cleaning RI & MA │ Driveway Power Wash – J&M',
      description: 'Remove oil stains & restore driveways, sidewalks, patios in Providence, Warwick & all RI/MA. Fast results.',
      keywords: 'concrete cleaning RI, driveway cleaning Rhode Island, driveway pressure washing, concrete pressure washing, oil stain removal, sidewalk cleaning, patio cleaning, walkway cleaning, driveway restoration, North Smithfield, Providence, Warwick, Cranston, Attleboro MA, Franklin MA, Smithfield, Lincoln',
      ogTitle: 'Professional Driveway & Concrete Cleaning RI & MA | J&M Power Washing',
      ogDescription: 'Expert concrete cleaning services. Remove stubborn oil stains, restore driveways, sidewalks & patios. Professional high-pressure washing serving RI & MA.',
    });

    addMultipleStructuredData([
      createServiceSchema(
        'Concrete Cleaning',
        'Professional concrete and driveway pressure washing services. Remove oil stains, dirt, and grime from driveways, sidewalks, and patios.',
        'https://powerwashjm.com/concrete-cleaning/'
      ),
      createWebPageWithImageSchema({
        title: 'Concrete Cleaning RI & MA │ Driveway Power Wash – J&M',
        description: 'Remove oil stains & restore driveways, sidewalks, patios in Providence, Warwick & all RI/MA. Fast results.',
        url: 'https://powerwashjm.com/concrete-cleaning/',
        image: {
          url: '/drivewaywash.png',
          alt: 'Professional driveway and concrete pressure washing in Rhode Island',
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
          backgroundImage: 'url(https://powerwashjm.com/drivewaywash.png)'
        }}
      >
        <div className="absolute inset-0 bg-slate-800/70"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <Droplets className="w-8 h-8 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider">High-Impact Cleaning</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Concrete & Driveway Cleaning</h1>
            <p className="text-xl text-slate-200 mb-8">
              Restore your driveway, walkways, and patios to like-new condition. Our high-pressure cleaning removes years of oil stains, dirt, algae, and grime from concrete and paved surfaces.
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
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Professional Driveway & Concrete Cleaning in RI & MA</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Driveways, walkways, and patios throughout Rhode Island and Massachusetts endure harsh conditions that create stubborn stains, organic growth, and surface deterioration. Winter road salt, vehicle oil leaks, rust stains, mold, and atmospheric pollutants combine to make concrete and asphalt surfaces look permanently dirty. J&M Power Washing specializes in restoring hardscapes throughout Providence, Warwick, Cranston, and southeastern Massachusetts using professional-grade pressure washing equipment and surface cleaning attachments that deliver consistent, streak-free results. Whether you're preparing your home for sale, hosting outdoor events, or simply want your property to reflect the pride you take in homeownership, our concrete cleaning service delivers dramatic transformation.
          </p>
        </div>
      </section>

      {/* Before & After Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">See The Dramatic Transformation</h2>
            <p className="text-xl text-gray-600">Professional power washing reveals the true beauty of your concrete</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto">
            <img
              src="https://hlehvmcuwklbgvydrddt.supabase.co/storage/v1/object/public/site-images/beforeandafter/drivewaybeforeandafter.png"
              alt="Before and after concrete driveway power washing showing dramatic transformation from stained to clean"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <p className="text-center text-gray-600 mt-6 text-lg font-medium">Before & After: Complete Driveway Restoration</p>
        </div>
      </section>

      {/* Transform Your Surfaces Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">Transform Your Concrete Surfaces</h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Concrete driveways, walkways, and patios are incredibly durable—but they're also porous and prone to staining. Oil, grease, dirt, algae, and tire marks can make even newer concrete look old and neglected. Professional pressure washing not only restores appearance but can also increase your property's value.
              </p>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                We use commercial-grade pressure washing equipment with the perfect balance of pressure and cleaning solutions to deep clean without damaging the surface. The results are dramatic and immediate.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">High-Pressure Power</h3>
                    <p className="text-gray-600">Commercial equipment removes embedded stains and buildup</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Surface Safe</h3>
                    <p className="text-gray-600">Proper technique prevents damage to concrete and joints</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Dramatic Results</h3>
                    <p className="text-gray-600">See the difference immediately—surfaces look like new</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Surfaces We Clean</h3>
                <ul className="grid grid-cols-1 gap-3">
                  {[
                    'Concrete driveways',
                    'Walkways and sidewalks',
                    'Patios and pool decks',
                    'Parking lots',
                    'Garage floors',
                    'Stamped concrete',
                    'Pavers and stone',
                    'Retaining walls',
                    'Building exteriors'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-700 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">What We Remove</h3>
                <ul className="grid grid-cols-1 gap-3 text-slate-200">
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Oil and grease stains</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Tire marks and rubber</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Algae and moss</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Dirt and grime buildup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Rust stains</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Chewing gum</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Block 2: Common Rhode Island Concrete Problems */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Common Rhode Island Concrete Problems</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Rhode Island's challenging climate creates specific concrete cleaning challenges. Winter road salt deposits white crystalline stains that penetrate porous concrete surfaces. Vehicle leaks create dark oil spots on driveway centers and garage entrances. Rust stains from metal outdoor furniture, downspouts, and fertilizer spread onto walkways from lawn maintenance. North-facing patios and shaded walkways in wooded areas of Lincoln, Smithfield, and Cumberland develop green algae and black mold that make surfaces slippery and dangerous when wet. Efflorescence - those white powdery deposits that appear on newer concrete - results from moisture drawing salts to the surface as it evaporates. Each stain type requires specific treatment approaches, proper pressure levels, appropriate cleaning chemicals, and experienced technique to remove without damaging concrete surfaces or killing surrounding landscaping.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Concrete Cleaning Process</h2>
            <p className="text-xl text-gray-600">Professional results, every time</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Site Assessment', desc: 'We evaluate surface type, stains, and condition' },
              { step: '2', title: 'Pre-Treatment', desc: 'Apply specialized cleaners for tough stains' },
              { step: '3', title: 'High-Pressure Wash', desc: 'Powerful cleaning removes embedded grime' },
              { step: '4', title: 'Final Rinse', desc: 'Thorough rinse ensures spotless results' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-slate-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Block 3: Our Professional Concrete Cleaning Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Professional Concrete Cleaning Process</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            J&M uses commercial-grade pressure washing equipment delivering 3000-4000 PSI through specialized surface cleaning attachments. These tools maintain consistent distance and pressure while containing overspray, creating uniform results without the streaking common with standard pressure washing wands. We pre-treat oil stains with professional degreasers, apply specialized rust removers to oxidation stains, and use appropriate cleaners for specific discoloration types. Our process includes edging along foundations, around landscaping, and beside garage doors for complete coverage. Hot water capability allows us to tackle the toughest grease and oil stains that cold water cannot penetrate. Post-cleaning inspection ensures complete stain removal, and we offer optional concrete sealing to protect surfaces, resist future staining, and simplify maintenance. Most residential driveways are completed in 1-2 hours with immediate wow factor results. Complete your exterior transformation with our <Link to="/house-washing/" className="text-blue-600 hover:text-blue-800 underline">house washing services</Link>.
          </p>
        </div>
      </section>

      {/* Content Block 4: Service Areas & Applications */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Service Areas & Applications in RI & MA</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Beyond driveways, our concrete cleaning services restore walkways, patios, pool decks, garage floors, commercial parking lots, retail sidewalks, and property entrances throughout Rhode Island and Massachusetts. We serve all major communities including <Link to="/towns/providence-ri/" className="text-blue-600 hover:text-blue-800 underline">Providence</Link>, <Link to="/towns/warwick-ri/" className="text-blue-600 hover:text-blue-800 underline">Warwick</Link>, <Link to="/towns/cranston-ri/" className="text-blue-600 hover:text-blue-800 underline">Cranston</Link>, <Link to="/towns/pawtucket-ri/" className="text-blue-600 hover:text-blue-800 underline">Pawtucket</Link>, <Link to="/towns/woonsocket-ri/" className="text-blue-600 hover:text-blue-800 underline">Woonsocket</Link>, <Link to="/towns/cumberland-ri/" className="text-blue-600 hover:text-blue-800 underline">Cumberland</Link>, <Link to="/towns/lincoln-ri/" className="text-blue-600 hover:text-blue-800 underline">Lincoln</Link>, <Link to="/towns/smithfield-ri/" className="text-blue-600 hover:text-blue-800 underline">Smithfield</Link>, <Link to="/towns/north-smithfield-ri/" className="text-blue-600 hover:text-blue-800 underline">North Smithfield</Link>, and <Link to="/towns/scituate-ri/" className="text-blue-600 hover:text-blue-800 underline">Scituate</Link> in Rhode Island, plus southeastern Massachusetts. Property managers and real estate agents trust us for pre-listing cleanings that deliver exceptional return on investment. Commercial clients appreciate scheduled maintenance programs that keep business entrances welcoming and professional. Every job includes free estimates, detailed surface evaluation, and our satisfaction guarantee backed by 100+ five-star reviews from neighbors throughout the region.
          </p>
        </div>
      </section>

      <ServiceFAQ
        faqs={[
          {
            question: 'Can you remove oil stains from my driveway?',
            answer: 'Yes, we specialize in oil stain removal using professional-grade degreasing solutions and high-pressure cleaning. Fresh oil stains respond best to treatment, but we can significantly improve even older, set-in stains. For stubborn stains, we may recommend multiple treatments or sealing to prevent future penetration.'
          },
          {
            question: 'How much does driveway cleaning cost in Rhode Island?',
            answer: 'Pricing depends on driveway size, condition, and stain severity. Most residential driveways in the Providence area range from $150-$400. We provide free on-site estimates with exact pricing before any work begins. Commercial properties and larger areas receive customized quotes based on square footage.'
          },
          {
            question: 'How long does concrete cleaning take?',
            answer: 'A typical residential driveway takes 1-3 hours depending on size and condition. We use professional surface cleaners that clean uniformly and efficiently. Your driveway is typically ready for vehicle traffic within 1-2 hours after we finish, though we recommend waiting 24 hours before parking on freshly cleaned surfaces.'
          },
          {
            question: 'Will pressure washing damage my concrete?',
            answer: 'When done correctly by professionals, no. We use appropriate pressure settings and maintain proper tip distance to clean effectively without damaging the concrete surface. Our technicians are trained to identify concrete condition and adjust techniques for older or more delicate surfaces.'
          },
          {
            question: 'Do you offer concrete sealing services?',
            answer: 'Yes, we offer concrete sealing as an add-on service. Sealing protects your freshly cleaned concrete from oil penetration, weathering, and future staining. Sealed driveways are much easier to maintain and typically only need cleaning every 2-3 years compared to annually for unsealed concrete.'
          },
          {
            question: 'What surfaces can you clean besides driveways?',
            answer: 'We clean all concrete and paved surfaces including sidewalks, patios, pool decks, garage floors, walkways, retaining walls, parking lots, commercial storefronts, and property entrances. We also handle brick pavers, stamped concrete, and flagstone with appropriate cleaning methods for each material.'
          }
        ]}
        title="Concrete Cleaning Frequently Asked Questions"
      />

      <QuoteForm />

      {/* Related Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Complete Property Cleaning</h2>
            <p className="text-xl text-gray-600">Pair concrete cleaning with our other exterior services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/house-washing/" className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 hover:border-blue-300">
              <div className="flex items-center space-x-3 mb-4">
                <Home className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">House Washing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Protect your siding and remove mold, mildew, and algae. Complete your property's transformation.
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
                Professional deck cleaning and restoration. Complete your outdoor living space makeover.
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
                Remove black streaks, moss, and algae from your roof. Essential maintenance that protects your investment.
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
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Boost Your Curb Appeal Today</h2>
          <p className="text-xl text-gray-600 mb-8">
            Clean concrete makes a powerful first impression. Get your free estimate now.
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
