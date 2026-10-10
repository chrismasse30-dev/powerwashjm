import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  customerEmail: string;
  customerName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  quoteId?: string;
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

async function sendViaMailJet(payload: EmailPayload, auth: string): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const customerPayload = {
      Messages: [
        {
          From: { Email: "sales@powerwashjm.com", Name: "J&M Power Washing" },
          To: [{ Email: payload.customerEmail, Name: payload.customerName || payload.customerEmail }],
          ReplyTo: { Email: "sales@powerwashjm.com", Name: "J&M Power Washing Sales" },
          Subject: payload.subject,
          TextPart: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
          HTMLPart: payload.htmlContent,
          CustomID: payload.quoteId || undefined
        }
      ]
    };

    console.log('📧 Attempting MailJet send to:', payload.customerEmail);
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
      body: JSON.stringify(customerPayload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('MailJet failed:', result);
      return { success: false, error: `MailJet API error: ${result.ErrorMessage || response.statusText}` };
    }

    console.log('✅ MailJet send successful');
    return { success: true, result };
  } catch (err) {
    console.error('MailJet exception:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function sendViaResend(payload: EmailPayload, resendKey: string): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    console.log('📧 Attempting Resend send to:', payload.customerEmail);

    const resendPayload = {
      from: "J&M Power Washing <sales@powerwashjm.com>",
      to: [payload.customerEmail],
      bcc: ["ChrisMasse30@Gmail.com"],
      reply_to: "sales@powerwashjm.com",
      subject: payload.subject,
      html: payload.htmlContent,
      text: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
      tags: [{ name: "type", value: "customer_estimate" }]
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify(resendPayload)
    });

    const responseText = await response.text();
    let result: any;
    try { result = JSON.parse(responseText); } catch { result = { raw: responseText }; }

    if (!response.ok) {
      console.error('Resend failed:', response.status, result);
      return { success: false, error: `Resend API error (${response.status}): ${JSON.stringify(result)}` };
    }

    console.log('✅ Resend send successful:', result);
    return { success: true, result };
  } catch (err) {
    console.error('Resend exception:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}



Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = getSupabaseClient();

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['mailjet_api_key', 'mailjet_secret_key']);

    if (settingsError) {
      console.error('Settings error:', settingsError);
    }

    const mailjetApiKey = settingsData?.find(r => r.setting_key === 'mailjet_api_key')?.setting_value;
    const mailjetSecret = settingsData?.find(r => r.setting_key === 'mailjet_secret_key')?.setting_value;
    const resendKey = Deno.env.get('RESEND_API_KEY');

    const hasMailJet = mailjetApiKey && mailjetSecret &&
      mailjetApiKey !== 'NOT_CONFIGURED' && mailjetSecret !== 'NOT_CONFIGURED';
    const hasResend = resendKey && resendKey !== 'NOT_CONFIGURED' && resendKey.length > 5;

    const payload: EmailPayload = await req.json();

    if (!payload.customerEmail || !payload.subject || !payload.htmlContent) {
      throw new Error('Missing required fields: customerEmail, subject, or htmlContent');
    }

    console.log('📧 Sending customer estimate email (MailJet primary, Resend backup)');
    console.log('To:', payload.customerEmail);
    console.log('Subject:', payload.subject);
    console.log('Providers available - MailJet:', !!hasMailJet, 'Resend:', !!hasResend);
    if (payload.quoteId) console.log('Quote ID:', payload.quoteId);

    let sendResult: { success: boolean; result?: any; error?: string } = { success: false, error: 'No providers available' };
    let provider = 'unknown';
    const errors: string[] = [];

    // Try MailJet first (primary)
    if (hasMailJet) {
      const auth = btoa(`${mailjetApiKey}:${mailjetSecret}`);
      sendResult = await sendViaMailJet(payload, auth);
      provider = 'mailjet';
      if (!sendResult.success) errors.push(`MailJet: ${sendResult.error}`);
    }

    // Fallback to Resend (backup)
    if (!sendResult.success && hasResend) {
      console.log('⚠️ Trying Resend fallback...');
      sendResult = await sendViaResend(payload, resendKey);
      provider = 'resend';
      if (!sendResult.success) errors.push(`Resend: ${sendResult.error}`);
    }



    if (!sendResult.success) {
      throw new Error(`All providers failed: ${errors.join(' | ')}`);
    }

    console.log(`✅ Customer email sent via ${provider}`);

    // Create tracking event
    if (payload.quoteId) {
      try {
        const messageId = provider === 'mailjet'
          ? sendResult.result?.Messages?.[0]?.To?.[0]?.MessageID
          : sendResult.result?.id || sendResult.result?.messageId;

        const { error: trackingError } = await supabase
          .from('email_tracking_events')
          .insert({
            quote_id: payload.quoteId,
            email_address: payload.customerEmail,
            event_type: 'sent',
            email_provider: provider,
            message_id: messageId ? String(messageId) : null,
            custom_id: payload.quoteId,
            event_data: {
              subject: payload.subject,
              sent_at: new Date().toISOString(),
              provider
            }
          });

        if (trackingError) {
          console.error('⚠️ Failed to create tracking event:', trackingError);
        } else {
          console.log('✅ Created tracking event for quote:', payload.quoteId);
        }
      } catch (trackError) {
        console.error('⚠️ Exception creating tracking event:', trackError);
      }
    }

    // Send internal copy via MailJet if it was the provider (non-critical)
    let internalCopyStatus = 'unknown';
    let internalCopyError = null;

    try {
      if (provider === 'mailjet' && hasMailJet) {
        const auth = btoa(`${mailjetApiKey}:${mailjetSecret}`);
        const internalPayload = {
          Messages: [{
            From: { Email: "sales@powerwashjm.com", Name: "J&M Power Washing" },
            To: [{ Email: "ChrisMasse30@Gmail.com", Name: "Chris Masse - Internal Copy" }],
            ReplyTo: { Email: "sales@powerwashjm.com", Name: "J&M Power Washing Sales" },
            Subject: `[INTERNAL COPY] ${payload.subject}`,
            TextPart: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
            HTMLPart: payload.htmlContent,
            CustomID: payload.quoteId ? `${payload.quoteId}-internal` : 'internal',
            TrackOpen: "disabled",
            TrackClick: "disabled"
          }]
        };

        const internalResponse = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
          body: JSON.stringify(internalPayload)
        });

        internalCopyStatus = internalResponse.ok ? 'sent' : 'failed_mailjet';
        if (!internalResponse.ok) {
          internalCopyError = 'MailJet internal copy failed';
          console.error('⚠️ MailJet internal copy failed');
        } else {
          console.log('✅ Internal copy sent via MailJet');
        }
      } else {
        internalCopyStatus = 'included_as_bcc';
        console.log('✅ Internal copy included as BCC in send');
      }
    } catch (internalError) {
      internalCopyStatus = 'error';
      internalCopyError = internalError instanceof Error ? internalError.message : String(internalError);
      console.error('⚠️ Internal copy exception (non-critical):', internalError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully via ${provider}`,
        data: sendResult.result,
        provider,
        internalCopy: { status: internalCopyStatus, recipients: ['ChrisMasse30@Gmail.com'], error: internalCopyError }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
