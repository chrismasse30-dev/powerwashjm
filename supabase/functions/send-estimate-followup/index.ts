import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FollowUpPayload {
  quoteId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { quoteId }: FollowUpPayload = await req.json();

    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_submissions')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    if (!quote.email) {
      throw new Error('No email address found for this quote');
    }

    // Get MailJet API keys from site_settings
    const { data: mailjetData, error: settingsError } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['mailjet_api_key', 'mailjet_secret_key']);

    if (settingsError || !mailjetData || mailjetData.length !== 2) {
      console.error('Settings error:', settingsError);
      throw new Error('MailJet API keys not found in settings');
    }

    const apiKeyRow = mailjetData.find(row => row.setting_key === 'mailjet_api_key');
    const secretKeyRow = mailjetData.find(row => row.setting_key === 'mailjet_secret_key');

    if (!apiKeyRow || !secretKeyRow ||
        apiKeyRow.setting_value === 'NOT_CONFIGURED' ||
        secretKeyRow.setting_value === 'NOT_CONFIGURED') {
      throw new Error('MailJet API keys not configured');
    }

    // Get the email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('html_content, subject')
      .eq('template_type', 'estimate_followup')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError || !template) {
      throw new Error('Email template not found');
    }

    let htmlContent = template.html_content;
    const emailSubject = template.subject;

    // Extract first name from full name
    const firstName = quote.name?.split(' ')[0] || 'there';

    // Calculate total quote amount and format as currency
    const totalPrice = quote.total_price || 0;
    const totalQuoteFormatted = typeof totalPrice === 'number'
      ? totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

    // Calculate estimated monthly payment (assuming 12-month financing at 0% APR)
    const monthlyPayment = totalPrice > 0
      ? (totalPrice / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

    // Replace template variables
    htmlContent = htmlContent
      .replace(/\{\{FIRST_NAME\}\}/g, firstName)
      .replace(/\{\{TOTAL_QUOTE\}\}/g, totalQuoteFormatted)
      .replace(/\{\{MONTHLY_PAYMENT\}\}/g, monthlyPayment)
      .replace(/\{\{QUOTE_ID\}\}/g, quoteId);

    // Remove pricing sections if total price is 0 or missing
    if (totalPrice <= 0) {
      // Remove the price reminder section
      htmlContent = htmlContent.replace(
        /<!-- PRICE REMINDER SECTION -->[\s\S]*?<!-- END PRICE SECTION -->/g,
        ''
      );

      // Remove the financing section
      htmlContent = htmlContent.replace(
        /<table[^>]*cellpadding="20"[^>]*style="background-color: #eff6ff[^"]*"[\s\S]*?<h3[^>]*>💳 Don't Forget: Flexible Financing<\/h3>[\s\S]*?<\/table>/g,
        ''
      );
    }

    // Prepare MailJet payload
    const auth = btoa(`${apiKeyRow.setting_value}:${secretKeyRow.setting_value}`);

    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: "sales@powerwashjm.com",
            Name: "J&M Power Washing"
          },
          To: [
            {
              Email: quote.email,
              Name: quote.name || quote.email
            }
          ],
          Bcc: [
            {
              Email: "sales@powerwashjm.com",
              Name: "JM Power Wash Sales"
            },
            {
              Email: "ChrisMasse30@Gmail.com",
              Name: "Chris Masse"
            }
          ],
          ReplyTo: {
            Email: "sales@powerwashjm.com",
            Name: "J&M Power Washing Sales"
          },
          Subject: emailSubject,
          HTMLPart: htmlContent,
          TextPart: htmlContent.replace(/<[^>]*>/g, ''),
          CustomID: quoteId
        }
      ]
    };

    console.log('📧 Sending estimate follow-up via MailJet to:', quote.email);
    console.log('Quote ID for tracking:', quoteId);

    // Send email via MailJet
    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(mailjetPayload)
    });

    const mailjetResult = await mailjetResponse.json();

    if (!mailjetResponse.ok) {
      console.error('MailJet API error response:', mailjetResult);
      console.error('Status code:', mailjetResponse.status);
      throw new Error(`MailJet API error: ${mailjetResult.ErrorMessage || mailjetResponse.statusText}`);
    }

    console.log('✅ Estimate follow-up sent successfully via MailJet:', mailjetResult);

    // Update quote_submissions with follow-up tracking
    const { error: updateError } = await supabase
      .from('quote_submissions')
      .update({
        estimate_followup_sent: true,
        estimate_followup_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);

    if (updateError) {
      console.error('Failed to update quote with follow-up tracking:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estimate follow-up email sent successfully via MailJet',
        sentTo: quote.email,
        provider: 'mailjet',
        data: mailjetResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending estimate follow-up:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});