import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Facebook, RefreshCw, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
  blog_post_title: string;
  blog_post_url: string;
  facebook_post_id: string | null;
  status: string;
  error_message: string | null;
  posted_at: string | null;
  created_at: string;
}

export default function FacebookSettings() {
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

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('facebook_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

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
      showMessage('error', 'Failed to load settings');
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
      const updateData = {
        facebook_page_id: settings.facebook_page_id,
        facebook_app_id: settings.facebook_app_id,
        facebook_app_secret: settings.facebook_app_secret,
        page_access_token: settings.page_access_token,
        is_enabled: settings.is_enabled,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('facebook_settings')
        .upsert(updateData)
        .select();

      if (error) throw error;
      if (!updated || updated.length === 0) {
        throw new Error('Save failed — your session may have expired. Please sign out and sign back in.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tokenStatus = getTokenStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Link
        to="/employee-dashboard/"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Return to Dashboard
      </Link>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Facebook className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facebook Integration</h1>
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
                placeholder="25040628762236696"
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
                  placeholder="Enter Page Access Token"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Page Access Token Status
              </label>
              <div className={`px-4 py-2 border border-gray-300 rounded-lg ${tokenStatus.color} font-semibold`}>
                {tokenStatus.text}
              </div>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Token Management</h2>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Posts</h2>
        {logs.length === 0 ? (
          <p className="text-gray-600">No posts yet</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
