import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight, Star, MapPin } from 'lucide-react';
import QuoteForm from './QuoteForm';
import ServicePricingBox from './ServicePricingBox';
import { updatePageMeta, addStructuredData, createBreadcrumbSchema, createServiceSchema, createFAQSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

interface ServiceFAQ {
  question: string;
  answer: string;
}

interface ServiceReview {
  author: string;
  location: string;
  rating: 5;
  text: string;
}

interface ServicePageProps {
  serviceName: string;
  serviceSlug: string;
  minPrice: number;
  maxPrice: number;
  typicalPrice: string;
  priceNote?: string;
  guarantee?: string;
  addOns?: Array<{ name: string; price: string }>;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  heroImage: string;
  heroTitle: string;
  heroDescription: string;
  introText: string;
  benefitsTitle: string;
  benefits: Array<{ title: string; description: string }>;
  processSteps: Array<{ step: string; title: string; description: string }>;
  faqs: ServiceFAQ[];
  reviews: ServiceReview[];
  whyChooseText: string;
  icon: React.ReactNode;
}

export default function ServicePageTemplate({
  serviceName,
  serviceSlug,
  minPrice,
  maxPrice,
  typicalPrice,
  priceNote,
  guarantee,
  addOns,
  metaTitle,
  metaDescription,
  keywords,
  heroImage,
  heroTitle,
  heroDescription,
  introText,
  benefitsTitle,
  benefits,
  processSteps,
  faqs,
  reviews,
  whyChooseText,
  icon
}: ServicePageProps) {
  const location = useLocation();
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const topTowns = ['Warwick', 'Providence', 'North Smithfield'];

  useEffect(() => {
    const canonicalUrl = `https://powerwashjm.com${location.pathname}`;
    const metaDescription = `Professional ${serviceName} Rhode Island – $${minPrice}–$${maxPrice}. Same-day premium crew. 5-year guarantee. Serving all 39 RI & MA towns. Free quote: (401) 595-0726`;

    updatePageMeta({
      title: `${serviceName} Rhode Island – J&M Power Washing & Holiday Lights`,
      description: metaDescription,
      keywords,
      ogTitle: `${serviceName} Rhode Island – J&M Power Washing & Holiday Lights`,
      ogDescription: metaDescription,
      canonical: canonicalUrl
    });

    const breadcrumbs = [
      { name: 'Home', url: 'https://powerwashjm.com/' },
      { name: 'Services', url: 'https://powerwashjm.com/#services' },
      { name: serviceName, url: `https://powerwashjm.com${location.pathname}` }
    ];

    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${serviceName} - Rhode Island`,
      description: metaDescription,
      provider: {
        '@type': 'LocalBusiness',
        name: 'J&M Power Washing & Holiday Lights',
        telephone: '+1-401-595-0726',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'RI',
          addressCountry: 'US',
        },
        areaServed: [
          { '@type': 'City', name: 'Warwick', addressRegion: 'RI' },
          { '@type': 'City', name: 'Providence', addressRegion: 'RI' },
          { '@type': 'City', name: 'North Smithfield', addressRegion: 'RI' },
          { '@type': 'State', name: 'Rhode Island' },
          { '@type': 'State', name: 'Massachusetts' }
        ],
      },
      offers: {
        '@type': 'Offer',
        priceRange: `$${minPrice}-$${maxPrice}`,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      }
    };

    addStructuredData([
      createBreadcrumbSchema(breadcrumbs),
      serviceSchema,
      createFAQSchema(faqs)
    ]);
  }, []);

  const scrollToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={getNavOffsetWithBreadcrumb()}>
      <section
        className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-900/75"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-4">
              {icon}
              <span className="text-sm font-semibold uppercase tracking-wider">Professional Service</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">{heroTitle}</h1>
            <p className="text-xl text-slate-200 mb-8">{heroDescription}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start">
              <a
                href="#quote"
                onClick={scrollToQuote}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-lg"
              >
                Get Free Estimate
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="tel:+14015950726"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
              >
                Call (401) 595-0726
              </a>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Free Estimates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                {serviceName} Rhode Island – Serving {topTowns.join(', ')}
              </h2>
              <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                {introText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-blue-900 mb-2">
                  Proudly Serving Rhode Island & Southern Massachusetts
                </p>
                <p className="text-slate-700">
                  We provide expert {serviceName.toLowerCase()} services throughout RI including Warwick, Providence, North Smithfield, Cranston, Pawtucket, Smithfield, Lincoln, Cumberland, Woonsocket, and surrounding communities. Free estimates for all Rhode Island and Southern MA locations.
                </p>
              </div>
            </div>

            <div>
              <ServicePricingBox
                serviceName={serviceName}
                minPrice={minPrice}
                maxPrice={maxPrice}
                typical={typicalPrice}
                note={priceNote}
                guarantee={guarantee}
                addOns={addOns}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{benefitsTitle}</h2>
            <p className="text-xl text-slate-600">Why Rhode Island homeowners choose J&M</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Process</h2>
            <p className="text-xl text-slate-600">Professional, efficient, and thorough</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Rhode Island Customers Say About Our {serviceName}
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-lg font-semibold text-slate-900">5.0 Rating</span>
            </div>
            <p className="text-slate-600">Based on {reviews.length} verified Rhode Island reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{review.text}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{review.author}</p>
                  <div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{review.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteForm />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Professional {serviceName} in Rhode Island?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of satisfied Rhode Island homeowners. Free estimates, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#quote"
              onClick={scrollToQuote}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105"
            >
              Get Your Free Estimate
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105"
            >
              Call (401) 595-0726
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
