import { FormData } from './EstimatorForm';
import { ChevronLeft, ChevronRight, Pipette, Lightbulb } from 'lucide-react';

interface StepGutterProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepGutter({ formData, updateFormData, onContinue, onBack }: StepGutterProps) {
  const handleContinue = () => {
    if (formData.gutterLinearFeet <= 0) {
      alert('Please enter the linear footage of gutters.');
      return;
    }
    if (!formData.gutterStories) {
      alert('Please select the number of floors.');
      return;
    }
    onContinue();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Gutter Cleaning Details</h2>
        <p className="text-gray-600">Tell us about your gutters for an accurate estimate</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">Quick Tip</p>
          <p className="text-sm text-blue-800">
            To estimate linear footage, measure the perimeter of your home.
            Most homes have gutters running along all roof edges.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Linear Footage of Gutters *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            How many linear feet of gutters need cleaning? (Measure around the entire perimeter)
          </p>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.gutterLinearFeet || ''}
            onChange={(e) => updateFormData({ gutterLinearFeet: parseInt(e.target.value) || 0 })}
            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Enter linear feet (e.g., 200)"
          />
          <p className="text-xs text-gray-500 mt-2">
            Example: A typical 2,000 sq ft home has approximately 150-200 linear feet of gutters
          </p>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Number of Floors (Stories) *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            How many stories is your home?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['1', '2', '3', '4'].map(story => (
              <button
                key={story}
                type="button"
                onClick={() => updateFormData({ gutterStories: story })}
                className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                  formData.gutterStories === story
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {story} {story === '1' ? 'Story' : 'Stories'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Gutter Condition *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            How would you describe the current condition of your gutters?
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => updateFormData({ gutterSoilLevel: 'light' })}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                formData.gutterSoilLevel === 'light'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Lightly Soiled</div>
              <div className="text-sm text-gray-600 mt-1">
                Minor debris, recently cleaned (within the last year)
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateFormData({ gutterSoilLevel: 'moderate' })}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                formData.gutterSoilLevel === 'moderate'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Moderately Dirty</div>
              <div className="text-sm text-gray-600 mt-1">
                Noticeable buildup, some leaves and debris, cleaned 1-2 years ago
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateFormData({ gutterSoilLevel: 'heavy' })}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                formData.gutterSoilLevel === 'heavy'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Heavily Soiled/Clogged</div>
              <div className="text-sm text-gray-600 mt-1">
                Significant buildup, packed debris, possible clogs, not cleaned in 2+ years
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
