import { supabase } from '../lib/supabase';
import { notifyWebhooks } from '../utils/webhookNotifications';
import { trackQuoteRequest, trackNewsletterSignup } from '../utils/analytics';
import { getSiteSetting } from './siteSettingsService';
import type { QuoteFormData } from '../utils/formValidation';

export interface SubmitQuoteParams {
  formData: QuoteFormData;
  draftId: string | null;
  submitEmail: string;
  pageSource: string;
  sessionId: string;
  ipData: { city: string; state: string };
}

export interface SubmitQuoteResult {
  success: boolean;
  submissionId?: string;
  error?: any;
}

async function sendNotificationEmails(params: SubmitQuoteParams): Promise<{primary: boolean, backup: boolean}> {
  const { formData, pageSource, ipData } = params;
  const results = { primary: false, backup: false };

  try {
    const sourcePath = pageSource || window.location.pathname;
    const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

    console.log('📧 Sending notification email via edge function...');

    const emailResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quote-notification`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          services: formData.services,
          propertyType: formData.propertyType,
          package: formData.package,
          pageSource: sourceLabel,
          ipCity: ipData.city,
          ipState: ipData.state
        })
      }
    );

    if (emailResponse.ok) {
      console.log('✅ Email notification sent successfully');
      results.primary = true;
    } else {
      const errorText = await emailResponse.text();
      console.error('❌ Email notification failed:', errorText);
    }

    return results;
  } catch (error) {
    console.error('Error in notification system:', error);
    return results;
  }
}

async function sendCustomerAutoresponse(formData: any, quoteId?: string): Promise<boolean> {
  try {
    console.log('📧 Sending customer autoresponse for quote:', quoteId);

    const autoresponseResult = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-customer-autoresponse`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          propertyType: formData.propertyType,
          services: formData.services,
          quoteId: quoteId
        })
      }
    );

    if (autoresponseResult.ok) {
      console.log('✅ Customer autoresponse sent successfully');
      return true;
    } else {
      const errorData = await autoresponseResult.json();
      console.error('❌ Customer autoresponse failed:', errorData);

      // Log error to database if we have a quote ID
      if (quoteId) {
        try {
          await supabase
            .from('quote_submissions')
            .update({
              form_confirmation_error: errorData.error || 'Email sending failed',
              form_confirmation_last_attempt: new Date().toISOString()
            })
            .eq('id', quoteId);
        } catch (dbError) {
          console.error('Failed to log email error to database:', dbError);
        }
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending customer autoresponse:', error);

    // Log error to database if we have a quote ID
    if (quoteId) {
      try {
        await supabase
          .from('quote_submissions')
          .update({
            form_confirmation_error: error instanceof Error ? error.message : 'Network error',
            form_confirmation_last_attempt: new Date().toISOString()
          })
          .eq('id', quoteId);
      } catch (dbError) {
        console.error('Failed to log email error to database:', dbError);
      }
    }
    return false;
  }
}

export async function submitQuote(params: SubmitQuoteParams): Promise<SubmitQuoteResult> {
  const { formData, draftId, submitEmail, pageSource, sessionId, ipData } = params;

  try {
    // CHECK NOTIFICATIONS TOGGLE - CRITICAL FOR TESTING
    // If notifications are disabled, completely block all submission processing
    const notificationsEnabled = await getSiteSetting('notifications_enabled');

    if (notificationsEnabled === 'false') {
      console.warn('⚠️ TESTING MODE: Quote submissions are currently DISABLED');
      console.warn('📋 Submission blocked - no database storage, no emails, no notifications');
      console.warn('🔧 To enable: Go to Pricing Administration and turn ON notifications');

      // Return success to avoid errors in UI, but don't process anything
      return {
        success: false,
        error: {
          message: 'TESTING MODE: Quote submissions are currently disabled. No data has been saved or emails sent.',
          code: 'NOTIFICATIONS_DISABLED',
          isTestingMode: true
        }
      };
    }

    const sourcePath = pageSource || window.location.pathname;
    const sourceLabel = sourcePath === '/' ? 'Homepage' : sourcePath;

    // Check for existing active draft with this email (to handle duplicate prevention)
    let existingDraftId = draftId;

    if (!existingDraftId && formData.email) {
      const { data: existingDraft } = await supabase
        .from('quote_submissions')
        .select('id')
        .eq('email', formData.email)
        .eq('is_submitted', false)
        .eq('deleted', false)
        .is('duplicate_of_id', null)
        .maybeSingle();

      if (existingDraft) {
        existingDraftId = existingDraft.id;
        console.log('Found existing draft for email, will update:', existingDraftId);
      }
    }

    if (existingDraftId) {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        services: formData.services,
        is_submitted: true,
        status: formData.services.includes('Holiday Lights') ? 'Needs Measure' : 'Submitted',
        property_type: formData.propertyType || null,
        package: formData.package || null,
        submit_email: submitEmail,
        page_source: sourceLabel,
        lead_event: 'quote_submitted',
        updated_at: new Date().toISOString(),
        requires_measurement: formData.services.includes('Holiday Lights')
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
        .eq('id', existingDraftId)
        .select()
        .maybeSingle();

      if (error) throw error;

      const promises = [
        notifyWebhooks(data!),
        sendNotificationEmails(params),
        sendCustomerAutoresponse(formData, data!.id)
      ];

      if (submitEmail && submitEmail.trim() !== '') {
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        promises.push(
          supabase
            .from('newsletter_signups')
            .insert([{
              email: formData.email,
              first_name: firstName,
              last_name: lastName,
              phone: formData.phone || null,
              ip_address: null,
              ip_city: ipData.city || null,
              ip_state: ipData.state || null,
              source: 'Quote Form'
            }])
            .then(({ error }) => {
              if (error && error.code !== '23505') {
                console.error('Error adding to newsletter:', error);
              } else if (!error) {
                console.log('Newsletter signup successful');

                // Sync to Brevo CRM (non-blocking)
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-brevo-contact`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: formData.email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: formData.phone,
                    city: ipData.city,
                    state: ipData.state,
                    source: 'Quote Form',
                    signedUpDate: new Date().toISOString()
                  })
                }).catch(err => console.error('Brevo sync error:', err));
              }
            })
        );
      }

      await Promise.allSettled(promises);

      trackQuoteRequest({
        service: formData.services[0],
        property_type: formData.propertyType,
        location: `${ipData.city}, ${ipData.state}`
      });

      // Track newsletter signup if they opted in
      if (submitEmail && submitEmail.trim() !== '') {
        trackNewsletterSignup({
          email_domain: formData.email.split('@')[1] || 'unknown',
          source: 'Quote Form',
          location: `${ipData.city}, ${ipData.state}`
        });
      }

      return { success: true, submissionId: data!.id };
    } else {
      const insertData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        services: formData.services,
        property_type: formData.propertyType || null,
        package: formData.package || null,
        submit_email: submitEmail,
        page_source: sourceLabel,
        session_id: sessionId,
        lead_event: 'quote_submitted',
        is_submitted: true,
        status: formData.services.includes('Holiday Lights') ? 'Needs Measure' : 'Submitted',
        requires_measurement: formData.services.includes('Holiday Lights')
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

      const promises = [
        notifyWebhooks(data!),
        sendNotificationEmails(params),
        sendCustomerAutoresponse(formData, data!.id)
      ];

      if (submitEmail && submitEmail.trim() !== '') {
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        promises.push(
          supabase
            .from('newsletter_signups')
            .insert([{
              email: formData.email,
              first_name: firstName,
              last_name: lastName,
              phone: formData.phone || null,
              ip_address: null,
              ip_city: ipData.city || null,
              ip_state: ipData.state || null,
              source: 'Quote Form'
            }])
            .then(({ error }) => {
              if (error && error.code !== '23505') {
                console.error('Error adding to newsletter:', error);
              } else if (!error) {
                console.log('Newsletter signup successful');

                // Sync to Brevo CRM (non-blocking)
                fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-brevo-contact`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: formData.email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: formData.phone,
                    city: ipData.city,
                    state: ipData.state,
                    source: 'Quote Form',
                    signedUpDate: new Date().toISOString()
                  })
                }).catch(err => console.error('Brevo sync error:', err));
              }
            })
        );
      }

      await Promise.allSettled(promises);

      trackQuoteRequest({
        service: formData.services[0],
        property_type: formData.propertyType,
        location: `${ipData.city}, ${ipData.state}`
      });

      // Track newsletter signup if they opted in
      if (submitEmail && submitEmail.trim() !== '') {
        trackNewsletterSignup({
          email_domain: formData.email.split('@')[1] || 'unknown',
          source: 'Quote Form',
          location: `${ipData.city}, ${ipData.state}`
        });
      }

      return { success: true, submissionId: data!.id };
    }
  } catch (error) {
    console.error('Error submitting quote:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    if (error && typeof error === 'object') {
      const errorObj = error as any;
      console.error('Error message:', errorObj.message);
      console.error('Error code:', errorObj.code);
      console.error('Error details:', errorObj.details);
    }

    return { success: false, error };
  }
}
