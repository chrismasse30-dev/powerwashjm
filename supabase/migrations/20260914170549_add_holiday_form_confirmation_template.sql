/*
# Add Holiday Form Confirmation Email Template

1. Modified Tables
   - `email_templates` - Expands template_type check constraint to include
     'holiday_form_confirmation', then inserts the festive holiday lights
     confirmation email template.

2. Description
   - Drops and re-creates the template_type check constraint to allow the new
     'holiday_form_confirmation' type alongside all existing types.
   - Inserts the holiday-branded confirmation email template with festive
     green/gold design, holiday logo, request details card, and next-steps.
   - Uses {{CUSTOMER_NAME}}, {{CUSTOMER_EMAIL}}, {{CUSTOMER_PHONE}},
     {{PROPERTY_ADDRESS}}, {{PROPERTY_TYPE}}, {{PACKAGE_NAME}} variables.

3. Important Notes
   - Idempotent: constraint drop uses IF EXISTS, insert uses ON CONFLICT.
   - No data loss: only the check constraint definition changes, no columns
     or rows are removed.
*/

ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_template_type_check;

ALTER TABLE email_templates ADD CONSTRAINT email_templates_template_type_check
  CHECK (template_type = ANY (ARRAY[
    'residential',
    'commercial',
    'form_confirmation',
    'estimate_followup',
    'instant_quote_confirmation',
    'holiday_form_confirmation'
  ]));

INSERT INTO email_templates (
  name,
  subject,
  template_type,
  is_active,
  html_content,
  text_content
) VALUES (
  'Holiday Form Confirmation - Customer Receipt',
  'Your Holiday Lights Request Has Been Received - J&M Holiday Lights',
  'holiday_form_confirmation',
  true,
  E'<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">\n<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">\n<tr><td align="center" style="padding:30px 15px;">\n<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">\n\n<!-- Header with holiday branding -->\n<tr><td style="background:linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%);padding:36px 30px;text-align:center;">\n  <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lights" style="max-width:180px;height:auto;margin-bottom:16px;" width="180" />\n  <h1 style="color:#fbbf24;font-size:22px;margin:0 0 6px;font-weight:700;letter-spacing:0.5px;">We Received Your Holiday Lights Request!</h1>\n  <p style="color:#bbf7d0;font-size:14px;margin:0;">Making homes and businesses shine bright this season</p>\n</td></tr>\n\n<!-- Decorative accent bar -->\n<tr><td style="height:4px;background:linear-gradient(90deg,#dc2626,#fbbf24,#16a34a,#dc2626,#fbbf24,#16a34a);"></td></tr>\n\n<!-- Body -->\n<tr><td style="background-color:#ffffff;padding:32px 30px;">\n  <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">Hi {{CUSTOMER_NAME}},</p>\n  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for reaching out about our professional holiday lighting services! We are excited to help make your property the brightest on the block this season.</p>\n\n  <!-- Request details card -->\n  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:0 0 24px;">\n  <tr><td style="padding:20px;">\n    <p style="color:#991b1b;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">Your Request Details</p>\n    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;width:140px;">Name:</td><td style="padding:6px 0;color:#1e293b;">{{CUSTOMER_NAME}}</td></tr>\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Email:</td><td style="padding:6px 0;color:#1e293b;">{{CUSTOMER_EMAIL}}</td></tr>\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Phone:</td><td style="padding:6px 0;color:#1e293b;">{{CUSTOMER_PHONE}}</td></tr>\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Property:</td><td style="padding:6px 0;color:#1e293b;">{{PROPERTY_ADDRESS}}</td></tr>\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Type:</td><td style="padding:6px 0;color:#1e293b;">{{PROPERTY_TYPE}}</td></tr>\n      <tr><td style="padding:6px 0;color:#b91c1c;font-weight:600;">Selected Package:</td><td style="padding:6px 0;color:#1e293b;">{{PACKAGE_NAME}}</td></tr>\n    </table>\n  </td></tr>\n  </table>\n\n  <!-- What happens next -->\n  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:0 0 24px;">\n  <tr><td style="padding:20px;">\n    <p style="color:#166534;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px;">What Happens Next</p>\n    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;color:#334155;line-height:1.7;">\n      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">1.</td><td style="padding:4px 0;">We will schedule a quick on-site measurement of your property</td></tr>\n      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">2.</td><td style="padding:4px 0;">Our design team will create a custom lighting plan for your home</td></tr>\n      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">3.</td><td style="padding:4px 0;">You will receive a detailed estimate within 24-48 hours</td></tr>\n      <tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#16a34a;font-weight:700;font-size:16px;">4.</td><td style="padding:4px 0;">Once approved, our crew handles installation, maintenance, and takedown</td></tr>\n    </table>\n  </td></tr>\n  </table>\n\n  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 8px;">Have questions in the meantime? Just call or text us:</p>\n  <p style="margin:0 0 20px;"><a href="tel:4015950726" style="color:#dc2626;font-size:16px;font-weight:700;text-decoration:none;">(401) 595-0726</a></p>\n\n  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0;">We look forward to making your holidays extra bright!</p>\n</td></tr>\n\n<!-- Footer -->\n<tr><td style="background:linear-gradient(135deg,#14532d 0%,#166534 100%);padding:24px 30px;text-align:center;">\n  <p style="color:#fbbf24;font-size:14px;font-weight:700;margin:0 0 4px;">J&M Holiday Lights</p>\n  <p style="color:#bbf7d0;font-size:13px;margin:0 0 4px;">Professional Holiday Lighting | Installation | Maintenance | Takedown</p>\n  <p style="color:#86efac;font-size:13px;margin:0;">\n    <a href="tel:4015950726" style="color:#86efac;text-decoration:none;">(401) 595-0726</a> &nbsp;|&nbsp;\n    <a href="mailto:sales@powerwashjm.com" style="color:#86efac;text-decoration:none;">sales@powerwashjm.com</a>\n  </p>\n  <p style="color:#4ade80;font-size:12px;margin:10px 0 0;">\n    <a href="https://powerwashjm.com/holiday-lights" style="color:#4ade80;text-decoration:underline;">View Our Holiday Packages</a>\n  </p>\n</td></tr>\n\n</table>\n</td></tr>\n</table>\n</body>\n</html>',
  E'Hi {{CUSTOMER_NAME}},\n\nThank you for reaching out about our professional holiday lighting services! We are excited to help make your property the brightest on the block this season.\n\nYOUR REQUEST DETAILS\n--------------------\nName: {{CUSTOMER_NAME}}\nEmail: {{CUSTOMER_EMAIL}}\nPhone: {{CUSTOMER_PHONE}}\nProperty: {{PROPERTY_ADDRESS}}\nType: {{PROPERTY_TYPE}}\nSelected Package: {{PACKAGE_NAME}}\n\nWHAT HAPPENS NEXT\n-----------------\n1. We will schedule a quick on-site measurement of your property\n2. Our design team will create a custom lighting plan for your home\n3. You will receive a detailed estimate within 24-48 hours\n4. Once approved, our crew handles installation, maintenance, and takedown\n\nHave questions? Call or text us at (401) 595-0726\n\nWe look forward to making your holidays extra bright!\n\nJ&M Holiday Lights\nProfessional Holiday Lighting | Installation | Maintenance | Takedown\n(401) 595-0726 | sales@powerwashjm.com\nhttps://powerwashjm.com/holiday-lights'
)
ON CONFLICT DO NOTHING;
