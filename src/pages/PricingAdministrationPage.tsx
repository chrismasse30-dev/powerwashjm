import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Save, RotateCcw, Bell, BellOff, Eye, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react';
import ReturnToDashboardButton from '../components/ReturnToDashboardButton';
import ServiceAreaSurchargeConfig from '../components/ServiceAreaSurchargeConfig';
import { getPricing, savePricing, defaultPricing, PricingData } from '../utils/estimatorPricing';
import { useAuth } from '../contexts/AuthContext';
import { getSiteSetting, updateSiteSetting } from '../services/siteSettingsService';

const NOTIFICATIONS_SETTING_KEY = 'notifications_enabled';

export default function PricingAdministrationPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [pricing, setPricing] = useState<PricingData>(getPricing());
  const [notification, setNotification] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [instantEstimateVisible, setInstantEstimateVisible] = useState(true);
  const [loadingEstimateVisibility, setLoadingEstimateVisibility] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/employee-login');
    }
  }, [user, loading, navigate]);

  // Load instant estimate visibility status
  useEffect(() => {
    const loadVisibilityStatus = async () => {
      try {
        const value = await getSiteSetting('instant_estimate_visible');
        setInstantEstimateVisible(value === 'true');
      } catch (error) {
        console.error('Error loading visibility status:', error);
      } finally {
        setLoadingEstimateVisibility(false);
      }
    };

    loadVisibilityStatus();
  }, []);

  // Load notifications status from database
  useEffect(() => {
    const loadNotificationsStatus = async () => {
      try {
        const value = await getSiteSetting(NOTIFICATIONS_SETTING_KEY);
        setNotificationsEnabled(value === 'true');
      } catch (error) {
        console.error('Error loading notifications status:', error);
        // Default to enabled on error
        setNotificationsEnabled(true);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotificationsStatus();
  }, []);

  // No auto re-enable timer needed - this is a permanent toggle for testing

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSave = () => {
    savePricing(pricing);
    showNotification('Pricing has been saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all prices to their default values? This cannot be undone.')) {
      setPricing(defaultPricing);
      showNotification('Prices have been reset to defaults. Click "Save Pricing" to confirm.');
    }
  };

  const updatePricing = (path: string[], value: number) => {
    setPricing(prev => {
      const newPricing = JSON.parse(JSON.stringify(prev));
      let current: any = newPricing;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newPricing;
    });
  };

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    const action = newState ? 'ENABLE' : 'DISABLE';

    const confirmMessage = newState
      ? 'Are you sure you want to ENABLE quote submission processing?\n\nAll quote submissions will be:\n• Stored in the database\n• Sent via email\n• Processed normally'
      : '⚠️ WARNING: TESTING MODE ⚠️\n\nAre you sure you want to DISABLE all quote submission processing?\n\nWhen disabled:\n❌ NO submissions will be saved to database\n❌ NO email notifications will be sent\n❌ NO webhooks will be triggered\n❌ NO newsletter signups will be processed\n\nThis is intended for TESTING ONLY.\n\nContinue?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const success = await updateSiteSetting(
        NOTIFICATIONS_SETTING_KEY,
        newState.toString(),
        user?.email || 'unknown'
      );

      if (success) {
        setNotificationsEnabled(newState);
        if (newState) {
          showNotification('✅ Quote submissions ENABLED - All processing active');
        } else {
          showNotification('🔴 TESTING MODE ACTIVE - Quote submissions DISABLED');
        }
      } else {
        showNotification('❌ Error updating notification setting. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      showNotification('❌ Error updating notification setting. Please try again.');
    }
  };

  const toggleInstantEstimateVisibility = async () => {
    const action = instantEstimateVisible ? 'hide' : 'show';
    const confirmMessage = instantEstimateVisible
      ? 'Are you sure you want to HIDE the Instant Online Quote page from public visitors?\n\nPublic visitors will be redirected to the homepage. Admins will still have access.'
      : 'Are you sure you want to SHOW the Instant Online Quote page to public visitors?\n\nThe page will be accessible to everyone.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const newValue = !instantEstimateVisible;
      const success = await updateSiteSetting(
        'instant_estimate_visible',
        newValue.toString(),
        user?.email || 'unknown'
      );

      if (success) {
        setInstantEstimateVisible(newValue);
        showNotification(
          newValue
            ? 'Instant Online Quote page is now VISIBLE to public visitors'
            : 'Instant Online Quote page is now HIDDEN from public visitors'
        );
      } else {
        showNotification('Error updating visibility setting. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showNotification('Error updating visibility setting. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <ReturnToDashboardButton />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-8 pb-4 border-b-2 border-blue-900">
            <DollarSign className="w-8 h-8 text-blue-900 mr-3" />
            <h1 className="text-3xl font-bold text-blue-900">Pricing Administration</h1>
          </div>

          {notification && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-center">
              {notification}
            </div>
          )}

          {/* Critical Testing Mode Warning */}
          {!notificationsEnabled && !loadingNotifications && (
            <div className="mb-8 p-6 border-4 border-red-500 rounded-lg bg-red-50 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-red-900 mb-2">
                    🔴 TESTING MODE ACTIVE
                  </h3>
                  <p className="text-red-800 font-semibold mb-3">
                    Quote submission processing is currently DISABLED
                  </p>
                  <div className="bg-white/50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-bold text-red-900 mb-2">All submissions will be blocked:</p>
                    <ul className="text-sm text-red-800 space-y-1 ml-4">
                      <li>❌ Nothing saved to database</li>
                      <li>❌ No email notifications sent</li>
                      <li>❌ No webhook notifications triggered</li>
                      <li>❌ No newsletter signups processed</li>
                    </ul>
                  </div>
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Remember to ENABLE notifications before going live!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quote Submission Processing Toggle */}
          <div className={`mb-8 p-6 border-2 rounded-lg ${
            notificationsEnabled
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-1">
                {notificationsEnabled ? (
                  <Bell className="w-6 h-6 text-green-600 mr-3" />
                ) : (
                  <BellOff className="w-6 h-6 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quote Submission Processing
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    {notificationsEnabled
                      ? '✅ Active - Submissions are being processed normally'
                      : '🔴 TESTING MODE - All submission processing is DISABLED'}
                  </p>
                  {loadingNotifications && (
                    <p className="text-sm text-gray-500 mt-1">Loading status...</p>
                  )}
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                disabled={loadingNotifications}
                className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  notificationsEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                }`}
              >
                {notificationsEnabled ? 'Turn OFF (Testing Mode)' : 'Turn ON (Enable Processing)'}
              </button>
            </div>

            {/* Detailed Status Information */}
            <div className={`border-t-2 pt-4 mt-4 ${
              notificationsEnabled ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    {notificationsEnabled ? 'When Enabled:' : 'When Disabled:'}
                  </h4>
                  {notificationsEnabled ? (
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✅ Submissions saved to database</li>
                      <li>✅ Email notifications sent to sales@powerwashjm.com & jmpowerwashing@yahoo.com</li>
                      <li>✅ Webhook notifications triggered</li>
                      <li>✅ Newsletter signups processed</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>❌ NO database storage</li>
                      <li>❌ NO email notifications</li>
                      <li>❌ NO webhook triggers</li>
                      <li>❌ NO newsletter processing</li>
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Purpose:</h4>
                  <p className="text-sm text-gray-700">
                    {notificationsEnabled
                      ? 'Normal production operation. All quote submissions are processed and stored.'
                      : 'Testing/development mode. Use this to test the quote forms without creating real submissions or sending actual notifications. Perfect for testing changes safely.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`mt-4 p-3 rounded-lg border-2 ${
              notificationsEnabled
                ? 'bg-green-100 border-green-300'
                : 'bg-red-100 border-red-300'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  notificationsEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-bold ${
                  notificationsEnabled ? 'text-green-900' : 'text-red-900'
                }`}>
                  {notificationsEnabled ? 'LIVE & PROCESSING' : 'TESTING MODE - NOT PROCESSING'}
                </span>
              </div>
            </div>
          </div>

          {/* Instant Estimate Visibility Toggle */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-1">
                {instantEstimateVisible ? (
                  <Eye className="w-6 h-6 text-green-600 mr-3" />
                ) : (
                  <EyeOff className="w-6 h-6 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Instant Online Quote Page Visibility
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {instantEstimateVisible
                      ? 'Page is currently VISIBLE to all public visitors'
                      : 'Page is currently HIDDEN from public visitors (redirected to homepage)'}
                  </p>
                  {loadingEstimateVisibility && (
                    <p className="text-sm text-gray-500 mt-1">Loading status...</p>
                  )}
                </div>
              </div>
              <button
                onClick={toggleInstantEstimateVisibility}
                disabled={loadingEstimateVisibility}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  instantEstimateVisible
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {instantEstimateVisible ? 'Hide from Live Site' : 'Show on Live Site'}
              </button>
            </div>

            {/* Admin Preview Link */}
            <div className="border-t border-purple-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Admin Preview Access
                  </h4>
                  <p className="text-sm text-gray-600">
                    As an admin, you can always access the page regardless of visibility status
                  </p>
                </div>
                <a
                  href="/instant-estimate?admin=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview Page
                </a>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`mt-4 p-3 rounded-lg border ${
              instantEstimateVisible
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  instantEstimateVisible ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-semibold ${
                  instantEstimateVisible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {instantEstimateVisible ? 'Live & Accessible' : 'Hidden from Public'}
                </span>
              </div>
            </div>
          </div>

          {/* Per Square Foot Services */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Per Square Foot Services</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">House Wash ($/sq ft)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.houseWash.pricePerSqFt}
                onChange={(e) => updatePricing(['houseWash', 'pricePerSqFt'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">Roof Cleaning ($/sq ft)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.roofCleaning.pricePerSqFt}
                onChange={(e) => updatePricing(['roofCleaning', 'pricePerSqFt'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">Patio/Pool/Walkway ($/sq ft)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.patioWash.pricePerSqFt}
                onChange={(e) => updatePricing(['patioWash', 'pricePerSqFt'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">Deck Wash ($/sq ft)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.deckWash.pricePerSqFt}
                onChange={(e) => updatePricing(['deckWash', 'pricePerSqFt'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="font-semibold text-gray-700">Driveway Wash ($/sq ft)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.drivewayWash.pricePerSqFt}
                onChange={(e) => updatePricing(['drivewayWash', 'pricePerSqFt'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Linear Foot Services */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Per Linear Foot Services</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="font-semibold text-gray-700">Gutters ($/linear foot)</label>
              <input
                type="number"
                step="0.01"
                value={pricing.gutterCleaning.pricePerLinearFoot}
                onChange={(e) => updatePricing(['gutterCleaning', 'pricePerLinearFoot'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Per Unit / Item Services */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Per Unit / Item Services</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">Solar Panel ($/panel)</label>
              <input
                type="number"
                step="1"
                value={pricing.solarPanelCleaning.pricePerPanel}
                onChange={(e) => updatePricing(['solarPanelCleaning', 'pricePerPanel'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="font-semibold text-gray-700">Fence Wash ($/panel)</label>
              <input
                type="number"
                step="1"
                value={pricing.fenceWash.pricePerPanel}
                onChange={(e) => updatePricing(['fenceWash', 'pricePerPanel'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="font-semibold text-gray-700">Fence Wash ($/linear foot)</label>
              <input
                type="number"
                step="0.1"
                value={pricing.fenceWash.pricePerLinearFoot}
                onChange={(e) => updatePricing(['fenceWash', 'pricePerLinearFoot'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Add-Ons */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add-Ons</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="font-semibold text-gray-700">Walk-out Basement Add-on</label>
              <input
                type="number"
                step="5"
                value={pricing.houseWashAddOns.walkout}
                onChange={(e) => updatePricing(['houseWashAddOns', 'walkout'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Multipliers */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Multipliers (Advanced)</h3>

            {/* Soil Level Multipliers Section */}
            <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Soil Level Multipliers (All Services)</h4>
              <p className="text-sm text-gray-700 mb-4">
                These multipliers apply when customers select different soil/dirtiness levels during booking:
              </p>

              <div className="space-y-6">
                {/* House Wash Soil Levels */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">House Wash - Soil Level</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Lightly Soiled (1.0x base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.houseWash.soilLevelMultiplier.light}
                        onChange={(e) => updatePricing(['houseWash', 'soilLevelMultiplier', 'light'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Moderately Dirty (1.25x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.houseWash.soilLevelMultiplier.moderate}
                        onChange={(e) => updatePricing(['houseWash', 'soilLevelMultiplier', 'moderate'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Heavily Soiled/Stained (1.6x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.houseWash.soilLevelMultiplier.heavy}
                        onChange={(e) => updatePricing(['houseWash', 'soilLevelMultiplier', 'heavy'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Roof Cleaning Soil Levels */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Roof Cleaning - Soil Level</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Lightly Soiled (1.0x base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.roofCleaning.soilLevelMultiplier.light}
                        onChange={(e) => updatePricing(['roofCleaning', 'soilLevelMultiplier', 'light'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Moderately Dirty (1.25x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.roofCleaning.soilLevelMultiplier.moderate}
                        onChange={(e) => updatePricing(['roofCleaning', 'soilLevelMultiplier', 'moderate'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Heavily Soiled/Stained (1.6x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.roofCleaning.soilLevelMultiplier.heavy}
                        onChange={(e) => updatePricing(['roofCleaning', 'soilLevelMultiplier', 'heavy'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Deck Wash Soil Levels */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Deck Wash - Soil Level</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Lightly Soiled (1.0x base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.deckWash.soilLevelMultiplier.light}
                        onChange={(e) => updatePricing(['deckWash', 'soilLevelMultiplier', 'light'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Moderately Dirty (1.25x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.deckWash.soilLevelMultiplier.moderate}
                        onChange={(e) => updatePricing(['deckWash', 'soilLevelMultiplier', 'moderate'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Heavily Soiled/Stained (1.6x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.deckWash.soilLevelMultiplier.heavy}
                        onChange={(e) => updatePricing(['deckWash', 'soilLevelMultiplier', 'heavy'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Driveway Wash Soil Levels */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Driveway Wash - Soil Level</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Lightly Soiled (1.0x base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.drivewayWash.soilLevelMultiplier.light}
                        onChange={(e) => updatePricing(['drivewayWash', 'soilLevelMultiplier', 'light'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Moderately Dirty (1.25x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.drivewayWash.soilLevelMultiplier.moderate}
                        onChange={(e) => updatePricing(['drivewayWash', 'soilLevelMultiplier', 'moderate'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Heavily Soiled/Stained (1.6x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.drivewayWash.soilLevelMultiplier.heavy}
                        onChange={(e) => updatePricing(['drivewayWash', 'soilLevelMultiplier', 'heavy'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Gutter Cleaning Soil Levels */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Gutter Cleaning - Condition</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Lightly Soiled (1.0x base)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.gutterCleaning.soilLevelMultiplier.light}
                        onChange={(e) => updatePricing(['gutterCleaning', 'soilLevelMultiplier', 'light'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Moderately Dirty (1.25x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.gutterCleaning.soilLevelMultiplier.moderate}
                        onChange={(e) => updatePricing(['gutterCleaning', 'soilLevelMultiplier', 'moderate'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">
                        Heavily Soiled/Clogged (1.6x)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.gutterCleaning.soilLevelMultiplier.heavy}
                        onChange={(e) => updatePricing(['gutterCleaning', 'soilLevelMultiplier', 'heavy'], parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-6">House Wash Story Multipliers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className="font-semibold text-gray-700">1 Story</label>
              <input
                type="number"
                step="0.1"
                value={pricing.houseWash.storyMultiplier['1']}
                onChange={(e) => updatePricing(['houseWash', 'storyMultiplier', '1'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />

              <label className="font-semibold text-gray-700">2 Stories</label>
              <input
                type="number"
                step="0.1"
                value={pricing.houseWash.storyMultiplier['2']}
                onChange={(e) => updatePricing(['houseWash', 'storyMultiplier', '2'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />

              <label className="font-semibold text-gray-700">3 Stories</label>
              <input
                type="number"
                step="0.1"
                value={pricing.houseWash.storyMultiplier['3']}
                onChange={(e) => updatePricing(['houseWash', 'storyMultiplier', '3'], parseFloat(e.target.value) || 0)}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-3">Roof / Gutter Cleaning Story Multipliers</h4>
            <p className="text-sm text-gray-600 mb-4">
              These multipliers apply to both Roof Cleaning and Gutter Cleaning services based on the number of stories.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <label className="font-semibold text-gray-700">Roof - 1 Story</label>
              <input
                type="number"
                step="0.1"
                value={pricing.roofCleaning.storyMultiplier['1']}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updatePricing(['roofCleaning', 'storyMultiplier', '1'], value);
                  updatePricing(['gutterCleaning', 'storyMultiplier', '1'], value);
                }}
                className="p-3 border border-gray-300 rounded-lg"
              />

              <label className="font-semibold text-gray-700">Roof / Gutter - 2 Stories</label>
              <input
                type="number"
                step="0.1"
                value={pricing.roofCleaning.storyMultiplier['2']}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updatePricing(['roofCleaning', 'storyMultiplier', '2'], value);
                  updatePricing(['gutterCleaning', 'storyMultiplier', '2'], value);
                }}
                className="p-3 border border-gray-300 rounded-lg"
              />

              <label className="font-semibold text-gray-700">Roof / Gutter - 3 Stories</label>
              <input
                type="number"
                step="0.1"
                value={pricing.roofCleaning.storyMultiplier['3']}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updatePricing(['roofCleaning', 'storyMultiplier', '3'], value);
                  updatePricing(['gutterCleaning', 'storyMultiplier', '3'], value);
                }}
                className="p-3 border border-gray-300 rounded-lg"
              />

              <label className="font-semibold text-gray-700">Roof / Gutter - 4 Stories</label>
              <input
                type="number"
                step="0.1"
                value={pricing.roofCleaning.storyMultiplier['4']}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updatePricing(['roofCleaning', 'storyMultiplier', '4'], value);
                  updatePricing(['gutterCleaning', 'storyMultiplier', '4'], value);
                }}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Pricing
            </button>
          </div>
        </div>

        {/* Service Area Surcharge Configuration */}
        <div className="mt-8">
          <ServiceAreaSurchargeConfig />
        </div>
      </div>
    </div>
  );
}
