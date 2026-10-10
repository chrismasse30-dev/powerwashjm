import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createFAQSchema } from '../utils/seo';
import { TownLinkedText } from './TownLinkedText';

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  title?: string;
}

export default function ServiceFAQ({ faqs, title = "Frequently Asked Questions" }: ServiceFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'FAQPage') {
          script.remove();
        }
      } catch (e) {
      }
    });

    const faqSchema = createFAQSchema(faqs);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [faqs]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          {title}
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12">
          Get answers to common questions about this service
        </p>

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
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-bold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-6 h-6 text-blue-900 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-6 pb-5 text-gray-700 leading-relaxed"
                  role="region"
                >
                  <TownLinkedText>{faq.answer}</TownLinkedText>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
