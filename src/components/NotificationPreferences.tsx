import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

export interface NotificationPrefs {
  new_quote_requests: boolean;
  customer_information: boolean;
  service_requests: boolean;
  measurement_designs: boolean;
}

interface NotificationPreferencesProps {
  preferences: NotificationPrefs;
  onSave: (prefs: NotificationPrefs) => Promise<void>;
  disabled?: boolean;
}

const NOTIFICATION_OPTIONS = [
  { key: 'new_quote_requests', label: 'New quote requests', description: 'Get notified when customers submit quotes' },
  { key: 'customer_information', label: 'Customer information', description: 'Updates to customer contact details' },
  { key: 'service_requests', label: 'Service requests', description: 'New service inquiries and requests' },
  { key: 'measurement_designs', label: 'Measurement designs', description: 'QuickMeasure design submissions' },
] as const;

export default function NotificationPreferences({
  preferences,
  onSave,
  disabled = false
}: NotificationPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePreference = (key: keyof NotificationPrefs) => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localPrefs);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalPrefs(preferences);
    setIsOpen(false);
  };

  const enabledCount = Object.values(localPrefs).filter(Boolean).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        title="Manage notification preferences"
      >
        <Bell className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700">Notifications</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          {enabledCount}/{NOTIFICATION_OPTIONS.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
            </div>
            <p className="text-xs text-gray-600">
              Choose which email notifications this user receives
            </p>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {NOTIFICATION_OPTIONS.map((option) => (
              <div key={option.key} className="group">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex-shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={() => togglePreference(option.key as keyof NotificationPrefs)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        localPrefs[option.key as keyof NotificationPrefs]
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {localPrefs[option.key as keyof NotificationPrefs] && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
