import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Loader2, AlertCircle, CreditCard as Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBannerVisibility } from '../hooks/useBannerVisibility';
import { updatePageMeta } from '../utils/seo';

interface QuoteData {
  id: string;
  name: string;
  business_name: string | null;
  property_type: string;
  design_image_url: string | null;
  second_design_image_url: string | null;
  estimate_approved_at: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  total_price: number | null;
  pricing_breakdown: {
    grand_total?: number;
    [key: string]: any;
  } | null;
  design_data: {
    includePhoto1?: boolean;
    includePhoto2?: boolean;
    [key: string]: any;
  } | null;
}

export default function ApproveEstimatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getNavOffsetWithBreadcrumb } = useBannerVisibility();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-approved' | 'changes-requested'>('loading');
  const [message, setMessage] = useState('');
  const [approving, setApproving] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeRequestText, setChangeRequestText] = useState('');
  const [submittingChanges, setSubmittingChanges] = useState(false);

  const quoteId = searchParams.get('id');

  useEffect(() => {
    updatePageMeta({
      title: 'Approve Estimate | J&M Power Washing',
      description: 'Review and approve your service estimate.',
      robots: 'noindex, nofollow'
    });

    if (!quoteId) {
      setStatus('error');
      setMessage('Invalid approval link. Please contact us directly.');
      setLoadingQuote(false);
      return;
    }

    fetchQuoteData();
  }, [quoteId]);

  const fetchQuoteData = async () => {
    if (!quoteId) return;

    try {
      const { data, error } = await supabase
        .from('quote_submissions')
        .select('id, name, business_name, property_type, design_image_url, second_design_image_url, estimate_approved_at, email, phone, address, total_price, pricing_breakdown, design_data')
        .eq('id', quoteId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quote:', error);
        setQuoteData(null);
        setStatus('loading');
        setLoadingQuote(false);
        return;
      }

      if (!data) {
        console.warn('Quote not found, using generic approval flow');
        setQuoteData(null);
        setStatus('loading');
        setLoadingQuote(false);
        return;
      }

      setQuoteData(data);

      if (data.estimate_approved_at) {
        setStatus('already-approved');
        setMessage('This estimate has already been approved!');
      } else {
        setStatus('loading');
      }

      setLoadingQuote(false);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuoteData(null);
      setStatus('loading');
      setLoadingQuote(false);
    }
  };

  const displayedTotal = quoteData?.pricing_breakdown?.grand_total && quoteData.pricing_breakdown.grand_total > 0
    ? quoteData.pricing_breakdown.grand_total
    : quoteData?.total_price || 0;

  const handleApprove = async () => {
    if (!quoteId || approving) return;

    setApproving(true);
    setStatus('loading');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-estimate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ quoteId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.alreadyApproved) {
          setStatus('already-approved');
          setMessage(data.message);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      } else {
        throw new Error(data.error || 'Failed to approve estimate');
      }
    } catch (error) {
      console.error('Error approving estimate:', error);
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'An error occurred. Please try again or contact us directly.'
      );
    } finally {
      setApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!quoteId || !changeRequestText.trim() || submittingChanges) return;

    setSubmittingChanges(true);

    try {
      const { error } = await supabase
        .from('quote_submissions')
        .update({
          change_request_message: changeRequestText.trim(),
          change_request_submitted_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (error) throw error;

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-quote-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: quoteData?.name || 'Customer',
            email: quoteData?.email || '',
            phone: quoteData?.phone || '',
            address: quoteData?.address || '',
            services: ['Holiday Lights'],
            property_type: quoteData?.property_type || '',
            page_source: 'Estimate Change Request',
            change_request_message: changeRequestText.trim(),
          })
        });
      } catch (notifyError) {
        console.error('Error sending change request notification:', notifyError);
      }

      setStatus('changes-requested');
      setMessage('Your change request has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting change request:', error);
      setStatus('error');
      setMessage('Failed to submit change request. Please try again or contact us directly.');
    } finally {
      setSubmittingChanges(false);
    }
  };

  if (!quoteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (loadingQuote) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (status === 'loading' && !approving && !quoteData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">

          <div className="text-center p-8 bg-gray-50 border-b border-gray-200">
            <img
              src="/logos/holidaylogo.png"
              alt="J&M Power Washing Holiday Lights"
              className="max-w-[250px] h-auto mx-auto"
            />
          </div>

          <div className="p-6 md:p-8">

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
              Approve Your Holiday Lighting Estimate
            </h1>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
              <p className="text-gray-700 text-center text-lg">
                Thank you for your interest in our holiday lighting services. We have your estimate on file and are ready to get started!
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 my-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">What Happens After Approval</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-xl">✓</span>
                  <span>We will send you a detailed invoice with your project specifics and pricing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-xl">✓</span>
                  <span>Our team will contact you within 24 hours to schedule your installation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-xl">✓</span>
                  <span>You will receive confirmation of your installation date and timeline</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 text-xl">✓</span>
                  <span>We handle everything from installation to takedown and storage</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
              <h3 className="font-semibold text-green-900 mb-2">Ready to Move Forward?</h3>
              <p className="text-green-800">
                By clicking the approval button below, you confirm your interest in proceeding with your holiday lighting installation. We will send you an invoice with all project details and pricing information.
              </p>
            </div>

            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {approving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing Your Approval...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Yes, I Approve This Estimate!
                </>
              )}
            </button>

            <p className="text-sm text-gray-600 mt-6 text-center">
              By clicking Approve, you authorize us to send you an invoice and schedule your installation. Our team will contact you with full project details.
            </p>

            <p className="text-center text-gray-700 mt-6">
              Have a question?{' '}
              <a href="tel:+14015950726" className="font-bold text-red-600 underline">
                Call Us at (401) 595-0726
              </a>
              {' '}or email{' '}
              <a href="mailto:sales@powerwashjm.com" className="font-bold text-red-600 underline">
                sales@powerwashjm.com
              </a>
              .
            </p>

          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading' && !approving && quoteData) {
    const clientName = quoteData.property_type === 'Commercial' && quoteData.business_name
      ? quoteData.business_name
      : quoteData.name;

    const firstName = quoteData.name.split(' ')[0];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">

          <div className="text-center p-8 bg-gray-50 border-b border-gray-200">
            <img
              src="/logos/holidaylogo.png"
              alt="J&M Power Washing Holiday Lights"
              className="max-w-[250px] h-auto mx-auto"
            />
          </div>

          <div className="p-6 md:p-8">

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
              Confirm Your Holiday Lighting
            </h1>

            <p className="text-lg text-gray-700 mt-4 text-center">
              Hi {firstName}, please review and confirm the details below to approve your estimate and secure your spot on our installation schedule!
            </p>

            {(() => {
              const includePhoto1 = quoteData.design_data?.includePhoto1 !== false;
              const includePhoto2 = quoteData.design_data?.includePhoto2 !== false;
              const showPhoto1 = quoteData.design_image_url && includePhoto1;
              const showPhoto2 = quoteData.second_design_image_url && includePhoto2;

              if (!showPhoto1 && !showPhoto2) return null;

              return (
                <div className="my-8">
                  <h2 className="text-red-600 text-xl md:text-2xl font-bold text-center mb-4">
                    Your Proposed Design
                  </h2>
                  <div className="space-y-4">
                    {showPhoto1 && (
                      <img
                        src={quoteData.design_image_url}
                        alt="Design Photo 1"
                        className="w-full h-auto rounded-lg border border-gray-300"
                      />
                    )}
                    {showPhoto2 && (
                      <img
                        src={quoteData.second_design_image_url}
                        alt="Design Photo 2"
                        className="w-full h-auto rounded-lg border border-gray-300"
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            {displayedTotal > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 my-6 border-2 border-green-200">
                <h3 className="text-green-900 font-bold text-xl mb-3 text-center">Your Total Investment</h3>
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-600 mb-2">
                    ${displayedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-gray-700 font-medium mb-4">
                    Complete turnkey service included
                  </p>
                  <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
                    <p className="mb-2">✓ Professional installation</p>
                    <p className="mb-2">✓ Maintenance throughout season</p>
                    <p className="mb-2">✓ Takedown after holidays</p>
                    <p>✓ Storage until next year</p>
                  </div>
                  <p className="text-sm text-green-800 mt-4 font-semibold">
                    💳 Flexible financing available - as low as ${(displayedTotal / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                  </p>
                </div>
              </div>
            )}

            {displayedTotal <= 0 && (
              <div className="bg-blue-50 rounded-lg p-6 my-6">
                <h3 className="text-blue-900 font-semibold text-lg mb-2">About Your Estimate</h3>
                <p className="text-gray-700 mb-3">
                  We have prepared a customized estimate based on your property details and preferences. Our team will provide you with the pricing details and invoice once you approve this design.
                </p>
                <p className="text-sm text-gray-600">
                  Complete turnkey service - Installation, maintenance, and removal all included
                </p>
              </div>
            )}

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
              <h3 className="font-semibold text-green-900 mb-2">What Happens Next:</h3>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Our team receives instant notification of your approval</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>We'll send you an invoice to secure your installation spot</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>We'll contact you to schedule your installation date</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleApprove}
              disabled={approving || submittingChanges}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {approving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Yes, I Approve This Estimate!
                </>
              )}
            </button>

            <button
              onClick={() => setShowChangeRequest(!showChangeRequest)}
              disabled={approving || submittingChanges}
              className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Edit3 className="w-6 h-6" />
              Request Changes
            </button>

            {showChangeRequest && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border-2 border-red-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">What changes would you like?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please describe the changes you'd like to make to this proposal. Our team will review your request and get back to you within 24 hours.
                </p>
                <textarea
                  value={changeRequestText}
                  onChange={(e) => setChangeRequestText(e.target.value)}
                  placeholder="Example: I'd like more lights on the front porch, or I'd prefer warm white lights instead of multicolor..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={6}
                  disabled={submittingChanges}
                />
                <button
                  onClick={handleRequestChanges}
                  disabled={!changeRequestText.trim() || submittingChanges}
                  className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingChanges ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5" />
                      Submit Change Request
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-6 text-center">
              By clicking Approve, you agree to the estimate total. Our team will email you an invoice and contact you within 24 hours to confirm your installation date.
            </p>

            <p className="text-center text-gray-700 mt-6">
              Have a question?{' '}
              <a href="tel:+14015950726" className="font-bold text-red-600 underline">
                Call Us
              </a>
              {' '}or email{' '}
              <a href="mailto:sales@powerwashjm.com" className="font-bold text-red-600 underline">
                sales@powerwashjm.com
              </a>
              .
            </p>

          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' || status === 'already-approved' || status === 'changes-requested') {
    const firstName = quoteData?.name ? quoteData.name.split(' ')[0] : '';
    const isChangesRequested = status === 'changes-requested';

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          <div className={`w-20 h-20 ${isChangesRequested ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {isChangesRequested ? (
              <Edit3 className="w-12 h-12 text-red-600" />
            ) : (
              <Check className="w-12 h-12 text-green-600" />
            )}
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold ${isChangesRequested ? 'text-red-600' : 'text-green-600'} mb-4`}>
            {firstName ? `Thank You, ${firstName}!` : 'Thank You!'}
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            {status === 'already-approved'
              ? 'This estimate has already been approved.'
              : isChangesRequested
              ? 'Your change request has been submitted.'
              : 'Your approval has been successfully submitted.'}
          </p>
          {!quoteData && (
            <p className="text-lg text-gray-600 mb-8">
              We will send you a detailed invoice with your project information and pricing within 24 hours.
            </p>
          )}
          {message && <p className="text-lg text-gray-600 mb-8">{message}</p>}

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ol className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="font-bold mr-3">1.</span>
                <span>Our team has been notified and will send you an invoice shortly</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3">2.</span>
                <span>Once payment is received, we'll schedule your installation</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-3">3.</span>
                <span>Get ready to have the best-lit home in the neighborhood!</span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <a
              href="tel:+14015950726"
              className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              📞 Call Us: (401) 595-0726
            </a>
            <a
              href="mailto:sales@powerwashjm.com"
              className="block w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
            >
              📧 Email Us
            </a>
            <button
              onClick={() => navigate('/')}
              className="block w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center p-4" style={getNavOffsetWithBreadcrumb()}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <a
            href="tel:+14015950726"
            className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            📞 Call Us: (401) 595-0726
          </a>
          <button
            onClick={() => navigate('/')}
            className="block w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
