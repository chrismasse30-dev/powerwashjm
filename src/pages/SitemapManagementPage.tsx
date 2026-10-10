import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Calendar, RefreshCw, Send, CheckCircle, AlertCircle, Loader2, ExternalLink, Plus, Trash2, Rocket } from 'lucide-react';

interface PageMetadata {
  id: string;
  slug: string;
  last_modified: string;
  change_frequency: string;
  priority: number;
  page_type: string;
  created_at: string;
  updated_at: string;
}

interface SubmissionResult {
  success: boolean;
  statusCode: number;
  message: string;
  urlsSubmitted: number;
  urls: string[];
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function SitemapManagementPage() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const [submitStatus, setSubmitStatus] = useState<SubmissionStatus>('idle');
  const [submitResult, setSubmitResult] = useState<SubmissionResult | null>(null);
  const [manualUrls, setManualUrls] = useState<string[]>(['']);
  const [submitHistory, setSubmitHistory] = useState<{ date: string; count: number; success: boolean }[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('page_metadata')
      .select('*')
      .order('slug');

    if (error) {
      console.error('Error fetching pages:', error);
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const updateLastModified = async (pageId: string) => {
    setUpdating(pageId);
    const { error } = await supabase
      .from('page_metadata')
      .update({ last_modified: new Date().toISOString() })
      .eq('id', pageId);

    if (error) {
      console.error('Error updating page:', error);
      alert('Failed to update page');
    } else {
      fetchPages();
    }
    setUpdating(null);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || page.page_type === filterType;
    return matchesSearch && matchesType;
  });

  const pageTypes = Array.from(new Set(pages.map(p => p.page_type)));

  const allPageUrls = pages.map(p => p.slug);

  const submitToSearchEngines = async (urls: string[]) => {
    const validUrls = urls.filter(u => u.trim().length > 0);
    if (validUrls.length === 0) {
      setSubmitStatus('error');
      setSubmitResult({ success: false, statusCode: 0, message: 'No URLs to submit', urlsSubmitted: 0, urls: [] });
      return;
    }

    setSubmitStatus('submitting');
    setSubmitResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/submit-indexnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ urls: validUrls }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: SubmissionResult = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setSubmitResult(data);
        setSubmitHistory(prev => [
          { date: new Date().toISOString(), count: data.urlsSubmitted, success: true },
          ...prev,
        ].slice(0, 10));
      } else {
        setSubmitStatus('error');
        setSubmitResult(data);
      }
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitResult({
        success: false,
        statusCode: 0,
        message: err.message || 'Failed to submit URLs',
        urlsSubmitted: 0,
        urls: [],
      });
    }
  };

  const handleSubmitAllUrls = () => {
    submitToSearchEngines(allPageUrls);
  };

  const handleSubmitManualUrls = () => {
    submitToSearchEngines(manualUrls.filter(u => u.trim()));
  };

  const addManualUrl = () => {
    setManualUrls([...manualUrls, '']);
  };

  const updateManualUrl = (index: number, value: string) => {
    setManualUrls(manualUrls.map((url, i) => (i === index ? value : url)));
  };

  const removeManualUrl = (index: number) => {
    setManualUrls(manualUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sitemap Management</h1>
          <p className="text-gray-600">
            Update last modified dates when you edit pages. The sitemap regenerates automatically on every build. Submit URLs to search engines to speed up indexing.
          </p>
        </div>

        {/* SEO URL Submission Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Submit URLs to Search Engines</h2>
              <p className="text-sm text-gray-600">
                Instantly notify Google, Bing, and other search engines about new or updated pages via IndexNow.
              </p>
            </div>
          </div>

          {submitStatus === 'success' && submitResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">URLs Submitted Successfully</h4>
                <p className="text-sm text-green-700 mt-1">{submitResult.message}</p>
                <p className="text-sm text-green-700">{submitResult.urlsSubmitted} URLs submitted to IndexNow.</p>
                <details className="mt-2">
                  <summary className="text-sm text-green-700 cursor-pointer hover:text-green-800">View submitted URLs</summary>
                  <ul className="mt-2 text-xs text-green-600 space-y-1 max-h-32 overflow-y-auto">
                    {submitResult.urls.map((url, i) => (
                      <li key={i} className="truncate">{url}</li>
                    ))}
                  </ul>
                </details>
              </div>
              <button
                onClick={() => { setSubmitStatus('idle'); setSubmitResult(null); }}
                className="text-green-400 hover:text-green-600"
              >
                ×
              </button>
            </div>
          )}

          {submitStatus === 'error' && submitResult && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Submission Failed</h4>
                <p className="text-sm text-red-700 mt-1">{submitResult.message}</p>
                {submitResult.statusCode > 0 && (
                  <p className="text-xs text-red-500 mt-1">Status code: {submitResult.statusCode}</p>
                )}
              </div>
              <button
                onClick={() => { setSubmitStatus('idle'); setSubmitResult(null); }}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Submit All URLs */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">Submit All Site URLs</h3>
                <p className="text-sm text-gray-600">
                  Submit all {allPageUrls.length} pages from your sitemap to search engines at once.
                </p>
              </div>
              <button
                onClick={handleSubmitAllUrls}
                disabled={submitStatus === 'submitting' || allPageUrls.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit All {allPageUrls.length} URLs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Manual URL Submission */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Submit Specific URLs</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter individual page URLs to submit. Use paths like <code className="text-xs bg-gray-200 px-1 rounded">/house-washing</code> or full URLs.
            </p>
            <div className="space-y-2 mb-3">
              {manualUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => updateManualUrl(index, e.target.value)}
                    placeholder="/new-page or https://powerwashjm.com/new-page"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {manualUrls.length > 1 && (
                    <button
                      onClick={() => removeManualUrl(index)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={addManualUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another URL
              </button>
              <button
                onClick={handleSubmitManualUrls}
                disabled={submitStatus === 'submitting' || manualUrls.every(u => !u.trim())}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-auto"
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit URLs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submission History */}
          {submitHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Submissions</h4>
              <div className="space-y-1">
                {submitHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded px-3 py-1.5">
                    <span className="text-gray-600">{new Date(entry.date).toLocaleString()}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-gray-700">{entry.count} URLs</span>
                      {entry.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              IndexNow is supported by Microsoft Bing, Yandex, and Naver. Google also receives notifications through the sitemap. Submissions are rate-limited per URL, so only submit when pages are new or updated.
            </p>
          </div>
        </div>

        {/* Existing Sitemap Table */}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Pages
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by URL..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Pages</option>
                {pageTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Freq
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Loading pages...
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No pages found
                    </td>
                  </tr>
                ) : (
                  filteredPages.map(page => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <a
                            href={`https://powerwashjm.com${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {page.slug}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {page.page_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(page.last_modified).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {page.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {page.change_frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => updateLastModified(page.id)}
                          disabled={updating === page.id}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-4 h-4 mr-1.5 ${updating === page.id ? 'animate-spin' : ''}`} />
                          Update Now
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How It Works</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Click "Update Now" whenever you edit a page to set its last modified date to today</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The sitemap automatically regenerates during the build process using these dates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Blog posts automatically track their own last modified dates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Search engines use these dates to prioritize crawling your updated pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
