import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { loadWebhooksFromEnv } from '../utils/webhookNotifications';
import { validateQuoteForm } from '../utils/formValidation';
import { submitQuote } from '../services/quoteSubmission';
import { useFormAutoSave } from '../hooks/useFormAutoSave';
import QuoteFormFields from './QuoteFormFields';
import ConfirmationModal from './ConfirmationModal';

interface QuoteFormProps {
  submitEmail?: string;
  pageSource?: string;
  showPropertyType?: boolean;
  initialData?: any;
  resumeQuoteId?: string;
  showTitle?: boolean;
  customTitle?: string;
  customDescription?: string;
  hideServices?: boolean;
  defaultServices?: string[];
}

export default function QuoteForm({
  submitEmail = 'sales@powerwashjm.com',
  pageSource,
  showPropertyType = false,
  initialData,
  resumeQuoteId,
  showTitle = true,
  customTitle = 'Get Your Free Quote',
  customDescription = "Fill out the form below and we'll get back to you with a detailed estimate",
  hideServices = false,
  defaultServices = []
}: QuoteFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zip || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    services: initialData?.services || (defaultServices.length > 0 ? defaultServices : [] as string[]),
    propertyType: initialData?.property_type || '',
    package: initialData?.package || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(resumeQuoteId || null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showServiceAreaError, setShowServiceAreaError] = useState(false);

  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('quote_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('quote_session_id', sid);
    }
    return sid;
  });

  const [ipData, setIpData] = useState<{city: string, state: string}>({city: '', state: ''});

  const SERVICED_STATES = ['MA', 'RI', 'CT', 'Massachusetts', 'Rhode Island', 'Connecticut'];

  useEffect(() => {
    loadWebhooksFromEnv();

    const fetchIpData = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Missing Supabase environment variables for IP location');
          return;
        }
        const apiUrl = `${supabaseUrl}/functions/v1/get-ip-location`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          }
        });

        if (!response.ok) {
          console.warn('IP location function returned status:', response.status);
          return;
        }

        const data = await response.json();

        if (data.error) {
          console.warn('IP location error:', data.error);
          return;
        }

        console.log('IP Data received:', { city: data.city, state: data.state });
        setIpData({
          city: data.city || '',
          state: data.state || ''
        });
      } catch (err) {
        console.error('Error fetching IP data:', err);
      }
    };

    fetchIpData();
  }, []);

  const { isSaving } = useFormAutoSave(
    formData,
    sessionId,
    submitEmail,
    pageSource || '',
    ipData,
    draftId,
    setDraftId
  );

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s: string) => s !== service)
        : [...prev.services, service]
    }));
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stateUpper = formData.state.toUpperCase().trim();
    const isServicedArea = SERVICED_STATES.some(s =>
      s.toUpperCase() === stateUpper || s.toUpperCase().startsWith(stateUpper)
    );

    if (!isServicedArea) {
      setShowServiceAreaError(true);
      return;
    }

    const validation = validateQuoteForm(formData, SERVICED_STATES, hideServices);

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.keys(validation.errors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const result = await submitQuote({
      formData,
      draftId,
      submitEmail,
      pageSource: pageSource || '',
      sessionId,
      ipData
    });

    if (result.success) {
      setSubmitStatus('success');
      setShowConfirmation(true);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        services: [],
        propertyType: '',
        package: ''
      });
      setDraftId(null);
      sessionStorage.removeItem('quote_session_id');
    } else {
      setSubmitStatus('error');

      // Handle specific error types with helpful messages
      const error = result.error;
      if (error?.code === '23505' && error?.message?.includes('idx_unique_active_email')) {
        // Duplicate email - this is actually OK, user may have submitted before
        alert(`We found an existing quote request with this email address. We'll review it and get back to you within 24 hours. If you need immediate assistance, please call (401) 595-0726.`);
      } else if (error?.code === '42501') {
        // RLS policy error
        alert(`Unable to submit form due to a security restriction. Please call (401) 595-0726 for immediate assistance.`);
      } else {
        // Generic error
        alert('There was an error submitting your quote. Please try again or call us at (401) 595-0726.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <section id="quote" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-3xl mx-auto">
          {showTitle && (
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {customTitle}
              </h2>
              <p className="text-xl text-gray-600">
                {customDescription}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            noValidate
            aria-label="Quote request form"
          >
            <QuoteFormFields
              formData={formData}
              errors={errors}
              showPropertyType={showPropertyType}
              isSubmitting={isSubmitting}
              onFieldChange={handleFieldChange}
              onServiceToggle={handleServiceToggle}
              hideServices={hideServices}
            />

            {isSaving && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving draft...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
            </button>

            {submitStatus === 'success' && (
              <div className="text-center text-green-600 font-semibold" role="status">
                Quote submitted successfully! We'll be in touch soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="text-center text-red-600 font-semibold" role="alert">
                There was an error submitting your quote. Please try again.
              </div>
            )}
          </form>
        </div>
      </section>

      {showServiceAreaError && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-area-title"
        >
          <div className="bg-white rounded-xl p-6 max-w-md">
            <h3 id="service-area-title" className="text-xl font-bold text-gray-900 mb-4">
              Service Area Notice
            </h3>
            <p className="text-gray-700 mb-6">
              We currently service Massachusetts (MA), Rhode Island (RI), and Connecticut (CT).
              If you're in a nearby area, please call us at (401) 595-0726 to discuss options.
            </p>
            <button
              onClick={() => setShowServiceAreaError(false)}
              className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} />
      )}
    </>
  );
}
