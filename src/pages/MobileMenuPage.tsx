import { Link } from 'react-router-dom';
import { ChevronRight, X, Phone } from 'lucide-react';
import { useEffect } from 'react';
import { LOGOS } from '../config/images';
import { updatePageMeta } from '../utils/seo';

export default function MobileMenuPage() {
  useEffect(() => {
    updatePageMeta({
      title: 'Menu - J & M Power Washing',
      description: 'Navigate J & M Power Washing services and company information',
      noindex: true
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex-shrink-0">
            <img src={LOGOS.standard} alt="J & M Power Washing" className="h-16 w-auto" />
          </Link>
          <Link
            to="/"
            className="p-2 text-gray-700 hover:text-blue-900 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </Link>
        </div>
        <div className="text-center pb-4">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">MENU</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
          >
            <span className="text-xl font-medium">Home</span>
          </Link>

          <Link
            to="/mobile-menu/services/"
            className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
          >
            <span className="text-xl font-medium">Services</span>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </Link>

          <Link
            to="/mobile-menu/company/"
            className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
          >
            <span className="text-xl font-medium">Company</span>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </Link>

          <Link
            to="/get-quote/"
            className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
          >
            <span className="text-xl font-medium">Get Quote</span>
          </Link>

          <Link
            to="/instant-estimate/"
            className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
          >
            <span className="text-xl font-medium">Instant Estimate</span>
          </Link>
        </nav>

        <div className="mt-8 space-y-4">
          <a
            href="tel:+14015950726"
            className="flex items-center justify-center space-x-3 bg-blue-900 text-white px-6 py-4 rounded-xl hover:bg-blue-800 transition-colors font-semibold text-lg shadow-lg"
          >
            <Phone className="w-5 h-5" />
            <span>(401) 595-0726</span>
          </a>

          <Link
            to="/customer-portal/"
            className="flex items-center justify-center bg-gray-100 text-gray-900 px-6 py-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
          >
            Customer Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
