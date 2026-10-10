import { FormData } from './EstimatorForm';

interface StepHouseDetailsProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepHouseDetails({ formData, updateFormData, onContinue, onBack }: StepHouseDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">House Wash Details</h2>

      <div className="mb-6">
        <label htmlFor="stories" className="block text-gray-900 font-medium mb-2">
          Number of Stories
        </label>
        <select
          id="stories"
          value={formData.stories}
          onChange={(e) => updateFormData({ stories: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option value="1">1 Story</option>
          <option value="2">2 Stories</option>
          <option value="3">3 Stories</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.walkout}
            onChange={(e) => updateFormData({ walkout: e.target.checked })}
            className="w-5 h-5 mr-3"
          />
          <span className="text-gray-900 font-medium">Add Walk-out Basement?</span>
        </label>
      </div>

      <div className="mb-6">
        <label htmlFor="houseSoilLevel" className="block text-gray-900 font-medium mb-2">
          How dirty is your house?
        </label>
        <select
          id="houseSoilLevel"
          value={formData.houseSoilLevel}
          onChange={(e) => updateFormData({ houseSoilLevel: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="light">Lightly Soiled - Regular maintenance, minor dirt</option>
          <option value="moderate">Moderately Dirty - Some buildup and stains (most common)</option>
          <option value="heavy">Heavily Soiled - Significant staining, mold, or grime</option>
        </select>
        <p className="text-sm text-gray-600 mt-2">
          💡 Dirtier surfaces require more intensive cleaning and affect pricing
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
          onClick={onContinue}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
