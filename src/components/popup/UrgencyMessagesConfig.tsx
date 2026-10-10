import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { getSiteSetting, updateSiteSetting } from '../../services/siteSettingsService';

export default function UrgencyMessagesConfig() {
  const [showPremiumSlots, setShowPremiumSlots] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const setting = await getSiteSetting('show_premium_slots');
      setShowPremiumSlots(setting === 'true');
    } catch (error) {
      console.error('Error fetching premium slots setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newValue = !showPremiumSlots;
      const success = await updateSiteSetting(
        'show_premium_slots',
        newValue.toString(),
        'Admin'
      );

      if (success) {
        setShowPremiumSlots(newValue);
        alert(`Premium slots message ${newValue ? 'enabled' : 'disabled'} successfully!`);
      } else {
        alert('Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating premium slots setting:', error);
      alert('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Urgency Messages</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control urgency and scarcity messages shown to visitors
          </p>
        </div>
        <button
          onClick={fetchSetting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Premium Slots Counter
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Shows "Only X premium slots left this week" message on the homepage service area section
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Preview:</p>
              <div className="bg-white rounded-lg p-3 border border-blue-300">
                <p className="text-gray-700">
                  Same-day premium soft wash + holiday light installation.
                  {showPremiumSlots && (
                    <>
                      <br />
                      <strong className="text-blue-900">Only 6 slots left this week</strong> across all towns.
                    </>
                  )}
                </p>
                {showPremiumSlots && (
                  <p className="text-lg font-bold text-blue-900 mt-3">
                    <span className="text-red-600 animate-pulse">Only 6 premium slots left this week</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPremiumSlots}
                  onChange={handleToggle}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {showPremiumSlots ? 'Enabled' : 'Disabled'}
                </span>
              </label>

              {saving && (
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">How it works:</h4>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>The counter automatically decreases as the week progresses (starts at 9, minimum of 3)</li>
            <li>When enabled, shows in two locations: subtitle text and call-to-action section</li>
            <li>Creates urgency to encourage visitors to book quickly</li>
            <li>Disable during slow periods or when you want to reduce urgency messaging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
