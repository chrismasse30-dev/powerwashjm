import { useState } from 'react';
import { FormData } from './EstimatorForm';
import { HelpCircle, ExternalLink, ChevronLeft, ChevronRight, Home, Car, Check } from 'lucide-react';

interface Step2HouseSizeProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function Step2HouseSize({ formData, updateFormData, onContinue, onBack }: Step2HouseSizeProps) {
  const [showModal, setShowModal] = useState(false);
  const [zillowAddress, setZillowAddress] = useState('');
  const [zillowCity, setZillowCity] = useState('');
  const [zillowSqFt, setZillowSqFt] = useState('');

  const sizeRanges = [
    { value: '1599', label: 'Under 1,600', display: '< 1,600 sq ft' },
    { value: '1999', label: '1,600 - 2,000', display: '1,600 - 2,000 sq ft' },
    { value: '2499', label: '2,000 - 2,500', display: '2,000 - 2,500 sq ft' },
    { value: '2999', label: '2,500 - 3,000', display: '2,500 - 3,000 sq ft' },
    { value: '3999', label: '3,000 - 4,000', display: '3,000 - 4,000 sq ft' },
    { value: '4999', label: '4,000 - 5,000', display: '4,000 - 5,000 sq ft' },
    { value: '5000', label: '5,000+', display: '5,000+ sq ft' }
  ];

  const handleSizeTypeChange = (type: 'range' | 'exact') => {
    updateFormData({ sizeType: type });
  };

  const handleZillowSearch = () => {
    if (zillowAddress && zillowCity) {
      window.open(
        `https://www.zillow.com/homes/${zillowAddress.replace(/\s+/g, '-')}-${zillowCity.replace(/\s+/g, '-')}_rb/`,
        '_blank'
      );
    }
  };

  const handleZillowConfirm = () => {
    if (zillowSqFt) {
      updateFormData({ sizeType: 'exact', exactHouseSize: zillowSqFt });
      setShowModal(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">What's Your Home Size?</h2>
        <p className="text-gray-600">This helps us provide an accurate estimate</p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          Not sure? We'll help you find it
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleSizeTypeChange('range')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              formData.sizeType === 'range'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
            }`}
          >
            Select a Range
          </button>
          <button
            type="button"
            onClick={() => handleSizeTypeChange('exact')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              formData.sizeType === 'exact'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
            }`}
          >
            I Know the Exact Size
          </button>
        </div>

        {formData.sizeType === 'range' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sizeRanges.map(range => (
              <button
                key={range.value}
                type="button"
                onClick={() => updateFormData({ houseSize: range.value })}
                className={`p-4 rounded-xl text-center transition-all ${
                  formData.houseSize === range.value
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold">{range.label}</div>
                <div className={`text-xs mt-1 ${formData.houseSize === range.value ? 'text-blue-100' : 'text-gray-500'}`}>
                  sq ft
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <label htmlFor="exactHouseSize" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your home's square footage
            </label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="exactHouseSize"
                value={formData.exactHouseSize}
                onChange={(e) => updateFormData({ exactHouseSize: e.target.value })}
                placeholder="e.g., 2,150"
                className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">sq ft</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Garage Information</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-3">Do you have a garage?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateFormData({ hasGarage: true })}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  formData.hasGarage === true
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => updateFormData({
                  hasGarage: false,
                  garageAttachment: '',
                  garageCars: '',
                  garageCustomCars: ''
                })}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  formData.hasGarage === false
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {formData.hasGarage && (
            <>
              <div className="pl-4 border-l-4 border-blue-200">
                <label className="block text-gray-700 font-medium mb-3">
                  Is your garage attached or detached?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => updateFormData({ garageAttachment: 'attached' })}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      formData.garageAttachment === 'attached'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Attached
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData({ garageAttachment: 'detached' })}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      formData.garageAttachment === 'detached'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Detached
                  </button>
                </div>
              </div>

              <div className="pl-4 border-l-4 border-blue-200">
                <label className="block text-gray-700 font-medium mb-3">
                  How many cars does your garage fit?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['1', '2', 'other'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateFormData({ garageCars: option as '1' | '2' | 'other', garageCustomCars: '' })}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        formData.garageCars === option
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'other' ? 'Other' : `${option}-Car`}
                    </button>
                  ))}
                </div>

                {formData.garageCars === 'other' && (
                  <div className="mt-4">
                    <input
                      type="number"
                      value={formData.garageCustomCars}
                      onChange={(e) => updateFormData({ garageCustomCars: e.target.value })}
                      placeholder="Enter number of cars"
                      min="1"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                )}
              </div>

              {formData.garageCars && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    {formData.garageCars === 'other' && formData.garageCustomCars
                      ? `${formData.garageCustomCars}-car`
                      : `${formData.garageCars}-car`} {formData.garageAttachment} garage
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4">
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
          onClick={onContinue}
          className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              x
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Find Your Home Size</h2>
              <p className="text-gray-600 mt-2">We'll help you look it up on Zillow</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={zillowAddress}
                  onChange={(e) => setZillowAddress(e.target.value)}
                  placeholder="e.g., 123 Main St"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={zillowCity}
                  onChange={(e) => setZillowCity(e.target.value)}
                  placeholder="e.g., Smithfield"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                type="button"
                onClick={handleZillowSearch}
                disabled={!zillowAddress || !zillowCity}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Open Zillow Search
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Found your home's size? Enter it below:
              </p>
              <div className="relative mb-4">
                <input
                  type="number"
                  value={zillowSqFt}
                  onChange={(e) => setZillowSqFt(e.target.value)}
                  placeholder="Enter sq ft from Zillow"
                  className="w-full p-3 pr-16 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">sq ft</span>
              </div>
              <button
                type="button"
                onClick={handleZillowConfirm}
                disabled={!zillowSqFt}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Use This Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
