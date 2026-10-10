import { Check, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface QuoteFormFieldsProps {
  formData: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    services: string[];
    propertyType: string;
    package: string;
  };
  errors: Record<string, string>;
  showPropertyType: boolean;
  isSubmitting: boolean;
  onFieldChange: (field: string, value: any) => void;
  onServiceToggle: (service: string) => void;
  hideServices?: boolean;
}

const SERVICE_AREA_STATES = ['RI', 'MA', 'CT', 'RHODE ISLAND', 'MASSACHUSETTS', 'CONNECTICUT'];
const DELAYED_VALIDATION_PREFIXES = ['C', 'M', 'R'];
const VALIDATION_DELAY_MS = 5000;
const TYPING_COMPLETE_DELAY_MS = 1000;

export default function QuoteFormFields({
  formData,
  errors,
  showPropertyType,
  isSubmitting,
  onFieldChange,
  onServiceToggle,
  hideServices = false
}: QuoteFormFieldsProps) {
  const services = [
    'House Washing',
    'Roof Cleaning',
    'Deck Cleaning',
    'Concrete Cleaning',
    'Gutter Cleaning',
    'Holiday Lights'
  ];

  const propertyTypes = ['Residential', 'Commercial'];
  const packages = ['Basic', 'Standard', 'Premium'];

  const [showStateWarning, setShowStateWarning] = useState(false);
  const stateInputTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingCompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firstLetterTimestampRef = useRef<number | null>(null);
  const previousStateRef = useRef<string>('');

  const isOutsideServiceArea = formData.state &&
    !SERVICE_AREA_STATES.includes(formData.state.toUpperCase().trim());

  const shouldDelayValidation = (value: string): boolean => {
    if (!value) return false;
    const firstLetter = value.charAt(0).toUpperCase();
    return DELAYED_VALIDATION_PREFIXES.includes(firstLetter);
  };

  useEffect(() => {
    const currentState = formData.state.trim();
    const previousState = previousStateRef.current;

    if (currentState !== previousState) {
      if (currentState === '') {
        setShowStateWarning(false);
        if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
        if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);
        firstLetterTimestampRef.current = null;
      } else if (currentState.length === 1 && shouldDelayValidation(currentState)) {
        setShowStateWarning(false);
        firstLetterTimestampRef.current = Date.now();

        if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
        stateInputTimerRef.current = setTimeout(() => {
          if (isOutsideServiceArea) {
            setShowStateWarning(true);
          }
        }, VALIDATION_DELAY_MS);
      } else if (currentState.length > 0) {
        if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);

        if (shouldDelayValidation(currentState)) {
          typingCompleteTimerRef.current = setTimeout(() => {
            if (isOutsideServiceArea) {
              setShowStateWarning(true);
            }
          }, TYPING_COMPLETE_DELAY_MS);
        } else {
          setShowStateWarning(isOutsideServiceArea);
        }
      }

      previousStateRef.current = currentState;
    }

    return () => {
      if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
      if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);
    };
  }, [formData.state, isOutsideServiceArea]);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9]*"
            value={formData.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
          Street Address *
        </label>
        <input
          type="text"
          id="address"
          name="address"
          autoComplete="street-address"
          value={formData.address}
          onChange={(e) => onFieldChange('address', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? 'address-error' : undefined}
        />
        {errors.address && (
          <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.address}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            autoComplete="address-level2"
            value={formData.city}
            onChange={(e) => onFieldChange('city', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && (
            <p id="city-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            autoComplete="address-level1"
            value={formData.state}
            onChange={(e) => onFieldChange('state', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.state || showStateWarning ? 'border-amber-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="MA, RI, or CT"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? 'state-error' : isOutsideServiceArea ? 'state-warning' : undefined}
          />
          {errors.state && (
            <p id="state-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.state}
            </p>
          )}
          {!errors.state && showStateWarning && (
            <div id="state-warning" className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2" role="alert">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Service Area Notice</p>
                <p>We currently serve Rhode Island, Massachusetts, and Connecticut. While we don't service your area yet, you can still submit your information and we'll notify you if we expand to your location!</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
            Zip Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={formData.zipCode}
            onChange={(e) => onFieldChange('zipCode', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.zipCode ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.zipCode}
            aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
          />
          {errors.zipCode && (
            <p id="zipCode-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.zipCode}
            </p>
          )}
        </div>
      </div>

      {!hideServices && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Services Needed *
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => onServiceToggle(service)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.services.includes(service)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                disabled={isSubmitting}
                aria-pressed={formData.services.includes(service)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formData.services.includes(service)
                        ? 'bg-blue-600'
                        : 'bg-white border-2 border-gray-300'
                    }`}
                  >
                    {formData.services.includes(service) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{service}</span>
                </div>
              </button>
            ))}
          </div>
          {errors.services && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.services}
            </p>
          )}
        </div>
      )}

      {showPropertyType && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Property Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onFieldChange('propertyType', type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.propertyType === type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  disabled={isSubmitting}
                  aria-pressed={formData.propertyType === type}
                >
                  <span className="text-gray-700 font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Package Selection
            </label>
            <div className="grid grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => onFieldChange('package', pkg)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.package === pkg
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  disabled={isSubmitting}
                  aria-pressed={formData.package === pkg}
                >
                  <span className="text-gray-700 font-medium">{pkg}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
