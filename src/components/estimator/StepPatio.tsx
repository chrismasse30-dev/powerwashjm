import { FormData } from './EstimatorForm';

interface StepPatioProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepPatio({ formData, updateFormData, onContinue, onBack }: StepPatioProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Patio, Pool & Walkway Details</h2>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Step #1: Areas you would like Washed</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="poolSqFt" className="block text-center text-gray-900 font-medium mb-2">
              Pool Apron (sq ft)
            </label>
            <input
              type="number"
              id="poolSqFt"
              value={formData.poolSqFt}
              onChange={(e) => updateFormData({ poolSqFt: parseInt(e.target.value, 10) || 0 })}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg text-center"
            />
          </div>
          <div>
            <label htmlFor="patioSqFt" className="block text-center text-gray-900 font-medium mb-2">
              Patio (sq ft)
            </label>
            <input
              type="number"
              id="patioSqFt"
              value={formData.patioSqFt}
              onChange={(e) => updateFormData({ patioSqFt: parseInt(e.target.value, 10) || 0 })}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg text-center"
            />
          </div>
          <div>
            <label htmlFor="walkwaySqFt" className="block text-center text-gray-900 font-medium mb-2">
              Walkway (sq ft)
            </label>
            <input
              type="number"
              id="walkwaySqFt"
              value={formData.walkwaySqFt}
              onChange={(e) => updateFormData({ walkwaySqFt: parseInt(e.target.value, 10) || 0 })}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg text-center"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Step #2: What is your area made of?</h4>
        <div className="mb-4">
          <label htmlFor="patioMaterial" className="block text-gray-900 font-medium mb-2">
            Material Type
          </label>
          <select
            id="patioMaterial"
            value={formData.patioMaterial}
            onChange={(e) => updateFormData({ patioMaterial: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="concrete">Concrete</option>
            <option value="pavers">Pavers</option>
            <option value="brick">Brick</option>
            <option value="bluestone">Bluestone</option>
            <option value="wood">Wood</option>
            <option value="composite">Composite Decking</option>
            <option value="asphalt">Asphalt</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Step #3: How dirty is the area?</h4>
        <div className="mb-4">
          <label htmlFor="patioDirtiness" className="block text-gray-900 font-medium mb-2">
            Dirtiness Level
          </label>
          <select
            id="patioDirtiness"
            value={formData.patioDirtiness}
            onChange={(e) => updateFormData({ patioDirtiness: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="light">Lightly Soiled</option>
            <option value="moderate">Moderately Dirty</option>
            <option value="heavy">Heavily Soiled / Stained</option>
          </select>
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
