import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Phone, ArrowLeft } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    updatePageMeta({
      title: '404 - Page Not Found | J&M Power Washing',
      description: 'The page you are looking for does not exist. Explore our power washing services, holiday lights installation, and more.',
      robots: 'noindex, nofollow'
    });

    // Track 404 errors for analytics
    if (window.gtag) {
      window.gtag('event', 'page_not_found', {
        page_path: window.location.pathname,
        page_referrer: document.referrer,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12 pt-40 lg:pt-56">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <div className="w-32 h-1 bg-blue-600 mx-auto mb-8"></div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
          Don't worry, we can help you find what you need!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Popular Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/house-washing/"
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                House Washing
              </h4>
              <p className="text-sm text-gray-600">Professional exterior cleaning</p>
            </Link>

            <Link
              to="/roof-cleaning/"
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                Roof Cleaning
              </h4>
              <p className="text-sm text-gray-600">Safe soft-washing service</p>
            </Link>

            <Link
              to="/holiday-lights/"
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                Holiday Lights
              </h4>
              <p className="text-sm text-gray-600">Professional installation</p>
            </Link>

            <Link
              to="/get-quote/"
              className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                Get a Quote
              </h4>
              <p className="text-sm text-gray-600">Free estimate for your project</p>
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-xl font-bold mb-4">Need Help?</h3>
          <p className="mb-6">Our team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+14015950726"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              <Phone className="w-5 h-5" />
              (401) 595-0726
            </a>
            <Link
              to="/faq/"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              <Search className="w-5 h-5" />
              Browse FAQ
            </Link>
          </div>
        </div>

        {/* Search suggestion */}
        <p className="text-sm text-gray-500 mt-8">
          Looking for something specific? Try our{' '}
          <Link to="/towns/" className="text-blue-600 hover:underline font-semibold">
            service area pages
          </Link>{' '}
          or{' '}
          <Link to="/blog" className="text-blue-600 hover:underline font-semibold">
            blog articles
          </Link>
        </p>
      </div>
    </div>
  );
}
