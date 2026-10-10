import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updatePageMeta, addStructuredData, createFAQSchema } from '../utils/seo';
import { useBannerVisibility } from '../hooks/useBannerVisibility';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Do you offer both residential and commercial power washing?',
      answer: 'Yes. We provide professional power washing for both homes and businesses, including houses, roofs, decks, driveways, sidewalks, storefronts, parking lots, and more.',
    },
    {
      question: 'What cleaning methods do you use?',
      answer: 'We use advanced equipment and safe, eco-friendly cleaning solutions. Depending on the surface, we apply either soft washing or pressure washing to ensure a deep clean without causing damage.',
    },
    {
      question: 'How often should I have my home or business power washed?',
      answer: 'Most properties benefit from professional power washing once a year. However, areas with heavy tree coverage, high traffic, or frequent exposure to dirt and algae may require more frequent cleaning.',
    },
    {
      question: 'Do your services help prevent damage?',
      answer: 'Yes. Power washing removes mold, mildew, algae, and dirt that can cause long-term damage to siding, roofing, decks, and concrete. Regular cleaning helps extend the life of your property\'s surfaces.',
    },
    {
      question: 'Is your cleaning safe for my plants and landscaping?',
      answer: 'Yes. We use environmentally safe cleaning products and take extra precautions to protect your landscaping, gardens, and outdoor furniture during the cleaning process.',
    },
    {
      question: 'What areas do you serve?',
      answer: 'We proudly serve communities throughout Rhode Island and Massachusetts, providing reliable residential and commercial power washing services.',
    },
    {
      question: 'How do I prepare my property before service?',
      answer: 'We recommend closing all windows and doors, removing fragile outdoor décor, and ensuring water sources are accessible. Our team will guide you through any other steps if needed.',
    },
    {
      question: 'Do you offer a satisfaction guarantee?',
      answer: 'Yes. Every service we provide comes with a 100% satisfaction guarantee. If you\'re not happy with the results, we\'ll make it right.',
    },
  ];

  useEffect(() => {
    updatePageMeta({
      title: 'Power Washing FAQ | Common Questions Answered | J&M RI & MA',
      description: 'Get answers to your power washing questions. Learn about our methods, pricing, preparation, service areas in Rhode Island & Massachusetts, and what to expect. Expert advice from J&M Power Washing.',
      keywords: 'power washing FAQ, pressure washing questions, soft washing info, cleaning services questions, RI MA power washing, how often power wash, power washing cost, power washing safety, Rhode Island pressure washing FAQ',
    });

    addStructuredData(createFAQSchema(faqs));
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white" style={getNavOffsetWithBreadcrumb()}>
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden parallax-bg"
        style={{
          backgroundImage: 'url(/homepagehouse.png)'
        }}
      >
        <div className="absolute inset-0 bg-blue-900/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HelpCircle className="w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wider">Help Center</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions about our power washing services, methods, and what to expect.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold">
              🔒 PRICE LOCKED 30 DAYS — NO SURPRISES
            </span>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-100 overflow-hidden transition-all hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-bold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-blue-900 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-5">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-blue-100 mb-6">
              Our team is here to help! Give us a call or request a free estimate today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+14015950726"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
              >
                Call (401) 595-0726
              </a>
              <a
                href="/#quote"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-800 text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105"
              >
                Request Free Estimate
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
