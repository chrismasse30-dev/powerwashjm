import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// v3 - inbox deliverability optimizations
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { customerEmail, customerName, subject, htmlContent, textContent, quoteId } = await req.json();

    if (!customerEmail || !subject || !htmlContent) {
      throw new Error('Missing required fields: customerEmail, subject, or htmlContent');
    }

    console.log('Sending estimate via Resend to:', customerEmail, '(v3 - inbox optimized)');
    console.log('Subject:', subject);

    const resendPayload: Record<string, unknown> = {
      from: "J&M Power Washing <sales@powerwashjm.com>",
      to: [customerEmail],
      reply_to: "sales@powerwashjm.com",
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      headers: {
        "X-Entity-Ref-ID": quoteId || crypto.randomUUID(),
        "X-Mailer": "JM-Power-Washing-Estimates",
      },
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
      throw new Error(`Resend API error (${response.status}): ${JSON.stringify(result)}`);
    }

    console.log('Email sent via Resend:', result);

    if (quoteId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: trackingError } = await supabase
          .from('email_tracking_events')
          .insert({
            quote_id: quoteId,
            email_address: customerEmail,
            event_type: 'sent',
            email_provider: 'resend',
            message_id: result?.id || null,
            custom_id: quoteId,
            event_data: {
              subject,
              sent_at: new Date().toISOString(),
              provider: 'resend'
            }
          });

        if (trackingError) {
          console.error('Failed to create tracking event:', trackingError);
        }
      } catch (trackError) {
        console.error('Exception creating tracking event:', trackError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully via Resend',
        data: result,
        provider: 'resend'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
