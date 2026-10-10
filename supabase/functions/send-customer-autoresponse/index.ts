import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailProvider {
  name: string;
  send: (emailData: EmailData) => Promise<EmailResult>;
}

interface EmailData {
  to: { email: string; name: string };
  from: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
  quoteId?: string;
}

interface EmailResult {
  success: boolean;
  provider: string;
  error?: string;
  response?: any;
}

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

    console.log('Using MailJet keys from database');
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

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'brevo_smtp_api_key')
      .maybeSingle();

    if (error || !data || data.setting_value === 'NOT_CONFIGURED') {
      return null;
    }

    console.log('Found Brevo API key');
    return data.setting_value;
  } catch (err) {
    console.error('Error getting Brevo key:', err);
    return null;
  }
}

async function getResendApiKey(): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'resend_api_key')
      .maybeSingle();

    if (error || !data || data.setting_value === 'NOT_CONFIGURED') {
      return null;
    }

    console.log('Found Resend API key');
    return data.setting_value;
  } catch (err) {
    console.error('Error getting Resend key:', err);
    return null;
  }
}

async function sendViaMailJet(emailData: EmailData): Promise<EmailResult> {
  try {
    const mailjetKeys = await getMailJetKeys();
    if (!mailjetKeys) {
      return { success: false, provider: 'MailJet', error: 'MailJet keys not configured' };
    }

    const auth = btoa(`${mailjetKeys.apiKey}:${mailjetKeys.secretKey}`);

    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: emailData.from.email,
            Name: emailData.from.name
          },
          To: [
            {
              Email: emailData.to.email,
              Name: emailData.to.name
            }
          ],
          Subject: emailData.subject,
          TextPart: emailData.text,
          HTMLPart: emailData.html,
          CustomID: emailData.quoteId || `form-confirmation-${Date.now()}`,
          EventPayload: JSON.stringify({
            quote_id: emailData.quoteId,
            email_type: 'form_confirmation'
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
      console.error('MailJet failed:', errorText);
      return { success: false, provider: 'MailJet', error: `MailJet API error: ${errorText}` };
    }

    const result = await response.json();
    console.log('Email sent via MailJet');
    return { success: true, provider: 'MailJet', response: result };
  } catch (error) {
    console.error('MailJet exception:', error);
    return { success: false, provider: 'MailJet', error: error.message };
  }
}

async function sendViaBrevo(emailData: EmailData): Promise<EmailResult> {
  try {
    const brevoKey = await getBrevoApiKey();
    if (!brevoKey) {
      return { success: false, provider: 'Brevo', error: 'Brevo API key not configured' };
    }

    const brevoPayload = {
      sender: {
        email: emailData.from.email,
        name: emailData.from.name
      },
      to: [
        {
          email: emailData.to.email,
          name: emailData.to.name
        }
      ],
      subject: emailData.subject,
      htmlContent: emailData.html,
      textContent: emailData.text,
      tags: ['form_confirmation'],
      params: {
        quote_id: emailData.quoteId
      }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo failed:', errorText);
      return { success: false, provider: 'Brevo', error: `Brevo API error: ${errorText}` };
    }

    const result = await response.json();
    console.log('Email sent via Brevo');
    return { success: true, provider: 'Brevo', response: result };
  } catch (error) {
    console.error('Brevo exception:', error);
    return { success: false, provider: 'Brevo', error: error.message };
  }
}

async function sendViaResend(emailData: EmailData): Promise<EmailResult> {
  try {
    const resendKey = await getResendApiKey();
    if (!resendKey) {
      return { success: false, provider: 'Resend', error: 'Resend API key not configured' };
    }

    const resendPayload = {
      from: `${emailData.from.name} <sales@powerwashjm.com>`,
      to: [emailData.to.email],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      tags: [
        { name: 'category', value: 'form_confirmation' },
        { name: 'quote_id', value: emailData.quoteId || 'none' }
      ]
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend failed:', errorText);
      return { success: false, provider: 'Resend', error: `Resend API error: ${errorText}` };
    }

    const result = await response.json();
    console.log('Email sent via Resend');
    return { success: true, provider: 'Resend', response: result };
  } catch (error) {
    console.error('Resend exception:', error);
    return { success: false, provider: 'Resend', error: error.message };
  }
}

async function sendViaSendGrid(emailData: EmailData): Promise<EmailResult> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, provider: 'SendGrid', error: 'Supabase not configured' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'sendgrid_api_key')
      .maybeSingle();

    if (error || !data || data.setting_value === 'NOT_CONFIGURED') {
      return { success: false, provider: 'SendGrid', error: 'SendGrid API key not configured' };
    }

    const sendGridPayload = {
      personalizations: [
        {
          to: [{ email: emailData.to.email, name: emailData.to.name }],
          subject: emailData.subject
        }
      ],
      from: {
        email: emailData.from.email,
        name: emailData.from.name
      },
      content: [
        { type: 'text/plain', value: emailData.text },
        { type: 'text/html', value: emailData.html }
      ],
      custom_args: {
        quote_id: emailData.quoteId || 'none',
        email_type: 'form_confirmation'
      }
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.setting_value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendGridPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid failed:', errorText);
      return { success: false, provider: 'SendGrid', error: `SendGrid API error: ${errorText}` };
    }

    console.log('Email sent via SendGrid');
    return { success: true, provider: 'SendGrid', response: { messageId: response.headers.get('x-message-id') } };
  } catch (error) {
    console.error('SendGrid exception:', error);
    return { success: false, provider: 'SendGrid', error: error.message };
  }
}

async function sendEmailWithFallback(emailData: EmailData): Promise<EmailResult> {
  const providers: Array<(data: EmailData) => Promise<EmailResult>> = [
    sendViaMailJet,
    sendViaBrevo,
    sendViaResend,
    sendViaSendGrid
  ];

  const errors: string[] = [];

  for (const provider of providers) {
    console.log(`Attempting to send email via ${provider.name}...`);
    const result = await provider(emailData);

    if (result.success) {
      console.log(`Email successfully sent via ${result.provider}`);
      return result;
    }

    errors.push(`${result.provider}: ${result.error}`);
    console.log(`${result.provider} failed, trying next provider...`);
  }

  console.error('All email providers failed');
  return {
    success: false,
    provider: 'ALL_FAILED',
    error: `All providers failed: ${errors.join('; ')}`
  };
}

function isHolidayLightsRequest(services: string[]): boolean {
  return services.some(s =>
    s.toLowerCase().includes('holiday') ||
    s.toLowerCase().includes('christmas') ||
    s.toLowerCase().includes('lights installation')
  );
}

function getPackageDisplayName(pkg: string): string {
  const map: Record<string, string> = {
    'tinsel': 'Tinsel Package ($599)',
    'garland': 'Garland Package ($999)',
    'gingerbread': 'Gingerbread Package ($1,499)',
  };
  return map[pkg?.toLowerCase()] || pkg || '';
}

function buildHolidayHtml(
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  propertyType: string,
  packageName: string,
): string {
  const packageDisplay = getPackageDisplayName(packageName);
  const packageSection = packageDisplay
    ? `<tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Selected Package:</td><td style="padding:6px 0;color:#1e293b;">${packageDisplay}</td></tr>`
    : '';
  const addressLine = address ? `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''} ${zipCode || ''}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">
<tr><td align="center" style="padding:30px 15px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">

<!-- Header with holiday branding -->
<tr><td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:36px 30px;text-align:center;">
  <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lights" style="max-width:180px;height:auto;margin-bottom:16px;" width="180" />
  <h1 style="color:#fbbf24;font-size:22px;margin:0 0 6px;font-weight:700;letter-spacing:0.5px;">We Received Your Holiday Lights Request!</h1>
  <p style="color:#bbf7d0;font-size:14px;margin:0;">Making homes and businesses shine bright this season</p>
</td></tr>

<!-- Decorative accent bar -->
<tr><td style="height:4px;background:linear-gradient(90deg,#dc2626,#fbbf24,#16a34a,#dc2626,#fbbf24,#16a34a);"></td></tr>

<!-- Body -->
<tr><td style="background-color:#ffffff;padding:32px 30px;">
  <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">Hi ${name},</p>
  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for reaching out about our professional holiday lighting services! We are excited to help make your property the brightest on the block this season.</p>

  <!-- Request details card -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:0 0 24px;">
  <tr><td style="padding:20px;">
    <p style="color:#991b1b;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Your Request Details</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;width:140px;">Name:</td><td style="padding:6px 0;color:#1e293b;">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Email:</td><td style="padding:6px 0;color:#1e293b;">${email}</td></tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Phone:</td><td style="padding:6px 0;color:#1e293b;">${phone}</td></tr>` : ''}
      ${addressLine ? `<tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Property:</td><td style="padding:6px 0;color:#1e293b;">${addressLine}</td></tr>` : ''}
      ${propertyType ? `<tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Type:</td><td style="padding:6px 0;color:#1e293b;">${propertyType}</td></tr>` : ''}
      ${packageSection}
    </table>
  </td></tr>
  </table>

  <!-- What happens next -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:0 0 24px;">
  <tr><td style="padding:20px;">
    <p style="color:#166534;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">What Happens Next</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;line-height:1.7;">
      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">1.</td><td style="padding:4px 0;">We will use our virtual tools to capture your property details &#8212; if needed, we will schedule a quick site visit</td></tr>
      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">2.</td><td style="padding:4px 0;">Our design team will create a custom lighting plan for your home</td></tr>
      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">3.</td><td style="padding:4px 0;">You will receive a detailed estimate within 24&#8211;48 hours</td></tr>
      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">4.</td><td style="padding:4px 0;">Once approved, our crew handles installation, maintenance, and takedown</td></tr>
    </table>
  </td></tr>
  </table>

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 8px;">Have questions in the meantime? Just call or text us:</p>
  <p style="margin:0 0 20px;"><a href="tel:4015950726" style="color:#dc2626;font-size:16px;font-weight:700;text-decoration:none;">(401) 595-0726</a></p>

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0;">We look forward to making your holidays extra bright!</p>
</td></tr>

<!-- Footer -->
<tr><td style="background:linear-gradient(135deg,#14532d 0%,#166534 100%);padding:24px 30px;text-align:center;">
  <p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0 0 4px;">J&M Holiday Lights</p>
  <p style="color:#bbf7d0;font-size:13px;margin:0 0 4px;">Professional Holiday Lighting | Installation | Maintenance | Takedown</p>
  <p style="color:#86efac;font-size:13px;margin:0;">
    <a href="tel:4015950726" style="color:#86efac;text-decoration:none;">(401) 595-0726</a> &nbsp;|&nbsp;
    <a href="mailto:sales@powerwashjm.com" style="color:#86efac;text-decoration:none;">sales@powerwashjm.com</a>
  </p>
  <p style="color:#4ade80;font-size:12px;margin:10px 0 0;">
    <a href="https://powerwashjm.com/holiday-lights" style="color:#4ade80;text-decoration:underline;">View Our Holiday Packages</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildHolidayText(
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  propertyType: string,
  packageName: string,
): string {
  const packageDisplay = getPackageDisplayName(packageName);
  const addressLine = address ? `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''} ${zipCode || ''}` : '';

  return `Hi ${name},

Thank you for reaching out about our professional holiday lighting services! We are excited to help make your property the brightest on the block this season.

YOUR REQUEST DETAILS
--------------------
Name: ${name}
Email: ${email}${phone ? `\nPhone: ${phone}` : ''}${addressLine ? `\nProperty: ${addressLine}` : ''}${propertyType ? `\nType: ${propertyType}` : ''}${packageDisplay ? `\nSelected Package: ${packageDisplay}` : ''}

WHAT HAPPENS NEXT
-----------------
1. We will use our virtual tools to capture your property details — if needed, we will schedule a quick site visit
2. Our design team will create a custom lighting plan for your home
3. You will receive a detailed estimate within 24-48 hours
4. Once approved, our crew handles installation, maintenance, and takedown

Have questions? Call or text us at (401) 595-0726

We look forward to making your holidays extra bright!

J&M Holiday Lights
Professional Holiday Lighting | Installation | Maintenance | Takedown
(401) 595-0726 | sales@powerwashjm.com
https://powerwashjm.com/holiday-lights`;
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
      name,
      customerName,
      email,
      customerEmail,
      phone,
      address,
      city,
      state,
      zipCode,
      propertyType,
      services = [],
      quoteId,
    } = payload;
    const packageName = payload.package || '';

    const finalName = name || customerName;
    const finalEmail = email || customerEmail;

    if (!finalEmail || !finalName) {
      return new Response(
        JSON.stringify({ error: 'name and email are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const isHoliday = isHolidayLightsRequest(services);

    let htmlContent: string;
    let textContent: string;
    let subject: string;

    if (isHoliday) {
      console.log('Holiday lights request detected, using holiday template');
      const addressLine = address ? `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''} ${zipCode || ''}` : '';
      const packageDisplay = getPackageDisplayName(packageName);

      const { data: holidayTemplate, error: holidayTemplateError } = await supabase
        .from('email_templates')
        .select('html_content, text_content, subject')
        .eq('template_type', 'holiday_form_confirmation')
        .eq('is_active', true)
        .maybeSingle();

      if (holidayTemplate && !holidayTemplateError) {
        console.log('Using holiday template from database');
        htmlContent = holidayTemplate.html_content
          .replace(/\{\{CUSTOMER_NAME\}\}/g, finalName)
          .replace(/\{\{CUSTOMER_EMAIL\}\}/g, finalEmail)
          .replace(/\{\{CUSTOMER_PHONE\}\}/g, phone || 'Not provided')
          .replace(/\{\{PROPERTY_ADDRESS\}\}/g, addressLine || 'Not provided')
          .replace(/\{\{PROPERTY_TYPE\}\}/g, propertyType || 'Not specified')
          .replace(/\{\{PACKAGE_NAME\}\}/g, packageDisplay || 'Not yet selected');

        textContent = holidayTemplate.text_content
          .replace(/\{\{CUSTOMER_NAME\}\}/g, finalName)
          .replace(/\{\{CUSTOMER_EMAIL\}\}/g, finalEmail)
          .replace(/\{\{CUSTOMER_PHONE\}\}/g, phone || 'Not provided')
          .replace(/\{\{PROPERTY_ADDRESS\}\}/g, addressLine || 'Not provided')
          .replace(/\{\{PROPERTY_TYPE\}\}/g, propertyType || 'Not specified')
          .replace(/\{\{PACKAGE_NAME\}\}/g, packageDisplay || 'Not yet selected');

        subject = holidayTemplate.subject;
      } else {
        console.warn('Holiday template not found in DB, using hardcoded fallback');
        subject = `Your Holiday Lights Request Has Been Received - J&M Holiday Lights`;
        htmlContent = buildHolidayHtml(
          finalName, finalEmail, phone || '', address || '',
          city || '', state || '', zipCode || '',
          propertyType || '', packageName
        );
        textContent = buildHolidayText(
          finalName, finalEmail, phone || '', address || '',
          city || '', state || '', zipCode || '',
          propertyType || '', packageName
        );
      }
    } else {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('html_content, text_content, subject')
        .eq('template_type', 'form_confirmation')
        .eq('is_active', true)
        .maybeSingle();

      if (template && !templateError) {
        const servicesList = services.length > 0
          ? services.map((s: string) => `<li>${s}</li>`).join('')
          : '<li>General Quote Request</li>';

        const servicesTextList = services.length > 0
          ? services.map((s: string) => `  - ${s}`).join('\n')
          : '  - General Quote Request';

        htmlContent = template.html_content
          .replace(/\{\{CUSTOMER_NAME\}\}/g, finalName)
          .replace(/\{\{CUSTOMER_EMAIL\}\}/g, finalEmail)
          .replace(/\{\{CUSTOMER_PHONE\}\}/g, phone || 'Not provided')
          .replace(/\{\{PROPERTY_ADDRESS\}\}/g, address || 'Not provided')
          .replace(/\{\{PROPERTY_CITY\}\}/g, city || '')
          .replace(/\{\{PROPERTY_STATE\}\}/g, state || '')
          .replace(/\{\{PROPERTY_ZIP\}\}/g, zipCode || '')
          .replace(/\{\{PROPERTY_TYPE\}\}/g, propertyType || 'Not specified')
          .replace(/\{\{SERVICES_LIST\}\}/g, servicesList);

        textContent = template.text_content
          .replace(/\{\{CUSTOMER_NAME\}\}/g, finalName)
          .replace(/\{\{CUSTOMER_EMAIL\}\}/g, finalEmail)
          .replace(/\{\{CUSTOMER_PHONE\}\}/g, phone || 'Not provided')
          .replace(/\{\{PROPERTY_ADDRESS\}\}/g, address || 'Not provided')
          .replace(/\{\{PROPERTY_CITY\}\}/g, city || '')
          .replace(/\{\{PROPERTY_STATE\}\}/g, state || '')
          .replace(/\{\{PROPERTY_ZIP\}\}/g, zipCode || '')
          .replace(/\{\{PROPERTY_TYPE\}\}/g, propertyType || 'Not specified')
          .replace(/\{\{SERVICES_LIST\}\}/g, servicesTextList);

        subject = template.subject;
      } else {
        console.warn('Form confirmation template not found, using fallback');
        subject = 'Re: Quote request received - J&M Power Washing';
        htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.8; color: #2d3748; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">

<div style="margin-bottom: 30px;">
<img src="https://powerwashjm.com/logos/logo.png" alt="J&M Power Washing" style="max-width: 200px; height: auto;" width="200" />
</div>

<p>Hi ${finalName},</p>

<p>Thanks for reaching out to J&M Power Washing. We received your quote request and wanted to confirm we have all your information.</p>

<div style="margin: 25px 0; padding: 20px; background-color: #f7fafc; border-left: 3px solid #4a5568;">
<p style="font-weight: 600; margin-bottom: 15px;">Request Details:</p>
<p style="margin: 8px 0;">Name: ${finalName}</p>
<p style="margin: 8px 0;">Email: ${finalEmail}</p>
<p style="margin: 8px 0;">Phone: ${phone || 'Not provided'}</p>
${address ? `<p style="margin: 8px 0;">Property: ${address}, ${city}, ${state} ${zipCode}</p>` : ''}
${propertyType ? `<p style="margin: 8px 0;">Property Type: ${propertyType}</p>` : ''}
${services.length > 0 ? `<p style="margin: 8px 0;">Services: ${services.join(', ')}</p>` : ''}
</div>

<p><strong>What happens next:</strong></p>
<p>We will review your request and send over a detailed quote within 24-48 hours.</p>

<p>If you have any questions in the meantime, feel free to call or text us at (401) 595-0726.</p>

<p>Thanks,</p>

<p style="margin-top: 30px;">Best regards,<br>
<br>
J&M Power Washing<br>
(401) 595-0726<br>
sales@powerwashjm.com</p>

</body>
</html>`;
        textContent = `Hi ${finalName},

Thanks for reaching out to J&M Power Washing. We received your quote request and wanted to confirm we have all your information.

Request Details:
Name: ${finalName}
Email: ${finalEmail}
Phone: ${phone || 'Not provided'}
${address ? `Property: ${address}, ${city}, ${state} ${zipCode}` : ''}
${propertyType ? `Property Type: ${propertyType}` : ''}
${services.length > 0 ? `Services: ${services.join(', ')}` : ''}

What happens next:
We will review your request and send over a detailed quote within 24-48 hours.

If you have any questions in the meantime, feel free to call or text us at (401) 595-0726.

Thanks,

Best regards,

J&M Power Washing
(401) 595-0726
sales@powerwashjm.com`;
      }
    }

    const emailData: EmailData = {
      to: { email: finalEmail, name: finalName },
      from: {
        email: "sales@powerwashjm.com",
        name: isHoliday ? "J&M Holiday Lights" : "J&M Power Washing"
      },
      subject,
      html: htmlContent,
      text: textContent,
      quoteId
    };

    console.log('Attempting to send customer confirmation email with fallback...');
    const result = await sendEmailWithFallback(emailData);

    if (!result.success) {
      console.error('All email providers failed:', result.error);
      throw new Error(result.error);
    }

    console.log(`Customer autoresponse sent via ${result.provider}`);

    if (quoteId) {
      try {
        const { error: updateError } = await supabase
          .from('quote_submissions')
          .update({
            form_confirmation_sent: true,
            form_confirmation_sent_at: new Date().toISOString(),
            form_confirmation_error: null,
            form_confirmation_last_attempt: new Date().toISOString(),
            form_confirmation_provider: result.provider
          })
          .eq('id', quoteId);

        if (updateError) {
          console.error('Failed to update form_confirmation_sent:', updateError);
        } else {
          console.log(`Updated form_confirmation tracking for quote ${quoteId} (via ${result.provider})`);
        }
      } catch (trackError) {
        console.error('Error updating form confirmation tracking:', trackError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: result.provider,
        isHoliday,
        data: result.response
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);

    const { quoteId, email: finalEmail, name: finalName, customerEmail, customerName } = payload;
    const recipientEmail = finalEmail || customerEmail;

    if (quoteId && recipientEmail) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('email_sending_errors')
          .insert([{
            quote_submission_id: quoteId,
            email_type: 'form_confirmation',
            recipient_email: recipientEmail,
            error_message: error.message || 'Unknown error',
            error_details: {
              stack: error.stack,
              name: error.name,
              timestamp: new Date().toISOString()
            }
          }]);

        await supabase
          .from('quote_submissions')
          .update({
            form_confirmation_error: error.message || 'Unknown error',
            form_confirmation_last_attempt: new Date().toISOString()
          })
          .eq('id', quoteId);

        console.log('Logged error to database for quote:', quoteId);
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
