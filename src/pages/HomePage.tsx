import { Check, Star, Droplets, Lightbulb, Home, Wind, Trash2, Car, Fence, Building2, ChevronRight, Sparkles, Briefcase, ChevronUp, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QuoteForm from '../components/QuoteForm';
import ReviewBanner from '../components/ReviewBanner';
import ServiceArea from '../components/ServiceArea';
import FooterHomepage from '../components/FooterHomepage';
import TrustBadges from '../components/TrustBadges';
import { updatePageMeta, addStructuredData, businessStructuredData } from '../utils/seo';
import { LOGOS, HERO_IMAGES, SERVICE_IMAGES, SEASON_CARDS } from '../config/images';
import { HERO_ALT_TEXT, SERVICE_ALT_TEXT, SEASON_CARD_ALT_TEXT } from '../config/imageAltText';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { supabase } from '../lib/supabase';
import { serviceShowcaseService, ServiceShowcaseCard } from '../services/serviceShowcaseService';

interface SeasonalCard {
  id: string;
  card_position: 'left' | 'right';
  title: string;
  subtitle: string;
  description: string;
  link_url: string;
  image_url: string;
  bullet_point_1: string;
  bullet_point_2: string;
  bullet_point_3: string;
  is_active: boolean;
  border_color: string;
  gradient_from: string;
  gradient_to: string;
}

export default function HomePage() {
  const { getNavOffset } = useBannerVisibility();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [seasonalCards, setSeasonalCards] = useState<SeasonalCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [showcaseCards, setShowcaseCards] = useState<ServiceShowcaseCard[]>([]);
  const [showcaseLoading, setShowcaseLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    updatePageMeta({
      title: 'J&M Power Washing & Holiday Lights | Rhode Island & Massachusetts',
      description: 'J&M Power Washing offers professional soft washing, roof cleaning, deck restoration, and holiday light installation in Rhode Island & Massachusetts. Free estimates – call (401) 595-0726!',
      keywords: 'power washing RI, pressure washing Rhode Island, house washing Providence, roof cleaning MA, deck cleaning, holiday lights installation, Christmas lights RI, soft washing, gutter cleaning, concrete cleaning, North Smithfield RI, Providence RI, Warwick RI, Cranston RI, Attleboro MA, Franklin MA, Mansfield MA',
      ogTitle: 'J&M Power Washing & Holiday Lights | Rhode Island & Massachusetts',
      ogDescription: 'J&M Power Washing offers professional soft washing, roof cleaning, and holiday lights in RI & MA. Licensed & insured. Free estimates!',
    });
  }, []);

  useEffect(() => {
    fetchSeasonalCards();
    fetchShowcaseCards();
  }, []);

  const fetchSeasonalCards = async () => {
    try {
      const { data, error } = await supabase
        .from('seasonal_cards')
        .select('*')
        .eq('is_active', true)
        .order('card_position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSeasonalCards(data);
      }
    } catch (error) {
      console.error('Error fetching seasonal cards:', error);
    } finally {
      setCardsLoading(false);
    }
  };

  const fetchShowcaseCards = async () => {
    try {
      const cards = await serviceShowcaseService.getRotatedCards(6);
      setShowcaseCards(cards);
    } catch (error) {
      console.error('Error fetching showcase cards:', error);
    } finally {
      setShowcaseLoading(false);
    }
  };

  return (
    <div>
      <section
        className="relative z-0 px-4 sm:px-6 lg:px-8 parallax-bg"
        style={{
          backgroundImage: `image-set(url('/homepagehouse-lg.webp') type('image/webp'), url('/homepagehouse-lg.jpg') type('image/jpeg'))`,
          ...getNavOffset()
        }}
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 bg-white/75" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto relative z-10 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">
            <div>
              <h1 id="hero-heading" className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-blue-900 leading-snug sm:leading-tight mb-4 sm:mb-5">
                Rhode Island &amp; Massachusetts Power Washing — Soft Wash Done Right
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                Family-owned soft-wash specialists serving RI and southern MA. We remove algae, salt, mold, and years of grime from siding, decks, and walkways — most homes finished in a single visit.
              </p>
              <nav className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 pb-8 sm:pb-0 items-start" aria-label="Primary call-to-action buttons">
                <div className="flex flex-col w-full sm:w-auto">
                  <a
                    href="#quote"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-900 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-800 transition-all sm:hover:scale-105 shadow-lg mb-3 whitespace-nowrap"
                    aria-label="Get a free estimate for power washing services"
                  >
                    Get a Free Estimate
                    <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </a>
                  <div className="text-center">
                    <Link to="/financing/" className="text-gray-700 text-base underline hover:text-blue-900 transition-colors py-2 px-1" aria-label="Learn about our financing options">
                      We Offer Financing
                    </Link>
                  </div>
                </div>
                <a href="tel:+14015950726" className="static inline-flex shrink-0 items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-900 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-800 transition-all sm:hover:scale-105 shadow-lg whitespace-nowrap w-full sm:w-fit" aria-label="Call us at 401-595-0726">
                  Call (401) 595-0726
                </a>
              </nav>

              <ul className="hidden sm:flex flex-wrap gap-x-4 gap-y-3 sm:gap-5 text-sm sm:text-base" aria-label="Company benefits and features">
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <span className="text-gray-700"><strong>Family Owned</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <span className="text-gray-700"><strong>Fully Insured</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <span className="text-gray-700">Most Jobs Done in <strong>One Day</strong></span>
                </li>
              </ul>
            </div>
            <div className="relative flex flex-col gap-5 mt-8 lg:mt-0">
              <TrustBadges className="" variant="horizontal" />

              <figure className="rounded-2xl shadow-2xl overflow-hidden">
                <picture>
                  <source
                    srcSet="/homepagehouse-sm.webp 640w, /homepagehouse-md.webp 1024w, /homepagehouse-lg.webp 1400w"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 622px"
                    type="image/webp"
                  />
                  <source
                    srcSet="/homepagehouse-sm.jpg 640w, /homepagehouse-md.jpg 1024w, /homepagehouse-lg.jpg 1400w"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 622px"
                    type="image/jpeg"
                  />
                  <img
                    src="/homepagehouse-md.jpg"
                    alt={HERO_ALT_TEXT.homeRightSide}
                    className="w-full object-cover max-h-[460px]"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    width={622}
                    height={460}
                  />
                </picture>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-4">
            Ready for Every Season
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            {seasonalCards[0]?.subtitle || 'Power Washing & Holiday Lights'}
          </p>

          {cardsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : seasonalCards.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {seasonalCards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-gradient-to-br ${card.gradient_from} ${card.gradient_to} rounded-2xl shadow-lg overflow-hidden border ${card.border_color} hover:shadow-xl transition-shadow`}
                >
                  <Link to={card.link_url} className="block aspect-[4/3] overflow-hidden">
                    {card.image_url?.includes('beforeafterhousewashnologo') ? (
                      <picture>
                        <source
                          type="image/webp"
                          srcSet="/images/beforeafterhousewashnologo-800.webp 800w, /images/beforeafterhousewashnologo.webp 1600w"
                          sizes="(max-width: 768px) 100vw, 622px"
                        />
                        <img
                          src="/images/beforeafterhousewashnologo.png"
                          alt="Power Washing services"
                          width={1244}
                          height={934}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </picture>
                    ) : (
                      <img
                        src={card.image_url}
                        alt={`${card.title} — exterior cleaning service in Rhode Island`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </Link>
                  <div className="p-8">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {card.description}
                    </p>
                    <ul className="space-y-3">
                      {card.bullet_point_1 && (
                        <li className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{card.bullet_point_1}</span>
                        </li>
                      )}
                      {card.bullet_point_2 && (
                        <li className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{card.bullet_point_2}</span>
                        </li>
                      )}
                      {card.bullet_point_3 && (
                        <li className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{card.bullet_point_3}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-shadow">
                <Link to="/house-washing/" className="block aspect-[4/3] overflow-hidden">
                  <img
                    src={SEASON_CARDS.powerWashing}
                    alt={SEASON_CARD_ALT_TEXT.powerWashing}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We remove green algae, black streaks, and mildew from vinyl, cedar, and composite siding using a low-pressure soft-wash system — no damage to paint, seals, or landscaping. Most single-family homes are finished in 3–5 hours.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Vinyl & Cedar Siding Cleaning</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Wood Restoration & Staining</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Can increase home value up to 10%</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg overflow-hidden border border-red-100 hover:shadow-xl transition-shadow">
                <Link to="/holiday-lights/" className="block aspect-[4/3] overflow-hidden">
                  <img
                    src={SEASON_CARDS.holidayLights}
                    alt={SEASON_CARD_ALT_TEXT.holidayLights}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Winter road salt and sand accelerate siding fading and gutter corrosion. We neutralize and rinse salt residue, clear organic buildup, and get your exterior ready before pollen and UV season sets in.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Full-service design and installation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Professional removal and storage</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Commercial-grade lighting options</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-4">
            Our Professional Services
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">Expert solutions for residential and commercial properties</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Home, color: 'text-blue-600', title: 'House Washing', desc: 'Exterior soft wash for vinyl and cedar siding, removing algae and mildew', path: '/house-washing/' },
              { icon: Building2, color: 'text-green-600', title: 'Roof Cleaning', desc: 'Soft-wash algae and moss removal to extend roof life and prevent shingle damage', path: '/roof-cleaning/' },
              { icon: Droplets, color: 'text-cyan-600', title: 'Concrete Cleaning', desc: 'Driveway, sidewalk, and parking lot pressure washing', path: '/concrete-cleaning/' },
              { icon: Wind, color: 'text-amber-700', title: 'Deck Cleaning', desc: 'Deck cleaning, wood restoration, staining, and sealing', path: '/deck-cleaning/' },
              { icon: Droplets, color: 'text-slate-700', title: 'Gutter Cleaning', desc: 'Complete interior and exterior gutter cleaning and debris removal', path: '/gutter-cleaning/' },
              { icon: Building, color: 'text-purple-600', title: 'HOA & Condo Cleaning', desc: 'Building washes, walkways, and common-area cleaning for associations and multi-family properties across RI and southern MA', path: '/hoa-condo-cleaning/' },
              { icon: Briefcase, color: 'text-indigo-600', title: 'Commercial Services', desc: 'Bank drive-thrus, gas stations, storefronts, and fleet vehicles. Scheduled after hours so we don\'t disrupt your customers.', path: '/commercial/' },
              { icon: Sparkles, color: 'text-yellow-500', title: 'Holiday Lights', desc: 'Design, installation, maintenance, and takedown. Commercial-grade LEDs, fully insured crew, off-season storage included.', path: '/holiday-lights/' }
            ].map((service, index) => (
              <Link key={index} to={service.path} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow flex flex-col items-center">
                <div className="mb-6">
                  <service.icon className={`w-16 h-16 ${service.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{service.desc}</p>
                <span className="text-blue-600 font-semibold hover:underline">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-4">
            See the Difference
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">Real results from real customers</p>

          {showcaseLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseCards.map((card) => (
                <Link key={card.id} to={card.service_slug} className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all block">
                  <div className="aspect-[3/2] relative overflow-hidden">
                    <img
                      src={card.image_url}
                      alt={`${card.service_name} results in Rhode Island`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold inline-block">
                        {card.service_name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <ReviewBanner />

      <ServiceArea />

      <QuoteForm />

      <FooterHomepage />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 lg:bottom-[252px] lg:right-8 bg-blue-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
