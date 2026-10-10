import { FormData } from './EstimatorForm';

interface StepDrivewayProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepDriveway({ formData, updateFormData, onContinue, onBack }: StepDrivewayProps) {
  const handleContinue = () => {
    // Validate that square footage is entered
    if (formData.drivewaySqFt <= 0) {
      alert('Please enter a valid square footage greater than 0');
      return;
    }
    onContinue();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Step 1: Driveway Wash (sq ft)</h2>

      {/* Square Footage Input */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-6 border border-gray-200">
        <div className="mb-6">
          <label
            htmlFor="drivewaySqFt"
            className="block text-lg font-semibold text-gray-900 mb-3"
          >
            Square Footage
          </label>
          <input
            type="number"
            id="drivewaySqFt"
            value={formData.drivewaySqFt || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              updateFormData({ drivewaySqFt: value > 0 ? value : 0 });
            }}
            min="1"
            step="1"
            placeholder="Enter square feet"
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            aria-label="Driveway square footage"
            aria-describedby="sqft-help"
          />
          <p id="sqft-help" className="mt-2 text-sm text-gray-600">
            Enter the total square footage of your driveway
          </p>
          {formData.drivewaySqFt > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ {formData.drivewaySqFt} sq ft entered
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Material Type Selection */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Type</h3>
        <div className="space-y-3">
          {[
            { value: 'concrete', label: 'Concrete' },
            { value: 'asphalt', label: 'Asphalt' },
            { value: 'pavers', label: 'Pavers' },
            { value: 'brick', label: 'Brick' }
          ].map((material) => (
            <label
              key={material.value}
              className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
              style={{
                borderColor: formData.drivewayMaterial === material.value ? '#3B82F6' : '',
                backgroundColor: formData.drivewayMaterial === material.value ? '#EFF6FF' : ''
              }}
            >
              <input
                type="radio"
                name="drivewayMaterial"
                value={material.value}
                checked={formData.drivewayMaterial === material.value}
                onChange={(e) => updateFormData({ drivewayMaterial: e.target.value })}
                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                aria-label={material.label}
              />
              <span className="ml-3 text-gray-900 font-medium">{material.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Select the material type of your driveway surface
        </p>
      </div>

      {/* Dirtiness Level */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How dirty is your driveway?</h3>
        <select
          id="drivewaySoilLevel"
          value={formData.drivewaySoilLevel}
          onChange={(e) => updateFormData({ drivewaySoilLevel: e.target.value })}
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
          aria-label="Driveway soil level"
        >
          <option value="light">Lightly Soiled - Minor dirt and dust</option>
          <option value="moderate">Moderately Dirty - Some stains and buildup (most common)</option>
          <option value="heavy">Heavily Soiled - Significant oil stains and grime</option>
        </select>
        <p className="text-sm text-gray-600 mt-2">
          💡 Oil stains and heavy buildup require specialized cleaning
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-4 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-gray-300"
          aria-label="Go back to previous step"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Continue to next step"
        >
          Continue →
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Measure your driveway length × width to get the total square footage.
          For irregularly shaped driveways, break it into sections and add them together.
        </p>
      </div>
    </div>
  );
}
