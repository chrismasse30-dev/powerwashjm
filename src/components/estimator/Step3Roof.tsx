import { FormData } from './EstimatorForm';

interface Step3RoofProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function Step3Roof({ formData, updateFormData, onContinue, onBack }: Step3RoofProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Roof Details</h2>

      <div className="mb-6">
        <label htmlFor="roofStories" className="block text-gray-900 font-medium mb-2">
          Number of Floors (Stories)
        </label>
        <select
          id="roofStories"
          value={formData.roofStories}
          onChange={(e) => updateFormData({ roofStories: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option value="1">1 Story</option>
          <option value="2">2 Stories</option>
          <option value="3">3 Stories</option>
          <option value="4">4 Stories</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="roofSoilLevel" className="block text-gray-900 font-medium mb-2">
          Roof Condition
        </label>
        <select
          id="roofSoilLevel"
          value={formData.roofSoilLevel}
          onChange={(e) => updateFormData({ roofSoilLevel: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="light">Lightly Soiled - Minor moss or algae</option>
          <option value="moderate">Moderately Dirty - Noticeable staining (most common)</option>
          <option value="heavy">Heavily Soiled - Significant moss, algae, or black streaks</option>
        </select>
        <p className="text-sm text-gray-600 mt-2">
          💡 Heavier buildup requires specialized treatment and affects pricing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="text-center">
          <img
            src="/homepagehouse.png"
            alt="Example of a one-story ranch home"
            className="w-full h-48 object-cover rounded-lg mb-2"
            loading="lazy"
          />
          <p className="font-semibold text-gray-900">Example: 1-Story Ranch Home</p>
        </div>
        <div className="text-center">
          <img
            src="/smithfieldhouse.JPG"
            alt="Example of a two-story Cape Cod home"
            className="w-full h-48 object-cover rounded-lg mb-2"
            loading="lazy"
          />
          <p className="font-semibold text-gray-900">Example: 2-Story Cape Cod Home</p>
        </div>
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
