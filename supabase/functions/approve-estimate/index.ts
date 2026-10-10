import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { quoteId } = await req.json();

    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quote_submissions')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    const designTotal = Number(quote.pricing_breakdown?.grand_total);
    const approvedTotal = Number.isFinite(designTotal) && designTotal > 0
      ? designTotal
      : Number(quote.total_price || 0);

    // Check if already approved (check both estimate_approved flag and estimate_approvals table)
    if (quote.estimate_approved) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyApproved: true,
          message: 'This estimate has already been approved. We will contact you shortly!'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: existingApproval } = await supabase
      .from('estimate_approvals')
      .select('id')
      .eq('quote_submission_id', quoteId)
      .maybeSingle();

    if (existingApproval) {
      // Update the quote if it wasn't marked as approved yet
      await supabase
        .from('quote_submissions')
        .update({
          estimate_approved: true,
          estimate_approved_at: new Date().toISOString(),
          estimate_approved_by_ip: ipAddress,
          status: 'Sold',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      return new Response(
        JSON.stringify({
          success: true,
          alreadyApproved: true,
          message: 'This estimate has already been approved. We will contact you shortly!'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create approval record
    const { data: approval, error: approvalError } = await supabase
      .from('estimate_approvals')
      .insert({
        quote_submission_id: quoteId,
        customer_name: quote.name,
        customer_email: quote.email,
        total_amount: approvedTotal,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (approvalError) {
      throw new Error(`Failed to create approval: ${approvalError.message}`);
    }

    // Update quote status to 'Sold' and set approval fields
    await supabase
      .from('quote_submissions')
      .update({
        estimate_approved: true,
        estimate_approved_at: new Date().toISOString(),
        estimate_approved_by_ip: ipAddress,
        status: 'Sold',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);

    // Get MailJet API keys from site_settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['mailjet_api_key', 'mailjet_secret_key']);

    const mailjetApiKey = settings?.find((r: any) => r.setting_key === 'mailjet_api_key')?.setting_value;
    const mailjetSecretKey = settings?.find((r: any) => r.setting_key === 'mailjet_secret_key')?.setting_value;

    if (mailjetApiKey && mailjetSecretKey && mailjetApiKey !== 'NOT_CONFIGURED') {
      // Send notification email to team via MailJet
      const approvedAtEST = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const teamEmailBody = `
        <h2>🎉 Customer Approved Their Estimate!</h2>
        <p><strong>Customer:</strong> ${quote.name}</p>
        <p><strong>Email:</strong> ${quote.email}</p>
        <p><strong>Phone:</strong> ${quote.phone || 'N/A'}</p>
        <p><strong>Address:</strong> ${quote.address || 'N/A'}</p>
        <p><strong>Estimate Amount:</strong> ${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p><strong>Property Type:</strong> ${quote.property_type || 'N/A'}</p>
        <p><strong>Package:</strong> ${quote.package || 'N/A'}</p>
        <p><strong>Approved At:</strong> ${approvedAtEST} EST</p>
        <hr>
        <p><strong>Next Step:</strong> Send invoice to finalize the booking.</p>
      `;

      const customerEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #1e3a5f, #2d5a3d); border-radius: 8px 8px 0 0;">
            <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lights" style="max-width: 200px; height: auto;" />
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e3a5f; margin-bottom: 16px;">Thank You for Approving Your Estimate!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${quote.name?.split(' ')[0] || 'there'},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">We're excited to confirm that your holiday lighting estimate of <strong>${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> has been approved.</p>
            <h3 style="color: #1e3a5f; margin-top: 24px;">What Happens Next</h3>
            <ol style="color: #333; font-size: 15px; line-height: 1.8;">
              <li>We'll send you an invoice to finalize your booking</li>
              <li>Our team will schedule your installation date</li>
              <li>We'll confirm the date and time with you</li>
            </ol>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 20px;">If you have any questions, don't hesitate to reach out!</p>
            <p style="color: #333; font-size: 15px; margin-top: 24px;">
              <strong>J&M Holiday Lights Team</strong><br>
              <a href="tel:4015950726" style="color: #1e3a5f;">(401) 595-0726</a><br>
              <a href="mailto:sales@powerwashjm.com" style="color: #1e3a5f;">sales@powerwashjm.com</a>
            </p>
          </div>
        </div>
      `;

      const credentials = btoa(`${mailjetApiKey}:${mailjetSecretKey}`);

      // Send team notification
      const teamResponse = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [{
            From: { Email: 'sales@powerwashjm.com', Name: 'J&M Power Washing System' },
            To: [
              { Email: 'ChrisMasse30@gmail.com', Name: 'Chris Masse' },
              { Email: 'sales@powerwashjm.com', Name: 'J&M Sales Team' }
            ],
            Subject: `🎉 Estimate Approved by ${quote.name} - ${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            HTMLPart: teamEmailBody
          }]
        })
      });

      if (teamResponse.ok) {
        await supabase
          .from('estimate_approvals')
          .update({
            notification_sent: true,
            notification_sent_at: new Date().toISOString()
          })
          .eq('id', approval.id);
      }

      // Send customer confirmation
      await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [{
            From: { Email: 'sales@powerwashjm.com', Name: 'J&M Holiday Lights' },
            To: [{ Email: quote.email, Name: quote.name }],
            Subject: 'Your Holiday Lighting Estimate is Confirmed!',
            HTMLPart: customerEmailBody
          }]
        })
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your estimate has been approved. We will send you an invoice shortly.',
        approval: {
          id: approval.id,
          approvedAt: approval.approved_at
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error approving estimate:', error);
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
