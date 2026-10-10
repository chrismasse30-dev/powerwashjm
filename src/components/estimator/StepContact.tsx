import { useState, useEffect, useRef } from 'react';
import { FormData } from './EstimatorForm';
import { Upload, AlertTriangle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyWebhooks } from '../../utils/webhookNotifications';
import { trackQuoteRequest } from '../../utils/analytics';
import { areEmailNotificationsEnabled } from '../../utils/emailNotifications';
import { getSiteSetting } from '../../services/siteSettingsService';
import { logSurchargeApplication } from '../../utils/serviceAreaSurcharge';
import { sendInstantQuoteConfirmation } from '../../services/instantQuoteEmailService';

const SERVICE_AREA_STATES = ['RI', 'MA', 'CT', 'RHODE ISLAND', 'MASSACHUSETTS', 'CONNECTICUT'];
const DELAYED_VALIDATION_PREFIXES = ['C', 'M', 'R'];
const VALIDATION_DELAY_MS = 5000;
const TYPING_COMPLETE_DELAY_MS = 1000;

interface StepContactProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  uploadedFiles: Array<{ name: string; dataUrl: string }>;
  setUploadedFiles: (files: Array<{ name: string; dataUrl: string }>) => void;
  estimateSummary: Array<{ service: string; details: string }>;
  estimateRange: { min: number; max: number };
  onContinue: (quoteId?: string) => void;
  onAddService: (serviceId: string) => void;
  onBack: () => void;
  surchargeInfo: { surcharge: number; distance: number; ruleId: string | null; baseZipCode: string } | null;
}

export default function StepContact({
  formData,
  updateFormData,
  uploadedFiles,
  setUploadedFiles,
  estimateSummary,
  estimateRange,
  onContinue,
  onAddService,
  onBack,
  surchargeInfo
}: StepContactProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [loadingTestingMode, setLoadingTestingMode] = useState(true);
  const [showStateWarning, setShowStateWarning] = useState(false);
  const stateInputTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingCompleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firstLetterTimestampRef = useRef<number | null>(null);
  const previousStateRef = useRef<string>('');

  // Check if testing mode is active
  useEffect(() => {
    const checkTestingMode = async () => {
      try {
        const notificationsEnabled = await getSiteSetting('notifications_enabled');
        setIsTestingMode(notificationsEnabled === 'false');
      } catch (error) {
        console.error('Error checking testing mode:', error);
        setIsTestingMode(false);
      } finally {
        setLoadingTestingMode(false);
      }
    };

    checkTestingMode();
  }, []);

  // Delayed validation logic for state input starting with C, M, or R
  useEffect(() => {
    const currentState = formData.contact_state.trim();
    const previousState = previousStateRef.current;
    const isOutsideServiceArea = currentState && !SERVICE_AREA_STATES.includes(currentState.toUpperCase());

    const shouldDelayValidation = (value: string): boolean => {
      if (!value) return false;
      const firstLetter = value.charAt(0).toUpperCase();
      return DELAYED_VALIDATION_PREFIXES.includes(firstLetter);
    };

    if (currentState !== previousState) {
      // Clear field - reset everything
      if (currentState === '') {
        setShowStateWarning(false);
        if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
        if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);
        firstLetterTimestampRef.current = null;
      }
      // First letter typed, and it's C, M, or R
      else if (currentState.length === 1 && shouldDelayValidation(currentState)) {
        setShowStateWarning(false);
        firstLetterTimestampRef.current = Date.now();

        // Start 5-second timer for delayed validation
        if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
        stateInputTimerRef.current = setTimeout(() => {
          if (isOutsideServiceArea) {
            setShowStateWarning(true);
          }
        }, VALIDATION_DELAY_MS);
      }
      // User continues typing
      else if (currentState.length > 0) {
        // Clear the typing complete timer and restart it
        if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);

        // If started with C, M, or R, wait for typing to complete
        if (shouldDelayValidation(currentState)) {
          typingCompleteTimerRef.current = setTimeout(() => {
            if (isOutsideServiceArea) {
              setShowStateWarning(true);
            }
          }, TYPING_COMPLETE_DELAY_MS);
        }
        // Other prefixes - show warning immediately
        else {
          setShowStateWarning(isOutsideServiceArea);
        }
      }

      previousStateRef.current = currentState;
    }

    // Cleanup timers on unmount
    return () => {
      if (stateInputTimerRef.current) clearTimeout(stateInputTimerRef.current);
      if (typingCompleteTimerRef.current) clearTimeout(typingCompleteTimerRef.current);
    };
  }, [formData.contact_state]);

  const validateForm = (): boolean => {
    // TESTING MODE: Bypass all validation when testing mode is active
    if (isTestingMode) {
      console.log('🔴 TESTING MODE: Skipping contact form validation');
      return true;
    }

    // PRODUCTION MODE: Validate all required fields
    const newErrors: string[] = [];

    console.log('📋 Validating form with data:', {
      name: formData.contact_name,
      phone: formData.contact_phone,
      email: formData.contact_email,
      address: formData.contact_address,
      city: formData.contact_city,
      state: formData.contact_state,
      zip: formData.contact_zip
    });

    if (!formData.contact_name.trim()) newErrors.push('Name is required');
    if (!formData.contact_phone.trim()) newErrors.push('Phone is required');
    if (!formData.contact_email.trim()) newErrors.push('Email is required');
    if (!formData.contact_address.trim()) newErrors.push('Street Address is required');
    if (!formData.contact_city.trim()) newErrors.push('City is required');
    if (!formData.contact_state.trim()) newErrors.push('State is required');
    if (!formData.contact_zip.trim()) newErrors.push('Zip Code is required');

    if (newErrors.length > 0) {
      console.log('❌ Validation failed:', newErrors);
    } else {
      console.log('✅ Validation passed');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const submitEstimateToDatabase = async () => {
    try {
      const summaryText = estimateSummary.map(item => `${item.service}: ${item.details}`).join('\n');
      const averagePrice = Math.round((estimateRange.min + estimateRange.max) / 2);
      const estimateText = `$${averagePrice.toLocaleString()}`;

      // Upload images to Supabase storage and get public URLs
      const imageUrls: string[] = [];
      for (const file of uploadedFiles) {
        try {
          // Convert data URL to blob
          const response = await fetch(file.dataUrl);
          const blob = await response.blob();

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `${timestamp}-${randomStr}.${fileExt}`;

          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('estimate-images')
            .upload(fileName, blob, {
              contentType: blob.type,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('estimate-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        } catch (uploadErr) {
          console.error('Error processing image upload:', uploadErr);
        }
      }

      const pricingBreakdown: any = {
        estimate_min: estimateRange.min,
        estimate_max: estimateRange.max,
        services_selected: formData.services,
        surcharge_applied: surchargeInfo?.surcharge || 0,
        distance_from_base: surchargeInfo?.distance || 0
      };

      if (formData.houseSize) pricingBreakdown.house_size = formData.houseSize;
      if (formData.roofSize) pricingBreakdown.roof_size = formData.roofSize;
      if (formData.deckSize) pricingBreakdown.deck_size = formData.deckSize;
      if (formData.patioSize) pricingBreakdown.patio_size = formData.patioSize;
      if (formData.drivewaySize) pricingBreakdown.driveway_size = formData.drivewaySize;
      if (formData.fenceLength) pricingBreakdown.fence_length = formData.fenceLength;
      if (formData.solarPanels) pricingBreakdown.solar_panels = formData.solarPanels;

      const insertData: any = {
        name: formData.contact_name,
        phone: formData.contact_phone,
        email: formData.contact_email,
        address: formData.contact_address,
        city: formData.contact_city,
        state: formData.contact_state,
        zip: formData.contact_zip,
        services: formData.services,
        submit_email: 'Sales@powerwashjm.com',
        page_source: 'Instant Quote Page',
        session_id: Date.now().toString(),
        is_submitted: true,
        total_price: averagePrice,
        pricing_breakdown: pricingBreakdown,
        sq_ft: formData.houseSize || null
      };

      // Add gutter cleaning data if gutter service is selected
      if (formData.services.includes('gutter')) {
        insertData.gutter_linear_feet = formData.gutterLinearFeet || null;
        insertData.gutter_stories = formData.gutterStories || null;
        insertData.gutter_soil_level = formData.gutterSoilLevel || null;
      }

      console.log('📝 Inserting data to database:', insertData);

      const { data, error} = await supabase
        .from('quote_submissions')
        .insert([insertData])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Database insert error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message || 'Unknown database error'}`);
      }

      console.log('✅ Database insert successful, record ID:', data?.id);

      if (data && surchargeInfo && surchargeInfo.surcharge > 0) {
        try {
          await logSurchargeApplication(
            data.id,
            formData.contact_zip,
            surchargeInfo
          );
          console.log('✅ Surcharge logged successfully');
        } catch (surchargeError) {
          console.error('⚠️ Error logging surcharge:', surchargeError);
          // Continue execution even if surcharge logging fails
        }
      }

      // Send customer confirmation email
      try {
        const testingModeActive = (await getSiteSetting('notifications_enabled')) === 'false';

        if (!testingModeActive) {
          await sendInstantQuoteConfirmation({
            customerName: formData.contact_name,
            customerEmail: formData.contact_email,
            customerPhone: formData.contact_phone,
            estimateRange: estimateText,
            quoteId: data?.id
          });
          console.log('✅ Instant quote confirmation email sent');
        } else {
          console.log('🔴 TESTING MODE: Instant quote confirmation email suppressed');
        }
      } catch (customerEmailError) {
        console.error('⚠️ Error sending instant quote confirmation email:', customerEmailError);
        // Continue execution even if customer email fails
      }

      // Build image HTML section
      let imageHtml = '';
      if (imageUrls.length > 0) {
        imageHtml = '\n\nProperty Photos:\n' + imageUrls.map((url, index) =>
          `Photo ${index + 1}: ${url}`
        ).join('\n');
      }

      // Send email notification - formatted like QuickMeasure emails
      const message = `
Hello,

A new form has been submitted on your website. Details below.

Email
${formData.contact_email}

Message
New Instant Estimate Request!

Customer Information:
- Name: ${formData.contact_name}
- Phone: ${formData.contact_phone}
- Email: ${formData.contact_email}

Property Details:
- Address: ${formData.contact_address}
- City: ${formData.contact_city}
- State: ${formData.contact_state}
- Zip Code: ${formData.contact_zip}

Estimate Summary:
${summaryText}

Estimated Price Range: ${estimateText}${imageHtml}

Source: Instant Online Estimate Tool
Submitted at: ${new Date().toLocaleString()}
      `.trim();

      // Only send email if notifications are enabled AND testing mode is NOT active
      try {
        const notificationsEnabled = areEmailNotificationsEnabled();
        const testingModeActive = (await getSiteSetting('notifications_enabled')) === 'false';

        if (notificationsEnabled && !testingModeActive) {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_key: 'fd56a2dd-939a-402e-955d-5d6345cadc3c',
              subject: `New Instant Estimate Request from ${formData.contact_name}`,
              from_name: formData.contact_name,
              email: 'Sales@powerwashjm.com',
              cc: 'jmpowerwashing@yahoo.com',
              message: message,
              replyto: formData.contact_email
            })
          });
          console.log('✅ Email notification sent (Testing Mode: OFF)');
        } else if (testingModeActive) {
          console.log('🔴 TESTING MODE: Email notification suppressed');
        } else {
          console.log('⏸️ Email notifications disabled by user');
        }
      } catch (emailError) {
        console.error('⚠️ Error sending email notification:', emailError);
        // Continue execution even if email fails
      }

      // Send webhooks
      try {
        if (data) {
          await notifyWebhooks(data);
        }
      } catch (webhookError) {
        console.error('⚠️ Error sending webhooks:', webhookError);
        // Continue execution even if webhooks fail
      }

      // Track analytics
      try {
        trackQuoteRequest({
          service: formData.services[0] || 'Unknown',
          property_type: null,
          location: `${formData.contact_city}, ${formData.contact_state}`
        });
      } catch (analyticsError) {
        console.error('⚠️ Error tracking analytics:', analyticsError);
        // Continue execution even if analytics fail
      }

      console.log('✅ Quote submission completed successfully');
      return data?.id || null;
    } catch (error) {
      console.error('❌ Error submitting estimate:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      setErrors([`Failed to submit estimate: ${errorMessage}`]);
      return null;
    }
  };

  const handleContinue = async () => {
    console.log('🚀 handleContinue called');
    const isValid = validateForm();
    console.log('Validation result:', isValid);

    if (isValid) {
      console.log('✅ Form is valid, proceeding with submission...');
      setSubmitting(true);
      const quoteId = await submitEstimateToDatabase();
      setSubmitting(false);

      if (quoteId) {
        console.log('✅ Submission successful, quoteId:', quoteId);
        onContinue(quoteId);
      } else {
        console.log('❌ Submission failed');
      }
    } else {
      console.log('❌ Form validation failed, not submitting');
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setUploadError('');

    if (uploadedFiles.length + files.length > 5) {
      setUploadError('You can only upload a maximum of 5 images.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedFiles([...uploadedFiles, { name: file.name, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const unselectedServices = [
    { id: 'houseWash', label: 'House Wash' },
    { id: 'roof', label: 'Roof Cleaning' },
    { id: 'patio', label: 'Pool, Patio, Walkway' },
    { id: 'fence', label: 'Fence Wash' },
    { id: 'solar', label: 'Solar Panel Cleaning' },
    { id: 'deck', label: 'Deck Wash' }
  ].filter(service => !formData.services.includes(service.id));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
      <p className="text-center text-gray-600 mb-6">
        Fill out the form below and we'll get back to you with a detailed estimate.
      </p>

      {/* Testing Mode Indicator */}
      {isTestingMode && !loadingTestingMode && (
        <div className="mb-6 p-4 border-2 border-orange-400 rounded-lg bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">Testing Mode Active</h3>
              <p className="text-sm text-orange-800">
                Contact form validation is disabled. You can submit without filling in any fields.
                This allows you to test the estimate calculator without providing personal information.
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">Please fill out all required fields marked with *</p>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact_name" className="block text-gray-900 font-medium mb-2">
              Name {!isTestingMode && '*'}
              {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional in testing mode)</span>}
            </label>
            <input
              type="text"
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => updateFormData({ contact_name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required={!isTestingMode}
            />
          </div>
          <div>
            <label htmlFor="contact_phone" className="block text-gray-900 font-medium mb-2">
              Phone {!isTestingMode && '*'}
              {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional in testing mode)</span>}
            </label>
            <input
              type="tel"
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => updateFormData({ contact_phone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required={!isTestingMode}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-gray-900 font-medium mb-2">
            Email {!isTestingMode && '*'}
            {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional in testing mode)</span>}
          </label>
          <input
            type="email"
            id="contact_email"
            value={formData.contact_email}
            onChange={(e) => updateFormData({ contact_email: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required={!isTestingMode}
          />
        </div>

        <div>
          <label htmlFor="contact_address" className="block text-gray-900 font-medium mb-2">
            Street Address {!isTestingMode && '*'}
            {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional in testing mode)</span>}
          </label>
          <input
            type="text"
            id="contact_address"
            value={formData.contact_address}
            onChange={(e) => updateFormData({ contact_address: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required={!isTestingMode}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="contact_city" className="block text-gray-900 font-medium mb-2">
              City {!isTestingMode && '*'}
              {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional)</span>}
            </label>
            <input
              type="text"
              id="contact_city"
              value={formData.contact_city}
              onChange={(e) => updateFormData({ contact_city: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required={!isTestingMode}
            />
          </div>
          <div>
            <label htmlFor="contact_state" className="block text-gray-900 font-medium mb-2">
              State {!isTestingMode && '*'}
              {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional)</span>}
            </label>
            <input
              type="text"
              id="contact_state"
              value={formData.contact_state}
              onChange={(e) => updateFormData({ contact_state: e.target.value })}
              placeholder="MA, RI, or CT"
              className={`w-full p-3 border rounded-lg ${
                showStateWarning ? 'border-amber-500' : 'border-gray-300'
              }`}
              required={!isTestingMode}
            />
            {showStateWarning && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Service Area Notice</p>
                  <p>We currently serve Rhode Island, Massachusetts, and Connecticut. While we don't service your area yet, you can still submit your information and we'll notify you if we expand to your location!</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="contact_zip" className="block text-gray-900 font-medium mb-2">
              Zip Code {!isTestingMode && '*'}
              {isTestingMode && <span className="text-sm text-orange-600 font-normal ml-2">(optional)</span>}
            </label>
            <input
              type="text"
              id="contact_zip"
              value={formData.contact_zip}
              onChange={(e) => updateFormData({ contact_zip: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required={!isTestingMode}
            />
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">Drag & Drop up to 5 photos here</p>
        <p className="text-gray-500 mb-4">or</p>
        <label className="inline-block bg-white border-2 border-blue-900 text-blue-900 px-6 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-50 transition-colors">
          Select Photos
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {uploadError && (
          <div className="mt-4 text-red-600 bg-red-50 p-2 rounded">{uploadError}</div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative border border-gray-200 rounded-lg p-2 bg-white">
                <img src={file.dataUrl} alt={file.name} className="w-full h-20 object-cover rounded" />
                <p className="text-xs mt-1 truncate">{file.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {unselectedServices.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Consider adding these services:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unselectedServices.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => onAddService(service.id)}
                className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                + Add {service.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Back to Add Details
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Get My Estimate'}
        </button>
      </div>
    </div>
  );
}
