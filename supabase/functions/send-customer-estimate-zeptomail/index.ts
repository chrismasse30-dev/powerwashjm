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
  attachments?: Array<{
    name: string;
    content: string;
    mimeType: string;
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ZeptoMail API key from site_settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'zeptomail_api_key')
      .maybeSingle();

    if (settingsError || !settings || !settings.setting_value) {
      console.error('Settings error:', settingsError);
      throw new Error('ZeptoMail API key not found in settings');
    }

    const zeptomailApiKey = settings.setting_value;
    console.log('API key retrieved (length):', zeptomailApiKey?.length || 0);

    // Parse request body
    const payload: EmailPayload = await req.json();

    if (!payload.customerEmail || !payload.subject || !payload.htmlContent) {
      throw new Error('Missing required fields: customerEmail, subject, or htmlContent');
    }

    // Prepare ZeptoMail API request
    const zeptomailPayload = {
      from: {
        address: "HolidayTeam@powerwashjm.com",
        name: "J&M Power Washing"
      },
      to: [
        {
          email_address: {
            address: payload.customerEmail,
            name: payload.customerName || payload.customerEmail
          }
        }
      ],
      reply_to: [
        {
          address: "sales@powerwashjm.com",
          name: "J&M Power Washing Sales"
        }
      ],
      bcc: [
        {
          email_address: {
            address: "sales@powerwashjm.com",
            name: "JM Power Wash Sales"
          }
        },
        {
          email_address: {
            address: "ChrisMasse30@Gmail.com",
            name: "Chris Masse"
          }
        }
      ],
      subject: payload.subject,
      htmlbody: payload.htmlContent,
      textbody: payload.textContent || payload.htmlContent.replace(/<[^>]*>/g, ''),
      track_clicks: true,
      track_opens: true
    };

    console.log('Sending email to:', payload.customerEmail);
    console.log('Subject:', payload.subject);
    console.log('BCC to: sales@powerwashjm.com, ChrisMasse30@Gmail.com');

    // Send email via ZeptoMail API
    const zeptomailResponse = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${zeptomailApiKey}`
      },
      body: JSON.stringify(zeptomailPayload)
    });

    let zeptomailResult: any;
    const responseText = await zeptomailResponse.text();
    try {
      zeptomailResult = JSON.parse(responseText);
    } catch {
      zeptomailResult = { raw: responseText };
    }

    if (!zeptomailResponse.ok) {
      console.error('ZeptoMail API error response:', JSON.stringify(zeptomailResult));
      console.error('Status code:', zeptomailResponse.status);
      console.error('Response headers:', JSON.stringify(Object.fromEntries(zeptomailResponse.headers.entries())));
      throw new Error(`ZeptoMail API error (${zeptomailResponse.status}): ${JSON.stringify(zeptomailResult)}`);
    }

    console.log('Email sent successfully:', zeptomailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully (with BCC to sales@powerwashjm.com and ChrisMasse30@Gmail.com)',
        data: zeptomailResult
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});