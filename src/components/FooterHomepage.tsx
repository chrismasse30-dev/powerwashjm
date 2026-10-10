import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { trackNewsletterSignup } from '../utils/analytics';
import { LOGOS } from '../config/images';
import { FOOTER_CONTENT, FOOTER_SERVICES } from '../config/footerContent';

export default function FooterHomepage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      let ipData = { ip: '', city: '', state: '' };

      try {
        console.log('Fetching IP location data...');
        const ipResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ip-location`);
        console.log('IP Response status:', ipResponse.status);
        if (ipResponse.ok) {
          ipData = await ipResponse.json();
          console.log('IP Data received:', ipData);
        } else {
          console.warn('IP lookup failed with status:', ipResponse.status);
        }
      } catch (ipError) {
        console.error('IP lookup error:', ipError);
      }

      const { error } = await supabase
        .from('newsletter_signups')
        .insert([{
          email: email,
          ip_address: ipData.ip,
          ip_city: ipData.city,
          ip_state: ipData.state,
          source: 'Footer Newsletter'
        }]);

      if (error) {
        console.error('Database insert error:', error);
        if (error.code === '23505' || error.message?.includes('newsletter_signups_email_key')) {
          setSubmitMessage('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        console.log('✅ Newsletter signup successful');

        // Sync to Brevo CRM (non-blocking)
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-brevo-contact`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            city: ipData.city,
            state: ipData.state,
            source: 'Footer Newsletter',
            signedUpDate: new Date().toISOString()
          })
        }).catch(err => console.error('Brevo sync error:', err));

        trackNewsletterSignup({
          email_domain: email.split('@')[1] || 'unknown',
          source: 'Footer Newsletter',
          location: ipData.city && ipData.state ? `${ipData.city}, ${ipData.state}` : 'unknown'
        });

        setSubmitMessage('Thanks for subscribing!');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Newsletter signup error:', err);
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  const services = FOOTER_SERVICES;

  const footerBgClass = 'bg-gradient-to-br from-blue-900 to-blue-800';
  const accentColorClass = 'text-blue-400';
  const textColorClass = 'text-blue-100';
  const borderColorClass = 'border-white/10';
  const hoverColorClass = 'hover:text-blue-400';
  const hoverBgClass = 'hover:bg-blue-400';
  const logoSrc = LOGOS.standard;
  const logoAlt = 'J & M Power Washing';
  const tagline = FOOTER_CONTENT.tagline;
  const facebookUrl = FOOTER_CONTENT.social.facebook;

  return (
    <footer className={`${footerBgClass} text-white py-16 px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-block">
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-32 w-auto mb-2"
              />
            </Link>
            <p className={`text-sm font-light leading-relaxed tracking-wide ${textColorClass} max-w-lg`}>
              {tagline}
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl transition-all ${hoverBgClass} hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(96,165,250,0.4)]`}
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={FOOTER_CONTENT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-xl transition-all ${hoverBgClass} hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(96,165,250,0.4)]`}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 tracking-wide">Services</h3>
            <ul className="list-none space-y-3">
              {services.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className={`${textColorClass} no-underline font-light text-base tracking-wide leading-relaxed inline-block transition-all ${hoverColorClass} hover:translate-x-1`}
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 tracking-wide">Service Areas</h3>
            <ul className="list-none space-y-2">
              {[
                { name: 'Warwick, RI', path: '/towns/warwick-ri/' },
                { name: 'Cranston, RI', path: '/towns/cranston-ri/' },
                { name: 'Providence, RI', path: '/towns/providence-ri/' },
                { name: 'Pawtucket, RI', path: '/towns/pawtucket-ri/' },
                { name: 'Attleboro, MA', path: '/towns/attleboro-ma/' },
                { name: 'Franklin, MA', path: '/towns/franklin-ma/' },
              ].map(town => (
                <li key={town.path}>
                  <Link
                    to={town.path}
                    className={`${textColorClass} no-underline font-light text-sm tracking-wide leading-relaxed inline-block transition-all ${hoverColorClass} hover:translate-x-1`}
                  >
                    {town.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/towns/"
                  className={`${accentColorClass} no-underline font-medium text-sm tracking-wide leading-relaxed inline-block transition-all ${hoverColorClass} hover:translate-x-1 mt-1`}
                >
                  View all 46 towns &rarr;
                </Link>
              </li>
            </ul>
            <h4 className="text-sm font-bold mt-6 mb-3 tracking-wide text-red-300 uppercase">Holiday Lighting</h4>
            <ul className="list-none space-y-2">
              {[
                { name: 'Warwick', path: '/holiday-lights/warwick-ri/' },
                { name: 'Cranston', path: '/holiday-lights/cranston-ri/' },
                { name: 'Providence', path: '/holiday-lights/providence-ri/' },
                { name: 'East Greenwich', path: '/holiday-lights/east-greenwich-ri/' },
              ].map(town => (
                <li key={town.path}>
                  <Link
                    to={town.path}
                    className={`${textColorClass} no-underline font-light text-sm tracking-wide leading-relaxed inline-block transition-all ${hoverColorClass} hover:translate-x-1`}
                  >
                    {town.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/holiday-lights/"
                  className={`${accentColorClass} no-underline font-medium text-sm tracking-wide inline-block transition-all ${hoverColorClass} hover:translate-x-1 mt-1`}
                >
                  All 32 holiday lighting towns &rarr;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 tracking-wide">Let's Connect</h3>
            <div className="flex flex-col gap-4">
              <a href="tel:+14015950726" className={`flex items-start gap-3 font-light text-base leading-relaxed tracking-wide ${textColorClass} ${hoverColorClass} transition-colors`}>
                <Phone className={`${accentColorClass} w-5 h-5 mt-0.5`} />
                <div>
                  <div><strong className="font-semibold text-white">Call us:</strong></div>
                  <div>(401) 595-0726</div>
                </div>
              </a>
              <a href="mailto:Sales@powerwashjm.com" className={`flex items-start gap-3 font-light text-base leading-relaxed tracking-wide ${textColorClass} ${hoverColorClass} transition-colors`}>
                <Mail className={`${accentColorClass} w-5 h-5 mt-0.5`} />
                <div>
                  <div><strong className="font-semibold text-white">Email:</strong></div>
                  <div>Sales@powerwashjm.com</div>
                </div>
              </a>
              <div className={`flex items-start gap-3 font-light text-base leading-relaxed tracking-wide ${textColorClass}`}>
                <MapPin className={`${accentColorClass} w-5 h-5 mt-0.5`} />
                <div>
                  <div><strong className="font-semibold text-white">Service Area:</strong></div>
                  <div>Rhode Island & Massachusetts</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <h4 className="text-base font-semibold mb-3 tracking-wide text-white">{FOOTER_CONTENT.newsletterHeading}</h4>
                <form className="flex flex-col gap-2 w-full max-w-sm" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 border-2 border-white/30 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-500"
                    placeholder="Enter Your Email"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg text-sm font-semibold tracking-wider cursor-pointer transition-all uppercase shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                  </button>
                  {submitMessage && (
                    <p className={`text-xs text-center font-semibold ${submitMessage.includes('Thanks') ? 'text-green-300' : 'text-yellow-300'}`}>
                      {submitMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

        </div>

        <div className={`border-t ${borderColorClass} pt-8 text-center text-sm font-light tracking-wide text-slate-300`}>
          <p>&copy; {FOOTER_CONTENT.copyright} | {FOOTER_CONTENT.companyDescription}</p>
          <p className="mt-2">{FOOTER_CONTENT.credentials} | 100% Satisfaction Guarantee</p>
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <Link to="/about-us/" className={`${hoverColorClass} transition-colors underline`}>
              About Us
            </Link>
            <span>|</span>
            <Link to="/sitemap/" className={`${hoverColorClass} transition-colors underline`}>
              Site Map
            </Link>
            <span>|</span>
            <Link to="/privacy-policy/" className={`${hoverColorClass} transition-colors underline`}>
              Privacy Policy
            </Link>
            <span>|</span>
            <Link to="/employee-login/" className={`${hoverColorClass} transition-colors underline`}>
              Employee Sign-In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
