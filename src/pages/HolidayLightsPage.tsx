import React, { useEffect, useState } from 'react';
import { Check, Lightbulb, ChevronRight, Star, Wrench, Shield, Package, MapPin, Phone, Mail, ArrowUp, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import HolidayLightsQuoteForm from '../components/HolidayLightsQuoteForm';
import ServiceArea from '../components/ServiceArea';
import ProjectGallery from '../components/ProjectGallery';
import ReviewBanner from '../components/ReviewBanner';
import { updatePageMeta, addMultipleStructuredData, businessStructuredData } from '../utils/seo';
import { HERO_IMAGES } from '../config/images';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-5 bg-white border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HolidayLightsPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const HOLIDAY_LIGHTS_FAQS = [
    {
      question: 'How much does Christmas light installation cost in Rhode Island & Massachusetts?',
      answer: 'Most residential installations range from $500 to $2,500 depending on home size, roofline complexity, and design scope. We provide free on-site estimates so you know the exact cost before we begin. All lights, materials, and labor are included in the price.'
    },
    {
      question: 'Do you provide the lights or do I need to buy my own?',
      answer: 'We provide all lights, materials, and hardware as part of our full-service package. We use commercial-grade LED lights rated for 50,000+ hours that are brighter, more energy-efficient, and more durable than retail options. After the season, we store everything for reuse next year.'
    },
    {
      question: 'When should I book my holiday light installation?',
      answer: 'We recommend booking by early October to secure your preferred installation date. Our schedule fills up fast beginning in September. Early bookers get first choice of scheduling and can have lights installed as early as late October.'
    },
    {
      question: 'What areas do you serve for holiday light installation?',
      answer: 'We serve all of Rhode Island and southern Massachusetts, including Warwick, Cranston, Providence, Pawtucket, Smithfield, North Smithfield, Lincoln, Cumberland, Coventry, Bristol, Barrington, East Greenwich, and many more towns.'
    },
    {
      question: 'What happens if lights stop working during the season?',
      answer: 'We offer season-long maintenance at no extra charge. If any bulb burns out, a strand fails, or weather damages your display, call us and we will repair it -- typically within 24-48 hours. Our maintenance guarantee covers Thanksgiving through mid-January.'
    },
    {
      question: 'Do you install holiday lights on commercial properties?',
      answer: 'Yes! We serve both residential and commercial properties including storefronts, restaurants, office buildings, shopping centers, and HOA communities. Commercial installations include timer and automation setup, and we coordinate with property managers for multi-tenant buildings.'
    },
  ];

  useEffect(() => {
    updatePageMeta({
      title: 'Christmas Light Installation in RI & MA | J&M Holiday Lights',
      description: 'Professional Christmas light installation in Rhode Island & MA. Full-service design, setup, maintenance, takedown & storage. Commercial-grade LEDs, fully insured.',
      keywords: 'holiday lights installation, Christmas light installation, professional holiday lighting, exterior holiday decorating, commercial holiday lights, residential Christmas lights, North Smithfield RI, Providence RI, Warwick RI, Cranston RI, Pawtucket RI, Woonsocket RI, Smithfield RI, Lincoln RI, Cumberland RI, Attleboro MA, Franklin MA, Mansfield MA',
      ogTitle: 'Professional Holiday Light Installation RI & MA | Full Service | J&M',
      ogDescription: 'Make your home shine this holiday season! Professional installation, maintenance, takedown & storage. Serving RI & MA with beautiful, hassle-free holiday lighting.',
    });

    addMultipleStructuredData([
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Holiday Light Installation',
        name: 'Holiday Light Installation',
        description: 'All-inclusive professional Christmas light installation with design, installation, maintenance, removal, and storage services',
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
          { '@type': 'State', name: 'Rhode Island' },
          { '@type': 'State', name: 'Massachusetts' },
        ],
        url: 'https://powerwashjm.com/holiday-lights/',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: HOLIDAY_LIGHTS_FAQS.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ]);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-8 pb-20 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: `url(${HERO_IMAGES.holidayLights})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-red-900/70 to-green-800/70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wider">Professional Service</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Christmas Light Installation in RI & MA</h1>
            <p className="text-xl text-green-100 mb-8">
              All-inclusive professional holiday light installation serving Rhode Island and Massachusetts. From custom design to storage, we handle everything so you can focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <div className="flex flex-col">
                <button
                  onClick={scrollToQuote}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-900 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-lg mb-3 whitespace-nowrap"
                  aria-label="Scroll to quote form"
                >
                  Get a Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <div className="text-center">
                  <Link to="/financing/" className="text-green-100 text-sm underline hover:text-white transition-colors hover:bg-white/10 px-2 py-1 rounded">
                    We Offer Financing
                  </Link>
                </div>
              </div>
              <a href="tel:+14015950726" className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-900 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg whitespace-nowrap h-fit">
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
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">The J&M Difference</h2>
            <p className="text-xl text-gray-600">Why Choose Us for Your Holiday Lighting?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-green-100 hover:border-green-300 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Satisfaction Guarantee</h3>
              <p className="text-gray-600">Your happiness is our priority. We stand behind every installation with our complete satisfaction guarantee.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-red-100 hover:border-red-300 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-red-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Licensed & Insured</h3>
              <p className="text-gray-600">Professional service you can trust. Fully licensed and insured for your peace of mind.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-green-100 hover:border-green-300 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">5-Star Professional Service</h3>
              <p className="text-gray-600">Award-winning service with meticulous attention to detail and exceptional customer care.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-red-100 hover:border-red-300 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-red-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hassle-Free Process</h3>
              <p className="text-gray-600">From design to storage, we handle every detail so you can enjoy the holidays stress-free.</p>
            </div>
          </div>

        </div>
      </section>

      <section
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/beachhouse.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">Our 5-Step All-Inclusive Process</h2>
            <p className="text-xl text-green-100 drop-shadow-md">From consultation to storage, we've got you covered</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Design & Quote</h3>
              <p className="text-gray-600 leading-relaxed">Custom lighting consultation with multiple design options and price points tailored to your vision and budget. No obligation.</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-6 border-2 border-red-200">
              <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lights Provided</h3>
              <p className="text-gray-600 leading-relaxed">We supply all commercial-grade LED lights and equipment. No more untangling old lights or buying expensive decorations.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Installation</h3>
              <p className="text-gray-600 leading-relaxed">Safe, expert installation using gutter and soffit clips. No property damage. We can work while you're away.</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-lg p-6 border-2 border-red-200">
              <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Maintenance & Warranty</h3>
              <p className="text-gray-600 leading-relaxed">Free maintenance and bulb replacement throughout the season. If anything goes wrong, we fix it at no extra charge.</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">5</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Removal & Storage</h3>
              <p className="text-gray-600 leading-relaxed">Complete post-season removal and secure storage of all equipment. Your lights are ready for next year, hassle-free.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={scrollToQuote}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-900 rounded-lg font-semibold text-xl hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-xl"
              aria-label="Scroll to quote form"
            >
              Get Your Free Quote Now
              <ChevronRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-900 via-green-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Services Offered</h2>
            <p className="text-xl text-green-100">Professional lighting for homes and businesses</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30">
              <h3 className="text-3xl font-bold mb-6 flex items-center">
                <Lightbulb className="w-8 h-8 mr-3" />
                Residential Lighting
              </h3>
              <p className="text-lg text-green-100 mb-6 leading-relaxed">
                Transform your home into a holiday masterpiece. From elegant roofline displays to full-property designs with trees, bushes, and pathways—we create stunning displays that capture the magic of the season.
              </p>
              <ul className="space-y-3">
                {[
                  'Roofline and gutter lighting',
                  'Window and door frame accents',
                  'Tree and landscape wrapping',
                  'Pathway and driveway lighting',
                  'Custom color schemes',
                  'Animated and programmable displays'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                    <span className="text-lg text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30">
              <h3 className="text-3xl font-bold mb-6 flex items-center">
                <Star className="w-8 h-8 mr-3" />
                Commercial Lighting
              </h3>
              <p className="text-lg text-green-100 mb-6 leading-relaxed">
                Make your business stand out this holiday season. Professional commercial lighting that attracts customers, creates ambiance, and showcases your brand during the most festive time of year.
              </p>
              <ul className="space-y-3">
                {[
                  'Storefront and building facades',
                  'Parking lot and landscape lighting',
                  'Signage and logo illumination',
                  'Restaurant and retail displays',
                  'Office complexes and properties',
                  'Large-scale commercial installations'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                    <span className="text-lg text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <ReviewBanner />

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Holiday Light Installation FAQ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our professional holiday lighting services in Rhode Island and Massachusetts.
            </p>
          </div>
          <div className="space-y-4">
            {HOLIDAY_LIGHTS_FAQS.map((faq, index) => (
              <FAQAccordionItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-900 via-red-900 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
        }}></div>
        <div className="max-w-7xl mx-auto text-center relative z-10 mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Transform Your Home This Holiday Season</h2>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-4">
            Don't wait until it's too late! Our calendar fills up fast during the holiday season.
          </p>
          <p className="text-2xl font-bold text-white mb-2">
            🎄 Book Now for the 2026 Holiday Season 🎄
          </p>
          <p className="text-lg text-green-200">
            Limited slots available - Reserve your spot today!
          </p>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <HolidayLightsQuoteForm submitEmail="sales@powerwashjm.com" pageSource="Holiday Lights Page" />
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-green-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-green-200">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Secure Your Spot for 2026
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                It may feel early, but the 2026 calendar is already filling up! Booking now ensures you get your preferred installation date and locked-in pricing. This is the perfect time to add to your display or change up your design for next year.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Flexible Payment Options to Fit Your Budget
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-green-300">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-800 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Monthly Payment Plan</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Pay 10% a month from January through October.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 italic">
                      Spread out payments over 10 months for easier budgeting
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-red-300">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-800 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">50/50 Plan</h4>
                      <p className="text-gray-700 leading-relaxed">
                        A 50% deposit now and the remainder at the time of installation.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 italic">
                      Split your payment into two easy installments
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={scrollToQuote}
                className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-green-700 to-red-700 text-white rounded-lg font-bold text-xl hover:from-green-800 hover:to-red-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
                aria-label="Scroll to quote form"
              >
                Book Your 2026 Installation Now
                <ChevronRight className="w-6 h-6 ml-2" />
              </button>
              <p className="mt-4 text-gray-600 text-sm">
                Don't miss out - Reserve your preferred dates today!
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProjectGallery />

      {/* Holiday Lights Town Pages - SEO internal linking */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Holiday Lighting by State</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/holiday-lights/rhode-island/" className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Christmas Light Installation in Rhode Island</h3>
              <p className="text-gray-700">See every Rhode Island community we light, grouped by county.</p>
            </Link>
            <Link to="/holiday-lights/massachusetts/" className="block bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-500 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Christmas Light Installation in Massachusetts</h3>
              <p className="text-gray-700">See the Massachusetts towns we light each season.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 text-center">
            Holiday Light Installation by Town
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            We provide professional Christmas light installation throughout Rhode Island. Find pricing and details for your town below.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { name: 'Warwick', slug: 'warwick-ri' },
              { name: 'Cranston', slug: 'cranston-ri' },
              { name: 'Providence', slug: 'providence-ri' },
              { name: 'Pawtucket', slug: 'pawtucket-ri' },
              { name: 'Woonsocket', slug: 'woonsocket-ri' },
              { name: 'North Smithfield', slug: 'north-smithfield-ri' },
              { name: 'Cumberland', slug: 'cumberland-ri' },
              { name: 'Lincoln', slug: 'lincoln-ri' },
              { name: 'Smithfield', slug: 'smithfield-ri' },
              { name: 'East Providence', slug: 'east-providence-ri' },
              { name: 'Johnston', slug: 'johnston-ri' },
              { name: 'North Providence', slug: 'north-providence-ri' },
              { name: 'Coventry', slug: 'coventry-ri' },
              { name: 'West Warwick', slug: 'west-warwick-ri' },
              { name: 'Bristol', slug: 'bristol-ri' },
              { name: 'Barrington', slug: 'barrington-ri' },
              { name: 'East Greenwich', slug: 'east-greenwich-ri' },
              { name: 'Tiverton', slug: 'tiverton-ri' },
              { name: 'North Kingstown', slug: 'north-kingstown-ri' },
              { name: 'Scituate', slug: 'scituate-ri' },
              { name: 'Glocester', slug: 'glocester-ri' },
              { name: 'West Greenwich', slug: 'west-greenwich-ri' },
              { name: 'Foster', slug: 'foster-ri' },
              { name: 'Burrillville', slug: 'burrillville-ri' },
              { name: 'Central Falls', slug: 'central-falls-ri' },
              { name: 'Bellingham', slug: 'bellingham-ma' },
              { name: 'Blackstone', slug: 'blackstone-ma' },
              { name: 'Douglas', slug: 'douglas-ma' },
              { name: 'Seekonk', slug: 'seekonk-ma' },
              { name: 'South Attleboro', slug: 'south-attleboro-ma' },
              { name: 'Uxbridge', slug: 'uxbridge-ma' },
              { name: 'Wrentham', slug: 'wrentham-ma' },
            ].map(town => (
              <Link
                key={town.slug}
                to={`/holiday-lights/${town.slug}/`}
                className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-all text-center"
              >
                {town.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServiceArea />

    </div>
  );
}
