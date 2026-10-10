import { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface KeywordOptimizerProps {
  content: string;
  primaryKeyword?: string;
  onKeywordChange?: (keyword: string) => void;
}

interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number;
  optimal: boolean;
  positions: string[];
}

export default function KeywordOptimizer({ content, primaryKeyword, onKeywordChange }: KeywordOptimizerProps) {
  const [keyword, setKeyword] = useState(primaryKeyword || '');
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);

  useEffect(() => {
    if (keyword && content) {
      analyzeKeyword();
    }
  }, [keyword, content]);

  const analyzeKeyword = () => {
    const plainText = content.replace(/<[^>]*>/g, ' ').toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const words = plainText.split(/\s+/).filter(w => w.length > 0);

    // Count occurrences
    const count = plainText.split(keywordLower).length - 1;
    const density = (count / words.length) * 100;
    const optimal = density >= 0.5 && density <= 2.5;

    // Find positions
    const positions: string[] = [];

    // Check if in title (assuming first paragraph or h1)
    const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/i)?.[1] || '';
    if (firstParagraph.toLowerCase().includes(keywordLower)) {
      positions.push('First paragraph');
    }

    // Check headings
    const headings = content.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
    const headingsWithKeyword = headings.filter(h =>
      h.toLowerCase().includes(keywordLower)
    ).length;

    if (headingsWithKeyword > 0) {
      positions.push(`${headingsWithKeyword} heading(s)`);
    }

    // Check meta description placeholder
    positions.push('Check meta description');

    setAnalysis({
      keyword,
      count,
      density: Math.round(density * 100) / 100,
      optimal,
      positions
    });
  };

  const handleKeywordInput = (value: string) => {
    setKeyword(value);
    if (onKeywordChange) {
      onKeywordChange(value);
    }
  };

  const getDensityStatus = () => {
    if (!analysis) return { color: 'text-gray-500', label: 'Not analyzed', bg: 'bg-gray-50' };

    if (analysis.density < 0.5) {
      return { color: 'text-orange-600', label: 'Too low', bg: 'bg-orange-50' };
    } else if (analysis.density <= 2.5) {
      return { color: 'text-green-600', label: 'Optimal', bg: 'bg-green-50' };
    } else {
      return { color: 'text-red-600', label: 'Too high (keyword stuffing)', bg: 'bg-red-50' };
    }
  };

  const status = getDensityStatus();

  const suggestedKeywords = [
    'power washing',
    'house washing',
    'roof cleaning',
    'pressure washing',
    'exterior cleaning'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-lg">Keyword Optimization</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Keyword
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordInput(e.target.value)}
          placeholder="Enter target keyword..."
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use the main keyword you want this post to rank for
        </p>
      </div>

      {!keyword && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 mb-2">Suggested keywords for your business:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => handleKeywordInput(kw)}
                className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {analysis && (
        <>
          <div className={`p-4 rounded-lg mb-4 ${status.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Keyword Density</span>
              <span className={`text-2xl font-bold ${status.color}`}>
                {analysis.density}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              {analysis.optimal ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Appears {analysis.count} times in content (optimal: 0.5-2.5%)
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Keyword Placement:</h4>
            <div className="space-y-2">
              {analysis.positions.map((position, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{position}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Optimization Tips:
            </h4>
            <ul className="text-xs text-purple-800 space-y-1">
              {analysis.density < 0.5 && (
                <li>• Add keyword naturally in {Math.ceil((0.5 - analysis.density) * (content.split(/\s+/).length / 100))} more places</li>
              )}
              {analysis.density > 2.5 && (
                <li>• Reduce keyword usage to avoid penalty. Use synonyms instead.</li>
              )}
              {!analysis.positions.includes('First paragraph') && (
                <li>• Include keyword in the first paragraph for better SEO</li>
              )}
              {analysis.positions.filter(p => p.includes('heading')).length === 0 && (
                <li>• Try to include keyword in at least one H2 or H3 heading</li>
              )}
              <li>• Use LSI keywords (related terms) to avoid over-optimization</li>
              <li>• Focus on natural, reader-friendly content over keyword stuffing</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Related Keywords to Consider:</h4>
            <div className="flex flex-wrap gap-2">
              {getRelatedKeywords(analysis.keyword).map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getRelatedKeywords(keyword: string): string[] {
  const keywordLower = keyword.toLowerCase();

  const relatedMap: Record<string, string[]> = {
    'power washing': ['pressure washing', 'exterior cleaning', 'house washing', 'soft washing'],
    'house washing': ['home exterior cleaning', 'siding cleaning', 'residential power washing'],
    'roof cleaning': ['roof washing', 'moss removal', 'shingle cleaning', 'roof maintenance'],
    'pressure washing': ['power washing', 'high-pressure cleaning', 'exterior washing'],
    'holiday lights': ['christmas lights', 'seasonal lighting', 'holiday decorations', 'light installation']
  };

  // Find exact matches
  if (relatedMap[keywordLower]) {
    return relatedMap[keywordLower];
  }

  // Find partial matches
  for (const [key, values] of Object.entries(relatedMap)) {
    if (keywordLower.includes(key) || key.includes(keywordLower)) {
      return values;
    }
  }

  // Default generic related terms
  return ['professional', 'services', 'local', 'expert', 'best'];
}
