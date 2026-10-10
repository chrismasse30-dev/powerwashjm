import { useNavigate } from 'react-router-dom';
import { Zap, ChevronDown, Clock, CheckCircle } from 'lucide-react';

interface InstantQuoteChoicePointProps {
  className?: string;
}

export default function InstantQuoteChoicePoint({ className = '' }: InstantQuoteChoicePointProps) {
  const navigate = useNavigate();

  const handleInstantQuoteClick = () => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'instant_quote_button_click', {
        'event_category': 'engagement',
        'event_label': 'pre_form_choice_point',
        'page': '/get-quote'
      });
    }

    navigate('/instant-estimate?ref=get-quote-choice');
  };

  const handleDetailedQuoteClick = () => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'detailed_quote_scroll', {
        'event_category': 'engagement',
        'event_label': 'pre_form_choice_point'
      });
    }

    const formElement = document.getElementById('quote-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-y border-emerald-100 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Want a Quick Estimate First?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Get an instant ballpark price in under 60 seconds
          </p>
          <p className="text-base text-gray-500 mt-2">
            No commitment required • See pricing before contacting us
          </p>
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          {/* Primary: Instant Quote Button */}
          <button
            onClick={handleInstantQuoteClick}
            className="group relative w-full md:w-auto"
          >
            <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 md:px-12 py-5 md:py-6 rounded-xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6 animate-pulse" />
                <div className="text-left">
                  <div>Get Instant Quote</div>
                  <div className="text-sm font-normal text-emerald-50">
                    (60 Seconds)
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-emerald-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
          </button>

          {/* Separator */}
          <div className="text-gray-400 font-semibold text-lg hidden md:block">
            OR
          </div>

          {/* Secondary: Scroll to Detailed Quote */}
          <button
            onClick={handleDetailedQuoteClick}
            className="group w-full md:w-auto border-2 border-blue-300 bg-white hover:bg-blue-50 text-blue-800 px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:border-blue-400 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <div>Need Detailed Quote?</div>
              <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
            </div>
            <div className="text-sm text-blue-600 mt-1">Continue Below</div>
          </button>
        </div>

        {/* Trust Indicators Below Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>No commitment</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Average: 45 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Free & instant</span>
          </div>
        </div>

        {/* Optional: Social Proof Counter */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-6 py-3 rounded-full text-amber-800">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">Trusted by homeowners across Rhode Island & Massachusetts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
