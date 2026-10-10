import { useEffect, useState } from 'react';
import { Target, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import { analyzeSEO, type SEOAnalysis } from '../utils/seoAnalyzer';

interface SEOCoachProps {
  post: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    meta_description?: string;
    featured_image_url?: string;
    primary_keyword?: string;
    secondary_keywords?: string[];
  };
  onScoreChange?: (score: number) => void;
}

export default function SEOCoach({ post, onScoreChange }: SEOCoachProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const result = analyzeSEO(post);
    setAnalysis(result);

    if (onScoreChange) {
      onScoreChange(result.score);
    }
  }, [post, onScoreChange]);

  if (!analysis) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredChecks = activeCategory === 'all'
    ? analysis.checks
    : analysis.checks.filter(c => c.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Checks', count: analysis.checks.length },
    { id: 'content', label: 'Content', count: analysis.checks.filter(c => c.category === 'content').length },
    { id: 'technical', label: 'Technical', count: analysis.checks.filter(c => c.category === 'technical').length },
    { id: 'keywords', label: 'Keywords', count: analysis.checks.filter(c => c.category === 'keywords').length },
    { id: 'images', label: 'Images', count: analysis.checks.filter(c => c.category === 'images').length }
  ].filter(cat => cat.count > 0); // Only show categories with checks

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">SEO Score</h3>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
          {analysis.score}
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-4">Comprehensive On-Page SEO Analysis</p>

      <div className={`p-4 rounded-lg border-2 ${getScoreBackground(analysis.score)} mb-6`}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className={`w-5 h-5 ${getScoreColor(analysis.score)}`} />
          <span className="font-semibold">
            {analysis.score >= 90 && 'Excellent SEO!'}
            {analysis.score >= 80 && analysis.score < 90 && 'Great SEO'}
            {analysis.score >= 70 && analysis.score < 80 && 'Good SEO'}
            {analysis.score >= 60 && analysis.score < 70 && 'Needs Improvement'}
            {analysis.score < 60 && 'Poor SEO'}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          {analysis.checks.filter(c => c.status === 'pass').length} of {analysis.checks.length} checks passed
        </p>
        <p className="text-xs text-gray-600 italic">
          Content quality, keywords, meta tags, and technical SEO
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Category Breakdown:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Content</p>
            <p className="text-lg font-bold text-gray-900">{analysis.breakdown.content}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Technical</p>
            <p className="text-lg font-bold text-gray-900">{analysis.breakdown.technical}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Keywords</p>
            <p className="text-lg font-bold text-gray-900">{analysis.breakdown.keywords}%</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Images</p>
            <p className="text-lg font-bold text-gray-900">{analysis.breakdown.images}%</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {filteredChecks.map(check => (
          <div
            key={check.id}
            className={`p-3 rounded-lg border ${
              check.status === 'pass' ? 'bg-green-50 border-green-200' :
              check.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {getStatusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{check.title}</p>
                <p className="text-xs text-gray-700 mt-1">{check.message}</p>
                {check.impact && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    check.impact === 'high' ? 'bg-red-100 text-red-700' :
                    check.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {check.impact} impact
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2 text-sm">Top Priorities:</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
