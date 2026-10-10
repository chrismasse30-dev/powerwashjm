import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Menu,
  X,
  CheckCircle,
  Building,
  Store,
  Shield,
  Clock,
  Users,
  FileText,
  ChevronRight
} from 'lucide-react';
import ServiceFAQ from '../components/ServiceFAQ';

export default function CommercialLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const smoothScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const services = {
    multifamily: [
      'Exterior building washing (all siding types)',
      'Roof soft washing (algae, moss, black streaks)',
      'Parking lots & garages',
      'Dumpster pad degreasing',
      'Common area walkways & patios',
      'Pool deck & amenity areas',
      'Signage & entrance monument cleaning'
    ],
    commercial: [
      'Storefront & window surround cleaning',
      'Drive-thru lanes & menu boards',
      'Shopping center facades',
      'Restaurant grease hood cleaning',
      'Loading dock & service areas',
      'Sidewalk & entrance pressure washing',
      'Awning & canopy cleaning'
    ]
  };

  const faqs = [
    {
      question: 'Do you provide your own water?',
      answer: 'Yes, we carry 300+ gallons per truck. For larger projects, we can coordinate site water access with your facility manager to maximize efficiency and minimize costs.'
    },
    {
      question: 'Can you work nights or weekends to avoid tenant disruption?',
      answer: 'Absolutely. We schedule around your occupants\' needs. Most HOA and retail jobs are done on off-peak hours. We\'ll coordinate with your on-site team to minimize any impact.'
    },
    {
      question: 'How do you protect landscaping and resident property?',
      answer: 'We pre-wet all landscaping, use eco-friendly detergents when needed, and follow strict protocols to protect plants, vehicles, and personal property. We also provide advance notice to residents through your preferred communication channel.'
    },
    {
      question: 'What are your payment and billing terms?',
      answer: 'We offer Net 30 terms for qualified property management companies and HOAs. We can invoice directly to your management company or process through your vendor portal. W-9 and COI provided upon request.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="h-12 w-48 bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J&M Power Washing</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => smoothScroll('services')}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => smoothScroll('about')}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
              >
                About
              </button>
              <button
                onClick={() => smoothScroll('faq')}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => smoothScroll('contact')}
                className="text-gray-700 hover:text-blue-700 font-medium transition-colors"
              >
                Contact
              </button>
              <a
                href="tel:+14015950726"
                className="inline-flex items-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5 mr-2" />
                (401) 595-0726
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-20 right-0 bottom-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col p-6 space-y-4">
            <button
              onClick={() => smoothScroll('services')}
              className="text-left text-gray-700 hover:text-blue-700 font-medium py-2 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => smoothScroll('about')}
              className="text-left text-gray-700 hover:text-blue-700 font-medium py-2 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => smoothScroll('faq')}
              className="text-left text-gray-700 hover:text-blue-700 font-medium py-2 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => smoothScroll('contact')}
              className="text-left text-gray-700 hover:text-blue-700 font-medium py-2 transition-colors"
            >
              Contact
            </button>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-lg mt-4"
            >
              <Phone className="w-5 h-5 mr-2" />
              (401) 595-0726
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 min-h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Reliable Exterior Cleaning for Property Managers in RI & MA
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed">
              We protect your property value and your reputation. Fully insured, compliant, and zero-hassle cleaning for HOAs, Condos, and Commercial Facilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => smoothScroll('contact')}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-700 text-white text-lg font-semibold rounded-lg hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Request a Commercial Proposal
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => smoothScroll('services')}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Our Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="bg-blue-50 border-y border-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-700 flex-shrink-0" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                $2 Million Liability Insurance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-700 flex-shrink-0" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                W-9 & Vendor Compliance Ready
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-700 flex-shrink-0" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                Uniformed, Background-Checked Crews
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-700 flex-shrink-0" />
              <p className="text-sm sm:text-base font-semibold text-gray-800">
                Night & Weekend Scheduling Available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Your Properties Are Your Reputation. Let Us Make You Look Good.
          </h2>
          <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
            <p className="text-lg sm:text-xl mb-6">
              As a property manager, you're under constant pressure: Board members expect pristine curb appeal. Tenants complain about dirty sidewalks. Maintenance requests pile up. And you're drowning in vendor coordination.
            </p>
            <p className="text-lg sm:text-xl mb-6">
              <strong>That's where we come in.</strong> J&M Power Washing handles exterior cleaning so you don't have to. We show up on time, work quietly around your residents, protect your landscaping, and leave your properties looking brand new.
            </p>
            <p className="text-lg sm:text-xl">
              You get the credit. We do the work. No drama. No complaints. Just results.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Commercial & HOA Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive exterior cleaning solutions designed for property managers who demand quality and reliability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Multi-Family & HOA Services */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">
                  Multi-Family & HOA Services
                </h3>
              </div>
              <ul className="space-y-3">
                {services.multifamily.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Commercial & Retail Services */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Store className="w-8 h-8 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">
                  Commercial & Retail Services
                </h3>
              </div>
              <ul className="space-y-3">
                {services.commercial.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Credibility Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div
                className="rounded-xl shadow-2xl h-96 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80)'
                }}
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Dedicated Professionals. Proven Reliability.
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                We are a full-time, dedicated operation committed to excellence. J&M Power Washing is an established, family-owned business that has partnered with property managers since 2018. We provide trained crews, comprehensive insurance, and an uncompromising standard of service.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Family Owned Since 2018</h4>
                    <p className="text-gray-600">Reliable service to the property management community</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Safety-First Training</h4>
                    <p className="text-gray-600">OSHA-compliant procedures and ongoing crew education</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Resident Communication Protocols</h4>
                    <p className="text-gray-600">We coordinate with your team to notify residents and minimize disruption</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Fully Insured & Bonded</h4>
                    <p className="text-gray-600">$2 million general liability with certificates provided upon request</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="faq">
        <ServiceFAQ
          faqs={faqs}
          title="Frequently Asked Questions"
        />
      </div>

      {/* Footer CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Get Your Free Commercial Assessment
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-blue-100">
            Don't wait for a tenant complaint. Get a proactive plan today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/get-quote/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 w-full sm:w-auto"
            >
              Request a Proposal
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>

            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition-all w-full sm:w-auto"
            >
              <Phone className="w-5 h-5 mr-2" />
              (401) 595-0726
            </a>
          </div>

          <div className="border-t border-blue-600 pt-8">
            <p className="text-blue-200 mb-2">Serving Property Managers Throughout:</p>
            <p className="text-white font-semibold text-lg">
              Rhode Island & Massachusetts
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} J&M Power Washing. All rights reserved.
          </p>
          <p className="text-sm">
            Fully Licensed & Insured | Commercial Services Division
          </p>
        </div>
      </footer>
    </div>
  );
}
