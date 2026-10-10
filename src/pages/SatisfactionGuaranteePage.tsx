import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Award, ChevronRight } from 'lucide-react';
import { updatePageMeta, addStructuredData } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

export default function SatisfactionGuaranteePage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();

  useEffect(() => {
    updatePageMeta({
      title: 'Our 100% Satisfaction Guarantee | J & M Power Washing',
      description: "J & M Power Washing's 100% satisfaction guarantee ensures your complete happiness with our power washing services. We make it right or it's free.",
      keywords: 'satisfaction guarantee, power washing guarantee, quality assurance, customer satisfaction, licensed insured, Rhode Island power washing, Massachusetts pressure washing',
      ogTitle: 'Our 100% Satisfaction Guarantee | J & M Power Washing',
      ogDescription: "We stand behind every job with our iron-clad satisfaction guarantee. If you're not completely happy, we make it right.",
    });

    const guaranteeSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'J&M Power Washing & Holiday Lights',
      provider: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing & Holiday Lights',
        telephone: '+1-401-595-0726',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Power Washing Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Power Washing Services',
              description: '100% Satisfaction Guarantee - We make it right or its free',
            },
          },
        ],
      },
    };

    addStructuredData(guaranteeSchema);
  }, []);

  return (
    <div style={getNavOffsetWithBreadcrumb()} className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mt-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <Shield className="w-10 h-10" aria-hidden="true" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Our 100% Satisfaction Guarantee
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Your peace of mind is our promise. We stand behind every job with complete confidence.
              </p>
            </div>
          </div>
        </div>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-lg mb-12">
              <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                <Award className="w-8 h-8 mr-3" aria-hidden="true" />
                The J & M Promise: We're Not Happy Until You Are.
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Your peace of mind is our top priority. At J & M Power Washing, we aren't finished until you are 100% satisfied with our work. We stand behind every job, from house washing to deck cleaning, with an iron-clad promise: If you're not completely happy with the results, we will make it right. That's the J & M Guarantee.
              </p>
            </div>

            <hr className="border-t-2 border-gray-200 my-12" />

            <div className="mb-12">
              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                What Our Guarantee Means for You
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                This isn't just a catchphrase—it's our commitment to accountability and a core part of our family-owned business. When you trust us with your home, we take that responsibility seriously.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Here is exactly how our promise works:
              </p>

              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">The Final Walkthrough</h4>
                    <p className="text-gray-700 leading-relaxed">
                      After our team completes your service, we encourage you to review the work. We want you to see the transformation for yourself.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Honest Feedback</h4>
                    <p className="text-gray-700 leading-relaxed">
                      If you spot anything that doesn't meet your expectations—a stubborn spot we missed or an area you're unsure about—we want to know.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Our "Make it Right" Pledge</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Our team will immediately work to understand the issue and re-service the area to your full satisfaction.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Final Approval</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We aren't done until you are 100% happy with the final result. No fine print, no hassles, just a job done right.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mb-12">
              <h3 className="text-3xl font-bold text-blue-900 mb-6">
                A Guarantee Built on Quality
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We can confidently offer this guarantee because we believe in our process and our people.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Professional Team</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Our technicians are licensed, insured, and trained to deliver exceptional results.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Top-Tier Equipment</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We use commercial soft-wash equipment and biodegradable cleaning solutions that cut through grime without harming your home, plants, or landscaping.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Local Reputation</h4>
                    <p className="text-gray-700 leading-relaxed">
                      As a family-owned business serving Rhode Island and Massachusetts, our reputation is everything. We are committed to upholding it with every home we service, from power washing to holiday light installations.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <hr className="border-t-2 border-gray-200 my-12" />

            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 lg:p-12 text-center">
              <h3 className="text-3xl font-bold text-blue-900 mb-4">
                Book Your Service with Complete Confidence
              </h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                Ready to restore your home's beauty without the risk? Choose the team that stands behind their work 100% of the time. Get your free, no-obligation estimate today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/#quote"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
                >
                  Get Your Risk-Free Estimate
                  <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Link>
                <a
                  href="tel:+14015950726"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 border-2 border-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
                >
                  Call (401) 595-0726
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
