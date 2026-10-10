import { Home, FileText, Phone, DollarSign } from 'lucide-react';

interface ProgressBarProps {
  currentStep: string;
  currentStepIndex?: number;
  totalSteps?: number;
}

export default function ProgressBar({ currentStep, currentStepIndex, totalSteps }: ProgressBarProps) {
  const steps = [
    { id: 'step1', label: 'Services', category: 'step1', icon: Home },
    { id: 'details', label: 'Details', category: 'details', icon: FileText },
    { id: 'stepContact', label: 'Contact', category: 'stepContact', icon: Phone },
    { id: 'stepFinal', label: 'Estimate', category: 'stepFinal', icon: DollarSign }
  ];

  const detailsSteps = ['step2', 'step3', 'stepSolar', 'stepFence', 'stepDeck', 'stepDriveway', 'stepPatio', 'stepHouseDetails'];

  let currentCategory = '';
  if (currentStep === 'step1') currentCategory = 'step1';
  else if (detailsSteps.includes(currentStep)) currentCategory = 'details';
  else if (currentStep === 'stepContact') currentCategory = 'stepContact';
  else if (currentStep === 'stepFinal') currentCategory = 'stepFinal';

  const currentIndex = steps.findIndex(s => s.category === currentCategory);

  // Calculate overall progress percentage
  const progressPercentage = currentStepIndex !== undefined && totalSteps
    ? Math.round(((currentStepIndex + 1) / totalSteps) * 100)
    : 0;

  return (
    <div className="mb-10">
      {/* Modern status header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-semibold text-gray-600">
          Step {currentStepIndex !== undefined ? currentStepIndex + 1 : 1} of {totalSteps || 4}
        </div>
        <div className="text-sm font-bold text-blue-600">
          {progressPercentage}% Complete
        </div>
      </div>

      {/* Modern animated progress bar */}
      <div className="relative mb-8">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Modern step indicators with icons */}
      <div className="relative">
        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative"
                style={{ width: '25%' }}
              >
                {/* Icon circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-500 transform
                    ${isComplete
                      ? 'bg-blue-600 shadow-lg scale-100'
                      : isActive
                      ? 'bg-blue-600 shadow-xl scale-110 ring-4 ring-blue-200'
                      : 'bg-gray-300 scale-90'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-6 h-6 transition-colors duration-300
                      ${(isComplete || isActive) ? 'text-white' : 'text-gray-500'}
                    `}
                  />
                </div>

                {/* Step label */}
                <div
                  className={`
                    mt-3 text-sm font-semibold text-center transition-colors duration-300
                    ${(isComplete || isActive) ? 'text-blue-600' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </div>

                {/* Connecting line to next step */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 -z-10"
                    style={{
                      background: isComplete
                        ? 'linear-gradient(to right, #2563eb, #3b82f6)'
                        : '#e5e7eb'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
