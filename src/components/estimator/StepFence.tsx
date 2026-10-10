import { FormData } from './EstimatorForm';

interface StepFenceProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepFence({ formData, updateFormData, onContinue, onBack }: StepFenceProps) {
  const handleContinue = () => {
    // Validate required fields
    if (!formData.fenceCoverage) {
      alert('Please select fence coverage (1 Side or Both Sides)');
      return;
    }
    if (!formData.fenceMaterial) {
      alert('Please select fence material (Wood or Vinyl)');
      return;
    }
    if (formData.fenceHeight === 'other' && !formData.fenceCustomHeight) {
      alert('Please enter a custom fence height');
      return;
    }
    if (formData.fenceHeight === 'other' && isNaN(Number(formData.fenceCustomHeight))) {
      alert('Please enter a valid numeric height');
      return;
    }
    onContinue();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fence Wash Details</h2>

      <div className="mb-6">
        <label className="block text-gray-900 font-medium mb-3">Quote by:</label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={formData.fenceType === 'panel'}
              onChange={() => updateFormData({ fenceType: 'panel' })}
              className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span>Panel</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={formData.fenceType === 'linearFoot'}
              onChange={() => updateFormData({ fenceType: 'linearFoot' })}
              className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span>Linear Foot</span>
          </label>
        </div>
      </div>

      {formData.fenceType === 'panel' ? (
        <div className="mb-6">
          <label htmlFor="fencePanelQty" className="block text-gray-900 font-medium mb-2">
            Number of panels?
          </label>
          <input
            type="number"
            id="fencePanelQty"
            value={formData.fencePanelQty}
            onChange={(e) => updateFormData({ fencePanelQty: parseInt(e.target.value, 10) || 0 })}
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      ) : (
        <div className="mb-6">
          <label htmlFor="fenceLinearFootQty" className="block text-gray-900 font-medium mb-2">
            Total linear feet?
          </label>
          <input
            type="number"
            id="fenceLinearFootQty"
            value={formData.fenceLinearFootQty}
            onChange={(e) => updateFormData({ fenceLinearFootQty: parseInt(e.target.value, 10) || 0 })}
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Responsive Grid Layout for Fence Options - Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* Fence Coverage Selection - Required */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 h-fit">
          <label className="block text-gray-900 font-medium mb-3">
            Fence Coverage <span className="text-red-600">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceCoverage === 'oneSide'}
                onChange={() => updateFormData({ fenceCoverage: 'oneSide' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="font-medium text-sm">1 Side of Fence</span>
            </label>
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceCoverage === 'bothSides'}
                onChange={() => updateFormData({ fenceCoverage: 'bothSides' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <div>
                <span className="font-medium text-sm">Both Sides of Fence</span>
                <p className="text-xs text-gray-600 mt-1">Both sides includes front and back of fence</p>
              </div>
            </label>
          </div>
        </div>

        {/* Fence Material Selection - Required */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 h-fit">
          <label className="block text-gray-900 font-medium mb-3">
            Fence Material <span className="text-red-600">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceMaterial === 'wood'}
                onChange={() => updateFormData({ fenceMaterial: 'wood' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="font-medium text-sm">Wood</span>
            </label>
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceMaterial === 'vinyl'}
                onChange={() => updateFormData({ fenceMaterial: 'vinyl' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="font-medium text-sm">Vinyl</span>
            </label>
          </div>
        </div>

        {/* Fence Height Selection */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 h-fit md:col-span-2 lg:col-span-1">
          <label className="block text-gray-900 font-medium mb-3">
            Fence Height
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceHeight === '4'}
                onChange={() => updateFormData({ fenceHeight: '4', fenceCustomHeight: '' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-sm">4 feet</span>
            </label>
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceHeight === '5'}
                onChange={() => updateFormData({ fenceHeight: '5', fenceCustomHeight: '' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-sm">5 feet</span>
            </label>
            <label className="flex items-center cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceHeight === '6'}
                onChange={() => updateFormData({ fenceHeight: '6', fenceCustomHeight: '' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium text-sm">6 feet</span>
            </label>
            <label className="flex items-start cursor-pointer p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors">
              <input
                type="radio"
                checked={formData.fenceHeight === 'other'}
                onChange={() => updateFormData({ fenceHeight: 'other' })}
                className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 mt-1"
              />
              <div className="flex-1">
                <span className="font-medium text-sm">Other</span>
                {formData.fenceHeight === 'other' && (
                  <div className="mt-3">
                    <label htmlFor="fenceCustomHeight" className="block text-xs text-gray-700 mb-2">
                      Enter custom height (in feet) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      id="fenceCustomHeight"
                      value={formData.fenceCustomHeight}
                      onChange={(e) => updateFormData({ fenceCustomHeight: e.target.value })}
                      placeholder="e.g., 8"
                      min="1"
                      max="20"
                      step="0.5"
                      required={formData.fenceHeight === 'other'}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

      </div>

      <div className="flex justify-between mt-8">
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
