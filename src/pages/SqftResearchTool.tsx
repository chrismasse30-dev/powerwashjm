import React, { useState } from 'react';
import { ArrowLeft, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

interface SearchResult {
  address: string;
  sqft: number;
  source?: string;
}

export default function SqftResearchTool() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxAttempts = 5;

  const performSearch = async (addressToSearch: string, attempt: number = 1): Promise<void> => {
    setCurrentAttempt(attempt);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sqft-lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: addressToSearch })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.sqft && data.sqft > 0) {
        setResult({
          address: addressToSearch,
          sqft: data.sqft,
          source: data.source
        });
        setError(null);
        setLoading(false);
      } else {
        throw new Error('No square footage data found');
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err);

      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        await performSearch(addressToSearch, attempt + 1);
      } else {
        setError(`Unable to find square footage data after ${maxAttempts} attempts. Please verify the address and try again.`);
        setLoading(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setCurrentAttempt(0);

    await performSearch(address.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/employee-dashboard')}
        className="fixed top-24 right-6 z-50 bg-blue-900 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-3xl mx-auto pt-32">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Address Square Footage Research Tool
          </h1>
          <p className="text-gray-600">
            Enter a US address to get estimated property square footage
          </p>
        </div>

        {/* Main Tool Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Input Section */}
          <div className="mb-6">
            <label htmlFor="addressInput" className="block text-sm font-medium text-gray-700 mb-2">
              Property Address
            </label>
            <input
              type="text"
              id="addressInput"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter full address (e.g., 123 Main St, Springfield, MA 01001)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={loading}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Square Footage
          </button>

          {/* Loading State */}
          {loading && (
            <div className="mt-6 text-center">
              <Loader className="inline-block animate-spin h-8 w-8 text-blue-600" />
              <p className="mt-3 text-gray-600">Searching property data...</p>
              <p className="text-sm text-gray-500 mt-1">
                Attempt {currentAttempt} of {maxAttempts}
              </p>
            </div>
          )}

          {/* Results Section */}
          {(result || error) && !loading && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>

              {/* Success Result */}
              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-green-900">Property Found</h3>
                      <p className="mt-2 text-gray-700">
                        <span className="font-medium">Address:</span>
                        <span className="ml-2">{result.address}</span>
                      </p>
                      <p className="mt-2 text-gray-700">
                        <span className="font-medium">Square Footage:</span>
                        <span className="ml-2 text-2xl font-bold text-blue-600">
                          {result.sqft.toLocaleString()} sq ft
                        </span>
                      </p>
                      {result.source && (
                        <div className="mt-4">
                          <a
                            href={result.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            View Data Source
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Result */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-red-900">Search Failed</h3>
                      <p className="mt-2 text-gray-700">{error}</p>
                      <button
                        onClick={handleSearch}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Enter a complete US address including street, city, state, and ZIP code</li>
            <li>Click "Search Square Footage" to begin the search</li>
            <li>The tool will automatically retry up to 5 times if needed</li>
            <li>Results include estimated square footage and data source</li>
          </ul>
        </div>
      </div>
      <ReturnToDashboardButton />
    </div>
  );
}
