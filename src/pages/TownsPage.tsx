import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { updatePageMeta } from '../utils/seo';
import { townsData } from '../data/townsData';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

const rhodeIslandTowns = townsData.filter(t => t.stateAbbr === 'RI');
const massachusettsTowns = townsData.filter(t => t.stateAbbr === 'MA');

interface TownDescription {
  name: string;
  slug: string;
  description: string;
}

const townDescriptions: TownDescription[] = [
  { name: 'Providence', slug: 'providence-ri', description: 'Providence homeowners and businesses trust J&M for safe soft washing that removes algae, mold, and city grime from siding, brick, and brownstones. Serving East Side, Federal Hill, and College Hill.' },
  { name: 'Warwick', slug: 'warwick-ri', description: 'Warwick\'s coastal weather means stubborn algae and salt buildup. Our low-pressure soft washing system protects your siding while eliminating green stains in just one day.' },
  { name: 'Cranston', slug: 'cranston-ri', description: 'Cranston\'s Knightsville, Edgewood, and Garden City areas love our gentle house washing and ARMA-certified roof cleaning that prevents moss damage.' },
  { name: 'East Providence', slug: 'east-providence-ri', description: 'Expert soft washing and roof treatments for East Providence properties. We remove years of riverside grime from vinyl, stucco, and brick homes.' },
  { name: 'Pawtucket', slug: 'pawtucket-ri', description: 'Pawtucket\'s historic mills and homes deserve gentle cleaning. Our soft washing process safely removes New England dirt without damaging delicate surfaces.' },
  { name: 'Johnston', slug: 'johnston-ri', description: 'Johnston families rely on J&M for fast, affordable exterior cleaning. We soft wash vinyl and cedar siding and treat roofs to stop algae regrowth.' },
  { name: 'North Providence', slug: 'north-providence-ri', description: 'From Centredale to Fruit Hill, North Providence homeowners choose our low-pressure house washing and non-toxic roof cleaning.' },
  { name: 'Coventry', slug: 'coventry-ri', description: 'Coventry\'s rural and suburban homes stay cleaner longer with our soft washing and roof treatments in Anthony, Washington, and Greene villages.' },
  { name: 'West Warwick', slug: 'west-warwick-ri', description: 'West Warwick properties get one-day transformations with our house washing, roof cleaning, and concrete services.' },
  { name: 'East Greenwich', slug: 'east-greenwich-ri', description: 'Upscale East Greenwich homes deserve premium cleaning. Our soft washing protects high-end siding and shingles while removing coastal algae.' },
  { name: 'North Kingstown', slug: 'north-kingstown-ri', description: 'From Wickford Village to Quonset, North Kingstown gets expert soft washing and roof cleaning that extends shingle life.' },
  { name: 'South Kingstown', slug: 'south-kingstown-ri', description: 'Wakefield, Peace Dale, and Kingston residents trust J&M for beach-area exterior cleaning and roof treatments.' },
  { name: 'Narragansett', slug: 'narragansett-ri', description: 'Narragansett\'s coastal homes face tough salt and sand buildup. Our gentle soft washing and roof cleaning keep beach houses looking fresh.' },
  { name: 'Newport', slug: 'newport-ri', description: 'Newport\'s mansions and historic homes require careful cleaning. We use ultra-low pressure to protect delicate surfaces while removing years of grime.' },
  { name: 'Bristol', slug: 'bristol-ri', description: 'Soft washing for Bristol\'s colonial homes, roof cleaning, and concrete services along the waterfront and Hope Street area.' },
  { name: 'Warren', slug: 'warren-ri', description: 'Warren\'s waterfront properties stay pristine with our soft washing and roof treatments throughout historic Warren.' },
  { name: 'Woonsocket', slug: 'woonsocket-ri', description: 'Northern RI\'s harsh winters leave black streaks everywhere. J&M brings Woonsocket homes back to life with roof cleaning and house washing.' },
  { name: 'Cumberland', slug: 'cumberland-ri', description: 'Diamond Hill to Cumberland Hill — we soft wash and restore properties across Cumberland and Valley Falls with roof cleaning and deck services.' },
  { name: 'Lincoln', slug: 'lincoln-ri', description: 'Lincoln\'s Limerock and Manville areas get fast, professional exterior cleaning with same-day availability.' },
  { name: 'Smithfield', slug: 'smithfield-ri', description: 'Greenville, Esmond, and Georgiaville trust our gentle cleaning methods. Roof cleaning that prevents ice dam damage.' },
  { name: 'North Smithfield', slug: 'north-smithfield-ri', description: 'Soft washing for cedar and vinyl homes in North Smithfield with comprehensive roof cleaning services.' },
  { name: 'Attleboro', slug: 'attleboro-ma', description: 'Just over the line, Attleboro residents get Massachusetts-licensed soft washing, roof cleaning, and holiday light installation.' },
  { name: 'North Attleboro', slug: 'north-attleboro-ma', description: 'Professional soft washing and roof cleaning services for North Attleboro homes that handle New England winters.' },
  { name: 'South Attleboro', slug: 'south-attleboro-ma', description: 'Hebronville, Dodgeville, and the Newport Avenue corridor get low-pressure soft washing that lifts algae without soaking the siding.' },
  { name: 'Seekonk', slug: 'seekonk-ma', description: 'Eastern MA towns love our cross-state service. Soft washing, roof treatments, and concrete cleaning in Seekonk center.' },
  { name: 'Rehoboth', slug: 'rehoboth-ma', description: 'Expert soft washing and roof treatments for Rehoboth\'s historic districts and residential areas.' },
  { name: 'Swansea', slug: 'swansea-ma', description: 'Professional power washing and roof cleaning services throughout all of Swansea, MA.' },
  { name: 'Franklin', slug: 'franklin-ma', description: 'Franklin homeowners enjoy our safe house washing and stunning holiday light displays with Massachusetts licensing.' },
  { name: 'Mansfield', slug: 'mansfield-ma', description: 'Mansfield properties stay cleaner longer with our low-pressure system. We remove winter road salt and algae.' },
  { name: 'Foxboro', slug: 'foxboro-ma', description: 'From Gillette Stadium area, we provide expert soft washing and roof cleaning for homes and commercial properties.' },
  { name: 'Barrington', slug: 'barrington-ri', description: 'Barrington\'s waterfront and upscale neighborhoods get premium soft washing and roof cleaning services.' },
  { name: 'Central Falls', slug: 'central-falls-ri', description: 'Central Falls properties receive expert house washing and roof cleaning at affordable rates with same-day service.' },
  { name: 'Burrillville', slug: 'burrillville-ri', description: 'Burrillville\'s rural homes and lake properties get professional soft washing and comprehensive roof treatments.' },
  { name: 'Foster', slug: 'foster-ri', description: 'Foster\'s country homes benefit from our gentle soft washing and specialized roof cleaning services.' },
  { name: 'Glocester', slug: 'glocester-ri', description: 'Glocester properties stay pristine with our professional house washing and roof cleaning services.' },
  { name: 'Scituate', slug: 'scituate-ri', description: 'Scituate homes near the reservoir get expert soft washing and roof treatments year-round.' },
  { name: 'Tiverton', slug: 'tiverton-ri', description: 'Tiverton\'s coastal properties receive salt-resistant soft washing and comprehensive roof cleaning.' },
  { name: 'West Greenwich', slug: 'west-greenwich-ri', description: 'West Greenwich homes get professional soft washing and roof cleaning with fast, reliable service.' },
  { name: 'Bellingham', slug: 'bellingham-ma', description: 'Bellingham, MA residents enjoy professional soft washing and roof cleaning across all neighborhoods.' },
  { name: 'Blackstone', slug: 'blackstone-ma', description: 'Blackstone properties get expert house washing and roof treatments along the Blackstone River valley.' },
  { name: 'Douglas', slug: 'douglas-ma', description: 'Douglas homes receive professional soft washing and comprehensive roof cleaning services.' },
  { name: 'Grafton', slug: 'grafton-ma', description: 'Grafton properties benefit from our gentle soft washing system and expert roof treatments.' },
  { name: 'Millbury', slug: 'millbury-ma', description: 'Millbury homes get professional house washing and roof cleaning with Massachusetts licensing.' },
  { name: 'Millville', slug: 'millville-ma', description: 'Millville properties receive expert soft washing and roof cleaning at competitive rates.' },
  { name: 'Northbridge', slug: 'northbridge-ma', description: 'Northbridge homes benefit from our professional soft washing and specialized roof treatments.' },
  { name: 'Norton', slug: 'norton-ma', description: 'Norton properties get expert house washing and comprehensive roof cleaning services.' },
  { name: 'Plainville', slug: 'plainville-ma', description: 'Plainville homes receive professional soft washing and roof cleaning near the RI border.' },
  { name: 'Shrewsbury', slug: 'shrewsbury-ma', description: 'Shrewsbury properties benefit from our expert soft washing and comprehensive roof treatments.' },
  { name: 'Sutton', slug: 'sutton-ma', description: 'Sutton homes get professional house washing and roof cleaning throughout all neighborhoods.' },
  { name: 'Uxbridge', slug: 'uxbridge-ma', description: 'Uxbridge properties receive expert soft washing and roof treatments in this historic mill town.' },
  { name: 'Wrentham', slug: 'wrentham-ma', description: 'Wrentham homes near the outlets get professional soft washing and comprehensive roof cleaning.' },
];

export default function TownsPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    updatePageMeta({
      title: 'Power Washing & Roof Cleaning in Rhode Island & Massachusetts – J&M',
      description: 'Professional house washing, roof cleaning, deck restoration & holiday lights in Providence, Warwick, Cranston, Attleboro & all of RI/MA. Free estimates – call (401) 595-0726!',
      keywords: 'power washing Rhode Island, roof cleaning Massachusetts, house washing RI MA, deck restoration, holiday lights installation, Providence, Warwick, Cranston, Attleboro',
      canonical: 'https://powerwashjm.com/towns/'
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative text-white py-24 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900" style={getNavOffsetWithBreadcrumb()}>
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url(/Town%20Page%20Hero%20Images/image.png)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/50 to-slate-900/60"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 shadow-2xl border border-white/20">
              <MapPin className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
            Power Washing and Holiday Lighting Service Areas in Rhode Island and Massachusetts
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto drop-shadow-lg">
            Professional power washing and holiday light installation services across Rhode Island and Massachusetts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse Our Service Areas by State</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/towns/rhode-island/" className="block border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Power Washing in Rhode Island</h3>
              <p className="text-gray-700">Every Rhode Island community we cover, grouped by county.</p>
            </Link>
            <Link to="/towns/massachusetts/" className="block border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Power Washing in Massachusetts</h3>
              <p className="text-gray-700">The Massachusetts towns our crews actually service.</p>
            </Link>
            <Link to="/holiday-lights/rhode-island/" className="block border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Christmas Light Installation in Rhode Island</h3>
              <p className="text-gray-700">Statewide holiday lighting coverage, town by town.</p>
            </Link>
            <Link to="/holiday-lights/massachusetts/" className="block border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Christmas Light Installation in Massachusetts</h3>
              <p className="text-gray-700">The Massachusetts towns we light each season.</p>
            </Link>
          </div>
        </section>

        <section className="mb-16 bg-blue-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose a Local Expert?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            The New England climate can be tough on your home's exterior. Humidity and shade often lead to rapid organic growth like mold, mildew, and lichen. Unlike national chains, J & M Power Washing lives and works in your community. We know exactly how to treat the vinyl siding, cedar shingles, and asphalt roofs found throughout Rhode Island and Southeastern Massachusetts safely and effectively.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Proudly Serving All of Rhode Island & Southeastern Massachusetts</h2>
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            J&M Power Washing provides professional soft washing, roof cleaning, house washing, deck restoration, concrete cleaning, and holiday light installation across Rhode Island and southeastern Massachusetts. Fully licensed, insured, and locally owned with same-day and weekend service available.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {townDescriptions.map((town) => (
              <Link
                key={town.slug}
                to={`/towns/${town.slug}/`}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Exterior Cleaning Services in {town.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                        Soft Washing
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                        Roof Cleaning
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                        Deck Restoration
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 ml-3" />
                </div>
                <p className="text-gray-700 leading-relaxed line-clamp-3 mt-3">
                  {town.description}
                </p>
                <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
                  View all services in {town.name} →
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">And Many More Communities!</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We proudly serve every corner of Rhode Island and southeastern Massachusetts including Plainville, Wrentham, Norfolk, and surrounding communities. If you're in RI or southeastern MA and need professional power washing, roof cleaning, or holiday lights — we've got you covered!
            </p>
            <p className="text-gray-700 leading-relaxed">
              Can't find your town listed? We likely serve your area! Contact us to confirm service availability.
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white">
            <p className="text-xl font-semibold mb-4">Ready for a cleaner exterior?</p>
            <p className="text-lg mb-6">
              Call J&M Power Washing at <a href="tel:+14015950726" className="font-bold underline hover:text-blue-100">(401) 595-0726</a> or request your free quote online. Same-day and weekend appointments available throughout Rhode Island and Massachusetts!
            </p>
            <Link
              to="/get-quote/"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Your Free Quote
            </Link>
          </div>
        </section>

        {/* Services Cross-Links */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Services Available in Every Town</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'House Washing', path: '/house-washing/', desc: 'Gentle soft wash for all siding types' },
              { name: 'Roof Cleaning', path: '/roof-cleaning/', desc: 'Safe removal of black streaks & algae' },
              { name: 'Deck Cleaning', path: '/deck-cleaning/', desc: 'Restore weathered wood & composite' },
              { name: 'Gutter Cleaning', path: '/gutter-cleaning/', desc: 'Interior cleanout & exterior brightening' },
              { name: 'Concrete Cleaning', path: '/concrete-cleaning/', desc: 'Driveways, patios & walkways' },
              { name: 'Holiday Lights', path: '/holiday-lights/', desc: 'Professional Christmas light installation' },
              { name: 'Commercial', path: '/commercial/', desc: 'Business & property management cleaning' },
              { name: 'HOA & Condo', path: '/hoa-condo-cleaning/', desc: 'Multi-unit community cleaning' },
            ].map(service => (
              <Link
                key={service.path}
                to={service.path}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Don't See Your Town?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We may still be able to serve your area! Contact us to discuss your power washing or holiday light installation needs.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get a Free Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
