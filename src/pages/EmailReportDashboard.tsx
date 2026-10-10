import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Calendar, User, Building2, MapPin, Phone, CheckCircle, ExternalLink, RefreshCw, MousePointer, Eye, AlertTriangle, XCircle, TrendingUp, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

interface EmailRecord {
  id: string;
  name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  customer_estimate_sent: boolean;
  customer_estimate_sent_at: string | null;
  form_confirmation_sent: boolean;
  form_confirmation_sent_at: string | null;
  design_image_url: string | null;
  second_design_image_url: string | null;
  created_at: string;
}

interface EmailEvent {
  id: string;
  event_type: string;
  created_at: string;
  email_address: string | null;
  user_agent: string | null;
  click_url: string | null;
  bounce_type: string | null;
  bounce_reason: string | null;
  email_provider: string | null;
  quote_id?: string;
}

interface EmailRecordWithEvents extends EmailRecord {
  events: EmailEvent[];
  total_opens: number;
  total_clicks: number;
  has_bounced: boolean;
  last_opened_at: string | null;
}

// Internal email addresses to exclude from customer tracking metrics
const INTERNAL_EMAILS = [
  'chrismasse30@gmail.com',
  'sales@powerwashjm.com',
  'info@powerwashjm.com',
  'admin@powerwashjm.com'
];

const isInternalEmail = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return INTERNAL_EMAILS.some(internalEmail =>
    normalizedEmail === internalEmail.toLowerCase()
  );
};

export default function EmailReportDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emails, setEmails] = useState<EmailRecordWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24' | '48' | '72' | '7' | '30' | '90' | 'all'>('all');
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>(['Needs Measure', 'Measured', 'Quoted', 'Sold']);
  const [limit, setLimit] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/employee-login');
      return;
    }
    fetchEmailReport();
  }, [user, navigate, timeRange]);

  const fetchEmailReport = async (loadMore: boolean = false) => {
    if (!loadMore) {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch only required columns for better performance
      let query = supabase
        .from('quote_submissions')
        .select('id, name, business_name, email, phone, address, city, state, status, customer_estimate_sent, customer_estimate_sent_at, form_confirmation_sent, form_confirmation_sent_at, design_image_url, second_design_image_url, created_at', { count: 'exact' })
        .eq('deleted', false)
        .or('customer_estimate_sent.eq.true,form_confirmation_sent.eq.true');

      if (timeRange !== 'all') {
        const hoursAgo = parseInt(timeRange);
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - hoursAgo);

        // Filter by either email sent date
        query = query.or(
          `customer_estimate_sent_at.gte.${cutoffDate.toISOString()},form_confirmation_sent_at.gte.${cutoffDate.toISOString()}`
        );
      }

      // Add pagination for faster initial load
      const currentLimit = loadMore ? limit + 50 : limit;
      const { data: quotes, error: queryError, count } = await query
        .order('created_at', { ascending: false })
        .limit(currentLimit);

      setHasMore(count ? count > currentLimit : false);

      if (queryError) throw queryError;

      // Fetch only essential event data for better performance
      const quoteIds = (quotes || []).map(q => q.id);

      let allEvents: EmailEvent[] = [];
      if (quoteIds.length > 0) {
        // Only fetch essential columns - skip user_agent, email_provider for initial load
        const { data: eventsData } = await supabase
          .from('email_tracking_events')
          .select('id, event_type, created_at, email_address, quote_id, bounce_type, click_url')
          .in('quote_id', quoteIds)
          .order('created_at', { ascending: false });

        allEvents = eventsData || [];
      }

      // Group events by quote_id for fast lookup
      const eventsByQuote = new Map<string, EmailEvent[]>();
      allEvents.forEach(event => {
        if (!eventsByQuote.has(event.quote_id)) {
          eventsByQuote.set(event.quote_id, []);
        }
        eventsByQuote.get(event.quote_id)!.push(event);
      });

      // Now enrich quotes with their events (optimized for performance)
      const enrichedEmails = (quotes || []).map((quote) => {
        const events = eventsByQuote.get(quote.id) || [];

        // Single-pass filtering to count events and find relevant data
        let total_opens = 0;
        let total_clicks = 0;
        let latestBounce: EmailEvent | null = null;
        let latestDelivery: EmailEvent | null = null;
        let last_opened_at: string | null = null;

        const emailEvents: EmailEvent[] = [];

        for (const event of events) {
          // Skip internal emails
          if (event.email_address && isInternalEmail(event.email_address)) {
            continue;
          }

          emailEvents.push(event);

          // Count and track in single pass
          const eventType = event.event_type;
          if (eventType === 'open' || eventType === 'opened') {
            total_opens++;
            if (!last_opened_at) last_opened_at = event.created_at;
          } else if (eventType === 'click' || eventType === 'clicked') {
            total_clicks++;
          } else if (eventType === 'soft_bounce' || eventType === 'hard_bounce' || eventType === 'bounce') {
            if (!latestBounce) latestBounce = event;
          } else if (eventType === 'delivered') {
            if (!latestDelivery) latestDelivery = event;
          }
        }

        // Check bounce status (optimized)
        let has_bounced = false;
        if (latestBounce && latestDelivery) {
          has_bounced = new Date(latestBounce.created_at) > new Date(latestDelivery.created_at);
        } else if (latestBounce) {
          has_bounced = true;
        }

        return {
          ...quote,
          events: emailEvents,
          total_opens,
          total_clicks,
          has_bounced,
          last_opened_at
        } as EmailRecordWithEvents;
      });

      if (loadMore) {
        setEmails(enrichedEmails);
        setLimit(currentLimit);
      } else {
        setEmails(enrichedEmails);
      }
    } catch (err) {
      console.error('Error fetching email report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load email report');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="text-gray-600">Loading email report...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <ReturnToDashboardButton />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Mail className="w-8 h-8 text-green-600" />
                Email Report Dashboard
              </h1>
              <p className="text-gray-600">All customer emails with real-time tracking (estimates, confirmations, and follow-ups)</p>
            </div>
            <button
              onClick={fetchEmailReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <div className="flex flex-wrap gap-3">
            {[
              { value: '24', label: 'Last 24 Hours' },
              { value: '48', label: 'Last 48 Hours' },
              { value: '72', label: 'Last 72 Hours' },
              { value: '7', label: 'Last 7 Days' },
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-3">
              {['Needs Measure', 'Measured', 'Quoted', 'Sold', 'Lost'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    if (statusFilter.includes(status)) {
                      setStatusFilter(statusFilter.filter(s => s !== status));
                    } else {
                      setStatusFilter([...statusFilter, status]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
                    statusFilter.includes(status)
                      ? status === 'Needs Measure' ? 'bg-yellow-600 text-white border-yellow-600'
                      : status === 'Measured' ? 'bg-blue-600 text-white border-blue-600'
                      : status === 'Quoted' ? 'bg-purple-600 text-white border-purple-600'
                      : status === 'Sold' ? 'bg-green-600 text-white border-green-600'
                      : 'bg-red-600 text-white border-red-600'
                      : status === 'Needs Measure' ? 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50'
                      : status === 'Measured' ? 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                      : status === 'Quoted' ? 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                      : status === 'Sold' ? 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                      : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing {emails.filter(e => statusFilter.includes(e.status || '')).length} of {emails.length} emails
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Filtered Emails</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emails.filter(e => statusFilter.includes(e.status || '')).length}
                  <span className="text-sm text-gray-500 font-normal ml-1">/ {emails.length}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Opens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emails.filter(e => statusFilter.includes(e.status || '')).reduce((sum, e) => sum + e.total_opens, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emails.filter(e => statusFilter.includes(e.status || '')).reduce((sum, e) => sum + e.total_clicks, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const filtered = emails.filter(e => statusFilter.includes(e.status || ''));
                    return filtered.length > 0 ? Math.round((filtered.filter(e => e.total_opens > 0).length / filtered.length) * 100) : 0;
                  })()}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bounced Emails</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emails.filter(e => statusFilter.includes(e.status || '') && e.has_bounced).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Email List */}
        {emails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Emails Sent</h3>
            <p className="text-gray-600">
              No customer emails have been sent in the selected time range.
            </p>
          </div>
        ) : emails.filter(email => statusFilter.includes(email.status || '')).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Emails Match Filter</h3>
            <p className="text-gray-600">
              No emails match the selected status filters. Try selecting different statuses above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.filter(email => statusFilter.includes(email.status || '')).map((email) => (
              <div
                key={email.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {email.business_name ? (
                          <>
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">
                              {email.business_name}
                            </h3>
                          </>
                        ) : (
                          <>
                            <User className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-900">
                              {email.name}
                            </h3>
                          </>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          email.status === 'Needs Measure' ? 'bg-yellow-100 text-yellow-800'
                          : email.status === 'Measured' ? 'bg-blue-100 text-blue-800'
                          : email.status === 'Quoted' ? 'bg-purple-100 text-purple-800'
                          : email.status === 'Sold' ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                          {email.status}
                        </span>
                        {email.form_confirmation_sent && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Form Confirmed
                          </span>
                        )}
                        {email.customer_estimate_sent && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Estimate Sent
                          </span>
                        )}
                      </div>
                      {email.business_name && (
                        <p className="text-sm text-gray-600 ml-8">Contact: {email.name}</p>
                      )}
                    </div>

                    <a
                      href={`/quickmeasure?quoteId=${email.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View in QuickMeasure
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${email.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {email.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${email.phone}`}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        {email.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {email.address}
                        {email.city && email.state && `, ${email.city}, ${email.state}`}
                      </span>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Opens</p>
                        <p className="text-lg font-bold text-gray-900">{email.total_opens}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Clicks</p>
                        <p className="text-lg font-bold text-gray-900">{email.total_clicks}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {email.has_bounced ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-semibold ${
                          email.has_bounced ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {email.has_bounced ? 'Bounced' : 'Delivered'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Last Opened</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {email.last_opened_at ? getTimeSince(email.last_opened_at) : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp - Show both form confirmation and estimate if both sent */}
                  <div className="border-t pt-4 space-y-2">
                    {email.form_confirmation_sent && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Form Confirmation:</span>
                        <span>{formatDateTime(email.form_confirmation_sent_at!)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">
                          {getTimeSince(email.form_confirmation_sent_at!)}
                        </span>
                      </div>
                    )}
                    {email.customer_estimate_sent && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Estimate Sent:</span>
                        <span>{formatDateTime(email.customer_estimate_sent_at!)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">
                          {getTimeSince(email.customer_estimate_sent_at!)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Details Toggle */}
                  {email.events.length > 0 && (
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedEmails);
                        if (newExpanded.has(email.id)) {
                          newExpanded.delete(email.id);
                        } else {
                          newExpanded.add(email.id);
                        }
                        setExpandedEmails(newExpanded);
                      }}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      {expandedEmails.has(email.id) ? '▼' : '▶'} View {email.events.length} Event{email.events.length !== 1 ? 's' : ''}
                    </button>
                  )}

                  {/* Expanded Event List */}
                  {expandedEmails.has(email.id) && email.events.length > 0 && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Email Activity Log</h4>
                      {email.events.map((event) => (
                        <div key={event.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {(event.event_type === 'open' || event.event_type === 'opened') && <Eye className="w-4 h-4 text-blue-600" />}
                              {(event.event_type === 'click' || event.event_type === 'clicked') && <MousePointer className="w-4 h-4 text-purple-600" />}
                              {(event.event_type === 'soft_bounce' || event.event_type === 'hard_bounce' || event.event_type === 'bounce') && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              {event.event_type === 'delivered' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {event.event_type === 'blocked' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                              {event.event_type === 'spam' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                              {event.event_type === 'queued' && <CheckCircle className="w-4 h-4 text-gray-600" />}
                              <span className="font-medium text-gray-900 capitalize">
                                {event.event_type.replace('_', ' ')}
                              </span>
                              {event.email_provider && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  {event.email_provider}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500">
                              {formatDateTime(event.created_at)}
                            </span>
                          </div>
                          {event.click_url && (
                            <p className="text-gray-600 ml-6">URL: {event.click_url}</p>
                          )}
                          {event.bounce_reason && (
                            <p className="text-red-600 ml-6">Reason: {event.bounce_reason}</p>
                          )}
                          {event.user_agent && (
                            <p className="text-gray-500 ml-6 text-xs truncate">Device: {event.user_agent}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Design Images Indicator */}
                  {(email.design_image_url || email.second_design_image_url) && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>
                        Included {email.design_image_url && email.second_design_image_url ? '2' : '1'} design image(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchEmailReport(true)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : `Load More (Showing ${emails.length})`}
            </button>
          </div>
        )}

        {/* Footer Note */}
        {emails.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This report shows all customer emails (QuickMeasure estimates, form confirmations, and follow-ups) with real-time
                tracking powered by email webhooks. All opens, clicks, and bounces are captured automatically. Showing {emails.length} most recent emails.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>✅ Email Tracking Active:</strong> All email events (opens, clicks, bounces) from ZeptoMail and MailJet
                are being tracked in real-time. Engagement data updates automatically when customers interact with emails.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
