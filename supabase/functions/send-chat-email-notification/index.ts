import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get MailJet keys
    const { data: mailjetData } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['mailjet_api_key', 'mailjet_secret_key']);

    const apiKeyRow = mailjetData?.find(row => row.setting_key === 'mailjet_api_key');
    const secretKeyRow = mailjetData?.find(row => row.setting_key === 'mailjet_secret_key');

    const chatRequest: ChatRequest = await req.json();
    console.log("Processing chat request notification");

    const emailBody = `
New Chat Request from Website

Customer Information:
Name: ${chatRequest.firstName} ${chatRequest.lastName}
Phone: ${chatRequest.phone}
Service Needed: ${chatRequest.service}

Page Source: ${chatRequest.source}
Timestamp: ${new Date().toLocaleString()}

This is an automated notification from your chat system.
    `.trim();

    const recipient = "sales@powerwashjm.com";
    const subject = `New Chat Request - ${chatRequest.firstName} ${chatRequest.lastName}`;
    console.log(`Sending chat notification to ${recipient}`);

    let emailSent = false;

    // Try MailJet first
    if (apiKeyRow && secretKeyRow) {
      try {
        console.log('📧 Sending via MailJet...');
        const auth = btoa(`${apiKeyRow.setting_value}:${secretKeyRow.setting_value}`);

        const mailjetPayload = {
          Messages: [
            {
              From: {
                Email: 'sales@powerwashjm.com',
                Name: 'JM Power Washing Chat System'
              },
              To: [
                {
                  Email: recipient,
                  Name: 'Sales Team'
                }
              ],
              ReplyTo: {
                Email: chatRequest.email,
                Name: `${chatRequest.firstName} ${chatRequest.lastName}`
              },
              Subject: subject,
              TextPart: emailBody
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
          console.log('✅ MailJet email sent successfully');
          emailSent = true;
        } else {
          const errorText = await emailResponse.text();
          console.error('❌ MailJet failed:', errorText);
        }
      } catch (mailjetError) {
        console.error('❌ MailJet error:', mailjetError);
      }
    }

    // Fallback to Web3Forms
    if (!emailSent) {
      console.log('📧 Using Web3Forms fallback...');
      const emailResponse = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "fd56a2dd-939a-402e-955d-5d6345cadc3c",
          subject: subject,
          from: "sales@powerwashjm.com",
          from_name: "JM Power Washing Chat System",
          email: recipient,
          message: emailBody,
          botcheck: false,
          replyto: chatRequest.email,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error(`Failed to send email to ${recipient}:`, errorText);
        throw new Error(`Email send failed: ${errorText}`);
      } else {
        const result = await emailResponse.json();
        console.log(`Email sent successfully to ${recipient}:`, result);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Chat notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending chat notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
