import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, RefreshCw, X } from 'lucide-react';
import { getAllTemplates, updateTemplate, type EmailTemplate } from '../services/emailTemplateService';

export default function EmailTemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState<'commercial' | 'residential' | 'estimate_followup' | 'form_confirmation' | 'instant_quote_confirmation' | 'holiday_form_confirmation'>('commercial');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editedCommercialTemplate, setEditedCommercialTemplate] = useState<string>('');
  const [editedResidentialTemplate, setEditedResidentialTemplate] = useState<string>('');
  const [editedFollowUpTemplate, setEditedFollowUpTemplate] = useState<string>('');
  const [editedFormConfirmationTemplate, setEditedFormConfirmationTemplate] = useState<string>('');
  const [editedInstantQuoteTemplate, setEditedInstantQuoteTemplate] = useState<string>('');
  const [editedHolidayFormTemplate, setEditedHolidayFormTemplate] = useState<string>('');

  // Commercial Email Template
  const commercialTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f8f9fa; }
    .container { max-width: 650px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-logo { max-width: 200px; height: auto; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .footer-logo { max-width: 180px; height: auto; margin: 20px 0 10px 0; }
    .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1e3a8a; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section-title { color: #1e3a8a; font-size: 20px; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #3b82f6; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .price-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0; }
    .price-box .amount { font-size: 36px; font-weight: 700; margin: 10px 0; }
    .price-box .label { font-size: 16px; opacity: 0.95; }
    .benefits { list-style: none; padding: 0; }
    .benefits li { padding: 12px 0; padding-left: 30px; position: relative; }
    .benefits li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }
    .pricing-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .pricing-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .cta-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://powerwashjm.com/holiday-lights/" target="_blank" rel="noopener noreferrer" style="display: inline-block;">
        <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lighting" class="header-logo" />
      </a>
      <h1>Your Holiday Lighting Estimate</h1>
      <p>[Business Name] – Attract Customers This Season</p>
    </div>

    <div class="content">
      <p class="greeting">Dear [Client Name],</p>
      <p>Thank you for requesting a holiday lighting design quote for your business. We're excited to help you create a stunning display that will attract customers and spread holiday cheer throughout the season!</p>

      <div class="price-box">
        <div class="label">Estimated Investment Amount</div>
        <div class="amount">$[Total Quote]</div>
      </div>

      <div class="section">
        <h2 class="section-title">🎄 The J&M Power Washing Advantage</h2>
        <ul class="benefits">
          <li><strong>Professional Design & Installation</strong> – Our experienced team creates custom displays tailored to your business</li>
          <li><strong>Premium Quality Lights</strong> – Commercial-grade LED lights built to last and impress</li>
          <li><strong>Full-Service Experience</strong> – From design to installation to takedown, we handle everything</li>
          <li><strong>Licensed & Insured</strong> – Your business is protected with our comprehensive coverage</li>
          <li><strong>Flexible Scheduling</strong> – Installation and removal on your timeline</li>
          <li><strong>Seasonal Storage</strong> – We store your lights safely until next year</li>
        </ul>
      </div>

      <div class="section">
        <h2 class="section-title">💰 Investment Details</h2>
        <div class="pricing-details">
          <p style="margin-bottom: 15px; color: #374151;">Your custom holiday lighting package includes:</p>
          <div class="pricing-row">
            <span style="font-weight: 600;">Design Consultation</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Professional Installation</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Premium LED Lights</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Seasonal Maintenance</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Professional Takedown</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Off-Season Storage</span>
            <span>Included</span>
          </div>
          <div class="pricing-row" style="border-bottom: none; margin-top: 15px; font-size: 18px; color: #1e3a8a;">
            <span style="font-weight: 700;">Total Investment</span>
            <span style="font-weight: 700;">$[Total Quote]</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">💳 We Offer Financing</h2>
        <div class="highlight-box">
          <p style="font-size: 16px; margin-bottom: 15px;">Make your holiday lighting more affordable with our flexible financing options!</p>
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Based on your estimate of <strong style="color: #1e3a8a;">$[Total Quote]</strong> (rounded to <strong style="color: #1e3a8a;">$[Rounded Amount]</strong>):</p>
            <p style="font-size: 20px; color: #059669; font-weight: 600; margin: 10px 0;">Estimated Monthly Payment: $[Monthly Payment]</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Based on a 12-month term</p>
          </div>
          <p style="margin-top: 15px;"><a href="https://powerwashjm.com/financing/" style="color: #1e3a8a; font-weight: 600; text-decoration: none;">Learn more about financing options and use our calculator →</a></p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">✅ Next Steps: Review & Enhancement</h2>
        <div class="highlight-box">
          <p style="margin-bottom: 15px;"><strong>We'd love to discuss your quote and answer any questions!</strong></p>
          <p style="margin-bottom: 10px;">During our consultation, we can:</p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Review each element of your custom design</li>
            <li style="margin: 8px 0;">Discuss enhancement options to make your display even more spectacular</li>
            <li style="margin: 8px 0;">Finalize your installation timeline</li>
            <li style="margin: 8px 0;">Answer any questions about our services</li>
            <li style="margin: 8px 0;">Lock in your preferred installation date</li>
          </ul>
          <p style="margin-top: 15px; color: #6b7280; font-size: 14px;"><em>Popular dates fill up quickly - contact us today to secure your spot!</em></p>
        </div>
      </div>

      <div class="cta-box">
        <p><strong>Ready to Make This Your Brightest Holiday Season?</strong></p>
        <p style="margin-top: 20px;">📞 Call us at <a href="tel:+14015950726" style="color: #1e3a8a; text-decoration: none; font-weight: bold;">(401) 595-0726</a> or reply to this email.</p>
      </div>
    </div>

    <!-- Email Footer (Comprehensive Version) -->
    <div style="background: #1e3a8a; color: #cbd5e1; padding: 40px 30px; font-size: 14px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Column 1: Logo and Social -->
          <td style="width: 33%; vertical-align: top; padding: 10px; text-align: left;">
            <a href="https://powerwashjm.com/" target="_blank" rel="noopener noreferrer">
              <img src="https://powerwashjm.com/logos/logo.png" alt="J&M Power Washing" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
            </a>
            <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">Professional pressure washing and exterior cleaning services you can trust.</p>
            <div>
              <a href="https://www.facebook.com/profile.php?id=100064067522225" target="_blank" rel="noopener noreferrer" style="text-decoration: none; margin-right: 10px; display: inline-block;">
                <img src="https://img.icons8.com/fluency/48/facebook-new.png" alt="Facebook" width="32" height="32" style="border-radius: 5px; background: white; padding: 2px; display: inline-block;" />
              </a>
              <a href="https://www.instagram.com/jmpowerwashing/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                <img src="https://img.icons8.com/fluency/48/instagram-new.png" alt="Instagram" width="32" height="32" style="border-radius: 5px; display: inline-block;" />
              </a>
            </div>
          </td>
          <!-- Column 2: Services -->
          <td style="width: 33%; vertical-align: top; padding: 10px; padding-left: 20px; text-align: left;">
            <h4 style="color: white; margin-top: 0; margin-bottom: 15px; font-weight: 600; font-size: 16px;">Services</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/house-washing/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">House Washing</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/roof-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Roof Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/deck-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Deck Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/gutter-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Gutter Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/concrete-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Concrete Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/holiday-lights/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Holiday Lights Installation</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/commercial/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Commercial Services</a></li>
            </ul>
          </td>
          <!-- Column 3: Contact -->
          <td style="width: 33%; vertical-align: top; padding: 10px; padding-left: 20px; text-align: left;">
            <h4 style="color: white; margin-top: 0; margin-bottom: 15px; font-weight: 600; font-size: 16px;">Let's Connect</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/phone.png" alt="Call" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Call us:</span>
                  <a href="tel:+14015950726" style="color: #cbd5e1; text-decoration: none;">(401) 595-0726</a>
                </div>
              </li>
              <li style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/new-post.png" alt="Email" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Email:</span>
                  <a href="mailto:sales@powerwashjm.com" style="color: #cbd5e1; text-decoration: none;">Sales@powerwashjm.com</a>
                </div>
              </li>
              <li style="display: flex; align-items: center;">
                <img src="https://img.icons8.com/fluency/48/map-marker.png" alt="Area" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Service Area:</span>
                  <span style="color: #cbd5e1;">Rhode Island & Massachusetts</span>
                </div>
              </li>
            </ul>
          </td>
        </tr>
      </table>
      <!-- Footer Bottom -->
      <div style="text-align: center; padding-top: 30px; margin-top: 30px; border-top: 1px solid #334155; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">© 2025 J & M Power Washing. All rights reserved. | Professional Pressure Washing Services</p>
        <p style="margin: 10px 0;">
          <a href="https://powerwashjm.com/about_us" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">About Us</a> |
          <a href="https://powerwashjm.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Privacy Policy</a>
        </p>
        <p style="margin: 10px 0 0 0; color: #94a3b8; font-weight: 600;">Licensed & Insured | 100% Satisfaction Guarantee</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Residential Email Template
  const residentialTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8; color: #2c3e50; background-color: #f8f9fa; }
    .container { max-width: 650px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .footer-logo { max-width: 180px; height: auto; margin: 20px 0 10px 0; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #dc2626; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section-title { color: #dc2626; font-size: 20px; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #ef4444; }
    .highlight-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .price-box { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; }
    .price-box .amount { font-size: 42px; font-weight: 700; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://powerwashjm.com/holiday-lights/" target="_blank" rel="noopener noreferrer" style="display: inline-block;">
        <img src="https://powerwashjm.com/logos/holidaylogo.png" alt="J&M Holiday Lighting" class="header-logo" />
      </a>
      <h1>Your Custom Holiday Lighting Design</h1>
      <p>For the [Last Name] Home</p>
    </div>

    <div class="content">
      <p class="greeting">Dear [First Name],</p>
      <p>Thank you for allowing J&M Power Washing the opportunity to design a beautiful, custom holiday display for your home. We're thrilled to help make your home the most festive on the block this holiday season!</p>

      <div class="price-box">
        <div class="label">Estimated Total Investment Amount</div>
        <div class="amount">$[Total Quote]</div>
      </div>

      <div class="section">
        <h2 class="section-title">🎄 The J&M Power Washing Advantage</h2>
        <ul class="benefits">
          <li><strong>Custom Design Service</strong> – Every home gets a unique display designed just for you</li>
          <li><strong>Premium LED Lighting</strong> – Energy-efficient, brilliant lights that last for years</li>
          <li><strong>Stress-Free Experience</strong> – We handle everything from start to finish</li>
          <li><strong>Professional Installation</strong> – Safe, secure mounting by trained experts</li>
          <li><strong>Maintenance Included</strong> – We'll fix any issues throughout the season</li>
          <li><strong>Full Takedown & Storage</strong> – Carefully removed and stored until next year</li>
        </ul>
      </div>

      <div class="section">
        <h2 class="section-title">💰 Investment Details</h2>
        <div class="pricing-details">
          <p style="margin-bottom: 15px; color: #374151;">Your custom holiday lighting package includes:</p>
          <div class="pricing-row">
            <span style="font-weight: 600;">Personal Design Consultation</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Professional Installation</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Premium LED Lights</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Season-Long Maintenance</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Professional Takedown</span>
            <span>Included</span>
          </div>
          <div class="pricing-row">
            <span style="font-weight: 600;">Climate-Controlled Storage</span>
            <span>Included</span>
          </div>
          <div class="pricing-row" style="border-bottom: none; margin-top: 15px; font-size: 18px; color: #dc2626;">
            <span style="font-weight: 700;">Total Investment</span>
            <span style="font-weight: 700;">$[Total Quote]</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title"><span>💳</span> We Offer Financing</h2>
        <div class="highlight-box">
          <p style="font-size: 16px; margin-bottom: 15px;">Make your holiday lighting more affordable with our flexible financing options!</p>
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Based on your estimate of <strong style="color: #dc2626;">$[Total Quote]</strong> (rounded to <strong style="color: #dc2626;">$[Rounded Amount]</strong>):</p>
            <p style="font-size: 20px; color: #059669; font-weight: 600; margin: 10px 0;">Estimated Monthly Payment: $[Monthly Payment]</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Based on a 12-month term</p>
          </div>
          <p style="margin-top: 15px;"><a href="https://powerwashjm.com/financing/" style="color: #dc2626; font-weight: 600; text-decoration: none;">Learn more about financing options and use our calculator →</a></p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">✅ Next Steps: Review & Enhancement</h2>
        <div class="highlight-box">
          <p style="margin-bottom: 15px;"><strong>Let's finalize your perfect holiday display!</strong></p>
          <p style="margin-bottom: 10px;">When we connect, we can:</p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li style="margin: 8px 0;">Walk through your custom design in detail</li>
            <li style="margin: 8px 0;">Explore additional features to enhance your display</li>
            <li style="margin: 8px 0;">Schedule your preferred installation date</li>
            <li style="margin: 8px 0;">Answer all your questions about the process</li>
            <li style="margin: 8px 0;">Discuss payment and financing options</li>
          </ul>
          <p style="margin-top: 15px; color: #6b7280; font-size: 14px;"><em>Installation slots are limited - reserve your date today!</em></p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Ready to transform your home this holiday season?</p>
        <p style="font-size: 18px; color: #dc2626; font-weight: 600;">📞 <a href="tel:+14015950726" style="color: #dc2626; text-decoration: none;">(401) 595-0726</a></p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">Or simply reply to this email</p>
      </div>
    </div>

    <!-- Email Footer (Comprehensive Version) -->
    <div style="background: #1e3a8a; color: #cbd5e1; padding: 40px 30px; font-size: 14px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Column 1: Logo and Social -->
          <td style="width: 33%; vertical-align: top; padding: 10px; text-align: left;">
            <a href="https://powerwashjm.com/" target="_blank" rel="noopener noreferrer">
              <img src="https://powerwashjm.com/logos/logo.png" alt="J&M Power Washing" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
            </a>
            <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">Professional pressure washing and exterior cleaning services you can trust.</p>
            <div>
              <a href="https://www.facebook.com/profile.php?id=100064067522225" target="_blank" rel="noopener noreferrer" style="text-decoration: none; margin-right: 10px; display: inline-block;">
                <img src="https://img.icons8.com/fluency/48/facebook-new.png" alt="Facebook" width="32" height="32" style="border-radius: 5px; background: white; padding: 2px; display: inline-block;" />
              </a>
              <a href="https://www.instagram.com/jmpowerwashing/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                <img src="https://img.icons8.com/fluency/48/instagram-new.png" alt="Instagram" width="32" height="32" style="border-radius: 5px; display: inline-block;" />
              </a>
            </div>
          </td>
          <!-- Column 2: Services -->
          <td style="width: 33%; vertical-align: top; padding: 10px; padding-left: 20px; text-align: left;">
            <h4 style="color: white; margin-top: 0; margin-bottom: 15px; font-weight: 600; font-size: 16px;">Services</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/house-washing/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">House Washing</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/roof-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Roof Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/deck-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Deck Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/gutter-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Gutter Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/concrete-cleaning/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Concrete Cleaning</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/holiday-lights/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Holiday Lights Installation</a></li>
              <li style="margin-bottom: 10px;"><a href="https://powerwashjm.com/commercial/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Commercial Services</a></li>
            </ul>
          </td>
          <!-- Column 3: Contact -->
          <td style="width: 33%; vertical-align: top; padding: 10px; padding-left: 20px; text-align: left;">
            <h4 style="color: white; margin-top: 0; margin-bottom: 15px; font-weight: 600; font-size: 16px;">Let's Connect</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/phone.png" alt="Call" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Call us:</span>
                  <a href="tel:+14015950726" style="color: #cbd5e1; text-decoration: none;">(401) 595-0726</a>
                </div>
              </li>
              <li style="display: flex; align-items: center; margin-bottom: 15px;">
                <img src="https://img.icons8.com/fluency/48/new-post.png" alt="Email" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Email:</span>
                  <a href="mailto:sales@powerwashjm.com" style="color: #cbd5e1; text-decoration: none;">Sales@powerwashjm.com</a>
                </div>
              </li>
              <li style="display: flex; align-items: center;">
                <img src="https://img.icons8.com/fluency/48/map-marker.png" alt="Area" width="24" height="24" style="margin-right: 10px; display: block;" />
                <div>
                  <span style="display: block; color: #94a3b8; font-size: 12px;">Service Area:</span>
                  <span style="color: #cbd5e1;">Rhode Island & Massachusetts</span>
                </div>
              </li>
            </ul>
          </td>
        </tr>
      </table>
      <!-- Footer Bottom -->
      <div style="text-align: center; padding-top: 30px; margin-top: 30px; border-top: 1px solid #334155; font-size: 12px;">
        <p style="margin: 0 0 10px 0;">© 2025 J & M Power Washing. All rights reserved. | Professional Pressure Washing Services</p>
        <p style="margin: 10px 0;">
          <a href="https://powerwashjm.com/about_us" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">About Us</a> |
          <a href="https://powerwashjm.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style="color: #cbd5e1; text-decoration: none;">Privacy Policy</a>
        </p>
        <p style="margin: 10px 0 0 0; color: #94a3b8; font-weight: 600;">Licensed & Insured | 100% Satisfaction Guarantee</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Load templates from database on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTemplates();
      setTemplates(data);

      // Set edited templates from database
      const commercial = data.find(t => t.template_type === 'commercial' && t.is_active);
      const residential = data.find(t => t.template_type === 'residential' && t.is_active);
      const followUp = data.find(t => t.template_type === 'estimate_followup' && t.is_active);
      const formConfirmation = data.find(t => t.template_type === 'form_confirmation' && t.is_active);
      const instantQuote = data.find(t => t.template_type === 'instant_quote_confirmation' && t.is_active);

      if (commercial) setEditedCommercialTemplate(commercial.html_content);
      if (residential) setEditedResidentialTemplate(residential.html_content);
      if (followUp) setEditedFollowUpTemplate(followUp.html_content);
      if (formConfirmation) setEditedFormConfirmationTemplate(formConfirmation.html_content);
      if (instantQuote) setEditedInstantQuoteTemplate(instantQuote.html_content);

      const holidayForm = data.find(t => t.template_type === 'holiday_form_confirmation' && t.is_active);
      if (holidayForm) setEditedHolidayFormTemplate(holidayForm.html_content);
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Failed to load templates from database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const templateToSave = activeTemplate === 'commercial'
        ? editedCommercialTemplate
        : activeTemplate === 'residential'
        ? editedResidentialTemplate
        : activeTemplate === 'estimate_followup'
        ? editedFollowUpTemplate
        : activeTemplate === 'form_confirmation'
        ? editedFormConfirmationTemplate
        : activeTemplate === 'instant_quote_confirmation'
        ? editedInstantQuoteTemplate
        : editedHolidayFormTemplate;
      const templateName = activeTemplate === 'commercial'
        ? 'commercial_v1'
        : activeTemplate === 'residential'
        ? 'residential_v1'
        : activeTemplate === 'estimate_followup'
        ? 'Estimate Follow-Up Email'
        : activeTemplate === 'form_confirmation'
        ? 'Form Confirmation - Customer Receipt'
        : activeTemplate === 'instant_quote_confirmation'
        ? 'Instant Quote Confirmation - Thank You'
        : 'Holiday Form Confirmation - Customer Receipt';

      const result = await updateTemplate(templateName, templateToSave);

      if (result.success) {
        alert('Template saved successfully! Changes will take effect immediately in QuickMeasure.');
        await loadTemplates(); // Reload to confirm
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const currentTemplate = activeTemplate === 'commercial'
    ? (editedCommercialTemplate || commercialTemplate)
    : activeTemplate === 'residential'
    ? (editedResidentialTemplate || residentialTemplate)
    : activeTemplate === 'estimate_followup'
    ? editedFollowUpTemplate
    : activeTemplate === 'form_confirmation'
    ? editedFormConfirmationTemplate
    : activeTemplate === 'instant_quote_confirmation'
    ? editedInstantQuoteTemplate
    : editedHolidayFormTemplate;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-6">
          <Link
            to="/employee-dashboard/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
            <p className="text-gray-600">QuickMeasure Customer Estimates</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Template Type</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTemplate('commercial')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'commercial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Commercial / Business
              </button>
              <button
                onClick={() => setActiveTemplate('residential')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'residential'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Residential / Homeowner
              </button>
              <button
                onClick={() => setActiveTemplate('estimate_followup')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'estimate_followup'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Estimate Follow-Up
              </button>
              <button
                onClick={() => setActiveTemplate('form_confirmation')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'form_confirmation'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Form Confirmation
              </button>
              <button
                onClick={() => setActiveTemplate('instant_quote_confirmation')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'instant_quote_confirmation'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Instant Quote
              </button>
              <button
                onClick={() => setActiveTemplate('holiday_form_confirmation')}
                className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeTemplate === 'holiday_form_confirmation'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Holiday Form Confirmation
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTemplate === 'commercial' ? 'Commercial' : activeTemplate === 'residential' ? 'Residential' : activeTemplate === 'estimate_followup' ? 'Estimate Follow-Up' : activeTemplate === 'form_confirmation' ? 'Form Confirmation' : activeTemplate === 'instant_quote_confirmation' ? 'Instant Quote Confirmation' : 'Holiday Form Confirmation'} Email Template
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={loadTemplates}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Reload
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Database-Backed Templates:</strong> Templates are now stored in the database and loaded dynamically.
                Any changes you make here will immediately affect emails sent from QuickMeasure.
                {templates.length > 0 && (
                  <span className="block mt-2">
                    Last updated: {new Date(
                      templates.find(t => t.template_type === activeTemplate)?.updated_at || ''
                    ).toLocaleString()}
                  </span>
                )}
              </p>
            </div>

            {showPreview ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-5xl max-h-[90vh] flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Email Template Preview - {activeTemplate === 'commercial' ? 'Commercial' : activeTemplate === 'residential' ? 'Residential' : activeTemplate === 'estimate_followup' ? 'Estimate Follow-Up' : activeTemplate === 'form_confirmation' ? 'Form Confirmation' : activeTemplate === 'instant_quote_confirmation' ? 'Instant Quote Confirmation' : 'Holiday Form Confirmation'}
                    </h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="bg-white rounded-lg shadow-md">
                      <div dangerouslySetInnerHTML={{ __html: currentTemplate }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!showPreview && (
              <div className="border border-gray-200 rounded-lg bg-gray-50">
                <pre className="p-4 overflow-auto max-h-[600px] text-xs">
                  <code>{currentTemplate}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Template Variables (Use double braces)</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {activeTemplate === 'holiday_form_confirmation' ? (
                <>
                  <p className="font-semibold text-emerald-800 mb-2">Holiday Form Confirmation Variables:</p>
                  <p>{'{{CUSTOMER_NAME}}'} - Customer's full name</p>
                  <p>{'{{CUSTOMER_EMAIL}}'} - Customer's email address</p>
                  <p>{'{{CUSTOMER_PHONE}}'} - Customer's phone number</p>
                  <p>{'{{PROPERTY_ADDRESS}}'} - Full property address</p>
                  <p>{'{{PROPERTY_TYPE}}'} - Residential or Commercial</p>
                  <p>{'{{PACKAGE_NAME}}'} - Selected holiday lights package (e.g. Tinsel, Garland, Gingerbread)</p>
                </>
              ) : activeTemplate === 'instant_quote_confirmation' ? (
                <>
                  <p className="font-semibold text-amber-800 mb-2">Instant Quote Confirmation Variables:</p>
                  <p>• <code className="bg-blue-100 px-1 rounded">{'{{CUSTOMER_NAME}}'}</code> - Customer's full name</p>
                  <p>• <code className="bg-blue-100 px-1 rounded">{'{{CUSTOMER_EMAIL}}'}</code> - Customer's email address</p>
                  <p>• <code className="bg-blue-100 px-1 rounded">{'{{CUSTOMER_PHONE}}'}</code> - Customer's phone number</p>
                  <p>• <code className="bg-blue-100 px-1 rounded">{'{{ESTIMATE_RANGE}}'}</code> - Estimated price range</p>
                </>
              ) : (
                <>
                  <p>• <code className="bg-blue-100 px-1 rounded">{'{{CLIENT_NAME}}'}</code> - Customer's full name</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{FIRST_NAME}}'}</code> - Customer's first name (residential)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{LAST_NAME}}'}</code> - Customer's last name (residential)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{BUSINESS_NAME}}'}</code> - Business name (commercial)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{TOTAL_QUOTE}}'}</code> - Total estimate amount (formatted)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{ROUNDED_AMOUNT}}'}</code> - Quote rounded to nearest $100</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{MONTHLY_PAYMENT}}'}</code> - Calculated monthly payment (12-month term)</p>
              <p className="mt-2 font-semibold text-green-800">📸 Photo Variables:</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_1_URL}}'}</code> - Design photo 1 URL (auto-populated)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_2_URL}}'}</code> - Design photo 2 URL (auto-populated)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_SECTION_START}}'}</code> - Start of conditional photo section</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_1_SECTION}}'}</code> - Photo 1 HTML (auto-generated)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_2_SECTION}}'}</code> - Photo 2 HTML (auto-generated)</p>
              <p>• <code className="bg-blue-100 px-1 rounded">{'{{PHOTO_SECTION_END}}'}</code> - End of conditional photo section</p>
                </>
              )}
              <p className="mt-3 font-semibold">Contact: (401) 595-0726 | Financing: https://powerwashjm.com/financing</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
