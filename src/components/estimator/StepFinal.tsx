import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calendar, DollarSign, Phone, Loader2, CreditCard, Sparkles, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getSiteSetting } from '../../services/siteSettingsService';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface StepFinalProps {
  estimateSummary: Array<{ service: string; details: string }>;
  estimateRange: { min: number; max: number };
  maintenanceTips: string[];
  onReset: () => void;
  quoteId?: string | null;
  contactInfo?: ContactInfo;
}

export default function StepFinal({
  estimateSummary,
  estimateRange,
  maintenanceTips,
  onReset,
  quoteId,
  contactInfo
}: StepFinalProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
  };

  const averagePrice = Math.round((estimateRange.min + estimateRange.max) / 2);
  const estimatedMonthlyPayment = Math.round(averagePrice / 12);

  const handleBookNow = () => {
    setShowBookingModal(true);
    setBookingStatus('idle');
    setBookingError('');
  };

  const handleConfirmBooking = async () => {
    setBookingStatus('loading');
    setBookingError('');

    try {
      if (quoteId) {
        const { error: updateError } = await supabase
          .from('quote_submissions')
          .update({
            estimate_approved_at: new Date().toISOString(),
            status: 'Approved'
          })
          .eq('id', quoteId);

        if (updateError) {
          console.error('Error updating quote status:', updateError);
        }
      }

      const testingModeActive = (await getSiteSetting('notifications_enabled')) === 'false';

      if (!testingModeActive) {
        const summaryText = estimateSummary.map(item => `${item.service}: ${item.details}`).join('\n');

        const message = `
BOOKING CONFIRMED - Customer Approved Estimate!

Customer Information:
- Name: ${contactInfo?.name || 'N/A'}
- Phone: ${contactInfo?.phone || 'N/A'}
- Email: ${contactInfo?.email || 'N/A'}

Property Address:
- Address: ${contactInfo?.address || 'N/A'}
- City: ${contactInfo?.city || 'N/A'}
- State: ${contactInfo?.state || 'N/A'}
- Zip: ${contactInfo?.zip || 'N/A'}

Services Requested:
${summaryText}

Estimated Price: ${formatCurrency(averagePrice)}

ACTION REQUIRED: Customer has approved this estimate and is ready to schedule!
Please reach out to schedule their service.

Source: Instant Estimate - Customer Approved
Approved at: ${new Date().toLocaleString()}
        `.trim();

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_key: 'fd56a2dd-939a-402e-955d-5d6345cadc3c',
            subject: `BOOKING CONFIRMED: ${contactInfo?.name || 'Customer'} - Instant Estimate Approved`,
            from_name: contactInfo?.name || 'Instant Estimate',
            email: 'Sales@powerwashjm.com',
            cc: 'jmpowerwashing@yahoo.com',
            message: message,
            replyto: contactInfo?.email || 'Sales@powerwashjm.com'
          })
        });
      }

      setBookingStatus('success');
    } catch (error) {
      console.error('Error confirming booking:', error);
      setBookingStatus('error');
      setBookingError('There was an issue confirming your booking. Please call us directly.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Estimate</h2>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          Estimate Summary
        </h4>
        <ul className="space-y-3">
          {estimateSummary.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">{item.service}</span>
              <span className="text-gray-700">{item.details}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-8 mb-6 text-center">
        <p className="text-lg mb-2">Your Estimated Price:</p>
        <p className="text-4xl font-bold">
          {formatCurrency(averagePrice)}
        </p>
        <p className="text-sm mt-3 opacity-90">
          Based on the services and property details you provided
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          type="button"
          onClick={handleBookNow}
          className="flex-1 bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          <Calendar className="w-6 h-6" />
          Book Now - We'll Schedule You!
        </button>
        <a
          href="tel:+14015950726"
          className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          <Phone className="w-6 h-6" />
          Call (401) 595-0726
        </a>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-full">
            <CreditCard className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              We Offer Financing!
            </h4>
            <p className="text-gray-700 mb-3">
              Make your project affordable with flexible payment plans through Wisetack.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Monthly Payment:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  as low as {formatCurrency(estimatedMonthlyPayment)}/mo
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on average estimate with 12-month financing. Actual terms may vary.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                $500 - $25,000 financing
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                3-60 month terms
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                Quick approval
              </span>
            </div>
            <Link
              to="/financing/"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Explore Financing Options
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-900 p-6 rounded-lg mb-6">
        <p className="text-gray-800 leading-relaxed">
          Thank you! A copy of this estimate has been automatically emailed to you. Our team will be in
          touch soon to confirm the details and schedule your service.
        </p>
      </div>

      {maintenanceTips.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Your Personalized Maintenance Plan
            </h4>
          </div>
          <ul className="space-y-3">
            {maintenanceTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          Start Over
        </button>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {bookingStatus === 'success' ? (
              <div className="p-8 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for choosing J&M Power Washing! Our team will reach out within 24 hours to schedule your service at a time that works best for you.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700">
                    <strong>What's Next:</strong>
                  </p>
                  <ul className="text-left text-gray-600 mt-2 space-y-2">
                    <li>1. We'll call or email to confirm your appointment</li>
                    <li>2. Our team arrives on schedule with all equipment</li>
                    <li>3. Enjoy your beautifully cleaned property!</li>
                  </ul>
                </div>
                <p className="text-gray-600 mb-4">
                  Questions? Call us at <a href="tel:+14015950726" className="text-blue-600 font-semibold hover:underline">(401) 595-0726</a>
                </p>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Booking</h3>
                <p className="text-gray-600 mb-6">
                  By clicking confirm, you're letting us know you'd like to proceed with your service. We'll reach out within 24 hours to schedule a convenient time.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="text-gray-900">{contactInfo?.name || 'N/A'}</span></p>
                    <p><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{contactInfo?.phone || 'N/A'}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="text-gray-900">{contactInfo?.email || 'N/A'}</span></p>
                    <p><span className="text-gray-500">Address:</span> <span className="text-gray-900">{contactInfo?.address}, {contactInfo?.city}, {contactInfo?.state} {contactInfo?.zip}</span></p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Services</h4>
                  <ul className="space-y-1 text-sm">
                    {estimateSummary.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="text-gray-700">{item.service}</span>
                        <span className="text-gray-500">{item.details}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-blue-200 mt-3 pt-3">
                    <p className="font-semibold text-gray-900">
                      Estimated: {formatCurrency(averagePrice)}
                    </p>
                  </div>
                </div>

                {bookingStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
                    {bookingError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    onReset();
                  }}
                  className="w-full bg-blue-50 text-blue-700 border border-blue-200 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors mb-4 flex items-center justify-center gap-2"
                  disabled={bookingStatus === 'loading'}
                >
                  <Plus className="w-5 h-5" />
                  Add More Services to This Booking
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    disabled={bookingStatus === 'loading'}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={bookingStatus === 'loading'}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
