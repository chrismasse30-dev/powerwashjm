import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MeasurementEmailRequest {
  imageData: string;
  total: string;
  totalPlus10: string;
  measurements: Array<{
    type: string;
    value: string;
    perimeter?: string;
  }>;
  clientInfo: {
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
    email: string;
  };
  projectNotes?: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { imageData, total, totalPlus10, measurements, clientInfo, projectNotes }: MeasurementEmailRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1e3a8a;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .content {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .client-info {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #3b82f6;
            }
            .client-info h3 {
              color: #1e3a8a;
              margin-top: 0;
              margin-bottom: 15px;
              font-size: 1.2em;
            }
            .client-info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .client-info-row:last-child {
              border-bottom: none;
            }
            .client-info-label {
              font-weight: bold;
              color: #4b5563;
              min-width: 100px;
            }
            .client-info-value {
              color: #1f2937;
            }
            .totals {
              background-color: #1f2937;
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .totals h3 {
              margin-top: 0;
              color: #93c5fd;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #374151;
            }
            .total-row:last-child {
              border-bottom: none;
            }
            .highlight {
              color: #10b981;
              font-weight: bold;
              font-size: 1.2em;
            }
            .measurements {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #e5e7eb;
            }
            .measurements h3 {
              color: #1e3a8a;
              margin-top: 0;
            }
            .measurement-item {
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .measurement-item:last-child {
              border-bottom: none;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 0.9em;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QuickMeasure Design Report</h1>
            <p>J & M Power Washing</p>
          </div>

          <div class="content">
            <p>A new property measurement has been completed using QuickMeasure.</p>
            <p><strong>See the attached image with measurements.</strong></p>
          </div>

          ${clientInfo.name || clientInfo.address || clientInfo.city || clientInfo.phone || clientInfo.email ? `
          <div class="client-info">
            <h3>Client Information</h3>
            ${clientInfo.name ? `<div class="client-info-row"><span class="client-info-label">Name:</span><span class="client-info-value">${clientInfo.name}</span></div>` : ''}
            ${clientInfo.address ? `<div class="client-info-row"><span class="client-info-label">Address:</span><span class="client-info-value">${clientInfo.address}</span></div>` : ''}
            ${clientInfo.city || clientInfo.zip ? `<div class="client-info-row"><span class="client-info-label">Location:</span><span class="client-info-value">${clientInfo.city}${clientInfo.city && clientInfo.zip ? ', ' : ''}${clientInfo.zip}</span></div>` : ''}
            ${clientInfo.phone ? `<div class="client-info-row"><span class="client-info-label">Phone:</span><span class="client-info-value">${clientInfo.phone}</span></div>` : ''}
            ${clientInfo.email ? `<div class="client-info-row"><span class="client-info-label">Email:</span><span class="client-info-value">${clientInfo.email}</span></div>` : ''}
          </div>
          ` : ''}

          ${projectNotes ? `
          <div class="client-info">
            <h3>📋 Project Notes</h3>
            <div style="padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-top: 10px;">
              <p style="color: #92400e; line-height: 1.8; white-space: pre-wrap; margin: 0;">${projectNotes}</p>
            </div>
          </div>
          ` : ''}

          <div class="totals">
            <h3>Measurement Summary</h3>
            <div class="total-row">
              <span>Total:</span>
              <strong>${total}</strong>
            </div>
            <div class="total-row">
              <span>Total +10%:</span>
              <span class="highlight">${totalPlus10}</span>
            </div>
          </div>

          <div class="measurements">
            <h3>Individual Measurements</h3>
            ${measurements.map((m, i) => `
              <div class="measurement-item">
                ${m.type === 'length'
                  ? `<strong>${i + 1}. Length:</strong> ${m.value}`
                  : `<strong>${i + 1}. Area:</strong> ${m.value} <br><span style="margin-left: 20px;">Perimeter: ${m.perimeter}</span>`
                }
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>This email was automatically generated by QuickMeasure</p>
            <p>&copy; ${new Date().getFullYear()} J & M Power Washing</p>
          </div>
        </body>
      </html>
    `;

    const base64Data = imageData.split(',')[1];

    const subjectLine = clientInfo.name
      ? `New QuickMeasure Design - ${clientInfo.name} - Total: ${total}`
      : `New QuickMeasure Design - Total: ${total}`;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'QuickMeasure <sales@powerwashjm.com>',
        to: ['sales@powerwashjm.com', 'jmpowerwashing@yahoo.com'],
        subject: subjectLine,
        html: emailHtml,
        attachments: [
          {
            filename: 'measurement-design.png',
            content: base64Data,
          }
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email via Resend', details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailData = await emailResponse.json();

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
