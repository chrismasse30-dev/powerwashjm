import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getMailJetKeys(supabaseUrl: string, supabaseKey: string): Promise<{ apiKey: string; secretKey: string } | null> {
  try {
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

interface QuoteSubmission {
  id: string;
  name: string;
  email: string;
  address?: string;
  services?: any;
  city?: string;
  state?: string;
  zip_code?: string;
  form_started_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mailjetKeys = await getMailJetKeys(supabaseUrl, supabaseKey);
    const web3formsKey = Deno.env.get("WEB3FORMS_ABANDONED_EMAIL_KEY");

    if (!mailjetKeys) {
      console.warn('⚠️  MailJet keys not configured - will use Web3Forms fallback');
    }

    let quoteIds = [];

    try {
      const requestData = await req.json();
      console.log("Request data:", requestData);

      if (requestData.quoteId || requestData.quoteIds) {
        quoteIds = Array.isArray(requestData.quoteIds)
          ? requestData.quoteIds
          : [requestData.quoteId];
      }
    } catch (e) {
      console.log("No specific quote IDs provided, will auto-discover abandoned forms");
    }

    if (quoteIds.length === 0) {
      console.log("Auto-discovering abandoned forms...");
      const abandonedResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/get_abandoned_form_quotes`,
        {
          method: "POST",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (abandonedResponse.ok) {
        const abandonedQuotes = await abandonedResponse.json();
        quoteIds = abandonedQuotes.map((q: any) => q.quote_id);
        console.log(`Found ${quoteIds.length} abandoned forms to process`);
      } else {
        console.error("Failed to fetch abandoned forms:", await abandonedResponse.text());
      }
    }

    if (quoteIds.length === 0) {
      console.log("No abandoned forms found");
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: "No abandoned forms found",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`Processing ${quoteIds.length} quote(s)`);

    const results = [];

    for (const quoteId of quoteIds) {
      try {
        console.log(`\n--- Processing quote: ${quoteId} ---`);

        const quoteResponse = await fetch(
          `${supabaseUrl}/rest/v1/quote_submissions?id=eq.${quoteId}&select=*`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
          }
        );

        if (!quoteResponse.ok) {
          throw new Error(`Failed to fetch quote: ${quoteResponse.statusText}`);
        }

        const quotes: QuoteSubmission[] = await quoteResponse.json();
        const quote = quotes[0];

        if (!quote) {
          console.error(`Quote ${quoteId} not found`);
          results.push({
            quoteId,
            status: "error",
            error: "Quote not found",
          });
          continue;
        }

        console.log("Quote data found:", {
          id: quote.id,
          email: quote.email,
          name: quote.name,
        });

        const submittedResponse = await fetch(
          `${supabaseUrl}/rest/v1/quote_submissions?id=eq.${quoteId}&select=is_submitted`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
          }
        );

        const submittedData = await submittedResponse.json();
        if (submittedData[0]?.is_submitted) {
          console.log(`Quote ${quoteId} already submitted, skipping email`);
          results.push({
            quoteId,
            status: "skipped",
            reason: "already_submitted",
          });
          continue;
        }

        const emailSentResponse = await fetch(
          `${supabaseUrl}/rest/v1/quote_submissions?id=eq.${quoteId}&select=abandoned_email_sent`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
          }
        );

        const emailSentData = await emailSentResponse.json();
        if (emailSentData[0]?.abandoned_email_sent) {
          console.log(`Email already sent for quote ${quoteId}, skipping`);
          results.push({
            quoteId,
            status: "skipped",
            reason: "email_already_sent",
          });
          continue;
        }

        function buildPlainTextEmail({
          fullName,
          address,
          services,
          formLink,
        }: {
          fullName: string;
          address: string;
          services: string;
          formLink: string;
        }): string {
          return `Hi ${fullName}! 👋

I noticed you started requesting a quote for your property, but didn't get a chance to finish. No worries—life gets busy!

${services ? `Services You're Interested In: ${services}\n` : ""}${address ? `Property Location: ${address}\n` : ""}
We'd love to help transform your property! Completing your quote request takes less than 2 minutes, and you'll get:

✓ An accurate, detailed estimate tailored to your property
✓ Expert recommendations from our experienced team
✓ Flexible scheduling options that work for you
✓ No-obligation pricing—see what we can do for you!

COMPLETE YOUR QUOTE REQUEST:
${formLink}

PREFER TO TALK? WE'RE HERE TO HELP!
📞 (401) 595-0726
Call or text us anytime—we're happy to answer questions or provide a quote over the phone!

We're a locally-owned, family-run business serving Rhode Island and Massachusetts. Our team takes pride in delivering exceptional results and outstanding customer service.

Looking forward to making your property shine! ✨

Best regards,
The J & M Power Washing Team

---
J & M Power Washing and Holiday Lights
Professional Exterior Cleaning in RI & MA
📞 (401) 595-0726 | 📧 sales@powerwashjm.com

You're receiving this email because you started a quote request at powerwashjm.com
Questions? Just reply to this email or give us a call!`;
        }

        let servicesText = "";
        if (Array.isArray(quote.services)) {
          servicesText = quote.services.join(", ");
        } else if (typeof quote.services === "string") {
          servicesText = quote.services;
        }

        const fullAddress = [
          quote.address,
          quote.city,
          quote.state,
          quote.zip_code
        ].filter(Boolean).join(", ");

        const plainTextMessage = buildPlainTextEmail({
          fullName: quote.name || "there",
          address: fullAddress,
          services: servicesText,
          formLink: `https://powerwashjm.com/complete-quote?resume=${quote.id}`,
        });

        console.log("Preparing to send email...");

        let emailSent = false;
        let emailResult: any = null;

        if (mailjetKeys) {
          try {
            console.log('📧 Attempting MailJet (primary)...');
            const auth = btoa(`${mailjetKeys.apiKey}:${mailjetKeys.secretKey}`);

            const mailjetPayload = {
              Messages: [
                {
                  From: {
                    Email: 'sales@powerwashjm.com',
                    Name: 'J & M Power Washing'
                  },
                  To: [
                    {
                      Email: quote.email,
                      Name: quote.name || ''
                    }
                  ],
                  Bcc: [
                    {
                      Email: 'sales@powerwashjm.com',
                      Name: 'Sales Team'
                    }
                  ],
                  Subject: 'Complete Your Quote Request - J & M Power Washing',
                  TextPart: plainTextMessage,
                  HTMLPart: buildHtmlEmail({
                    fullName: quote.name || 'there',
                    services: servicesText,
                    address: fullAddress,
                    formLink: `https://powerwashjm.com/complete-quote?resume=${quote.id}`,
                  }),
                  CustomID: quote.id
                }
              ]
            };

            const emailResponse = await fetch('https://api.mailjet.com/v3.1/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
              },
              body: JSON.stringify(mailjetPayload)
            });

            if (emailResponse.ok) {
              emailResult = await emailResponse.json();
              emailSent = true;
              console.log('✅ MailJet email sent successfully');
            } else {
              const errorText = await emailResponse.text();
              console.error('⚠️  MailJet failed:', errorText);
            }
          } catch (mailjetError) {
            console.error('⚠️  MailJet error:', mailjetError);
          }
        }

        if (!emailSent && web3formsKey) {
          try {
            console.log('📧 Using Web3Forms fallback...');
            const formData = new FormData();
            formData.append('access_key', web3formsKey);
            formData.append('subject', 'Complete Your Quote Request - J & M Power Washing');
            formData.append('from_name', 'J & M Power Washing');
            formData.append('email', quote.email);
            formData.append('replyto', 'sales@powerwashjm.com');
            formData.append('message', plainTextMessage);

            const fallbackResponse = await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              body: formData
            });

            if (fallbackResponse.ok) {
              emailSent = true;
              emailResult = { messageId: 'web3forms-fallback' };
              console.log('✅ Web3Forms fallback succeeded');
            } else {
              console.error('❌ Web3Forms failed:', await fallbackResponse.text());
            }
          } catch (fallbackError) {
            console.error('❌ Web3Forms error:', fallbackError);
          }
        }

        if (!emailSent) {
          throw new Error('All email delivery methods failed');
        }

        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/quote_submissions?id=eq.${quoteId}`,
          {
            method: "PATCH",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal",
            },
            body: JSON.stringify({
              abandoned_email_sent: true,
              abandoned_email_sent_at: new Date().toISOString(),
            }),
          }
        );

        if (!updateResponse.ok) {
          console.error("Failed to update abandoned_email_sent flag");
        }

        console.log(`✅ Email sent successfully for quote ${quoteId}`);
        results.push({
          quoteId,
          email: quote.email,
          status: "sent",
          messageId: emailResult.messageId,
        });
      } catch (error) {
        console.error(`Error processing quote ${quoteId}:`, error);
        results.push({
          quoteId,
          status: "error",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function buildHtmlEmail({
  fullName,
  services,
  address,
  formLink,
}: {
  fullName: string;
  services: string;
  address: string;
  formLink: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Complete Your Quote Request - J & M Power Washing</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 20px; text-align: center; }
    .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: 0.5px; }
    .tagline { color: #e0e7ff; font-size: 14px; margin: 5px 0 0 0; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
    .greeting { font-size: 20px; color: #1e40af; margin: 0 0 20px 0; font-weight: 600; }
    .body-text { font-size: 16px; margin: 0 0 15px 0; color: #4b5563; }
    .service-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }
    .service-label { font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600; }
    .service-name { font-size: 18px; color: #1e40af; margin: 0; font-weight: 600; }
    .address-box { background: #f9fafb; padding: 15px 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #e5e7eb; }
    .address-label { font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600; }
    .address-text { font-size: 16px; color: #1f2937; margin: 0; font-weight: 500; }
    .cta-container { text-align: center; margin: 35px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25); transition: all 0.3s; }
    .cta-button:hover { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3); }
    .cta-subtext { font-size: 14px; color: #6b7280; margin: 15px 0 0 0; }
    .contact-section { background: #fef3c7; padding: 25px; margin: 30px 0; border-radius: 6px; text-align: center; border: 2px solid #fbbf24; }
    .contact-title { font-size: 16px; color: #92400e; margin: 0 0 15px 0; font-weight: 600; }
    .phone-link { display: inline-block; font-size: 24px; color: #1e40af; text-decoration: none; font-weight: bold; margin: 10px 0; }
    .contact-note { font-size: 14px; color: #78350f; margin: 10px 0 0 0; }
    .benefits { margin: 25px 0; }
    .benefit-item { margin: 12px 0; padding-left: 30px; position: relative; font-size: 15px; color: #4b5563; }
    .benefit-item:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
    .footer { background: #1f2937; color: #d1d5db; padding: 30px 20px; text-align: center; font-size: 14px; }
    .footer-text { margin: 5px 0; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content { padding: 30px 20px !important; }
      .greeting { font-size: 18px !important; }
      .body-text { font-size: 15px !important; }
      .cta-button { padding: 14px 30px !important; font-size: 16px !important; }
      .phone-link { font-size: 20px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td class="header">
              <h1 class="logo">J & M Power Washing</h1>
              <p class="tagline">Professional Exterior Cleaning & Holiday Lights</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              <p class="greeting">Hi ${fullName}! 👋</p>
              <p class="body-text">
                I noticed you started requesting a quote for your property, but didn't get a chance to finish. No worries—life gets busy!
              </p>
              ${services ? `
              <div class="service-box">
                <p class="service-label">Services You're Interested In:</p>
                <p class="service-name">${services}</p>
              </div>
              ` : ''}
              ${address ? `
              <div class="address-box">
                <p class="address-label">Property Location:</p>
                <p class="address-text">${address}</p>
              </div>
              ` : ''}
              <p class="body-text">
                We'd love to help transform your property! Completing your quote request takes less than 2 minutes, and you'll get:
              </p>
              <div class="benefits">
                <div class="benefit-item">An accurate, detailed estimate tailored to your property</div>
                <div class="benefit-item">Expert recommendations from our experienced team</div>
                <div class="benefit-item">Flexible scheduling options that work for you</div>
                <div class="benefit-item">No-obligation pricing—see what we can do for you!</div>
              </div>
              <div class="cta-container">
                <a href="${formLink}" class="cta-button">Complete My Quote Request</a>
                <p class="cta-subtext">Pick up right where you left off</p>
              </div>
              <div class="contact-section">
                <p class="contact-title">Prefer to Talk? We're Here to Help!</p>
                <a href="tel:+14015950726" class="phone-link">📞 (401) 595-0726</a>
                <p class="contact-note">Call or text us anytime—we're happy to answer questions or provide a quote over the phone!</p>
              </div>
              <p class="body-text">
                We're a locally-owned, family-run business serving Rhode Island and Massachusetts. Our team takes pride in delivering exceptional results and outstanding customer service.
              </p>
              <p class="body-text">
                Looking forward to making your property shine! ✨
              </p>
              <p class="body-text" style="margin-top: 25px;">
                <strong>Best regards,</strong><br>
                The J & M Power Washing Team
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p class="footer-text"><strong>J & M Power Washing and Holiday Lights</strong></p>
              <p class="footer-text">Professional Exterior Cleaning in RI & MA</p>
              <p class="footer-text" style="margin-top: 15px;">
                📞 (401) 595-0726 | 📧 sales@powerwashjm.com
              </p>
              <p class="footer-text" style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                You're receiving this email because you started a quote request at powerwashjm.com<br>
                Questions? Just reply to this email or give us a call!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}