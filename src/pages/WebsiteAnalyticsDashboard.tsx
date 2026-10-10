import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  MousePointer,
  Target,
  Globe,
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  BarChart2,
  AlertCircle,
  ExternalLink,
  Zap,
  Hand,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import { analyticsService } from '../services/analyticsService';
import { chartAnalyticsService, type ChartDataPoint, type TopPage, type DateRangeFilter } from '../services/chartAnalyticsService';
import { clarityService } from '../services/clarityService';
import AnalyticsAreaChart from '../components/charts/AnalyticsAreaChart';
import AnalyticsBarChart from '../components/charts/AnalyticsBarChart';
import TopPagesList from '../components/charts/TopPagesList';
import MetricCard from '../components/charts/MetricCard';
import ClarityRecordingsPanel from '../components/ClarityRecordingsPanel';
import type {
  GAMetrics,
  ActiveUsersTrend,
  RealTimeMetrics,
  PagePerformance,
  GeographicData,
  TrafficSource
} from '../services/analyticsService';

type DateRangePreset = '7d' | '30d' | '90d' | 'custom';

export default function WebsiteAnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangePreset>('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'charts'>('overview');

  const [chartDateFilter, setChartDateFilter] = useState<DateRangeFilter>('week');
  const [chartLoading, setChartLoading] = useState(false);
  const [uniqueVisitorsData, setUniqueVisitorsData] = useState<ChartDataPoint[]>([]);
  const [pageviewsData, setPageviewsData] = useState<ChartDataPoint[]>([]);
  const [bandwidthData, setBandwidthData] = useState<ChartDataPoint[]>([]);
  const [topPagesChart, setTopPagesChart] = useState<TopPage[]>([]);

  const [gaMetrics, setGaMetrics] = useState<GAMetrics | null>(null);
  const [activeUsersTrend, setActiveUsersTrend] = useState<ActiveUsersTrend[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [topPages, setTopPages] = useState<PagePerformance[]>([]);
  const [geoData, setGeoData] = useState<GeographicData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);



  const [sortConfig, setSortConfig] = useState<{ key: keyof PagePerformance; direction: 'asc' | 'desc' }>({
    key: 'views',
    direction: 'desc'
  });

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }
    if (viewMode === 'overview') {
      fetchAllData();
    } else {
      fetchChartData();
    }
  }, [user, navigate, dateRange, viewMode, chartDateFilter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getDateRangeFromPreset = (): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate)
          };
        }
        start.setDate(end.getDate() - 7);
        break;
    }

    return { start, end };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const range = getDateRangeFromPreset();

      const [
        gaData,
        trendData,
        realtimeData,
        pagesData,
        geoDataResult,
        sourcesData
      ] = await Promise.all([
        analyticsService.getExecutiveKPIs(range),
        analyticsService.getActiveUsersTrend(range),
        analyticsService.getRealTimeMetrics(),
        analyticsService.getTopPages(range),
        analyticsService.getGeographicData(range),
        analyticsService.getTrafficSources(range)
      ]);

      setGaMetrics(gaData);
      setActiveUsersTrend(trendData);
      setRealTimeMetrics(realtimeData);
      setTopPages(pagesData);
      setGeoData(geoDataResult);
      setTrafficSources(sourcesData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchRealTimeData = async () => {
    try {
      const realtimeData = await analyticsService.getRealTimeMetrics();
      setRealTimeMetrics(realtimeData);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const [visitors, pageviews, bandwidth, topPages] = await Promise.all([
        chartAnalyticsService.getUniqueVisitors(chartDateFilter),
        chartAnalyticsService.getPageviews(chartDateFilter),
        chartAnalyticsService.getBandwidth(chartDateFilter),
        chartAnalyticsService.getTopPages(chartDateFilter)
      ]);

      setUniqueVisitorsData(visitors);
      setPageviewsData(pageviews);
      setBandwidthData(bandwidth);
      setTopPagesChart(topPages);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const handleSort = (key: keyof PagePerformance) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedPages = [...topPages].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    return aValue < bValue ? -direction : direction;
  });

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <ReturnToDashboardButton />

      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Website Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Google Analytics insights for J & M Power Washing</p>
            </div>

<div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('charts')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    viewMode === 'charts'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Charts
                </button>
              </div>

              {viewMode === 'overview' ? (
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRangePreset)}
                    className="text-sm border-none focus:ring-0 bg-transparent cursor-pointer"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => setChartDateFilter('day')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      chartDateFilter === 'day'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setChartDateFilter('week')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      chartDateFilter === 'week'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setChartDateFilter('month')}
                    className={`px-4 py-2 text-sm transition-colors ${
                      chartDateFilter === 'month'
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Month
                  </button>
                </div>
              )}

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  autoRefresh
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="text-sm">Auto-refresh</span>
              </button>

              <button
                onClick={viewMode === 'overview' ? fetchAllData : fetchChartData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {viewMode === 'overview' && dateRange === 'custom' && (
            <div className="flex gap-3 mb-6">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {viewMode === 'overview' ? (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285F4"/>
                      <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#34A853"/>
                      <path d="M12 12V22" stroke="#FBBC04" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Google Analytics Data</h2>
                    <p className="text-sm text-gray-600">Real-time data from Google Analytics 4</p>
                  </div>
                </div>
              </div>

          {gaMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-600">Total Active Users</h3>
                  </div>
                  {gaMetrics.activeUsersChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{gaMetrics.activeUsers.toLocaleString()}</p>
                <p className={`text-sm mt-1 ${gaMetrics.activeUsersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gaMetrics.activeUsersChange >= 0 ? '+' : ''}{gaMetrics.activeUsersChange}% from previous period
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-orange-600" />
                    <h3 className="text-sm font-medium text-gray-600">Total Event Count</h3>
                  </div>
                  {gaMetrics.totalEventsChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{gaMetrics.totalEvents.toLocaleString()}</p>
                <p className={`text-sm mt-1 ${gaMetrics.totalEventsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gaMetrics.totalEventsChange >= 0 ? '+' : ''}{gaMetrics.totalEventsChange}% from previous period
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-medium text-gray-600">Total Key Events</h3>
                  </div>
                  {gaMetrics.keyEventsChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{gaMetrics.keyEvents.toLocaleString()}</p>
                <p className={`text-sm mt-1 ${gaMetrics.keyEventsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gaMetrics.keyEventsChange >= 0 ? '+' : ''}{gaMetrics.keyEventsChange}% from previous period
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Users Trend</h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="h-64">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={activeUsersTrend.map((item, i) => {
                      const x = (i / (activeUsersTrend.length - 1)) * 600;
                      const maxUsers = Math.max(...activeUsersTrend.map(d => d.users));
                      const y = 200 - (item.users / maxUsers) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </svg>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  {activeUsersTrend.map((item, i) => i % Math.ceil(activeUsersTrend.length / 7) === 0 && (
                    <span key={item.date}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  ))}
                </div>
              </div>
            </div>

            {realTimeMetrics && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Real-Time Monitoring</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Active Users (Last 30 Minutes)</p>
                  <p className="text-4xl font-bold text-gray-900">{realTimeMetrics.activeUsersNow}</p>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active Users Per Minute</p>
                </div>
                <div className="h-40 relative">
                  <div className="absolute inset-0 flex items-end justify-between gap-0.5">
                    {realTimeMetrics.minuteByMinute.slice(-30).map((item, i) => {
                      const maxUsers = Math.max(...realTimeMetrics.minuteByMinute.map(d => d.users), 1);
                      const height = Math.max((item.users / maxUsers) * 100, 2);
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-blue-600 rounded-t transition-all hover:bg-blue-700 cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`${item.minute} min ago: ${item.users} users`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>-30 min</span>
                  <span>-15 min</span>
                  <span>Now</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Pages</h3>
              <button
                onClick={() => exportToCSV(topPages, 'top_pages')}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      onClick={() => handleSort('pageTitle')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Page Title
                    </th>
                    <th
                      onClick={() => handleSort('views')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Views
                    </th>
                    <th
                      onClick={() => handleSort('uniqueViews')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Unique Views
                    </th>
                    <th
                      onClick={() => handleSort('avgTime')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Avg. Time (s)
                    </th>
                    <th
                      onClick={() => handleSort('bounceRate')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                    >
                      Bounce Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPages.map((page, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{page.pageTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{page.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{page.uniqueViews.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{page.avgTime}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{page.bounceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                {geoData.map((country, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900">{country.country}</span>
                      <span className="text-gray-600">{country.users.toLocaleString()} ({country.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Traffic Acquisition</h3>
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="space-y-3">
                {trafficSources.map((source, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900">{source.source}</span>
                      <span className="text-gray-600">{source.sessions.toLocaleString()} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
                <MousePointer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Microsoft Clarity</h2>
                <p className="text-sm text-gray-600">Session recordings and behavior analysis</p>
              </div>
              <a
                href={clarityService.getClarityDashboardUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm">Open Clarity Dashboard</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">View Real-Time Analytics in Clarity</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Microsoft Clarity provides detailed metrics including session counts, heatmaps, dead clicks, rage clicks, and user behavior patterns.
                  Click "Open Clarity Dashboard" above to view your complete analytics.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={clarityService.getClarityDashboardUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={clarityService.getHeatmapUrl('/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Heatmaps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={clarityService.getRecordingsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    All Recordings
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <ClarityRecordingsPanel projectId={import.meta.env.VITE_CLARITY_PROJECT_ID || 'tns4bwvo1r'} />
          </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
                <p className="text-gray-400 text-sm">View usage metrics for this project.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricCard
                  title="Unique Visitors"
                  subtitle={`Sep 9 to Oct 10, 2025`}
                  tooltip="Number of unique visitors to your site"
                  loading={chartLoading}
                >
                  <AnalyticsAreaChart data={uniqueVisitorsData} color="#3b82f6" />
                </MetricCard>

                <MetricCard
                  title="Pageviews"
                  subtitle={`Sep 9 to Oct 10, 2025`}
                  tooltip="Total number of page views"
                  loading={chartLoading}
                >
                  <AnalyticsAreaChart data={pageviewsData} color="#3b82f6" />
                </MetricCard>

                <MetricCard
                  title="Bandwidth"
                  subtitle={`Sep 9 to Oct 10, 2025`}
                  tooltip="Total bandwidth usage"
                  loading={chartLoading}
                >
                  <AnalyticsBarChart
                    data={bandwidthData}
                    color="#3b82f6"
                    formatValue={(value) => `${value} MB`}
                  />
                </MetricCard>

                <MetricCard
                  title="Top pages"
                  subtitle={`Most visited pages`}
                  tooltip="Pages with the most views"
                  loading={chartLoading}
                >
                  <TopPagesList pages={topPagesChart} />
                </MetricCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
