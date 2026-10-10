import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Shield, Clock, Phone, Mail, MapPin, Award, TrendingUp, Users, ThumbsUp } from 'lucide-react';
import QuoteForm from '../components/QuoteForm';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import Footer from '../components/Footer';
import InstantQuoteChoicePoint from '../components/InstantQuoteChoicePoint';
import { updatePageMeta, addStructuredData } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function GetQuotePage() {
  const [scrolled, setScrolled] = useState(false);
  const { bannerVisible, getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    updatePageMeta({
      title: 'Get Your Free Quote | Professional Power Washing Services in RI & MA',
      description: 'Request a free quote for professional power washing services. Licensed & insured. Fast response within 24 hours. House washing, roof cleaning, deck restoration & more. Serving Rhode Island & Massachusetts.',
      keywords: 'free power washing quote, pressure washing estimate, house washing price, roof cleaning quote, deck cleaning estimate, free estimate RI MA, power washing cost, professional cleaning quote',
      ogTitle: 'Get Your Free Power Washing Quote Today | J&M Power Washing',
      ogDescription: 'Fast, free quotes for all power washing services. Licensed & insured with 100% satisfaction guarantee. Serving RI & MA.',
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Get Your Free Quote',
      description: 'Request a free quote for professional power washing services',
      url: 'https://powerwashjm.com/get-quote/',
      mainEntity: {
        '@type': 'Service',
        name: 'Power Washing Quote Request',
        provider: {
          '@type': 'LocalBusiness',
          name: 'J&M Power Washing',
          telephone: '+1-+1-401-595-0726',
          email: 'Sales@powerwashjm.com',
        },
      },
    };
    addStructuredData(structuredData);

    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Breadcrumbs />

      <main>
        {/* Hero Section */}
        <section className="relative pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden" style={getNavOffsetWithBreadcrumb()}>
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: 'url(/housewashbeforeandafter.png)',
              backgroundPosition: 'center center',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/70 to-blue-900/80"></div>

          <div className="relative max-w-7xl mx-auto">
            <div className="text-center text-white mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
                Get Your Free Quote Today
              </h1>
              <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed drop-shadow-md mb-8">
                Professional power washing services for your home or business. Free estimates, fast response, and guaranteed satisfaction.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Free Estimates</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">24-Hour Response</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Licensed & Insured</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="#quote-form"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                >
                  Request Your Free Quote
                </a>
                <a
                  href="tel:+14015950726"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-xl border-2 border-white/30"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call (401) 595-0726
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-blue-900" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-blue-900 mb-2">5-Star</h3>
                <p className="text-gray-600 font-medium">Customer Reviews</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-green-700 mb-2">100%</h3>
                <p className="text-gray-600 font-medium">Satisfaction Guarantee</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-purple-700 mb-2">1000+</h3>
                <p className="text-gray-600 font-medium">Happy Customers</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-orange-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-orange-700 mb-2">24hrs</h3>
                <p className="text-gray-600 font-medium">Response Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Instant Quote Choice Point */}
        <InstantQuoteChoicePoint />

        {/* Quote Form Section */}
        <section id="quote-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <QuoteForm pageSource="dedicated-quote-page" />
              </div>

              {/* Right Column - Benefits & Trust */}
              <div className="space-y-6">
                {/* Why Choose Us */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Award className="w-7 h-7 text-blue-900" />
                    Why Choose Us?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Licensed & fully insured',
                      'Family-owned and operated',
                      'Free, no-obligation estimates',
                      'Same-day service available',
                      '100% satisfaction guarantee',
                      'Professional equipment & techniques',
                      'Eco-friendly cleaning solutions',
                      'Competitive, transparent pricing'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-900 text-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Us Directly</h3>
                  <div className="space-y-4">
                    <a href="tel:+14015950726" className="flex items-start gap-3 hover:text-blue-200 transition-colors group">
                      <Phone className="w-5 h-5 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold">Phone</div>
                        <div className="text-blue-100">(401) 595-0726</div>
                      </div>
                    </a>
                    <a href="mailto:Sales@powerwashjm.com" className="flex items-start gap-3 hover:text-blue-200 transition-colors group">
                      <Mail className="w-5 h-5 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold">Email</div>
                        <div className="text-blue-100 break-all">Sales@powerwashjm.com</div>
                      </div>
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Service Area</div>
                        <div className="text-blue-100">Rhode Island & Massachusetts</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Hours</div>
                        <div className="text-blue-100">Mon-Sat: 7am-7pm</div>
                        <div className="text-blue-100">Sun: By appointment</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Satisfaction Guarantee Badge */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border-2 border-green-200">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
                      <ThumbsUp className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      100% Satisfaction Guaranteed
                    </h3>
                    <p className="text-gray-700 text-sm">
                      We're not satisfied until you are. If you're not completely happy with our service, we'll make it right.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional power washing services for residential and commercial properties
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'House Washing',
                  description: 'Gentle soft washing to remove dirt, mold, and mildew from your home\'s exterior',
                  link: '/house-washing'
                },
                {
                  title: 'Roof Cleaning',
                  description: 'Safe removal of algae, moss, and stains to extend your roof\'s lifespan',
                  link: '/roof-cleaning'
                },
                {
                  title: 'Deck Cleaning',
                  description: 'Deep cleaning and restoration to bring your deck back to life',
                  link: '/deck-cleaning'
                },
                {
                  title: 'Concrete Cleaning',
                  description: 'High-pressure cleaning for driveways, patios, and walkways',
                  link: '/concrete-cleaning'
                },
                {
                  title: 'Gutter Cleaning',
                  description: 'Full-service interior and exterior gutter cleaning',
                  link: '/gutter-cleaning'
                },
                {
                  title: 'Commercial Services',
                  description: 'Professional cleaning solutions for business properties',
                  link: '/commercial'
                }
              ].map((service, index) => (
                <Link
                  key={index}
                  to={service.link}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl hover:scale-105 transition-all group"
                >
                  <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-blue-700">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-blue-600 font-semibold group-hover:text-blue-800 flex items-center gap-2">
                    Learn more <TrendingUp className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Service Area */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Serving Rhode Island & Massachusetts
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Proud to serve communities throughout RI and MA with professional power washing services
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link
                to="/towns/"
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-4 group-hover:text-blue-700 transition-colors">Rhode Island</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Providence</li>
                  <li>• Warwick</li>
                  <li>• Cranston</li>
                  <li>• Pawtucket</li>
                  <li>• Woonsocket</li>
                  <li>• North Smithfield</li>
                  <li>• Smithfield</li>
                  <li>• Cumberland</li>
                  <li>• Lincoln</li>
                </ul>
              </Link>

              <Link
                to="/towns/"
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-4 group-hover:text-blue-700 transition-colors">Massachusetts</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Attleboro</li>
                  <li>• Franklin</li>
                  <li>• Mansfield</li>
                  <li>• North Attleboro</li>
                  <li>• Foxborough</li>
                  <li>• Bellingham</li>
                  <li>• Wrentham</li>
                  <li>• Milford</li>
                </ul>
              </Link>

              <div className="bg-blue-900 text-white rounded-xl shadow-lg p-8 flex flex-col justify-center">
                <MapPin className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-4 text-center">Don't See Your Area?</h3>
                <p className="text-blue-100 text-center mb-6">
                  We may still be able to help! Contact us to discuss your location.
                </p>
                <a
                  href="tel:+14015950726"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-900 rounded-lg font-bold hover:bg-gray-100 transition-all"
                >
                  Call Us Now
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                The towns listed above are just a sample of the areas we service.{' '}
                <Link to="/towns/" className="text-blue-600 hover:text-blue-800 font-semibold underline transition-colors">
                  Click here
                </Link>
                {' '}to view our complete service area coverage.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Property?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Get your free, no-obligation estimate today. Our team is ready to help make your property look its best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#quote-form"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
              >
                Get Your Free Quote
              </a>
              <a
                href="tel:+14015950726"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-xl border-2 border-white/30"
              >
                <Phone className="w-5 h-5 mr-2" />
                (401) 595-0726
              </a>
            </div>
          </div>
        </section>

        {/* Security & Privacy Notice */}
        <section className="py-8 px-4 bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
              <Shield className="w-4 h-4" />
              <span>Your information is secure and will never be shared with third parties.</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
