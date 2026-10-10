import { useState, useEffect, useRef } from 'react';
import { Check, X, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notifyWebhooks, loadWebhooksFromEnv } from '../utils/webhookNotifications';
import ConfirmationModal from './ConfirmationModal';
import { HOLIDAY_PACKAGES } from '../config/images';

interface HolidayLightsQuoteFormProps {
  submitEmail?: string;
  pageSource?: string;
}

export default function HolidayLightsQuoteForm({ submitEmail = 'Sales@powerwashjm.com', pageSource }: HolidayLightsQuoteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    services: ['Holiday Lights'] as string[],
    propertyType: '',
    package: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('quote_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('quote_session_id', sid);
    }
    return sid;
  });
  const [ipData, setIpData] = useState<{city: string, state: string}>({city: '', state: ''});
  const [showServiceAreaError, setShowServiceAreaError] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageTitle, setModalImageTitle] = useState('');

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imageModalOpen) {
        setImageModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageModalOpen]);

  useEffect(() => {
    if (imageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [imageModalOpen]);

  const saveDraft = async (data: typeof formData) => {
    if (!data.name && !data.phone && !data.email && !data.address) {
      return;
    }

    try {
      const sourcePath = pageSource || window.location.pathname;
      const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

      const draftData: any = {
        name: data.name || null,
        business_name: data.businessName || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zipCode || null,
        services: data.services,
        property_type: data.propertyType || null,
        package: data.package || null,
        submit_email: submitEmail,
        page_source: sourceLabel,
        session_id: sessionId,
        is_submitted: false
      };

      if (ipData.city) {
        draftData.ip_city = ipData.city;
      }
      if (ipData.state) {
        draftData.ip_state = ipData.state;
      }

      if (draftId) {
        await supabase
          .from('quote_submissions')
          .update(draftData)
          .eq('id', draftId);
      } else {
        const { data: newDraft, error } = await supabase
          .from('quote_submissions')
          .insert([draftData])
          .select()
          .maybeSingle();

        if (!error && newDraft) {
          setDraftId(newDraft.id);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(formData);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData]);

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

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let submissionData: any;

      if (draftId) {
        const sourcePath = pageSource || window.location.pathname;
        const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

        const updateData: any = {
          name: formData.name,
          business_name: formData.businessName || null,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          services: formData.services,
          is_submitted: true,
          property_type: formData.propertyType || null,
          package: formData.package || null,
          submit_email: submitEmail,
          page_source: sourceLabel,
          status: 'Needs Measure',
          requires_measurement: true
        };

        if (ipData.city) {
          updateData.ip_city = ipData.city;
        }
        if (ipData.state) {
          updateData.ip_state = ipData.state;
        }

        const { data, error } = await supabase
          .from('quote_submissions')
          .update(updateData)
          .eq('id', draftId)
          .select()
          .maybeSingle();

        if (error) throw error;
        submissionData = data;
      } else {
        const sourcePath = pageSource || window.location.pathname;
        const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

        const insertData: any = {
          name: formData.name,
          business_name: formData.businessName || null,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          services: formData.services,
          is_submitted: true,
          property_type: formData.propertyType || null,
          package: formData.package || null,
          submit_email: submitEmail,
          page_source: sourceLabel,
          session_id: sessionId,
          status: 'Needs Measure',
          requires_measurement: true
        };

        if (ipData.city) {
          insertData.ip_city = ipData.city;
        }
        if (ipData.state) {
          insertData.ip_state = ipData.state;
        }

        const { data, error } = await supabase
          .from('quote_submissions')
          .insert([insertData])
          .select()
          .maybeSingle();

        if (error) throw error;
        submissionData = data;
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-quote-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        });

        if (!emailResponse.ok) {
          console.error('Email notification failed:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      try {
        await notifyWebhooks(submissionData);
      } catch (webhookError) {
        console.error('Error sending webhook notifications:', webhookError);
      }

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-customer-autoresponse`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: submissionData.id,
            customerName: submissionData.name,
            customerEmail: submissionData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            services: formData.services,
            propertyType: formData.propertyType,
            package: formData.package,
          })
        });
      } catch (autoResponseError) {
        console.error('Error sending customer autoresponse:', autoResponseError);
      }

      setSubmitStatus('success');
      setDraftId(null);
      sessionStorage.removeItem('quote_session_id');

      setFormData({
        name: '',
        businessName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        services: ['Holiday Lights'],
        propertyType: '',
        package: ''
      });

      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      setSubmitStatus('error');

      // Handle specific error types with helpful messages
      if (error.code === '23505' && error.message?.includes('idx_unique_active_email')) {
        // Duplicate email - this is actually OK, user may have submitted before
        alert(`We found an existing quote request with this email address. We'll review it and get back to you within 24 hours. If you need immediate assistance, please call (401) 595-0726.`);
      } else if (error.code === '42501') {
        // RLS policy error
        alert(`Unable to submit form due to a security restriction. Please call (401) 595-0726 for immediate assistance.`);
      } else {
        // Generic error
        alert(`Error submitting form. Please call (401) 595-0726 for immediate assistance.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      />

      {showServiceAreaError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Area Notice</h3>
            <p className="text-gray-700 mb-6">
              We're sorry, but we are not currently servicing your area. We currently provide services only in Massachusetts, Rhode Island, and Connecticut.
            </p>
            <p className="text-gray-600 mb-6 text-sm">
              If you'd like to be notified when we expand to your area, please contact us at{' '}
              <a href="mailto:Sales@powerwashjm.com" className="text-blue-600 hover:underline">
                Sales@powerwashjm.com
              </a>
            </p>
            <button
              onClick={() => setShowServiceAreaError(false)}
              className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <section id="quote" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-4">
            Get Your Free Quote
          </h2>
          <p className="text-xl text-gray-600">
            Fill out the form below and we'll get back to you within 24 hours
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold">100% Satisfaction Guarantee</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-xl p-8 lg:p-12 border border-blue-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
                placeholder="(401) 555-1234"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
              placeholder="john@example.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
              placeholder="ABC Company"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900 bg-white"
              >
                <option value="">Select State</option>
                <option value="MA">Massachusetts</option>
                <option value="RI">Rhode Island</option>
                <option value="CT">Connecticut</option>
                <option value="Other" disabled>-- Outside Service Area --</option>
              </select>
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all text-gray-900"
                placeholder="12345"
                pattern="[0-9]{5}"
                maxLength={5}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Services Needed *
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-300">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="holiday-lights"
                  checked={true}
                  readOnly
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="holiday-lights" className="text-gray-900 font-medium">
                  Holiday Lights
                </label>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="propertyType" className="block text-sm font-semibold text-gray-900 mb-2">
              Property Type *
            </label>
            <select
              id="propertyType"
              required
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value, package: '' })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all bg-white text-gray-900"
            >
              <option value="">Select Property Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {formData.propertyType === 'Residential' && (
            <div className="mb-6 bg-gradient-to-b from-blue-50 to-white p-6 rounded-2xl">
              <label className="block text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
                Which package best fits your needs? *
              </label>
              <p className="text-center text-gray-700 mb-6 text-base md:text-lg font-medium">
                All packages include professional installation, maintenance, removal, and storage
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full">
                    <input
                      type="radio"
                      id="tinsel-package"
                      name="package"
                      value="The Tinsel Package"
                      checked={formData.package === 'The Tinsel Package'}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="tinsel-package"
                      className={`block relative rounded-2xl overflow-visible transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl mb-2 w-full cursor-pointer ${
                        formData.package === 'The Tinsel Package'
                          ? 'holiday-lights-border ring-4 ring-blue-500 ring-offset-2'
                          : 'border-4 border-gray-300 hover:border-blue-400 bg-white shadow-lg'
                      }`}
                    >
                    {formData.package === 'The Tinsel Package' && (
                      <>
                        <div className="string-lights top">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`top-${i}`}
                              className={`holiday-light ${['red', 'yellow', 'green', 'blue'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, top: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights bottom">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`bottom-${i}`}
                              className={`holiday-light ${['blue', 'green', 'yellow', 'red'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, bottom: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights left">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`left-${i}`}
                              className={`holiday-light ${['green', 'blue', 'red', 'yellow'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, left: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights right">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`right-${i}`}
                              className={`holiday-light ${['yellow', 'red', 'blue', 'green'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, right: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="holiday-light red" style={{ position: 'absolute', top: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light blue" style={{ position: 'absolute', top: '-18px', right: '-18px' }}></div>
                        <div className="holiday-light green" style={{ position: 'absolute', bottom: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light yellow" style={{ position: 'absolute', bottom: '-18px', right: '-18px' }}></div>
                      </>
                    )}
                      <div className="w-full aspect-[3/4] flex items-center justify-center p-3 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl shadow-2xl">
                        <img
                          src={HOLIDAY_PACKAGES.tinsel}
                          alt="The Tinsel Package - Roofline lighting only"
                          className="w-full h-full object-contain rounded-lg"
                          loading="eager"
                          style={{
                            filter: 'brightness(1.05) contrast(1.08) saturate(1.12)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalImageSrc(HOLIDAY_PACKAGES.tinsel);
                            setModalImageTitle('The Tinsel Package');
                            setImageModalOpen(true);
                          }}
                          className="absolute bottom-3 right-3 bg-white/95 hover:bg-white px-3 py-2 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all z-20 border-2 border-gray-200 hover:border-blue-500"
                        >
                          <ZoomIn className="w-4 h-4" />
                          <span className="hidden sm:inline">View Full Size</span>
                        </button>
                        {formData.package === 'The Tinsel Package' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData({ ...formData, package: '' });
                            }}
                            className="absolute top-3 right-3 bg-green-600 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Click to deselect this package"
                            aria-label="Deselect The Tinsel Package"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <div className="absolute top-3 left-3 z-20 pointer-events-none">
                          <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all shadow-md ${
                            formData.package === 'The Tinsel Package'
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-400'
                          }`}>
                            {formData.package === 'The Tinsel Package' && (
                              <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="text-center w-full px-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">The Tinsel Package</h3>
                    <p className="text-sm md:text-base text-gray-700 mb-3 font-medium">Roofline lighting only</p>
                    <p className="text-lg md:text-xl font-bold text-green-700 bg-green-50 py-2 px-4 rounded-full inline-block">Starting at $599</p>
                  </div>
                </div>

                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full">
                    <input
                      type="radio"
                      id="garland-package"
                      name="package"
                      value="The Garland Package"
                      checked={formData.package === 'The Garland Package'}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="garland-package"
                      className={`block relative rounded-2xl overflow-visible transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl mb-2 w-full cursor-pointer ${
                        formData.package === 'The Garland Package'
                          ? 'holiday-lights-border ring-4 ring-blue-500 ring-offset-2'
                          : 'border-4 border-gray-300 hover:border-blue-400 bg-white shadow-lg'
                      }`}
                    >
                    {formData.package === 'The Garland Package' && (
                      <>
                        <div className="string-lights top">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`top-${i}`}
                              className={`holiday-light ${['red', 'yellow', 'green', 'blue'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, top: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights bottom">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`bottom-${i}`}
                              className={`holiday-light ${['blue', 'green', 'yellow', 'red'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, bottom: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights left">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`left-${i}`}
                              className={`holiday-light ${['green', 'blue', 'red', 'yellow'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, left: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights right">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`right-${i}`}
                              className={`holiday-light ${['yellow', 'red', 'blue', 'green'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, right: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="holiday-light red" style={{ position: 'absolute', top: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light blue" style={{ position: 'absolute', top: '-18px', right: '-18px' }}></div>
                        <div className="holiday-light green" style={{ position: 'absolute', bottom: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light yellow" style={{ position: 'absolute', bottom: '-18px', right: '-18px' }}></div>
                      </>
                    )}
                      <div className="w-full aspect-[3/4] flex items-center justify-center p-3 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 rounded-xl shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-t-xl shadow-lg font-bold text-xs uppercase tracking-wide z-20 text-center pointer-events-none">
                          Most Popular
                        </div>
                        <img
                          src={HOLIDAY_PACKAGES.garland}
                          alt="The Garland Package - Roofline and walkway lighting"
                          className="w-full h-full object-contain rounded-lg"
                          loading="eager"
                          style={{
                            filter: 'brightness(1.05) contrast(1.08) saturate(1.12)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalImageSrc(HOLIDAY_PACKAGES.garland);
                            setModalImageTitle('The Garland Package');
                            setImageModalOpen(true);
                          }}
                          className="absolute bottom-3 right-3 bg-white/95 hover:bg-white px-3 py-2 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all z-20 border-2 border-gray-200 hover:border-blue-500"
                        >
                          <ZoomIn className="w-4 h-4" />
                          <span className="hidden sm:inline">View Full Size</span>
                        </button>
                        {formData.package === 'The Garland Package' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData({ ...formData, package: '' });
                            }}
                            className="absolute top-3 right-3 bg-green-600 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Click to deselect this package"
                            aria-label="Deselect The Garland Package"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <div className="absolute top-3 left-3 z-20 pointer-events-none">
                          <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all shadow-md ${
                            formData.package === 'The Garland Package'
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-400'
                          }`}>
                            {formData.package === 'The Garland Package' && (
                              <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="text-center w-full px-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">The Garland Package</h3>
                    <p className="text-sm md:text-base text-gray-700 mb-3 font-medium">Roofline + walkway lighting</p>
                    <p className="text-lg md:text-xl font-bold text-green-700 bg-green-50 py-2 px-4 rounded-full inline-block">Starting at $999</p>
                  </div>
                </div>

                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full">
                    <input
                      type="radio"
                      id="gingerbread-package"
                      name="package"
                      value="The Gingerbread Package"
                      checked={formData.package === 'The Gingerbread Package'}
                      onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor="gingerbread-package"
                      className={`block relative rounded-2xl overflow-visible transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl mb-2 w-full cursor-pointer ${
                        formData.package === 'The Gingerbread Package'
                          ? 'holiday-lights-border ring-4 ring-blue-500 ring-offset-2'
                          : 'border-4 border-gray-300 hover:border-blue-400 bg-white shadow-lg'
                      }`}
                    >
                    {formData.package === 'The Gingerbread Package' && (
                      <>
                        <div className="string-lights top">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`top-${i}`}
                              className={`holiday-light ${['red', 'yellow', 'green', 'blue'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, top: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights bottom">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={`bottom-${i}`}
                              className={`holiday-light ${['blue', 'green', 'yellow', 'red'][i % 4]}`}
                              style={{ left: `${(i * 16) + 14}%`, bottom: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights left">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`left-${i}`}
                              className={`holiday-light ${['green', 'blue', 'red', 'yellow'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, left: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="string-lights right">
                          <div className="light-wire"></div>
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={`right-${i}`}
                              className={`holiday-light ${['yellow', 'red', 'blue', 'green'][i % 4]}`}
                              style={{ top: `${(i * 25) + 15}%`, right: '0px' }}
                            />
                          ))}
                        </div>
                        <div className="holiday-light red" style={{ position: 'absolute', top: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light blue" style={{ position: 'absolute', top: '-18px', right: '-18px' }}></div>
                        <div className="holiday-light green" style={{ position: 'absolute', bottom: '-18px', left: '-18px' }}></div>
                        <div className="holiday-light yellow" style={{ position: 'absolute', bottom: '-18px', right: '-18px' }}></div>
                      </>
                    )}
                      <div className="w-full aspect-[3/4] flex items-center justify-center p-3 relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-xl shadow-2xl">
                        <img
                          src={HOLIDAY_PACKAGES.gingerbread}
                          alt="The Gingerbread Package - Full property lighting"
                          className="w-full h-full object-contain rounded-lg"
                          loading="eager"
                          style={{
                            filter: 'brightness(1.05) contrast(1.08) saturate(1.12)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setModalImageSrc(HOLIDAY_PACKAGES.gingerbread);
                            setModalImageTitle('The Gingerbread Package');
                            setImageModalOpen(true);
                          }}
                          className="absolute bottom-3 right-3 bg-white/95 hover:bg-white px-3 py-2 rounded-full text-xs font-semibold text-gray-900 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all z-20 border-2 border-gray-200 hover:border-blue-500"
                        >
                          <ZoomIn className="w-4 h-4" />
                          <span className="hidden sm:inline">View Full Size</span>
                        </button>
                        {formData.package === 'The Gingerbread Package' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData({ ...formData, package: '' });
                            }}
                            className="absolute top-3 right-3 bg-green-600 hover:bg-red-600 text-white rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            title="Click to deselect this package"
                            aria-label="Deselect The Gingerbread Package"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <div className="absolute top-3 left-3 z-20 pointer-events-none">
                          <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all shadow-md ${
                            formData.package === 'The Gingerbread Package'
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-400'
                          }`}>
                            {formData.package === 'The Gingerbread Package' && (
                              <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="text-center w-full px-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">The Gingerbread Package</h3>
                    <p className="text-sm md:text-base text-gray-700 mb-3 font-medium">Full property lighting</p>
                    <p className="text-lg md:text-xl font-bold text-green-700 bg-green-50 py-2 px-4 rounded-full inline-block">Starting at $1499</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.propertyType === 'Commercial' && (
            <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Commercial Holiday Lighting</h3>
              <p className="text-gray-700 mb-4">
                We provide custom commercial holiday lighting solutions tailored to your business needs. Our team will work with you to create a professional, festive display that enhances your property.
              </p>
              <p className="text-sm text-gray-600">
                A member of our team will contact you to discuss your specific requirements and provide a detailed quote.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (formData.propertyType === 'Residential' && !formData.package)}
            className="w-full bg-gradient-to-r from-green-600 to-red-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-green-700 hover:to-red-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Submitting...' : 'Get My Free Quote'}
          </button>

          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center">
                There was an error submitting your quote. Please try again or call us at (401) 595-0726
              </p>
            </div>
          )}
        </form>
        </div>
      </section>

      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fadeIn p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 z-50"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-6xl w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 bg-gray-50">
                <img
                  src={modalImageSrc}
                  alt={modalImageTitle}
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                  style={{
                    maxHeight: '80vh',
                    filter: 'brightness(1.05) contrast(1.08) saturate(1.12)',
                  }}
                />
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <p className="text-center text-gray-700 text-lg font-semibold mb-3">
                  {modalImageTitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  {formData.package === modalImageTitle ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, package: '' });
                          setImageModalOpen(false);
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold text-base hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        <span>Deselect This Package</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(false)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>Keep Selected</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, package: modalImageTitle });
                          setImageModalOpen(false);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <span>Select This Package</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold text-base hover:bg-gray-200 transition-all"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
                <p className="text-center text-gray-500 text-xs mt-3">
                  Press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
