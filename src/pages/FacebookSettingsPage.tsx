import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Home, Facebook, AlertCircle, CheckCircle2, RefreshCw, Save, Eye, EyeOff, RotateCw, Trash2, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';

interface FacebookSettingsData {
  id?: string;
  facebook_page_id: string;
  facebook_app_id: string;
  facebook_app_secret: string;
  page_access_token: string;
  token_expires_at: string | null;
  is_enabled: boolean;
  last_token_refresh: string | null;
}

interface FacebookPostLog {
  id: string;
  blog_post_id: string;
  blog_post_title: string;
  blog_post_url: string;
  facebook_post_id: string | null;
  status: string;
  error_message: string | null;
  posted_at: string | null;
  created_at: string;
}

export default function FacebookSettingsPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<FacebookSettingsData>({
    facebook_page_id: '',
    facebook_app_id: '',
    facebook_app_secret: '',
    page_access_token: '',
    token_expires_at: null,
    is_enabled: false,
    last_token_refresh: null,
  });

  const [logs, setLogs] = useState<FacebookPostLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shortLivedToken, setShortLivedToken] = useState('');
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [retryingPost, setRetryingPost] = useState<string | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/employee-login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadSettings();
      loadLogs();
    }
  }, [user, isAdmin]);

  const loadSettings = async () => {
    try {
      console.log('Loading Facebook settings...');
      const { data, error } = await supabase
        .from('facebook_settings')
        .select('*')
        .maybeSingle();

      console.log('Facebook settings query result:', { data, error });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }

      if (data) {
        setSettings({
          id: data.id,
          facebook_page_id: data.facebook_page_id || '',
          facebook_app_id: data.facebook_app_id || '',
          facebook_app_secret: data.facebook_app_secret || '',
          page_access_token: data.page_access_token || '',
          token_expires_at: data.token_expires_at,
          is_enabled: data.is_enabled || false,
          last_token_refresh: data.last_token_refresh,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('facebook_post_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
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
        const { data: updated, error } = await supabase
          .from('facebook_settings')
          .update({
            facebook_page_id: settings.facebook_page_id,
            facebook_app_id: settings.facebook_app_id,
            facebook_app_secret: settings.facebook_app_secret,
            page_access_token: settings.page_access_token,
            is_enabled: settings.is_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select();

        if (error) throw error;
        if (!updated || updated.length === 0) {
          throw new Error('Save failed — your session may have expired. Please sign out and sign back in.');
        }
      } else {
        const { error } = await supabase
          .from('facebook_settings')
          .insert({
            facebook_page_id: settings.facebook_page_id,
            facebook_app_id: settings.facebook_app_id,
            facebook_app_secret: settings.facebook_app_secret,
            page_access_token: settings.page_access_token,
            is_enabled: settings.is_enabled,
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

  const handleRefreshToken = async () => {
    if (!shortLivedToken.trim()) {
      showMessage('error', 'Please enter a short-lived access token');
      return;
    }

    setRefreshingToken(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refresh-facebook-token`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ shortLivedToken }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to refresh token');
      }

      showMessage('success', `Token refreshed successfully for page: ${result.pageName}`);
      setShortLivedToken('');
      await loadSettings();
    } catch (error) {
      console.error('Error refreshing token:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to refresh token');
    } finally {
      setRefreshingToken(false);
    }
  };

  const handleCheckAll = () => {
    setSelectedLogs(new Set(logs.map(log => log.id)));
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
      // Optimistically remove from UI
      setLogs(prevLogs => prevLogs.filter(log => !selectedIds.includes(log.id)));
      setSelectedLogs(new Set());

      // Delete from database
      const { error } = await supabase
        .from('facebook_post_logs')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      showMessage('success', `Deleted ${selectedCount} post(s) successfully`);
    } catch (error) {
      console.error('Error deleting posts:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to delete posts');
      // Reload to restore accurate state on error
      await loadLogs();
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshLogs = async () => {
    await loadLogs();
    showMessage('success', 'Posts refreshed');
  };

  const handleRetryPost = async (log: FacebookPostLog) => {
    setRetryingPost(log.id);
    try {
      const slug = log.blog_post_url.split('/blog/')[1];

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-to-facebook`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          blogPostId: log.blog_post_id,
          blogPostTitle: log.blog_post_title,
          blogPostSlug: slug,
          forcePost: true,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to post to Facebook');
      }

      showMessage('success', 'Successfully posted to Facebook!');
      await loadLogs();
    } catch (error) {
      console.error('Error retrying post:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to retry post');
    } finally {
      setRetryingPost(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/employee-login');
  };

  const getTokenStatus = () => {
    if (!settings.page_access_token) {
      return { color: 'text-gray-500', text: 'Not configured' };
    }

    if (!settings.token_expires_at) {
      return { color: 'text-green-600', text: 'Active (Long-lived)' };
    }

    const expiresAt = new Date(settings.token_expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { color: 'text-red-600', text: 'Expired' };
    } else if (daysUntilExpiry < 7) {
      return { color: 'text-orange-600', text: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { color: 'text-green-600', text: `Expires in ${daysUntilExpiry} days` };
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
              <h1 className="text-3xl font-bold">Facebook Settings</h1>
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

        {settings.token_expires_at && (() => {
          const expiresAt = new Date(settings.token_expires_at);
          const now = new Date();
          const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            return (
              <div className="mb-6 p-5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 text-lg mb-1">Token Expiration Reminder</h3>
                  <p className="text-orange-800 font-semibold">
                    Your Facebook access token will expire on <span className="font-bold">{expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> ({daysUntilExpiry} days remaining)
                  </p>
                  <p className="text-orange-700 text-sm mt-2">
                    Please renew your token before it expires to continue auto-posting blog posts to Facebook.
                  </p>
                </div>
              </div>
            );
          } else if (daysUntilExpiry > 30) {
            return (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-800 font-medium">
                    Token expires on <span className="font-bold">{expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span> ({daysUntilExpiry} days remaining)
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Facebook className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Facebook Integration</h2>
              <p className="text-sm text-gray-600">Automatically post new blog posts to your Facebook Business Page</p>
            </div>
          </div>

          <div className="space-y-6">
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
                    <span className="font-semibold text-gray-900">Enable Auto-Posting</span>
                    <p className="text-sm text-gray-600">Automatically post to Facebook when blog posts are published</p>
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
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  value={settings.facebook_page_id}
                  onChange={(e) => setSettings({ ...settings, facebook_page_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="430347003969301"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={settings.facebook_app_id}
                  onChange={(e) => setSettings({ ...settings, facebook_app_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1670055597300242"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Facebook App Secret
                </label>
                <div className="relative">
                  <input
                    type={showAppSecret ? 'text' : 'password'}
                    value={settings.facebook_app_secret}
                    onChange={(e) => setSettings({ ...settings, facebook_app_secret: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter App Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppSecret(!showAppSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Access Token
                </label>
                <div className="relative">
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    value={settings.page_access_token}
                    onChange={(e) => setSettings({ ...settings, page_access_token: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste your Page Access Token here"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Token Management</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short-Lived Access Token
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Get this token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Graph API Explorer</a>
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={shortLivedToken}
                  onChange={(e) => setShortLivedToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste short-lived token here"
                />
              </div>
            </div>

            <button
              onClick={handleRefreshToken}
              disabled={refreshingToken || !shortLivedToken.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingToken ? 'animate-spin' : ''}`} />
              {refreshingToken ? 'Refreshing...' : 'Exchange for Long-Lived Token'}
            </button>

            {settings.last_token_refresh && (
              <p className="text-sm text-gray-600">
                Last refreshed: {new Date(settings.last_token_refresh).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Posts</h2>

          {logs.length > 0 && (
            <div className="mb-4 flex items-center gap-3 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600">
                Total: {logs.length} | Selected: {selectedLogs.size}
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

          {logs.length === 0 ? (
            <p className="text-gray-600">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
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
                          <h3 className="font-semibold text-gray-900">{log.blog_post_title}</h3>
                          <a
                            href={log.blog_post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {log.blog_post_url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(log.status)}`}>
                            {log.status === 'success' ? 'SUCCESS' : log.status.toUpperCase()}
                          </span>
                          {log.status === 'failed' && (
                            <button
                              onClick={() => handleRetryPost(log)}
                              disabled={retryingPost === log.id}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Retry posting to Facebook"
                            >
                              <RotateCw className={`w-3 h-3 ${retryingPost === log.id ? 'animate-spin' : ''}`} />
                              {retryingPost === log.id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded">
                          {log.error_message}
                        </div>
                      )}
                      {log.facebook_post_id && (
                        <a
                          href={`https://facebook.com/${log.facebook_post_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View on Facebook →
                        </a>
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
      </main>
    </div>
  );
}
