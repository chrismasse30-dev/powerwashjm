import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { AlertTriangle, CheckCircle, FileText, Send, Shield, Clock, Award, Star, Calculator, TrendingUp, Users, Phone } from 'lucide-react';
import EstimatorForm from '../components/estimator/EstimatorForm';
import { useAuth } from '../contexts/AuthContext';
import { getSiteSetting } from '../services/siteSettingsService';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { updatePageMeta, addStructuredData, createBreadcrumbSchema } from '../utils/seo';

export default function InstantEstimatePage() {
  const [, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { getNavOffset } = useBannerVisibility();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminPreview = searchParams.get('admin') === 'true';
  const resumeQuoteId = searchParams.get('resume');

  useEffect(() => {
    updatePageMeta({
      title: 'Instant Power Washing Estimate | Free Online Quote Calculator',
      description: 'Get an instant power washing estimate for your Rhode Island or Massachusetts home. Free online calculator provides accurate pricing in under 60 seconds. No phone calls required.',
      keywords: 'power washing estimate, instant pressure washing quote, online estimate calculator, power washing cost calculator, free pressure washing estimate, rhode island power washing quote',
      canonical: 'https://powerwashjm.com/instant-estimate/',
      ogTitle: 'Free Instant Power Washing Estimate Calculator - Get Accurate Pricing Now',
      ogDescription: 'Calculate your power washing cost instantly. Free online estimator for Rhode Island & Massachusetts homes. Get pricing in 60 seconds, no phone calls required.',
      ogImage: 'https://powerwashjm.com/logos/logo.png'
    });

    const breadcrumbData = createBreadcrumbSchema([
      { name: 'Home', url: 'https://powerwashjm.com' },
      { name: 'Instant Estimate', url: 'https://powerwashjm.com/instant-estimate/' }
    ]);

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': ['Service', 'WebApplication'],
      'serviceType': 'Power Washing Estimate Calculator',
      'name': 'Instant Power Washing Estimate Calculator',
      'description': 'Free online calculator for instant power washing and pressure washing estimates. Get accurate pricing for your property in under 60 seconds.',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'availability': 'https://schema.org/InStock',
        'description': 'Free instant estimate service'
      },
      'provider': {
        '@type': 'LocalBusiness',
        'name': 'J&M Power Washing & Holiday Lights',
        'telephone': '+1-401-595-0726',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '50 Truman St',
          'addressLocality': 'Johnston',
          'addressRegion': 'RI',
          'postalCode': '02919',
          'addressCountry': 'US'
        },
      },
      'areaServed': [
        { '@type': 'State', 'name': 'Rhode Island' },
        { '@type': 'State', 'name': 'Massachusetts' }
      ],
      'url': 'https://powerwashjm.com/instant-estimate/',
      'potentialAction': {
        '@type': 'UseAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://powerwashjm.com/instant-estimate/',
          'actionPlatform': [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform'
          ]
        }
      }
    };

    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [breadcrumbData, serviceSchema]
    };

    addStructuredData(combinedSchema);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check page visibility on mount
  useEffect(() => {
    const checkVisibility = async () => {
      // CRITICAL: Wait for auth to finish loading before making any decisions
      if (authLoading) {
        return;
      }

      try {
        // If admin preview mode and user is authenticated, always show
        if (isAdminPreview && user) {
          setIsVisible(true);
          setLoading(false);
          return;
        }

        // If there's a resume parameter, allow access regardless of visibility setting
        // This allows abandoned cart emails to work even when page is hidden
        if (resumeQuoteId) {
          setIsVisible(true);
          setLoading(false);
          return;
        }

        // Check database setting for public visibility
        const visibilitySetting = await getSiteSetting('instant_estimate_visible');
        const pageIsVisible = visibilitySetting === 'true';

        setIsVisible(pageIsVisible);
        setLoading(false);

        // If page is hidden and not admin, redirect to homepage
        // Only redirect if auth is confirmed loaded and user is definitely null
        if (!pageIsVisible && !user && !authLoading) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error checking page visibility:', error);
        // On error, default to visible to avoid breaking the page
        setIsVisible(true);
        setLoading(false);
      }
    };

    checkVisibility();
  }, [user, authLoading, isAdminPreview, navigate, resumeQuoteId]);

  // Show loading state while checking auth or page visibility
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not visible and not admin, this shouldn't render (navigation handles redirect)
  // But as a safety, show nothing
  if (!isVisible && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Preview Banner */}
      {isAdminPreview && user && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 py-4 px-4 text-center font-bold shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-lg">🔒 ADMIN PREVIEW MODE - This page may be hidden from public visitors</span>
          </div>
        </div>
      )}

      {/* Page Hidden Warning for logged-in admins */}
      {!isVisible && user && !isAdminPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-4 px-4 text-center font-bold shadow-lg border-b-4 border-red-800">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span className="text-lg">⚠️ ADMIN VIEW: This page is HIDDEN from public visitors (they're redirected to homepage)</span>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      )}

      <Navigation />
      <Breadcrumbs />

      <div className={`relative ${(isAdminPreview && user) || (!isVisible && user) ? 'pt-16' : ''} bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden`} style={getNavOffset()}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/Estimate%20Image%20.png)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/70 to-blue-900/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Instant Power Washing Estimate Calculator - Free Online Quote
            </h1>
            <h2 className="text-lg md:text-2xl text-blue-50 max-w-4xl mx-auto leading-relaxed drop-shadow-md font-medium">
              Get Accurate Pricing for Your Rhode Island or Massachusetts Property in Under 60 Seconds
            </h2>
            <p className="text-base md:text-xl text-blue-100 max-w-3xl mx-auto mt-4 leading-relaxed drop-shadow-md">
              No phone calls required. Simply select your services, enter your property details, and receive an instant, personalized estimate. Free, fast, and accurate.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Additional warning banner within page content */}
        {!isVisible && user && (
          <div className="mb-8 bg-red-50 border-4 border-red-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-red-900 mb-2">
                  🔒 You're viewing this as an ADMIN
                </h3>
                <p className="text-red-800 text-lg font-semibold mb-2">
                  This page is currently HIDDEN from public visitors
                </p>
                <p className="text-red-700">
                  Non-admin visitors attempting to access this page will be redirected to the homepage.
                  To make this page public, go to <strong>Pricing Administration</strong> and click <strong>"Show on Live Site"</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Introduction Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-8 border border-gray-100">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-lg text-gray-700 leading-relaxed">
              Need a <strong>power washing estimate</strong> without the hassle of phone calls? Our <strong>free online calculator</strong> provides instant, accurate pricing for your <Link to="/towns/" className="text-blue-600 hover:text-blue-700 underline">Rhode Island or Massachusetts property</Link>. Simply select your services, enter your property details, and receive a detailed estimate in under 60 seconds.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              Whether you need <Link to="/house-washing/" className="text-blue-600 hover:text-blue-700 underline">house washing</Link>, <Link to="/roof-cleaning/" className="text-blue-600 hover:text-blue-700 underline">roof cleaning</Link>, <Link to="/deck-cleaning/" className="text-blue-600 hover:text-blue-700 underline">deck restoration</Link>, or <Link to="/concrete-cleaning/" className="text-blue-600 hover:text-blue-700 underline">concrete pressure washing</Link>, our calculator factors in your specific property size and condition to provide the most accurate quote possible.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How Our Instant Estimate Calculator Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">No phone calls, no waiting. Get an accurate price range for your project in just a few minutes.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="absolute top-8 left-[calc(50%+40px)] hidden md:block w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-blue-300 to-blue-200"></div>
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 1</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Step 1: Select Your Services</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Choose from our range of professional <strong>power washing</strong> and <strong>pressure washing services</strong></p>
                </div>
              </div>

              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="absolute top-8 left-[calc(50%+40px)] hidden md:block w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-blue-200 to-blue-100"></div>
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 2</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Step 2: Enter Property Details</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Tell us about your property size, location, and specific needs for accurate pricing</p>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Send className="w-8 h-8" />
                </div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 3</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Step 3: Receive Your Instant Quote</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Get your personalized <strong>power washing estimate</strong> instantly via email</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>100% Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-5 h-5 text-green-600" />
                <span>Same-Day Quotes Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>5-Star Rated Service</span>
              </div>
            </div>
          </div>
        </div>

        <EstimatorForm resumeQuoteId={resumeQuoteId} />

        {/* SEO Content Sections */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Why Choose Our Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              Why Use Our Instant Estimate Calculator?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">100% Free - No Obligation</h4>
                  <p className="text-gray-600 text-sm">Get your estimate without providing payment information or making any commitments</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Instant Results in 60 Seconds</h4>
                  <p className="text-gray-600 text-sm">No waiting for callbacks or emails - your estimate appears immediately</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Accurate Pricing Based on Property Size</h4>
                  <p className="text-gray-600 text-sm">Our calculator uses your actual square footage and service needs for precise quotes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">No Phone Calls or Pressure</h4>
                  <p className="text-gray-600 text-sm">Research pricing on your own schedule without sales pressure</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Trust & Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Trusted by Rhode Island & Massachusetts Homeowners
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">2,000+</div>
                <div className="text-sm text-gray-700 font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">5.0</div>
                <div className="text-sm text-gray-700 font-medium">Star Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
                <div className="text-sm text-gray-700 font-medium">5-Star Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">40+</div>
                <div className="text-sm text-gray-700 font-medium">Towns Served</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-200">
              <div className="flex items-center gap-2 justify-center text-sm text-gray-700">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 justify-center text-sm text-gray-700 mt-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Family Owned & Operated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Power Washing Services Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 mt-12 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            Power Washing Services We Estimate
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">House Washing & Soft Wash</h3>
              <p className="text-gray-600 text-sm mb-3">Professional soft washing for vinyl and cedar siding, removing dirt, mold, and mildew without damage.</p>
              <Link to="/house-washing/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Roof Cleaning & Algae Removal</h3>
              <p className="text-gray-600 text-sm mb-3">Safe removal of black streaks, algae, and moss to extend your roof's lifespan and improve curb appeal.</p>
              <Link to="/roof-cleaning/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Deck Cleaning & Restoration</h3>
              <p className="text-gray-600 text-sm mb-3">Restore your deck to like-new condition with professional cleaning and optional staining services.</p>
              <Link to="/deck-cleaning/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Driveway & Concrete Pressure Washing</h3>
              <p className="text-gray-600 text-sm mb-3">Powerful pressure washing for driveways, sidewalks, and concrete surfaces to remove stains and grime.</p>
              <Link to="/concrete-cleaning/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gutter Cleaning & Brightening</h3>
              <p className="text-gray-600 text-sm mb-3">Thorough interior and exterior gutter cleaning to ensure proper water flow and bright, clean appearance.</p>
              <Link to="/gutter-cleaning/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Commercial Building Washing</h3>
              <p className="text-gray-600 text-sm mb-3">Professional commercial power washing for businesses, stores, and multi-unit properties.</p>
              <Link to="/commercial/" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1">
                Learn More →
              </Link>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 md:p-10 mt-12 border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            Service Areas: Rhode Island & Massachusetts
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-600" />
                Rhode Island Towns We Serve
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/towns/warwick-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Warwick</Link>
                <Link to="/towns/cranston-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Cranston</Link>
                <Link to="/towns/providence-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Providence</Link>
                <Link to="/towns/pawtucket-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Pawtucket</Link>
                <Link to="/towns/johnston-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Johnston</Link>
                <Link to="/towns/north-providence-ri/" className="text-blue-600 hover:text-blue-700 text-sm">North Providence</Link>
                <Link to="/towns/smithfield-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Smithfield</Link>
                <Link to="/towns/lincoln-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Lincoln</Link>
                <Link to="/towns/cumberland-ri/" className="text-blue-600 hover:text-blue-700 text-sm">Cumberland</Link>
                <Link to="/towns/east-providence-ri/" className="text-blue-600 hover:text-blue-700 text-sm">East Providence</Link>
              </div>
              <Link to="/towns/" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 inline-block">
                View All RI Towns →
              </Link>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-600" />
                Massachusetts Communities We Service
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/towns/attleboro-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Attleboro</Link>
                <Link to="/towns/north-attleboro-ma/" className="text-blue-600 hover:text-blue-700 text-sm">North Attleboro</Link>
                <Link to="/towns/seekonk-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Seekonk</Link>
                <Link to="/towns/franklin-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Franklin</Link>
                <Link to="/towns/bellingham-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Bellingham</Link>
                <Link to="/towns/blackstone-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Blackstone</Link>
                <Link to="/towns/uxbridge-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Uxbridge</Link>
                <Link to="/towns/mansfield-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Mansfield</Link>
                <Link to="/towns/foxboro-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Foxboro</Link>
                <Link to="/towns/norton-ma/" className="text-blue-600 hover:text-blue-700 text-sm">Norton</Link>
              </div>
              <Link to="/towns/" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 inline-block">
                View All MA Towns →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 mt-12 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions About Our Instant Estimator
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How accurate is the instant estimate?</h3>
              <p className="text-gray-700">Our calculator provides highly accurate estimates based on industry-standard pricing and your specific property details. The final quote may vary slightly based on property condition, accessibility, or special requirements discovered during the on-site inspection.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Is there any cost or obligation?</h3>
              <p className="text-gray-700">No! Our instant estimate calculator is 100% free with no obligation to book. We provide transparent pricing so you can make an informed decision about your power washing needs.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How quickly will I receive my estimate?</h3>
              <p className="text-gray-700">Your personalized estimate is generated instantly - in under 60 seconds. You'll receive a detailed quote via email immediately after completing the form.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What information do I need to provide?</h3>
              <p className="text-gray-700">You'll need to know your property size (square footage) or approximate dimensions, the services you're interested in, and your location. We also ask for basic contact information to send you the estimate.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I get estimates for multiple services?</h3>
              <p className="text-gray-700">Yes! Our calculator allows you to select multiple services at once. Bundling services often results in better pricing, which is automatically calculated in your estimate.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What factors affect my estimate?</h3>
              <p className="text-gray-700">Key factors include property size, services selected, property type (residential vs. commercial), location, and any special requirements like multi-story buildings or difficult access areas.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Do you offer discounts for multiple services?</h3>
              <p className="text-gray-700">Yes! When you bundle services like <Link to="/house-washing/" className="text-blue-600 hover:underline">house washing</Link> with <Link to="/roof-cleaning/" className="text-blue-600 hover:underline">roof cleaning</Link>, our calculator automatically applies package pricing that saves you money.</p>
            </div>
            <div className="pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What happens after I receive my estimate?</h3>
              <p className="text-gray-700">After receiving your instant estimate, you can review it at your convenience. If you'd like to proceed, simply call us at (401) 595-0726 or reply to the estimate email to schedule your service. There's no pressure - take all the time you need to decide.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl p-8 md:p-10 mt-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Your Instant Estimate?</h2>
          <p className="text-xl text-blue-50 mb-6 max-w-2xl mx-auto">Join thousands of satisfied homeowners in Rhode Island and Massachusetts who've used our free calculator.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#estimator" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Get My Free Estimate Now
            </a>
            <a href="tel:+14015950726" className="bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call (401) 595-0726
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
