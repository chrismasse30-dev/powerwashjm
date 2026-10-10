import { Phone, Menu, X, Facebook, Instagram, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LOGOS } from '../config/images';
import { useHeader } from '../contexts/HeaderContext';

export default function Navigation() {
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [mobileCompanyExpanded, setMobileCompanyExpanded] = useState(false);
  const { navRef, navHeight } = useHeader();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
    setCompanyMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('#mobile-menu-overlay') && !target.closest('[aria-controls="mobile-menu"]')) {
        setMobileMenuOpen(false);
      }
      if (servicesMenuOpen && !target.closest('[aria-label="Services menu"]') && !target.closest('[role="menu"]')) {
        setServicesMenuOpen(false);
      }
      if (companyMenuOpen && !target.closest('[aria-label="Company menu"]') && !target.closest('[role="menu"]')) {
        setCompanyMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, servicesMenuOpen, companyMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileServicesExpanded(false);
      setMobileCompanyExpanded(false);
    }
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  const services = [
    { name: 'House Washing', path: '/house-washing/' },
    { name: 'Roof Cleaning', path: '/roof-cleaning/' },
    { name: 'Deck Cleaning', path: '/deck-cleaning/' },
    { name: 'Gutter Cleaning', path: '/gutter-cleaning/' },
    { name: 'Concrete Cleaning', path: '/concrete-cleaning/' },
    { name: 'Holiday Lights', path: '/holiday-lights/' },
    { name: 'HOA & Condo Cleaning', path: '/hoa-condo-cleaning/' },
    { name: 'Fleet Washing', path: '/commercial/fleet-washing/' },
    { name: 'Commercial Solutions', path: '/commercial/' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about-us/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Financing', path: '/financing/' },
    { name: 'Customer Log In', path: '/customer-portal/' },
    { name: 'FAQ', path: '/faq/' },
    { name: 'Instant Online Quote', path: '/instant-estimate/' },
  ];

  const isHolidayPage = (location.pathname.replace(/[/]+$/, '') || '/') === '/holiday-lights' || (location.pathname.replace(/[/]+$/, '') || '/') === '/approve-estimate';
  const logoSrc = isHolidayPage ? LOGOS.holiday : LOGOS.standard;
  const logoAlt = isHolidayPage ? 'J & M Holiday Lights' : 'J & M Power Washing';

  return (
    <>
      {/* Fixed nav bar */}
      <nav
        ref={navRef as React.MutableRefObject<HTMLElement | null>}
        className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm z-50 transition-all duration-300"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-24 lg:h-28 flex items-center justify-between gap-8">
            <Link to="/" className="flex items-center shrink-0 overflow-hidden" aria-label="Go to homepage">
              <img
                src={logoSrc}
                alt={logoAlt}
                width={512}
                height={512}
                className="block h-auto max-h-[67px] lg:max-h-[77px] w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="text-slate-700 hover:text-blue-700 font-semibold text-base transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                aria-current={(location.pathname.replace(/[/]+$/, '') || '/') === '/' ? 'page' : undefined}
              >
                Home
              </Link>

              <div className="relative">
                <button
                  onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setServicesMenuOpen(!servicesMenuOpen); }
                    if (e.key === 'Escape') setServicesMenuOpen(false);
                  }}
                  className="text-slate-700 hover:text-blue-700 font-semibold text-base transition-colors flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-blue-50"
                  aria-label="Services menu"
                  aria-haspopup="true"
                  aria-expanded={servicesMenuOpen}
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <div
                  className={`absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl transition-all duration-200 border border-gray-100 z-[60] ${servicesMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  role="menu"
                  aria-label="Services"
                >
                  {services.map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      onClick={() => setServicesMenuOpen(false)}
                      className="block px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      role="menuitem"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCompanyMenuOpen(!companyMenuOpen); }
                    if (e.key === 'Escape') setCompanyMenuOpen(false);
                  }}
                  className="text-slate-700 hover:text-blue-700 font-semibold text-base transition-colors flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-blue-50"
                  aria-label="Company menu"
                  aria-haspopup="true"
                  aria-expanded={companyMenuOpen}
                >
                  <span>Company</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${companyMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <div
                  className={`absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl transition-all duration-200 border border-gray-100 z-[60] ${companyMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                  role="menu"
                  aria-label="Company"
                >
                  {companyLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setCompanyMenuOpen(false)}
                      className="block px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      role="menuitem"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/get-quote/"
                className="text-slate-700 hover:text-blue-700 font-semibold text-base transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
              >
                Get Quote
              </Link>
              <a
                href="tel:+14015950726"
                className="ml-2 flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-white font-semibold text-base hover:bg-blue-800 transition-colors"
                aria-label="Call us at 401-595-0726"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>(401) 595-0726</span>
              </a>
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-overlay"
            >
              {mobileMenuOpen
                ? <X className="w-6 h-6" aria-hidden="true" />
                : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="h-px bg-gray-200" aria-hidden="true" />
      </nav>

      {/* Mobile menu — fixed overlay that starts exactly below the nav bar */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-overlay"
          className="lg:hidden fixed left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto"
          style={{ top: `${navHeight}px` }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col divide-y divide-gray-100">
            <Link
              to="/"
              onClick={handleMobileMenuItemClick}
              className="px-5 py-4 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-base font-semibold"
            >
              Home
            </Link>

            {/* Services accordion */}
            <div>
              <button
                onClick={() => setMobileServicesExpanded(!mobileServicesExpanded)}
                className="flex items-center justify-between w-full px-5 py-4 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-base font-semibold"
                aria-expanded={mobileServicesExpanded}
              >
                <span>Services</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileServicesExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {mobileServicesExpanded && (
                <div className="bg-slate-50">
                  {services.map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      onClick={handleMobileMenuItemClick}
                      className="flex items-center pl-8 pr-5 py-3 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium border-l-2 border-blue-300 ml-5"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Company accordion */}
            <div>
              <button
                onClick={() => setMobileCompanyExpanded(!mobileCompanyExpanded)}
                className="flex items-center justify-between w-full px-5 py-4 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-base font-semibold"
                aria-expanded={mobileCompanyExpanded}
              >
                <span>Company</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileCompanyExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {mobileCompanyExpanded && (
                <div className="bg-slate-50">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleMobileMenuItemClick}
                      className="flex items-center pl-8 pr-5 py-3 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium border-l-2 border-blue-300 ml-5"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/get-quote/"
              onClick={handleMobileMenuItemClick}
              className="px-5 py-4 text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-base font-semibold"
            >
              Get Quote
            </Link>

            {/* CTA */}
            <div className="px-5 py-5 flex flex-col gap-3">
              <a
                href="tel:+14015950726"
                className="flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-4 rounded-full font-bold text-base hover:bg-blue-800 transition-colors"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>(401) 595-0726</span>
              </a>
              <div className="flex gap-4 justify-center pt-2">
                <a
                  href="https://www.facebook.com/profile.php?id=100064067522225"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/jmpowerwashing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
