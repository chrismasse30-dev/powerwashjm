import { Phone, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingButtons() {
  const handleInstantQuoteClick = () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'instant_quote_float_click', {
        event_category: 'engagement',
        event_label: 'Floating Button'
      });
    }
    localStorage.setItem('quote_source', 'instant_float_button');
    localStorage.setItem('quote_urgency', 'Only 3 slots left');
  };

  useEffect(() => {
    if ((window.location.pathname.replace(/[/]+$/, '') || '/') === '/get-quote' && localStorage.getItem('quote_source') === 'instant_float_button') {
      const timer = setTimeout(() => {
        const sourceInput = document.querySelector('input[name="lead_source"], input[name="source"], input[name="utm_source"]');
        const form = document.querySelector('form');

        if (form && !document.querySelector('input[name="urgency_level"]')) {
          const urgencyInput = document.createElement('input');
          urgencyInput.type = 'hidden';
          urgencyInput.name = 'urgency_level';
          urgencyInput.value = localStorage.getItem('quote_urgency') || '';
          form.appendChild(urgencyInput);
        }

        if (sourceInput) {
          (sourceInput as HTMLInputElement).value = 'Instant Quote Floating Button';
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* Hide floating buttons on mobile and tablet (< 1024px), show on desktop */}
      <div className="hidden lg:flex fixed bottom-24 right-8 z-50 flex-col gap-3">
        <a
          href="tel:+14015950726"
          className="group relative flex items-center justify-center w-14 h-14 bg-blue-900 text-white rounded-full shadow-lg hover:bg-blue-800 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Call us at 401-595-0726"
          onClick={(e) => {
            window.location.href = 'tel:+14015950726';
          }}
        >
          <Phone className="w-6 h-6" />
          <span className="absolute right-16 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Call Us
          </span>
        </a>

        <Link
          to="/get-quote/"
          onClick={handleInstantQuoteClick}
          className="group flex items-center justify-center w-14 h-14 bg-blue-900 text-white rounded-full shadow-lg hover:bg-blue-800 transition-all hover:scale-110 active:scale-95"
          aria-label="Get instant quote"
        >
          <Zap className="w-6 h-6" />
          <span className="absolute right-16 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Instant Quote
          </span>
        </Link>
      </div>

    </>
  );
}
