import { Star } from 'lucide-react';
import { useState, useEffect, memo, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface Review {
  name: string;
  text: string;
  rating: number;
  date: string;
  source: string | null;
}


function ReviewBanner() {
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('customer_name, review_text, rating, review_date, source')
        .eq('is_active', true)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedReviews: Review[] = data.map(review => ({
          name: review.customer_name,
          text: review.review_text,
          rating: review.rating,
          date: review.review_date,
          source: review.source
        }));
        setDbReviews(formattedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviews = dbReviews;
  const allReviews = [...reviews, ...reviews];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6">What Our Customers Say</h2>
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="inline-flex items-center space-x-2 bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-lg border border-yellow-200">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
                  {reviews.length > 0 ? `${reviews.length} Verified Reviews` : '5.0 Stars on Google (165 Reviews)'}
                </span>
            </div>
            <a
              href="https://www.google.com/search?q=J+and+M+Power+Washing+Johnston+RI&ludocid=7273927993537504886#lrd=0x89e444b9c7ba14d1:0x64fcb1b21e366a76,1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 sm:px-8 py-2 sm:py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition-all duration-200 hover:scale-105 hover:shadow-xl whitespace-nowrap text-sm sm:text-base"
            >
              See all 165 five-star reviews on Google →
            </a>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

        <div className="flex animate-scroll space-x-4">
          {allReviews.map((review, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-center mb-3 gap-2">
                <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
                <div className="flex space-x-0.5 flex-shrink-0">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{review.text}</p>
              <div className="mt-3 flex items-center space-x-1.5">
                {review.source === 'Google' || !review.source ? (
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                )}
                <span className="text-xs text-gray-600">{review.source || 'Google'} Review</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

export default memo(ReviewBanner);
