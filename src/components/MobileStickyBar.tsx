import { Phone, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileStickyBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-900 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around gap-3 px-4 py-3">
        <a
          href="tel:+14015950726"
          className="flex items-center justify-center gap-2 flex-1 bg-blue-900 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-800 transition-colors active:scale-95 transform cursor-pointer min-h-[48px] touch-manipulation"
          aria-label="Call J&M Power Washing at 401-595-0726"
        >
          <Phone className="w-5 h-5" aria-hidden="true" />
          <span>Call Now</span>
        </a>

        <Link
          to="/get-quote/"
          className="flex items-center justify-center gap-2 flex-1 bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition-colors active:scale-95 transform min-h-[48px] touch-manipulation"
          aria-label="Get a free estimate for power washing services"
        >
          <FileText className="w-5 h-5" aria-hidden="true" />
          <span>Free Estimate</span>
        </Link>
      </div>
    </div>
  );
}
