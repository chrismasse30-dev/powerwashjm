import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updatePageMeta, addStructuredData, businessStructuredData } from '../utils/seo';
import PaymentCalculator from '../components/PaymentCalculator';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function FinancingPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const navigate = useNavigate();

  const handleGetQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const quoteSection = document.getElementById('quote');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  useEffect(() => {
    updatePageMeta({
      title: 'Financing Options | Flexible Payment Plans | J&M Power Washing RI & MA',
      description: 'Affordable power washing with flexible financing through Wisetack. $500-$25,000 financing, 3-60 month terms, competitive APRs. Make home improvements affordable today in RI & MA. Apply online!',
      keywords: 'power washing financing, payment plans, flexible financing, home service financing, affordable power washing, Wisetack financing, 0% APR, Rhode Island financing, Massachusetts payment plans',
      ogTitle: 'Flexible Financing Options | Affordable Payment Plans | J&M Power Washing',
      ogDescription: 'Make your power washing project affordable with financing from $500-$25,000. Quick approval, flexible terms 3-60 months. Start your project today!',
    });

    addStructuredData(businessStructuredData);
  }, []);

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/homepagehouse.png)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/85"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">We Offer Financing</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Make your home improvement project affordable with flexible financing options
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Flexible Financing Through Wisetack</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We've partnered with Wisetack to offer you flexible financing options that make professional power washing and holiday light services affordable. Get approved quickly and start your project right away.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Financing from $500 - $25,000</h3>
                    <p className="text-gray-600">Finance projects of any size</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">APRs from 0% to 35.9%</h3>
                    <p className="text-gray-600">Competitive rates based on creditworthiness</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Terms from 3 to 60 months*</h3>
                    <p className="text-gray-600">Choose a payment plan that works for you</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">No Hidden Fees</h3>
                    <p className="text-gray-600">No penalties, late fees, or compounding interest</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Approval Process</h3>
                    <p className="text-gray-600">Get approved in minutes with minimal paperwork</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3">How It Works:</h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold text-blue-900 mr-2">1.</span>
                    <button onClick={handleGetQuote} className="text-blue-900 hover:underline font-medium text-left">Get a free estimate for your project</button>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-900 mr-2">2.</span>
                    <span>Apply for financing through Wisetack</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-900 mr-2">3.</span>
                    <span>Receive approval decision in minutes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-900 mr-2">4.</span>
                    <span>Schedule your service and pay over time</span>
                  </li>
                </ol>
              </div>

              <div className="mt-6 text-xs text-gray-600 leading-relaxed space-y-3">
                <p>
                  The interest rates, payment amounts, and total interest are estimates only. If you are approved, the actual interest rate, payment amount, and total interest will be provided to you before you sign the financing agreement.
                </p>
                <p>
                  *All financing is subject to credit approval. Your terms may vary. Payment options through Wisetack are provided by our lending partners. For example, a $1,200 purchase could cost $104.89 a month for 12 months, based on an 8.9% APR, or $400 a month for 3 months, based on a 0% APR. Offers range from 0–35.9% APR based on creditworthiness. State interest rate caps may apply. No other financing charges or participation fees. See additional terms at <a href="https://wisetack.com/faqs" target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline">wisetack.com/faqs</a>
                </p>
              </div>
            </div>

            <div>
              <PaymentCalculator />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Contact us today to learn more about our financing options and get a free estimate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetQuote}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Free Estimate
            </button>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-900 hover:text-white transition-all"
            >
              Call (401) 595-0726
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
