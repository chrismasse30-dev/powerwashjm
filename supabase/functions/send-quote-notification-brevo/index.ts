import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WEB3FORMS_KEY = Deno.env.get('WEB3FORMS_ABANDONED_EMAIL_KEY');

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

async function getBrevoApiKey(): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'brevo_smtp_key')
      .maybeSingle();

    if (error) {
      console.log('Error fetching brevo_smtp_key from DB:', error.message);
      return null;
    }

    if (data?.setting_value && data.setting_value !== 'NOT_CONFIGURED') {
      console.log('✅ Using Brevo SMTP key from database');
      return data.setting_value;
    }

    console.log('No DB key found');
    return null;
  } catch (err) {
    console.error('Error in getBrevoApiKey:', err);
    return null;
  }
}


function createPlainTextEmail(data: QuoteData): string {
  const servicesList = data.services.join(', ');
  const isHolidayLights = data.services.includes('Holiday Lights');

  return `
NEW ${isHolidayLights ? 'HOLIDAY LIGHTS ' : ''}QUOTE REQUEST
${'='.repeat(60)}

CUSTOMER INFORMATION:
  Name: ${data.name}
  Email: ${data.email}
  Phone: ${data.phone}

PROPERTY DETAILS:
  Address: ${data.address}
  City: ${data.city}, ${data.state} ${data.zipCode}${data.propertyType ? `\n  Property Type: ${data.propertyType}` : ''}

SERVICES REQUESTED:
  ${servicesList}${data.package ? `\n  Package: ${data.package}` : ''}${data.pageSource ? `\n\nSOURCE:\n  Page: ${data.pageSource}` : ''}${data.ipCity && data.ipState ? `\n  Location: ${data.ipCity}, ${data.ipState}` : ''}

${'='.repeat(60)}

This quote request was submitted via your website contact form.
Reply directly to this email to contact the customer.

--
J&M Power Washing
Professional Exterior Cleaning Services
  `.trim();
}

async function sendViaMailJet(emailHtml: string, plainText: string, to: string, subject: string, replyTo: string, name: string): Promise<boolean> {
  try {
    console.log('🚀 Using MailJet email service...');

    const mailjetKeys = await getMailJetKeys();
    if (!mailjetKeys) {
      console.log('⚠️  MailJet keys not configured');
      return false;
    }

    const auth = btoa(`${mailjetKeys.apiKey}:${mailjetKeys.secretKey}`);

    const payload = {
      Messages: [
        {
          From: {
            Email: 'sales@powerwashjm.com',
            Name: 'J&M Power Wash'
          },
          To: [
            {
              Email: to,
              Name: 'Sales Team'
            }
          ],
          ReplyTo: {
            Email: replyTo,
            Name: name
          },
          Subject: subject,
          TextPart: plainText,
          HTMLPart: emailHtml
        }
      ]
    };

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ MailJet email sent successfully:', result);
      return true;
    }

    const errorText = await response.text();
    console.error('❌ MailJet failed:', response.status, errorText);
    return false;
  } catch (error) {
    console.error('❌ MailJet error:', error);
    return false;
  }
}

async function sendViaWeb3Forms(plainText: string, to: string, subject: string, replyTo: string, name: string): Promise<boolean> {
  try {
    console.log('📧 Using Web3Forms fallback...');

    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY || '');
    formData.append('subject', subject);
    formData.append('from_name', 'J&M Power Wash');
    formData.append('name', name);
    formData.append('email', to);
    formData.append('replyto', replyTo);
    formData.append('message', plainText);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      console.log('✅ Web3Forms fallback succeeded');
      return true;
    }
    console.error('❌ Web3Forms failed:', await response.text());
    return false;
  } catch (error) {
    console.error('❌ Web3Forms error:', error);
    return false;
  }
}

interface QuoteData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  services: string[];
  propertyType?: string;
  package?: string;
  pageSource?: string;
  ipCity?: string;
  ipState?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: QuoteData = await req.json();
    console.log('Sending quote notification for:', data.name);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { color: #1e3a8a; font-weight: bold; margin-bottom: 10px; font-size: 16px; }
    .info-line { margin: 8px 0; padding: 8px; background-color: #f8f9fa; border-radius: 4px; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .services { margin-top: 10px; }
    .service-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; margin: 4px; font-size: 14px; }
    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Form Submission</h2>
    </div>
    <div class="content">
      <p><strong>Hello,</strong></p>
      <p>A new form has been submitted on your website. Details below.</p>
      
      <div class="section">
        <div class="section-title">Email</div>
        <div class="info-line"><a href="mailto:${data.email}">${data.email}</a></div>
      </div>

      <div class="section">
        <div class="section-title">Message</div>
        <div class="info-line">New ${data.services.includes('Holiday Lights') ? 'Holiday Lights' : ''} Quote Request!</div>
      </div>

      <div class="section">
        <div class="section-title">Customer Information:</div>
        <div class="info-line"><span class="label">Name:</span> <span class="value">${data.name}</span></div>
        <div class="info-line"><span class="label">Phone:</span> <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span></div>
        <div class="info-line"><span class="label">Email:</span> <span class="value"><a href="mailto:${data.email}">${data.email}</a></span></div>
      </div>

      <div class="section">
        <div class="section-title">Property Details:</div>
        <div class="info-line"><span class="label">Address:</span> <span class="value">${data.address}</span></div>
        <div class="info-line"><span class="label">City:</span> <span class="value">${data.city}</span></div>
        <div class="info-line"><span class="label">State:</span> <span class="value">${data.state}</span></div>
        <div class="info-line"><span class="label">Zip Code:</span> <span class="value">${data.zipCode}</span></div>
      </div>

      ${data.propertyType ? `
      <div class="section">
        <div class="section-title">Property Type:</div>
        <div class="info-line">${data.propertyType}</div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Services Requested:</div>
        <div class="services">
          ${data.services.map(s => `<span class="service-badge">${s}</span>`).join('')}
        </div>
      </div>

      ${data.pageSource ? `
      <div class="section">
        <div class="info-line"><span class="label">Source Page:</span> <span class="value">${data.pageSource}</span></div>
      </div>
      ` : ''}

      ${data.ipCity && data.ipState ? `
      <div class="section">
        <div class="info-line"><span class="label">Location:</span> <span class="value">${data.ipCity}, ${data.ipState}</span></div>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>This email was sent via your website contact form.</p>
    </div>
  </div>
</body>
</html>`;

    const subject = data.services.includes('Holiday Lights')
      ? `New Holiday Lights Quote from ${data.name}`
      : `New Quote Request from ${data.name}`;

    let emailSent = false;
    const plainTextEmail = createPlainTextEmail(data);

    // Try MailJet first (primary)
    emailSent = await sendViaMailJet(emailHtml, plainTextEmail, 'sales@powerwashjm.com', subject, data.email, data.name);

    // Fallback to Web3Forms if MailJet fails
    if (!emailSent && WEB3FORMS_KEY) {
      emailSent = await sendViaWeb3Forms(plainTextEmail, 'sales@powerwashjm.com', subject, data.email, data.name);
    }

    if (!emailSent) {
      throw new Error('All email delivery methods failed');
    }

    console.log('✅ Email delivered successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});