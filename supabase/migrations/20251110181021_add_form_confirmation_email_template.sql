/*
  # Add Form Confirmation Email Template
  
  1. New Template
    - Template Type: `form_confirmation`
    - Name: Form Confirmation - Customer Receipt
    - Purpose: Send detailed recap to customers after form submission
    
  2. Features
    - Recaps all customer details
    - Lists services requested
    - Professional branded design
    - Clear next steps timeline
    - Call-to-action with phone number
    
  3. Template Variables
    - {{CUSTOMER_NAME}} - Customer's full name
    - {{CUSTOMER_EMAIL}} - Customer's email address
    - {{CUSTOMER_PHONE}} - Customer's phone number
    - {{PROPERTY_ADDRESS}} - Full street address
    - {{PROPERTY_CITY}} - City
    - {{PROPERTY_STATE}} - State
    - {{PROPERTY_ZIP}} - ZIP code
    - {{PROPERTY_TYPE}} - Residential or Commercial
    - {{SERVICES_LIST}} - HTML list of services requested
*/

INSERT INTO email_templates (
  name,
  subject,
  html_content,
  text_content,
  template_type,
  is_active
) VALUES (
  'Form Confirmation - Customer Receipt',
  'Thank You for Your Quote Request - JM Power Wash',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request Confirmation</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; -webkit-font-smoothing: antialiased; line-height: 1.6; }
    .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000080 0%, #1e40af 50%, #3b82f6 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .content { padding: 40px 30px; color: #333333; }
    .greeting { font-size: 18px; color: #000080; font-weight: 600; margin-bottom: 20px; }
    .message { font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: #555555; }
    .recap-section { background: #f8f9fa; border-left: 4px solid #000080; padding: 25px; margin: 30px 0; border-radius: 4px; }
    .recap-title { font-size: 20px; font-weight: 700; color: #000080; margin-bottom: 20px; border-bottom: 2px solid #FFD700; padding-bottom: 10px; }
    .detail-row { margin-bottom: 15px; font-size: 15px; }
    .detail-label { font-weight: 600; color: #000080; display: block; margin-bottom: 5px; }
    .detail-value { color: #333333; display: block; }
    .services-list { margin: 10px 0; padding-left: 0; list-style: none; }
    .services-list li { padding: 8px 0; padding-left: 25px; position: relative; color: #333333; }
    .services-list li:before { content: "✓"; position: absolute; left: 0; color: #FFD700; font-weight: bold; font-size: 18px; }
    .cta-section { background: #000080; color: #ffffff; padding: 25px; text-align: center; margin: 30px 0; border-radius: 4px; }
    .cta-section h3 { margin: 0 0 15px 0; font-size: 20px; }
    .cta-section p { margin: 10px 0; font-size: 16px; }
    .phone-link { color: #FFD700; text-decoration: none; font-weight: 700; font-size: 24px; display: inline-block; margin: 10px 0; }
    .phone-link:hover { color: #FFF; }
    .timeline { background: #fff3cd; border: 2px solid #FFD700; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center; }
    .timeline-title { font-weight: 700; color: #000080; font-size: 18px; margin-bottom: 10px; }
    .timeline-text { font-size: 16px; color: #555555; line-height: 1.6; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 3px solid #FFD700; }
    .footer-brand { font-weight: 700; color: #000080; font-size: 18px; margin-bottom: 10px; }
    .footer-contact { color: #666666; font-size: 14px; margin: 5px 0; }
    .footer-tagline { color: #999999; font-size: 13px; margin-top: 15px; font-style: italic; }
    @media only screen and (max-width: 600px) {
      .content { padding: 25px 20px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 26px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header"><h1>Thank You!</h1></div>
    <div class="content">
      <div class="greeting">Hi {{CUSTOMER_NAME}},</div>
      <div class="message">Thank you for reaching out to <strong>JM Power Wash</strong> and <strong>JM Holiday Lights</strong>! We are excited to help transform your property.</div>
      <div class="message">We have received your quote request and our team is already reviewing the details.</div>
      <div class="recap-section">
        <div class="recap-title">📋 Your Request Details</div>
        <div class="detail-row"><div class="detail-label">Name:</div><div class="detail-value">{{CUSTOMER_NAME}}</div></div>
        <div class="detail-row"><div class="detail-label">Email:</div><div class="detail-value">{{CUSTOMER_EMAIL}}</div></div>
        <div class="detail-row"><div class="detail-label">Phone:</div><div class="detail-value">{{CUSTOMER_PHONE}}</div></div>
        <div class="detail-row"><div class="detail-label">Property Address:</div><div class="detail-value">{{PROPERTY_ADDRESS}}<br>{{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}</div></div>
        <div class="detail-row"><div class="detail-label">Property Type:</div><div class="detail-value">{{PROPERTY_TYPE}}</div></div>
        <div class="detail-row"><div class="detail-label">Services Requested:</div><div class="detail-value"><ul class="services-list">{{SERVICES_LIST}}</ul></div></div>
      </div>
      <div class="timeline">
        <div class="timeline-title">⏱️ What Happens Next?</div>
        <div class="timeline-text">You can expect to receive a personalized quote within the next <strong>24-48 hours</strong>. Our team will carefully review your request and prepare a detailed estimate tailored to your specific needs.</div>
      </div>
      <div class="cta-section">
        <h3>Have Questions?</h3>
        <p>We are here to help! Feel free to reach out anytime:</p>
        <a href="tel:+14015950768" class="phone-link">(401) 595-0768</a>
        <p style="margin-top: 15px; font-size: 14px;">Call or text us - we typically respond within minutes!</p>
      </div>
      <div class="message">We look forward to working with you and transforming your property!</div>
      <div class="message" style="margin-top: 30px;"><strong>Best regards,</strong><br>The JM Power Wash & JM Holiday Lights Team</div>
    </div>
    <div class="footer">
      <div class="footer-brand">JM Power Wash & JM Holiday Lights</div>
      <div class="footer-contact">📞 (401) 595-0768</div>
      <div class="footer-contact">✉️ sales@powerwashjm.pro</div>
      <div class="footer-tagline">Professional Power Washing & Holiday Lighting Services</div>
    </div>
  </div>
</body>
</html>',
  'Hi {{CUSTOMER_NAME}},

Thank you for reaching out to JM Power Wash and JM Holiday Lights! We are excited to help transform your property.

We have received your quote request and our team is already reviewing the details.

YOUR REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: {{CUSTOMER_NAME}}
Email: {{CUSTOMER_EMAIL}}
Phone: {{CUSTOMER_PHONE}}

Property Address:
{{PROPERTY_ADDRESS}}
{{PROPERTY_CITY}}, {{PROPERTY_STATE}} {{PROPERTY_ZIP}}

Property Type: {{PROPERTY_TYPE}}

Services Requested:
{{SERVICES_LIST}}

WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can expect to receive a personalized quote within the next 24-48 hours. Our team will carefully review your request and prepare a detailed estimate tailored to your specific needs.

HAVE QUESTIONS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We are here to help! Feel free to reach out anytime:

Phone: (401) 595-0768 (call or text)
Email: sales@powerwashjm.pro

We typically respond within minutes!

We look forward to working with you and transforming your property!

Best regards,
The JM Power Wash & JM Holiday Lights Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JM Power Wash & JM Holiday Lights
Professional Power Washing & Holiday Lighting Services
Phone: (401) 595-0768 | Email: sales@powerwashjm.pro',
  'form_confirmation',
  true
);