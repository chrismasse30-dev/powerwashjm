import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PasswordResetRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  adminEmail: string;
  timestamp: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const request: PasswordResetRequest = await req.json();
    console.log("Processing password reset notification for:", request.email);

    const userName = request.firstName && request.lastName 
      ? `${request.firstName} ${request.lastName}`
      : request.email;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f3f4f6;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
      color: #fff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 30px 20px;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
      color: #4b5563;
    }
    .alert-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .alert-box p {
      margin: 0;
      color: #92400e;
      font-weight: 500;
    }
    .info-section {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .info-section h3 {
      color: #1e3a8a;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: bold;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
      min-width: 120px;
      flex-shrink: 0;
    }
    .info-value {
      color: #1f2937;
    }
    .steps {
      background-color: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .steps h3 {
      color: #1e40af;
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin: 10px 0;
      color: #1e40af;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      padding: 20px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .security-notice {
      background-color: #fee2e2;
      border: 2px solid #ef4444;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .security-notice p {
      margin: 0;
      color: #991b1b;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔐 Password Reset Required</h1>
      <p>J & M Power Washing</p>
    </div>

    <div class="content">
      <p>Hi ${userName},</p>

      <div class="alert-box">
        <p>⚠️ Your account password has been reset by an administrator.</p>
      </div>

      <p>For security reasons, your account password has been reset. You should have received a separate password reset email from Supabase with instructions to create a new password.</p>

      <div class="steps">
        <h3>📝 Next Steps</h3>
        <ol>
          <li>Check your email for a message from Supabase with subject "Reset Your Password"</li>
          <li>Click the secure reset link in that email</li>
          <li>Create a new, strong password</li>
          <li>Log in to your account with your new password</li>
        </ol>
      </div>

      <div class="security-notice">
        <p>🔒 The password reset link will expire in 1 hour</p>
      </div>

      <div class="info-section">
        <h3>🛡️ Security Information</h3>
        <div class="info-row">
          <span class="info-label">Action:</span>
          <span class="info-value">Password Reset</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reset By:</span>
          <span class="info-value">${request.adminEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date & Time:</span>
          <span class="info-value">${new Date(request.timestamp).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          })}</span>
        </div>
      </div>

      <p>If you did not request this password reset or have concerns about your account security, please contact your administrator immediately.</p>

      <p style="margin-top: 30px;">
        <strong>Best regards,</strong><br>
        The JM Power Wash Team
      </p>
    </div>

    <div class="footer">
      <p>This is an automated security notification</p>
      <p>&copy; ${new Date().getFullYear()} J & M Power Washing</p>
    </div>
  </div>
</body>
</html>`;

    console.log(`Sending password reset notification to ${request.email}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "JM Power Washing <sales@powerwashjm.com>",
        to: [request.email],
        subject: "Password Reset Required - JM Power Wash",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`Failed to send email:`, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await emailResponse.json();
    console.log(`Password reset notification sent successfully:`, result);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
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