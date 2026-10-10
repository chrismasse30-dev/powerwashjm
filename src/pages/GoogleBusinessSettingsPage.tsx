import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Home, AlertCircle, CheckCircle2, RefreshCw, Save, Eye, EyeOff, Trash2, CheckSquare, Square, Star, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import GBPPhotoManager from '../components/GBPPhotoManager';

interface GoogleBusinessSettingsData {
  id?: string;
  account_id: string;
  location_id: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
  access_token: string;
  token_expires_at: string | null;
  is_enabled: boolean;
  last_token_refresh: string | null;
  auto_post_enabled: boolean;
  auto_reply_reviews: boolean;
}

interface GoogleBusinessPostLog {
  id: string;
  post_type: string;
  source_title: string;
  source_url: string | null;
  gbp_post_id: string | null;
  status: string;
  error_message: string | null;
  posted_at: string | null;
  post_content: string | null;
  created_at: string;
}

interface GoogleBusinessReview {
  id: string;
  gbp_review_id: string;
  reviewer_name: string;
  reviewer_profile_url: string | null;
  star_rating: number;
  review_text: string | null;
  review_reply: string | null;
  reply_posted_at: string | null;
  review_created_at: string;
  is_responded: boolean;
}

export default function GoogleBusinessSettingsPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GoogleBusinessSettingsData>({
    account_id: '',
    location_id: '',
    client_id: '',
    client_secret: '',
    refresh_token: '',
    access_token: '',
    token_expires_at: null,
    is_enabled: false,
    last_token_refresh: null,
    auto_post_enabled: false,
    auto_reply_reviews: false,
  });

  const [postLogs, setPostLogs] = useState<GoogleBusinessPostLog[]>([]);
  const [reviews, setReviews] = useState<GoogleBusinessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'posts' | 'reviews' | 'photos'>('settings');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/employee-login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadSettings();
      loadPostLogs();
      loadReviews();
    }
  }, [user, isAdmin]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('google_business_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          account_id: data.account_id || '',
          location_id: data.location_id || '',
          client_id: data.client_id || '',
          client_secret: data.client_secret || '',
          refresh_token: data.refresh_token || '',
          access_token: data.access_token || '',
          token_expires_at: data.token_expires_at,
          is_enabled: data.is_enabled || false,
          last_token_refresh: data.last_token_refresh,
          auto_post_enabled: data.auto_post_enabled || false,
          auto_reply_reviews: data.auto_reply_reviews || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadPostLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('google_business_post_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPostLogs(data || []);
    } catch (error) {
      console.error('Error loading post logs:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('google_business_reviews')
        .select('*')
        .order('review_created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('google_business_settings')
          .update({
            account_id: settings.account_id,
            location_id: settings.location_id,
            client_id: settings.client_id,
            client_secret: settings.client_secret,
            refresh_token: settings.refresh_token,
            access_token: settings.access_token,
            is_enabled: settings.is_enabled,
            auto_post_enabled: settings.auto_post_enabled,
            auto_reply_reviews: settings.auto_reply_reviews,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('google_business_settings')
          .insert({
            account_id: settings.account_id,
            location_id: settings.location_id,
            client_id: settings.client_id,
            client_secret: settings.client_secret,
            refresh_token: settings.refresh_token,
            access_token: settings.access_token,
            is_enabled: settings.is_enabled,
            auto_post_enabled: settings.auto_post_enabled,
            auto_reply_reviews: settings.auto_reply_reviews,
          });

        if (error) throw error;
      }

      showMessage('success', 'Settings saved successfully!');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };


  const handleSyncReviews = async () => {
    setSyncingReviews(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-gbp-reviews`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to sync reviews');
      }

      showMessage('success', `Synced ${result.count || 0} reviews from Google`);
      await loadReviews();
    } catch (error) {
      console.error('Error syncing reviews:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to sync reviews');
    } finally {
      setSyncingReviews(false);
    }
  };

  const handleReplyToReview = async (reviewId: string, gbpReviewId: string) => {
    const reply = replyText[reviewId];
    if (!reply || !reply.trim()) {
      showMessage('error', 'Please enter a reply');
      return;
    }

    setSendingReply(reviewId);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reply-to-gbp-review`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reviewId: gbpReviewId, reply }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to post reply');
      }

      showMessage('success', 'Reply posted successfully!');
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      await loadReviews();
    } catch (error) {
      console.error('Error posting reply:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to post reply');
    } finally {
      setSendingReply(null);
    }
  };

  const handleCheckAll = () => {
    setSelectedLogs(new Set(postLogs.map(log => log.id)));
  };

  const handleUncheckAll = () => {
    setSelectedLogs(new Set());
  };

  const handleToggleLog = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedLogs.size === 0) {
      showMessage('error', 'Please select posts to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedLogs.size} post(s)?`)) {
      return;
    }

    setDeleting(true);
    const selectedCount = selectedLogs.size;
    const selectedIds = Array.from(selectedLogs);

    try {
      setPostLogs(prevLogs => prevLogs.filter(log => !selectedIds.includes(log.id)));
      setSelectedLogs(new Set());

      const { error } = await supabase
        .from('google_business_post_logs')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      showMessage('success', `Deleted ${selectedCount} post(s) successfully`);
    } catch (error) {
      console.error('Error deleting posts:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to delete posts');
      await loadPostLogs();
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshLogs = async () => {
    await loadPostLogs();
    showMessage('success', 'Posts refreshed');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/employee-login');
  };

  const getTokenStatus = () => {
    if (!settings.access_token) {
      return { color: 'text-gray-500', text: 'Not configured' };
    }

    if (!settings.token_expires_at) {
      return { color: 'text-green-600', text: 'Active' };
    }

    const expiresAt = new Date(settings.token_expires_at);
    const now = new Date();
    const msUntilExpiry = expiresAt.getTime() - now.getTime();
    const minutesUntilExpiry = Math.floor(msUntilExpiry / (1000 * 60));
    const hoursUntilExpiry = Math.floor(minutesUntilExpiry / 60);

    if (msUntilExpiry < 0) {
      return { color: 'text-red-600', text: 'Expired - Please refresh token' };
    } else if (minutesUntilExpiry < 60) {
      return { color: 'text-orange-600', text: `Expires in ${minutesUntilExpiry} minute(s)` };
    } else if (hoursUntilExpiry < 2) {
      const remainingMinutes = minutesUntilExpiry % 60;
      return { color: 'text-orange-600', text: `Expires in ${hoursUntilExpiry}h ${remainingMinutes}m` };
    } else {
      return { color: 'text-green-600', text: `Expires in ${hoursUntilExpiry} hour(s)` };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const tokenStatus = getTokenStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-24"></div>
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Google Business Profile</h1>
              <p className="text-blue-200 mt-1">J & M Power Washing</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <Link
                to="/"
                className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <ReturnToDashboardButton />
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Posts ({postLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'photos'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Photos
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Your Google Business Profile</h3>
                  <div className="space-y-2 text-blue-50">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Business Name:</span> J & M Power Washing
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Location ID:</span> 5504656431427208801
                    </p>
                    <a
                      href="https://share.google/b6RmMst7gKWU4ApiX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      View Your GBP Listing
                    </a>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Google Cloud Console</a></li>
                    <li>Create a new project or select existing one</li>
                    <li>Enable the "Google My Business API"</li>
                    <li>Create OAuth 2.0 credentials (Web application)</li>
                    <li>Add redirect URI: <code className="bg-yellow-100 px-2 py-1 rounded">https://powerwashjm.com/google-business-callback</code></li>
                    <li>Copy your Client ID and Client Secret below</li>
                    <li>Click "Authorize with Google" to connect your account</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.is_enabled}
                        onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">Enable Integration</span>
                        <p className="text-sm text-gray-600">Connect to Google Business Profile</p>
                      </div>
                    </label>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${
                    settings.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {settings.is_enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account ID <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.account_id}
                      onChange={(e) => setSettings({ ...settings, account_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave blank if unsure"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only needed for managing multiple locations</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location ID
                    </label>
                    <input
                      type="text"
                      value={settings.location_id || '5504656431427208801'}
                      onChange={(e) => setSettings({ ...settings, location_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5504656431427208801"
                    />
                    <p className="text-xs text-gray-500 mt-1">This is your Google Business Profile location ID</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      OAuth Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.client_id}
                      onChange={(e) => setSettings({ ...settings, client_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Google OAuth Client ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      OAuth Client Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showClientSecret ? 'text' : 'password'}
                        value={settings.client_secret}
                        onChange={(e) => setSettings({ ...settings, client_secret: e.target.value })}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Client Secret"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_post_enabled}
                        onChange={(e) => setSettings({ ...settings, auto_post_enabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">Auto-Post Blog Posts</span>
                        <p className="text-sm text-gray-600">Automatically share new blog posts to Google Business Profile</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_reply_reviews}
                        onChange={(e) => setSettings({ ...settings, auto_reply_reviews: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">Auto-Reply to Reviews</span>
                        <p className="text-sm text-gray-600">Automatically respond to new reviews (5-star only)</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <div className={`px-4 py-3 border rounded-lg ${tokenStatus.color === 'text-gray-500' ? 'bg-gray-50 border-gray-300' : tokenStatus.color === 'text-green-600' ? 'bg-green-50 border-green-300' : tokenStatus.color === 'text-orange-600' ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-300'}`}>
                    <span className={`font-semibold ${tokenStatus.color}`}>Token Status: {tokenStatus.text}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth Authorization</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to authorize with Google Business Profile. Make sure you have saved your Client ID and Client Secret first.
                  </p>
                  <div className="space-y-4">
                    {settings.client_id ? (
                      <a
                        href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${settings.client_id}&redirect_uri=https://powerwashjm.com/google-business-callback&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Authorize with Google
                      </a>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Please save your OAuth Client ID and Client Secret before authorizing.
                        </p>
                      </div>
                    )}

                    {settings.last_token_refresh && (
                      <p className="text-sm text-gray-600">
                        Last refreshed: {new Date(settings.last_token_refresh).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Activity</h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Google API Limitation</h4>
                      <p className="text-sm text-yellow-800 mb-2">
                        Google deprecated the Local Posts API in 2021. Text posts can no longer be created programmatically.
                        You can still post photos from the Photos tab.
                      </p>
                      <a
                        href="https://business.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Create posts manually on Google Business →
                      </a>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Post History</h3>

                {postLogs.length > 0 && (
                  <div className="mb-4 flex items-center gap-3 pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-600">
                      Total: {postLogs.length} | Selected: {selectedLogs.size}
                    </span>
                    <button
                      onClick={handleCheckAll}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Check All
                    </button>
                    <button
                      onClick={handleUncheckAll}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      Uncheck All
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedLogs.size === 0 || deleting}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : 'Delete Selected'}
                    </button>
                    <button
                      onClick={handleRefreshLogs}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                )}

                {postLogs.length === 0 ? (
                  <p className="text-gray-600">No posts yet</p>
                ) : (
                  <div className="space-y-3">
                    {postLogs.map((log) => (
                      <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedLogs.has(log.id)}
                            onChange={() => handleToggleLog(log.id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                    {log.post_type}
                                  </span>
                                  <h3 className="font-semibold text-gray-900">{log.source_title}</h3>
                                </div>
                                {log.source_url && (
                                  <a
                                    href={log.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {log.source_url}
                                  </a>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(log.status)}`}>
                                {log.status.toUpperCase()}
                              </span>
                            </div>
                            {log.post_content && (
                              <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                {log.post_content}
                              </p>
                            )}
                            {log.error_message && (
                              <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded">
                                {log.error_message}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  <button
                    onClick={handleSyncReviews}
                    disabled={syncingReviews}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingReviews ? 'animate-spin' : ''}`} />
                    {syncingReviews ? 'Syncing...' : 'Sync Reviews'}
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet. Click "Sync Reviews" to fetch from Google.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(review.star_rating)}
                              <span className="text-sm text-gray-600 ml-2">
                                {new Date(review.review_created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {review.is_responded && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                              Replied
                            </span>
                          )}
                        </div>

                        {review.review_text && (
                          <p className="text-gray-700 mb-3">{review.review_text}</p>
                        )}

                        {review.review_reply ? (
                          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-900">Your Reply:</span>
                            </div>
                            <p className="text-sm text-blue-900">{review.review_reply}</p>
                            {review.reply_posted_at && (
                              <p className="text-xs text-blue-700 mt-1">
                                Replied on {new Date(review.reply_posted_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={replyText[review.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                              placeholder="Write your reply..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                            <button
                              onClick={() => handleReplyToReview(review.id, review.gbp_review_id)}
                              disabled={sendingReply === review.id || !replyText[review.id]?.trim()}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              {sendingReply === review.id ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Post Photos to Google Business Profile</h2>
                <GBPPhotoManager
                  onSuccess={(msg) => showMessage('success', msg)}
                  onError={(msg) => showMessage('error', msg)}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
