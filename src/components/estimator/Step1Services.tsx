import { FormData } from './EstimatorForm';
import { Home, Droplets, Trees, Car, Fence, Sun, LayoutGrid, Pipette, Check, Shield, Clock, Award } from 'lucide-react';

interface Step1ServicesProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onContinue: () => void;
}

export default function Step1Services({ formData, updateFormData, onContinue }: Step1ServicesProps) {
  const services = [
    {
      id: 'houseWash',
      label: 'House Wash',
      description: 'Remove dirt, mold, and mildew from all exterior surfaces',
      icon: Home,
      popular: true
    },
    {
      id: 'roof',
      label: 'Roof Cleaning',
      description: 'Eliminate algae, moss, and black streaks from your roof',
      icon: Droplets,
      popular: true
    },
    {
      id: 'patio',
      label: 'Pool, Patio, Walkway',
      description: 'Clean concrete, pavers, and stone surfaces',
      icon: LayoutGrid,
      popular: false
    },
    {
      id: 'driveway',
      label: 'Driveway Wash',
      description: 'Remove oil stains, dirt, and grime from driveways',
      icon: Car,
      popular: false
    },
    {
      id: 'fence',
      label: 'Fence Wash',
      description: 'Restore wood or vinyl fencing to like-new condition',
      icon: Fence,
      popular: false
    },
    {
      id: 'solar',
      label: 'Solar Panel Cleaning',
      description: 'Maximize efficiency by removing dust and debris',
      icon: Sun,
      popular: false
    },
    {
      id: 'deck',
      label: 'Deck Wash',
      description: 'Clean and protect wooden or composite decking',
      icon: Trees,
      popular: false
    },
    {
      id: 'gutter',
      label: 'Gutter Cleaning',
      description: 'Remove debris and buildup from gutters and downspouts',
      icon: Pipette,
      popular: false
    }
  ];

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = formData.services.includes(serviceId)
      ? formData.services.filter(s => s !== serviceId)
      : [...formData.services, serviceId];
    updateFormData({ services: updatedServices });
  };

  const handleContinue = () => {
    if (formData.services.length === 0) {
      return;
    }
    onContinue();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">What Can We Help You With?</h2>
        <p className="text-gray-600">Select all the services you're interested in</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>100% Satisfaction Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-full">
          <Clock className="w-4 h-4 text-green-600" />
          <span>Same-Day Quotes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-4 py-2 rounded-full">
          <Award className="w-4 h-4 text-amber-600" />
          <span>1,000+ Happy Customers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {services.map(service => {
          const Icon = service.icon;
          const isSelected = formData.services.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceToggle(service.id)}
              className={`
                relative p-5 border-2 rounded-xl text-left transition-all duration-200 group
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {service.popular && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Popular
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-lg ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {service.label}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {service.description}
                  </p>
                </div>

                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 group-hover:border-blue-400'
                  }
                `}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {formData.services.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900">
                {formData.services.length} service{formData.services.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-green-700">Bundle multiple services and save!</p>
            </div>
          </div>
        </div>
      )}

      {formData.services.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
              !
            </div>
            <p className="text-amber-800">Please select at least one service to continue</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={formData.services.length === 0}
          className={`
            px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200
            ${formData.services.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }
          `}
        >
          Continue to Details
        </button>
      </div>
    </div>
  );
}
