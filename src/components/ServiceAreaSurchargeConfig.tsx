import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculateDistanceBetweenZips } from '../utils/serviceAreaSurcharge';

interface SurchargeRule {
  id: string;
  base_zip_code: string;
  distance_from: number;
  distance_to: number;
  surcharge_amount: number;
  active: boolean;
}

export default function ServiceAreaSurchargeConfig() {
  const [rules, setRules] = useState<SurchargeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [baseZipCode, setBaseZipCode] = useState('02919');
  const [testZipCode, setTestZipCode] = useState('');
  const [testDistance, setTestDistance] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('service_area_surcharges')
        .select('*')
        .order('distance_from', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setBaseZipCode(data[0].base_zip_code);
        setRules(data);
      }
    } catch (error) {
      console.error('Error loading surcharge rules:', error);
      showNotification('Error loading surcharge rules', true);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, isError = false) => {
    setNotification(message);
    setTimeout(() => setNotification(''), isError ? 5000 : 3000);
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      for (const rule of rules) {
        const updateData = {
          base_zip_code: baseZipCode,
          distance_from: rule.distance_from,
          distance_to: rule.distance_to,
          surcharge_amount: rule.surcharge_amount,
          active: rule.active,
        };

        if (rule.id.startsWith('temp_')) {
          const { error } = await supabase
            .from('service_area_surcharges')
            .insert([updateData]);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('service_area_surcharges')
            .update(updateData)
            .eq('id', rule.id);

          if (error) throw error;
        }
      }

      showNotification('Surcharge rules saved successfully!');
      loadRules();
    } catch (error) {
      console.error('Error saving rules:', error);
      showNotification('Error saving rules. Please try again.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = () => {
    const lastRule = rules[rules.length - 1];
    const newFrom = lastRule ? lastRule.distance_to : 50;
    const newTo = newFrom + 10;

    setRules([
      ...rules,
      {
        id: `temp_${Date.now()}`,
        base_zip_code: baseZipCode,
        distance_from: newFrom,
        distance_to: newTo,
        surcharge_amount: 0,
        active: true,
      },
    ]);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    if (ruleId.startsWith('temp_')) {
      setRules(rules.filter((r) => r.id !== ruleId));
      return;
    }

    try {
      const { error } = await supabase
        .from('service_area_surcharges')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.filter((r) => r.id !== ruleId));
      showNotification('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting rule:', error);
      showNotification('Error deleting rule', true);
    }
  };

  const handleUpdateRule = (index: number, field: keyof SurchargeRule, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
  };

  const handleCalculateTestDistance = async () => {
    if (!testZipCode || testZipCode.length < 5) {
      showNotification('Please enter a valid 5-digit zip code', true);
      return;
    }

    setCalculatingDistance(true);
    try {
      const distance = await calculateDistanceBetweenZips(baseZipCode, testZipCode);
      setTestDistance(distance);

      if (distance === null) {
        showNotification('Could not calculate distance. Invalid zip code?', true);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      showNotification('Error calculating distance', true);
    } finally {
      setCalculatingDistance(false);
    }
  };

  const getAppliedSurcharge = (distance: number | null): number => {
    if (distance === null) return 0;

    const matchingRule = rules.find(
      (rule) => rule.active && distance >= rule.distance_from && distance < rule.distance_to
    );

    return matchingRule ? matchingRule.surcharge_amount : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading surcharge rules...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Service Area Trip Surcharge (Hidden from Customers)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure distance-based pricing adjustments. These surcharges are automatically added to
          quotes but are completely hidden from customers.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-semibold">Important Security Notice</p>
              <p>
                Surcharges are completely invisible to end users. They see only the final quoted
                price without any breakdown or indication of distance-based fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Base Zip Code</label>
        <input
          type="text"
          value={baseZipCode}
          onChange={(e) => setBaseZipCode(e.target.value)}
          className="w-40 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="02919"
          maxLength={5}
        />
        <p className="text-xs text-gray-500 mt-1">
          All distances are calculated from this zip code
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Test Distance Calculator</h4>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Customer Zip Code</label>
            <input
              type="text"
              value={testZipCode}
              onChange={(e) => setTestZipCode(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter zip"
              maxLength={5}
            />
          </div>
          <button
            onClick={handleCalculateTestDistance}
            disabled={calculatingDistance}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {calculatingDistance ? 'Calculating...' : 'Calculate'}
          </button>
          {testDistance !== null && (
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900">
                Distance: {testDistance} miles
              </p>
              <p className="text-xs text-gray-600">
                Surcharge: ${getAppliedSurcharge(testDistance).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Distance Ranges & Surcharges</h4>
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <input
                type="checkbox"
                checked={rule.active}
                onChange={(e) => handleUpdateRule(index, 'active', e.target.checked)}
                className="w-4 h-4"
              />
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  value={rule.distance_from}
                  onChange={(e) =>
                    handleUpdateRule(index, 'distance_from', parseInt(e.target.value))
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="number"
                  value={rule.distance_to}
                  onChange={(e) =>
                    handleUpdateRule(index, 'distance_to', parseInt(e.target.value))
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
                <span className="text-sm text-gray-600">miles</span>
                <span className="text-sm text-gray-600 mx-2">→</span>
                <span className="text-sm font-semibold text-gray-600">$</span>
                <input
                  type="number"
                  value={rule.surcharge_amount}
                  onChange={(e) =>
                    handleUpdateRule(index, 'surcharge_amount', parseFloat(e.target.value))
                  }
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddRule}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          <Plus className="w-4 h-4" />
          Add Distance Range
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleSaveRules}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Surcharge Rules'}
        </button>
        {notification && (
          <div
            className={`px-4 py-2 rounded-md ${
              notification.includes('Error')
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {notification}
          </div>
        )}
      </div>
    </div>
  );
}
