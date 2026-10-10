import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect } from 'react';
import { updatePageMeta } from '../utils/seo';

export default function MobileCompanyMenuPage() {
  useEffect(() => {
    updatePageMeta({
      title: 'Company - J & M Power Washing',
      description: 'Learn more about J & M Power Washing',
      noindex: true
    });
  }, []);

  const companyLinks = [
    { name: 'About Us', path: '/about-us/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Service Areas', path: '/towns/' },
    { name: 'Financing', path: '/financing/' },
    { name: 'FAQ', path: '/faq/' },
    { name: 'Satisfaction Guarantee', path: '/satisfaction-guarantee/' },
    { name: 'Privacy Policy', path: '/privacy-policy/' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-6 py-6">
          <Link
            to="/mobile-menu/"
            className="p-2 text-gray-700 hover:text-blue-900 transition-colors"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
            COMPANY
          </h1>
          <Link
            to="/"
            className="p-2 text-gray-700 hover:text-blue-900 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-6">
        <nav className="space-y-1">
          {companyLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center justify-between py-5 px-4 text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
            >
              <span className="text-lg font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
