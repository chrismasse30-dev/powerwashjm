import { useState } from 'react';
import { FormData } from './EstimatorForm';

interface StepDeckProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepDeck({ formData, updateFormData, onContinue, onBack }: StepDeckProps) {
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);

  const presets = [
    { size: 200, label: 'Small', dimensions: '12×16' },
    { size: 300, label: 'Medium', dimensions: '15×20' },
    { size: 400, label: 'Large', dimensions: '20×20' },
    { size: 600, label: 'Extra Large', dimensions: '20×30' }
  ];

  const handleCalculate = () => {
    if (length > 0 && width > 0) {
      updateFormData({ deckSqFt: length * width });
    }
  };

  const handleContinue = () => {
    if (!formData.deckType) {
      alert('Please select a Type of Decking before continuing');
      return;
    }
    onContinue();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deck Wash Details</h2>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Size Guide</h4>
        <p className="text-gray-600 text-center mb-4">
          Select a common deck size or enter custom measurements
        </p>

        {/* Preset Sizes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {presets.map(preset => (
            <button
              key={preset.size}
              type="button"
              onClick={() => updateFormData({ deckSqFt: preset.size })}
              className={`p-4 border-2 rounded-lg hover:border-blue-500 transition-all ${
                formData.deckSqFt === preset.size ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
              }`}
            >
              <div className="font-bold text-lg text-gray-900">{preset.size} sq ft</div>
              <div className="text-xs text-gray-600 mt-1">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.dimensions}</div>
            </button>
          ))}
        </div>

        {/* Custom Calculator */}
        <div className="border-t border-gray-200 pt-4">
          <label className="font-semibold text-gray-900 mb-3 block">Or calculate custom size:</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Length (ft)"
              value={length || ''}
              onChange={(e) => setLength(parseInt(e.target.value) || 0)}
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              min="0"
            />
            <span className="text-gray-600 font-bold">×</span>
            <input
              type="number"
              placeholder="Width (ft)"
              value={width || ''}
              onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
              className="flex-1 p-3 border border-gray-300 rounded-lg"
              min="0"
            />
            <button
              type="button"
              onClick={handleCalculate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="mt-4">
          <label htmlFor="deckSqFt" className="block text-gray-900 font-medium mb-2">
            Or enter square footage directly:
          </label>
          <input
            type="number"
            id="deckSqFt"
            value={formData.deckSqFt || ''}
            onChange={(e) => updateFormData({ deckSqFt: parseInt(e.target.value, 10) || 0 })}
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter square feet"
          />
          {formData.deckSqFt > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {formData.deckSqFt} sq ft entered
            </p>
          )}
        </div>
      </div>

      {/* Type of Decking - Required Field */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Type of Decking <span className="text-red-600">*</span>
        </h4>
        <label htmlFor="deckType" className="block text-gray-900 font-medium mb-2">
          Select your deck material type:
        </label>
        <select
          id="deckType"
          value={formData.deckType}
          onChange={(e) => updateFormData({ deckType: e.target.value as 'composite' | 'wood' | 'painted' })}
          className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
            !formData.deckType ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          required
        >
          <option value="">-- Please Select Type of Decking --</option>
          <option value="composite">Composite</option>
          <option value="wood">Wood Deck (No Paint)</option>
          <option value="painted">Painted</option>
        </select>
        {!formData.deckType && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            ⚠️ This field is required - Please select your deck type
          </p>
        )}
        {formData.deckType && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {formData.deckType === 'composite' ? 'Composite' : formData.deckType === 'wood' ? 'Wood Deck (No Paint)' : 'Painted'} deck selected
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Deck Condition</h4>
        <label htmlFor="deckSoilLevel" className="block text-gray-900 font-medium mb-2">
          How dirty is your deck?
        </label>
        <select
          id="deckSoilLevel"
          value={formData.deckSoilLevel}
          onChange={(e) => updateFormData({ deckSoilLevel: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="light">Lightly Soiled - Regular cleaning, minor dirt</option>
          <option value="moderate">Moderately Dirty - Some staining and mildew (most common)</option>
          <option value="heavy">Heavily Soiled - Significant staining, mold, or neglect</option>
        </select>
        <p className="text-sm text-gray-600 mt-2">
          💡 Condition affects the intensity of cleaning required
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
