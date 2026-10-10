import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import townFaqFallback from '../data/townFaqFallback.json';

const addInternalLinks = (text: string): string => {
  const linkMappings: Array<{ keyword: RegExp; url: string; replacement: string }> = [
    { keyword: /\bget your custom pricing\b/gi, url: '/get-quote', replacement: 'get your custom pricing' },
    { keyword: /\bonline quote\b/gi, url: '/get-quote', replacement: 'online quote' },
    { keyword: /\bquote online\b/gi, url: '/get-quote', replacement: 'quote online' },
    { keyword: /\bget a quote\b/gi, url: '/get-quote', replacement: 'get a quote' },
    { keyword: /\brequest a quote\b/gi, url: '/get-quote', replacement: 'request a quote' },
    { keyword: /\bhouse washing\b/gi, url: '/house-washing', replacement: 'house washing' },
    { keyword: /\broof cleaning\b/gi, url: '/roof-cleaning', replacement: 'roof cleaning' },
    { keyword: /\bdeck cleaning\b/gi, url: '/deck-cleaning', replacement: 'deck cleaning' },
    { keyword: /\bdeck restoration\b/gi, url: '/deck-cleaning', replacement: 'deck restoration' },
    { keyword: /\bgutter cleaning\b/gi, url: '/gutter-cleaning', replacement: 'gutter cleaning' },
    { keyword: /\bconcrete cleaning\b/gi, url: '/concrete-cleaning', replacement: 'concrete cleaning' },
    { keyword: /\bdriveway cleaning\b/gi, url: '/concrete-cleaning', replacement: 'driveway cleaning' },
    { keyword: /\bholiday lights?\b/gi, url: '/holiday-lights', replacement: 'holiday lights' },
    { keyword: /\bcommercial (?:power washing|cleaning|services)\b/gi, url: '/commercial', replacement: 'commercial services' },
    { keyword: /\bHOA cleaning\b/gi, url: '/hoa-condo-cleaning', replacement: 'HOA cleaning' },
    { keyword: /\bcondo cleaning\b/gi, url: '/hoa-condo-cleaning', replacement: 'condo cleaning' },
    { keyword: /\bsoft wash(?:ing)?\b/gi, url: '/house-washing', replacement: 'soft washing' },
    { keyword: /\bpressure washing\b/gi, url: '/house-washing', replacement: 'pressure washing' },
    { keyword: /\bflexible financing\b/gi, url: '/financing', replacement: 'flexible financing' },
    { keyword: /\bfinancing options\b/gi, url: '/financing', replacement: 'financing options' },
    { keyword: /\bpayment plans\b/gi, url: '/financing', replacement: 'payment plans' }
  ];

  let processedText = text;
  const existingLinks: Array<{ start: number; end: number }> = [];

  const anchorRegex = /<a\b[^>]*>.*?<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(text)) !== null) {
    existingLinks.push({ start: match.index, end: match.index + match[0].length });
  }

  linkMappings.forEach(({ keyword, url, replacement }) => {
    const matches: Array<{ index: number; length: number; matched: string }> = [];
    const regex = new RegExp(keyword.source, keyword.flags);
    let result;

    while ((result = regex.exec(processedText)) !== null) {
      const matchStart = result.index;
      const matchEnd = matchStart + result[0].length;

      const isInExistingLink = existingLinks.some(
        link => matchStart >= link.start && matchEnd <= link.end
      );

      if (!isInExistingLink) {
        matches.push({
          index: matchStart,
          length: result[0].length,
          matched: result[0]
        });
      }
    }

    matches.reverse().forEach(({ index, length, matched }) => {
      const before = processedText.substring(0, index);
      const after = processedText.substring(index + length);
      const link = `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline font-medium">${matched}</a>`;
      processedText = before + link + after;
    });
  });

  return processedText;
};

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  category: string;
}

interface TownFAQProps {
  townSlug: string;
  townName: string;
}

export default function TownFAQ({ townSlug, townName }: TownFAQProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchFAQs();
  }, [townSlug]);

  useEffect(() => {
    if (faqs.length > 0) {
      addFAQSchema();
    }
  }, [faqs]);

  const addFAQSchema = () => {
    const stripHtml = (html: string) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(faq.answer)
        }
      }))
    };

    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'FAQPage') {
          script.remove();
        }
      } catch (e) {
      }
    });

    const script = document.createElement('script');
    script.id = 'town-faq-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
  };

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('town_faqs')
        .select('id, question, answer, display_order, category')
        .eq('town_slug', townSlug)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const rows = data || [];
        const fbMap: any = townFaqFallback;
        const fb = rows.length === 0 ? fbMap[townSlug] : null;
        if (fb && fb.length > 0) {
          setFaqs(fb.map((x: any, i: number) => ({ id: 'fallback-' + i, question: x.question, answer: x.answer, category: x.category, display_order: x.display_order })));
        } else {
          setFaqs(rows);
        }
    } catch (error) {
      console.error('Error fetching town FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Common questions about our power washing services in {townName}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: addInternalLinks(faq.answer) }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Have more questions about our services in {townName}?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/get-quote/"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get a Free Quote
            </Link>
            <a
              href="tel:+14015950726"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md border-2 border-blue-600"
            >
              Call (401) 595-0726
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
