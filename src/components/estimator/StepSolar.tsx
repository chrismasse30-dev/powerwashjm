import { FormData } from './EstimatorForm';

interface StepSolarProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepSolar({ formData, updateFormData, onContinue, onBack }: StepSolarProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Solar Panel Cleaning</h2>

      <div className="text-center mb-6">
        <div className="text-6xl mb-4">☀️</div>
        <label htmlFor="solarPanelQty" className="block text-gray-900 font-medium mb-2">
          Number of panels?
        </label>
        <input
          type="number"
          id="solarPanelQty"
          value={formData.solarPanelQty}
          onChange={(e) => updateFormData({ solarPanelQty: parseInt(e.target.value, 10) || 0 })}
          min="0"
          className="w-32 p-3 border border-gray-300 rounded-lg text-center mx-auto"
        />
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
          onClick={onContinue}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
