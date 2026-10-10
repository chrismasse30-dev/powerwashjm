import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getMailJetKeys(): Promise<{ apiKey: string; secretKey: string } | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured for MailJet keys');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['mailjet_api_key', 'mailjet_secret_key']);

    if (error || !data || data.length !== 2) {
      console.log('Error fetching MailJet keys from DB:', error?.message);
      return null;
    }

    const apiKeyRow = data.find(row => row.setting_key === 'mailjet_api_key');
    const secretKeyRow = data.find(row => row.setting_key === 'mailjet_secret_key');

    if (!apiKeyRow || !secretKeyRow ||
        apiKeyRow.setting_value === 'NOT_CONFIGURED' ||
        secretKeyRow.setting_value === 'NOT_CONFIGURED') {
      console.log('MailJet keys not configured in database');
      return null;
    }

    console.log('✅ Using MailJet keys from database');
    return {
      apiKey: apiKeyRow.setting_value,
      secretKey: secretKeyRow.setting_value
    };
  } catch (err) {
    console.error('Error in getMailJetKeys:', err);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let payload: any = {};

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    payload = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      estimateRange,
      quoteId
    } = payload;

    if (!customerEmail || !customerName || !estimateRange) {
      return new Response(
        JSON.stringify({ error: 'customerName, customerEmail, and estimateRange are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch the instant quote confirmation template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('html_content, text_content, subject')
      .eq('template_type', 'instant_quote_confirmation')
      .eq('is_active', true)
      .maybeSingle();

    if (!template || templateError) {
      console.error('Instant quote confirmation template not found:', templateError);
      return new Response(
        JSON.stringify({ error: 'Email template not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Replace template variables
    const htmlContent = template.html_content
      .replace(/\{\{CUSTOMER_NAME\}\}/g, customerName)
      .replace(/\{\{CUSTOMER_EMAIL\}\}/g, customerEmail)
      .replace(/\{\{CUSTOMER_PHONE\}\}/g, customerPhone)
      .replace(/\{\{ESTIMATE_RANGE\}\}/g, estimateRange);

    const textContent = template.text_content
      .replace(/\{\{CUSTOMER_NAME\}\}/g, customerName)
      .replace(/\{\{CUSTOMER_EMAIL\}\}/g, customerEmail)
      .replace(/\{\{CUSTOMER_PHONE\}\}/g, customerPhone)
      .replace(/\{\{ESTIMATE_RANGE\}\}/g, estimateRange);

    const subject = template.subject
      .replace(/\{\{CUSTOMER_NAME\}\}/g, customerName);

    const mailjetKeys = await getMailJetKeys();
    if (!mailjetKeys) {
      throw new Error('MailJet keys not configured');
    }

    const auth = btoa(`${mailjetKeys.apiKey}:${mailjetKeys.secretKey}`);

    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: "sales@powerwashjm.com",
            Name: "J&M Power Washing"
          },
          To: [
            {
              Email: customerEmail,
              Name: customerName
            }
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
          CustomID: quoteId || `instant-quote-${Date.now()}`,
          EventPayload: JSON.stringify({
            quote_id: quoteId,
            email_type: 'instant_quote_confirmation'
          })
        }
      ]
    };

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(mailjetPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailJet API error:', errorText);
      throw new Error(`MailJet API error: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Instant quote confirmation sent via MailJet:', result);

    // Update quote_submissions to track instant quote confirmation sent
    if (quoteId) {
      try {
        const { error: updateError } = await supabase
          .from('quote_submissions')
          .update({
            form_confirmation_sent: true,
            form_confirmation_sent_at: new Date().toISOString(),
            form_confirmation_error: null,
            form_confirmation_last_attempt: new Date().toISOString()
          })
          .eq('id', quoteId);

        if (updateError) {
          console.error('Failed to update confirmation tracking:', updateError);
        } else {
          console.log('✅ Updated confirmation tracking for quote:', quoteId);
        }
      } catch (trackError) {
        console.error('Error updating confirmation tracking:', trackError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);

    // Track error in database if we have a quote ID
    const { quoteId, customerEmail } = payload;

    if (quoteId && customerEmail) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Log error to email_sending_errors table
        await supabase
          .from('email_sending_errors')
          .insert([{
            quote_submission_id: quoteId,
            email_type: 'instant_quote_confirmation',
            recipient_email: customerEmail,
            error_message: error.message || 'Unknown error',
            error_details: {
              stack: error.stack,
              name: error.name,
              timestamp: new Date().toISOString()
            }
          }]);

        // Update quote_submissions with error tracking
        await supabase
          .from('quote_submissions')
          .update({
            form_confirmation_error: error.message || 'Unknown error',
            form_confirmation_last_attempt: new Date().toISOString()
          })
          .eq('id', quoteId);

        console.log('📝 Logged error to database for quote:', quoteId);
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        quoteId: quoteId
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
