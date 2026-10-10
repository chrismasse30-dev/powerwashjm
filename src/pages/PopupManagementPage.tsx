import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import PopupConfigForm from '../components/popup/PopupConfigForm';
import PopupPreview from '../components/popup/PopupPreview';
import PopupPresetList from '../components/popup/PopupPresetList';
import SeasonalCardsConfig from '../components/popup/SeasonalCardsConfig';
import UrgencyMessagesConfig from '../components/popup/UrgencyMessagesConfig';
import { usePopupConfig } from '../hooks/usePopupConfig';

export default function PopupManagementPage() {
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const { activeConfig, isLoading } = usePopupConfig();

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/employee-dashboard/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Popup Management</h1>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Seasonal Cards Section */}
        <section>
          <SeasonalCardsConfig />
        </section>

        {/* Urgency Messages Section */}
        <section className="border-t-4 border-gray-200 pt-12">
          <UrgencyMessagesConfig />
        </section>

        {/* Popup Section */}
        <section className="border-t-4 border-gray-200 pt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popup Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage modal popups that appear on the website
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <PopupConfigForm formData={formData} setFormData={setFormData} />
                <PopupPresetList onLoadPreset={setFormData} formData={formData} />
              </div>

              {showPreview && (
                <div className="lg:sticky lg:top-8 h-fit">
                  <PopupPreview config={formData || activeConfig} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
