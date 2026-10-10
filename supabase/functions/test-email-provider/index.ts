import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// v3 - added resend_test and brevo_env providers

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
    const emailApiKey = Deno.env.get('emailapikey');
    const emailSmtp = Deno.env.get('EmailSMTP');

    const { provider, to, subject, htmlContent } = await req.json();

    if (provider === 'check') {
      return new Response(JSON.stringify({
        emailapikey_exists: !!emailApiKey,
        emailapikey_prefix: emailApiKey ? emailApiKey.substring(0, 15) + '...' : null,
        emailapikey_length: emailApiKey?.length || 0,
        EmailSMTP_exists: !!emailSmtp,
        EmailSMTP_prefix: emailSmtp ? emailSmtp.substring(0, 15) + '...' : null,
        EmailSMTP_length: emailSmtp?.length || 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (provider === 'zeptomail_env') {
      if (!emailApiKey) {
        return new Response(JSON.stringify({ error: 'emailapikey not set' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const zeptomailPayload = {
        from: { address: "sales@powerwashjm.com", name: "J&M Power Washing" },
        to: [{ email_address: { address: to, name: "Kathy Bradley" } }],
        bcc: [{ email_address: { address: "ChrisMasse30@Gmail.com", name: "Chris Masse" } }],
        reply_to: [{ address: "sales@powerwashjm.com", name: "J&M Power Washing Sales" }],
        subject: subject || "Test Email",
        htmlbody: htmlContent || "<p>Test email from ZeptoMail env key</p>",
        textbody: "Test email"
      };

      const response = await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Zoho-enczapikey ${emailApiKey}`
        },
        body: JSON.stringify(zeptomailPayload)
      });

      const result = await response.text();
      return new Response(JSON.stringify({
        status: response.status,
        ok: response.ok,
        result: result
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (provider === 'resend_test') {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) {
        return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const resendPayload = {
        from: "J&M Power Washing <sales@powerwashjm.com>",
        to: [to],
        reply_to: "sales@powerwashjm.com",
        subject: subject || "Test Email",
        html: htmlContent || "<p>Test</p>",
        text: "Test email"
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resendPayload)
      });

      const result = await response.text();
      return new Response(JSON.stringify({
        status: response.status,
        ok: response.ok,
        result: result
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (provider === 'brevo_env') {
      if (!emailSmtp) {
        return new Response(JSON.stringify({ error: 'EmailSMTP not set' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const brevoPayload = {
        sender: { email: "sales@powerwashjm.com", name: "J&M Power Washing" },
        to: [{ email: to, name: "Kathy Bradley" }],
        bcc: [{ email: "ChrisMasse30@Gmail.com", name: "Chris Masse" }],
        replyTo: { email: "sales@powerwashjm.com", name: "J&M Power Washing Sales" },
        subject: subject || "Test Email",
        htmlContent: htmlContent || "<p>Test</p>",
        textContent: "Test email"
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': emailSmtp,
          'content-type': 'application/json'
        },
        body: JSON.stringify(brevoPayload)
      });

      const result = await response.text();
      return new Response(JSON.stringify({
        status: response.status,
        ok: response.ok,
        result: result
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown provider' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
