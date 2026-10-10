import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import QuoteForm from '../components/QuoteForm';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { updatePageMeta } from '../utils/seo';

interface QuoteData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  services: string[];
  property_type?: string;
  square_footage?: number;
  stories?: number;
  [key: string]: any;
}

export default function CompleteYourQuotePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const quoteId = searchParams.get('resume');

  useEffect(() => {
    updatePageMeta({
      title: 'Complete Your Quote | J&M Power Washing',
      description: 'Complete your power washing service quote request.',
      robots: 'noindex, nofollow'
    });

    const loadQuoteData = async () => {
      if (!quoteId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('quote_submissions')
          .select('*')
          .eq('id', quoteId)
          .eq('deleted', false)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setQuoteData(data);
        } else {
          setError('Quote not found. Please start a new quote request.');
        }
      } catch (err) {
        console.error('Error loading quote data:', err);
        setError('Unable to load your saved information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuoteData();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-40 lg:pt-56">

      <main className="container mx-auto px-4 pb-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Complete Your Quote Request
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {quoteData
              ? `Welcome back, ${quoteData.name?.split(' ')[0] || 'there'}! We've saved your information. Complete your quote to get started.`
              : 'Get your free, no-obligation quote in just a few minutes.'
            }
          </p>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Free Quote</h3>
              <p className="text-sm text-gray-600">No obligation, no hidden fees</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-sm text-gray-600">Get your quote within 24 hours</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Expert Service</h3>
              <p className="text-sm text-gray-600">Professional team you can trust</p>
            </div>
          </div>
        </div>

        {/* Quote Form Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
            <p className="text-gray-600">
              {quoteData
                ? 'Review and complete your information below. All fields can be edited.'
                : 'Fill out the form below to receive your personalized quote.'
              }
            </p>
          </div>

          <QuoteForm
            initialData={quoteData || undefined}
            resumeQuoteId={quoteId || undefined}
            showTitle={false}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Why Choose J&M Power Washing?</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>5-Star Customer Reviews</span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Satisfaction Guaranteed</span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Free Estimates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Your information is secure and will never be shared with third parties.</p>
        </div>
      </main>
    </div>
  );
}
