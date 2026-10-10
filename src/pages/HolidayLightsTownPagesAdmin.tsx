import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, TreePine, MapPin, Search } from 'lucide-react';
import { holidayLightsTownsData } from '../data/holidayLightsTownsData';
import { useState } from 'react';

export default function HolidayLightsTownPagesAdmin() {
  const [search, setSearch] = useState('');

  const filtered = holidayLightsTownsData.filter((town) =>
    town.name.toLowerCase().includes(search.toLowerCase()) ||
    town.slug.toLowerCase().includes(search.toLowerCase()) ||
    town.zipCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-24"></div>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/employee-dashboard/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <TreePine className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Holiday Lights Town Pages</h1>
              </div>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {holidayLightsTownsData.length} pages
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  SEO Landing Pages - Holiday Light Installation
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  These pages are indexed by search engines but not linked in the main site navigation.
                  Each targets a specific Rhode Island town for holiday light installation searches.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search towns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Town
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zip Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Neighborhoods
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Path
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((town) => (
                  <tr key={town.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">
                          {town.name}, {town.stateAbbr}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {town.zipCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {town.neighborhoods.map((n) => (
                          <span
                            key={n}
                            className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      /holiday-lights/{town.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/holiday-lights/${town.slug}/`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Page
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No towns match your search.
            </div>
          )}
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">About These Pages</h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>These are SEO "ghost pages" -- discoverable by Google, Bing, and AI tools like ChatGPT.</li>
            <li>They are NOT visible in the website navigation menus.</li>
            <li>Each page has unique, town-specific content about holiday light installation.</li>
            <li>All pages include a quote form pre-tagged with the town name for lead tracking.</li>
            <li>Pages are listed in sitemap.xml for search engine crawling.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
