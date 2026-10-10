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

    const { data: quote, error: quoteError } = await supabase
      .from('quote_submissions')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    const { data: mailjetApiKeyData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'mailjet_api_key')
      .maybeSingle();

    const { data: mailjetSecretData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'mailjet_secret_key')
      .maybeSingle();

    const mailjetApiKey = mailjetApiKeyData?.setting_value;
    const mailjetSecretKey = mailjetSecretData?.setting_value;

    if (!mailjetApiKey || !mailjetSecretKey) {
      throw new Error('Mailjet API credentials not configured');
    }

    const designData = quote.design_data || {};

    // IMPORTANT: If design_data has measurements but pricing_breakdown is outdated,
    // recalculate pricing from design_data to ensure email shows current totals
    let pricingBreakdown = quote.pricing_breakdown || null;

    // Check if we should recalculate from design_data (when measurements exist but might be newer than pricing_breakdown)
    if (designData.measurements && Array.isArray(designData.measurements) && designData.measurements.length > 0) {
      console.log('Recalculating pricing breakdown from design_data measurements');

      // Helper to calculate footage from measurements
      const calculateFootageFromMeasurements = (measurements: any[], type: string, photoId?: string) => {
        return measurements
          .filter(m => {
            const matchesType = m.type === type;
            const matchesPhoto = !photoId || m.metadata?.photoId === photoId;
            return matchesType && matchesPhoto;
          })
          .reduce((sum, m) => sum + (m.value || 0), 0);
      };

      // Calculate actual measurements in inches, then convert to feet
      const houseMeasurementsInches = calculateFootageFromMeasurements(designData.measurements, 'length', undefined);
      const houseMeasurementsFeet = houseMeasurementsInches / 12;

      const treeMeasurementsInches = calculateFootageFromMeasurements(designData.treeMeasurements || [], 'tree', undefined);
      const treeMeasurementsFeet = treeMeasurementsInches / 12;

      // Power cord measurements
      const powerCordMeasurements = designData.measurements.filter((m: any) => m.metadata?.isPowerCord === true);
      const powerCordInches = powerCordMeasurements.reduce((sum: number, m: any) => sum + (m.value || 0), 0);
      const powerCordFeet = powerCordInches / 12;

      // Manual inputs (in feet already)
      const manualPhoto1 = parseFloat(designData.manualInputPhoto1 || '0');
      const manualPhoto2 = parseFloat(designData.manualInputPhoto2 || '0');
      const manualInputFeet = manualPhoto1 + manualPhoto2;

      // Get pricing rates from design_data or use defaults
      const houseRate = parseFloat(designData.perFootCostHouse || '8.00');
      const treeRate = parseFloat(designData.perFootCostTree || '3.50');
      const powerCordRate = parseFloat(designData.perFootCostPowerCord || '5.00');
      const manualRate = houseRate; // Manual input uses house rate
      const discountPercent = parseFloat(designData.discount || '0');

      // Recalculate pricing breakdown
      pricingBreakdown = {
        house_measurements: {
          footage: houseMeasurementsFeet,
          rate: houseRate
        },
        trees: {
          footage: treeMeasurementsFeet,
          rate: treeRate
        },
        power_cord: {
          footage: powerCordFeet,
          rate: powerCordRate
        },
        manual_input: {
          footage: manualInputFeet,
          rate: manualRate
        },
        discount: discountPercent,
        grand_total: quote.total_price || 0
      };

      console.log('Recalculated pricing breakdown:', pricingBreakdown);
    }

    const clientDetails = [
      { label: 'Name', value: quote.name },
      { label: 'Business', value: quote.business_name },
      { label: 'Address', value: quote.address },
      { label: 'City/ZIP', value: `${quote.city || ''}${quote.city && quote.zip ? ', ' : ''}${quote.zip || ''}` },
      { label: 'Phone', value: quote.phone },
      { label: 'Email', value: quote.email },
    ].filter(item => item.value);

    const services = Array.isArray(quote.services) ? quote.services.join(', ') : 'N/A';
    const salesRep = quote.sales_rep || 'Not assigned';
    const projectNotes = designData.projectNarrative || quote.project_notes || '';

    const calculateGrandTotal = () => {
      if (!pricingBreakdown) return 0;
      const houseFeet = pricingBreakdown.house_measurements?.footage || 0;
      const treeFeet = pricingBreakdown.trees?.footage || 0;
      const powerCordFeet = pricingBreakdown.power_cord?.footage || 0;
      const manualInputFeet = pricingBreakdown.manual_input?.footage || 0;
      return houseFeet + treeFeet + powerCordFeet + manualInputFeet;
    };

    const calculateGrandTotalPlus10 = () => {
      return calculateGrandTotal() * 1.1;
    };

    const formatFootage = (feet: number) => {
      const wholeFeet = Math.floor(feet);
      const inches = Math.round((feet - wholeFeet) * 12);
      return inches > 0 ? `${wholeFeet}' ${inches}\"` : `${wholeFeet}'`;
    };

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
    }
    .email-container {
      max-width: 700px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .urgent-header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 25px;
      text-align: center;
    }
    .urgent-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .company-header {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      color: white;
      padding: 30px 25px;
      text-align: center;
    }
    .company-header h2 {
      margin: 0 0 5px 0;
      font-size: 32px;
      font-weight: bold;
    }
    .company-header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content-wrapper {
      padding: 30px 25px;
    }
    .section {
      margin-bottom: 30px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid #3b82f6;
    }
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    .section-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin: 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
    }
    .info-label {
      font-weight: 600;
      color: #64748b;
    }
    .info-value {
      color: #1e293b;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .highlight-box .amount {
      font-size: 36px;
      font-weight: bold;
      color: #92400e;
      margin: 10px 0;
    }
    .highlight-box .label {
      font-size: 14px;
      color: #78350f;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .quickmeasure-note {
      background: #dbeafe;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .quickmeasure-note h3 {
      margin: 0 0 15px 0;
      color: #1e40af;
      font-size: 18px;
    }
    .quickmeasure-note p {
      margin: 10px 0;
      color: #1e40af;
      font-size: 15px;
      line-height: 1.6;
    }
    .action-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .action-list li {
      padding: 10px 15px;
      margin: 8px 0;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #10b981;
      display: flex;
      align-items: center;
    }
    .action-list li:before {
      content: "\u2713";
      display: inline-block;
      width: 24px;
      height: 24px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .image-gallery {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .image-link {
      display: block;
      padding: 12px 15px;
      margin: 10px 0;
      background: white;
      color: #1e40af;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.2s;
      border: 1px solid #bfdbfe;
    }
    .image-link:hover {
      background: #1e40af;
      color: white;
      transform: translateX(5px);
    }
    .footer {
      background: #f1f5f9;
      padding: 25px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="urgent-header">
      <h1>&#x1F6A8; URGENT - Quote Marked as SOLD/WON &#x1F6A8;</h1>
    </div>

    <div class="company-header">
      <h2>&#x1F389; New Sale Confirmed!</h2>
      <p>J&M Power Washing Holiday Lights</p>
    </div>

    <div class="content-wrapper">

      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F464;</span>
          <h3 class="section-title">Client Information</h3>
        </div>
        <div class="info-grid">
          ${clientDetails.map(item => `
            <div class="info-label">${item.label}:</div>
            <div class="info-value">${item.value}</div>
          `).join('')}
          <div class="info-label">Sales Rep:</div>
          <div class="info-value">${salesRep}</div>
        </div>
      </div>

      ${services !== 'N/A' ? `
      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F6E0;&#xFE0F;</span>
          <h3 class="section-title">Services Requested</h3>
        </div>
        <div class="info-value">${services}</div>
      </div>
      ` : ''}

      ${projectNotes ? `
      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F4DD;</span>
          <h3 class="section-title">Sales Rep Notes</h3>
        </div>
        <div class="info-value" style="white-space: pre-wrap; font-style: italic; background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">${projectNotes}</div>
      </div>
      ` : ''}

      <div class="highlight-box">
        <div class="label">Total Investment</div>
        <div class="amount">$${parseFloat(quote.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      ${pricingBreakdown ? `
      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F4CF;</span>
          <h3 class="section-title">QuickMeasure Totals</h3>
        </div>
        <div class="info-grid">
          ${pricingBreakdown.house_measurements?.footage > 0 ? `
            <div class="info-label">Total for House/Property:</div>
            <div class="info-value">${formatFootage(pricingBreakdown.house_measurements.footage)}</div>
          ` : ''}
          ${pricingBreakdown.trees?.footage > 0 ? `
            <div class="info-label">Total for Trees:</div>
            <div class="info-value">${formatFootage(pricingBreakdown.trees.footage)}</div>
          ` : ''}
          ${pricingBreakdown.power_cord?.footage > 0 ? `
            <div class="info-label">Power Cord:</div>
            <div class="info-value">${formatFootage(pricingBreakdown.power_cord.footage)}</div>
          ` : ''}
          ${pricingBreakdown.manual_input?.footage > 0 ? `
            <div class="info-label">Manual Input:</div>
            <div class="info-value">${formatFootage(pricingBreakdown.manual_input.footage)}</div>
          ` : ''}
          <div class="info-label" style="font-weight: 700;">Grand Total:</div>
          <div class="info-value" style="font-weight: 700;">${formatFootage(calculateGrandTotal())}</div>
          <div class="info-label" style="font-weight: 700; color: #10b981;">Grand Total +10%:</div>
          <div class="info-value" style="font-weight: 700; color: #10b981;">${formatFootage(calculateGrandTotalPlus10())}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F4B0;</span>
          <h3 class="section-title">Quote Amount Details</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #1e40af; color: white;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Footage (+10%)</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Rate</th>
              <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${pricingBreakdown.house_measurements?.footage > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 500;">House</td>
              <td style="padding: 12px; text-align: right;">${formatFootage(pricingBreakdown.house_measurements.footage * 1.1)}</td>
              <td style="padding: 12px; text-align: right;">$${pricingBreakdown.house_measurements.rate.toFixed(2)}/ft</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">$${((pricingBreakdown.house_measurements.footage * 1.1) * pricingBreakdown.house_measurements.rate).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${pricingBreakdown.trees?.footage > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 500;">Trees</td>
              <td style="padding: 12px; text-align: right;">${formatFootage(pricingBreakdown.trees.footage * 1.1)}</td>
              <td style="padding: 12px; text-align: right;">$${pricingBreakdown.trees.rate.toFixed(2)}/ft</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">$${((pricingBreakdown.trees.footage * 1.1) * pricingBreakdown.trees.rate).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${pricingBreakdown.power_cord?.footage > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 500;">Power Cord</td>
              <td style="padding: 12px; text-align: right;">${formatFootage(pricingBreakdown.power_cord.footage * 1.1)}</td>
              <td style="padding: 12px; text-align: right;">$${pricingBreakdown.power_cord.rate.toFixed(2)}/ft</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">$${((pricingBreakdown.power_cord.footage * 1.1) * pricingBreakdown.power_cord.rate).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${pricingBreakdown.manual_input?.footage > 0 ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 500;">Manual Input</td>
              <td style="padding: 12px; text-align: right;">${formatFootage(pricingBreakdown.manual_input.footage * 1.1)}</td>
              <td style="padding: 12px; text-align: right;">$${pricingBreakdown.manual_input.rate.toFixed(2)}/ft</td>
              <td style="padding: 12px; text-align: right; font-weight: 600;">$${((pricingBreakdown.manual_input.footage * 1.1) * pricingBreakdown.manual_input.rate).toFixed(2)}</td>
            </tr>
            ` : ''}
            ${pricingBreakdown.discount > 0 ? `
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <td colspan="3" style="padding: 12px; font-weight: 500; color: #059669;">Discount (${pricingBreakdown.discount}%)</td>
              <td style="padding: 12px; text-align: right; font-weight: 600; color: #059669;">-$${(parseFloat(quote.total_price) / (1 - pricingBreakdown.discount / 100) * (pricingBreakdown.discount / 100)).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="background: #f3f4f6;">
              <td colspan="3" style="padding: 15px; font-weight: 700; font-size: 16px;">TOTAL</td>
              <td style="padding: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #1e40af;">$${parseFloat(quote.total_price).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : `
      <div class="quickmeasure-note">
        <h3>&#x1F4CA; Pricing Details</h3>
        <p><strong>Total price: $${parseFloat(quote.total_price || 0).toFixed(2)}</strong></p>
        <p>Pricing breakdown not available. Please view the QuickMeasure design images below for complete details.</p>
      </div>
      `}

      ${quote.design_image_url || quote.second_design_image_url ? `
      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F4F8;</span>
          <h3 class="section-title">QuickMeasure Design Images</h3>
        </div>
        <div class="image-gallery">
          <p style="margin-top: 0; color: #1e40af; font-weight: 600;">Click the links below to view measurement designs:</p>
          ${quote.design_image_url ? `<a href="${quote.design_image_url}" class="image-link" target="_blank">&#x1F4F7; Photo 1 (Front View)</a>` : ''}
          ${quote.second_design_image_url ? `<a href="${quote.second_design_image_url}" class="image-link" target="_blank">&#x1F4F7; Photo 2 (Side View)</a>` : ''}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x23F0;</span>
          <h3 class="section-title">Immediate Next Steps</h3>
        </div>
        <ul class="action-list">
          <li>Contact client immediately to confirm installation date</li>
          <li>Send invoice for deposit/full payment</li>
          <li>Schedule installation crew</li>
          <li>Prepare materials and equipment</li>
        </ul>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-icon">&#x1F4CB;</span>
          <h3 class="section-title">Submission Details</h3>
        </div>
        <div class="info-grid">
          <div class="info-label">Quote ID:</div>
          <div class="info-value">${quote.id}</div>
          <div class="info-label">Submitted:</div>
          <div class="info-value">${new Date(quote.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
          <div class="info-label">Status Changed:</div>
          <div class="info-value">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
        </div>
      </div>

    </div>

    <div class="footer">
      <p><strong>This is an automated notification from J&M Power Washing</strong></p>
      <p>Please respond promptly to secure this sale!</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const plainTextBody = `
🚨 URGENT - QUOTE MARKED AS SOLD/WON 🚨

🎉 NEW SALE CONFIRMED!
J&M Power Washing Holiday Lights

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CLIENT INFORMATION:
${clientDetails.map(item => `${item.label}: ${item.value}`).join('\n')}
Sales Rep: ${salesRep}

${services !== 'N/A' ? `🛠️ SERVICES REQUESTED:\n${services}\n\n` : ''}
${projectNotes ? `📝 SALES REP NOTES:\n${projectNotes}\n\n` : ''}
💰 TOTAL INVESTMENT: $${parseFloat(quote.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pricingBreakdown ? `📏 QUICKMEASURE TOTALS:
${pricingBreakdown.house_measurements?.footage > 0 ? `Total for House/Property: ${formatFootage(pricingBreakdown.house_measurements.footage)}` : ''}${pricingBreakdown.house_measurements?.footage > 0 && (pricingBreakdown.trees?.footage > 0 || pricingBreakdown.power_cord?.footage > 0 || pricingBreakdown.manual_input?.footage > 0) ? '\n' : ''}${pricingBreakdown.trees?.footage > 0 ? `Total for Trees: ${formatFootage(pricingBreakdown.trees.footage)}` : ''}${pricingBreakdown.trees?.footage > 0 && (pricingBreakdown.power_cord?.footage > 0 || pricingBreakdown.manual_input?.footage > 0) ? '\n' : ''}${pricingBreakdown.power_cord?.footage > 0 ? `Power Cord: ${formatFootage(pricingBreakdown.power_cord.footage)}` : ''}${pricingBreakdown.power_cord?.footage > 0 && pricingBreakdown.manual_input?.footage > 0 ? '\n' : ''}${pricingBreakdown.manual_input?.footage > 0 ? `Manual Input: ${formatFootage(pricingBreakdown.manual_input.footage)}` : ''}
Grand Total: ${formatFootage(calculateGrandTotal())}
Grand Total +10%: ${formatFootage(calculateGrandTotalPlus10())}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 QUOTE AMOUNT DETAILS:
${pricingBreakdown.house_measurements?.footage > 0 ? `House: ${formatFootage(pricingBreakdown.house_measurements.footage * 1.1)} × $${pricingBreakdown.house_measurements.rate.toFixed(2)}/ft
$${((pricingBreakdown.house_measurements.footage * 1.1) * pricingBreakdown.house_measurements.rate).toFixed(2)}` : ''}${pricingBreakdown.house_measurements?.footage > 0 && (pricingBreakdown.trees?.footage > 0 || pricingBreakdown.power_cord?.footage > 0 || pricingBreakdown.manual_input?.footage > 0) ? '\n' : ''}${pricingBreakdown.trees?.footage > 0 ? `Trees: ${formatFootage(pricingBreakdown.trees.footage * 1.1)} × $${pricingBreakdown.trees.rate.toFixed(2)}/ft
$${((pricingBreakdown.trees.footage * 1.1) * pricingBreakdown.trees.rate).toFixed(2)}` : ''}${pricingBreakdown.trees?.footage > 0 && (pricingBreakdown.power_cord?.footage > 0 || pricingBreakdown.manual_input?.footage > 0) ? '\n' : ''}${pricingBreakdown.power_cord?.footage > 0 ? `Power Cord: ${formatFootage(pricingBreakdown.power_cord.footage * 1.1)} × $${pricingBreakdown.power_cord.rate.toFixed(2)}/ft
$${((pricingBreakdown.power_cord.footage * 1.1) * pricingBreakdown.power_cord.rate).toFixed(2)}` : ''}${pricingBreakdown.power_cord?.footage > 0 && pricingBreakdown.manual_input?.footage > 0 ? '\n' : ''}${pricingBreakdown.manual_input?.footage > 0 ? `Manual Input: ${formatFootage(pricingBreakdown.manual_input.footage * 1.1)} × $${pricingBreakdown.manual_input.rate.toFixed(2)}/ft
$${((pricingBreakdown.manual_input.footage * 1.1) * pricingBreakdown.manual_input.rate).toFixed(2)}` : ''}${pricingBreakdown.discount > 0 ? `\nDiscount (${pricingBreakdown.discount}%): -$${(parseFloat(quote.total_price) / (1 - pricingBreakdown.discount / 100) * (pricingBreakdown.discount / 100)).toFixed(2)}` : ''}
──────────────────────────────
TOTAL: $${parseFloat(quote.total_price).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : `📊 PRICING DETAILS:
Total price: $${parseFloat(quote.total_price || 0).toFixed(2)}
Pricing breakdown not available. Please view the QuickMeasure design images below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}

${quote.design_image_url || quote.second_design_image_url ? `📸 QUICKMEASURE DESIGN IMAGES:\n${quote.design_image_url ? `📷 Photo 1: ${quote.design_image_url}\n` : ''}${quote.second_design_image_url ? `📷 Photo 2: ${quote.second_design_image_url}\n` : ''}\n` : ''}

⏰ IMMEDIATE NEXT STEPS:
✓ Contact client immediately to confirm installation date
✓ Send invoice for deposit/full payment
✓ Schedule installation crew
✓ Prepare materials and equipment

📋 SUBMISSION DETAILS:
Quote ID: ${quote.id}
Submitted: ${new Date(quote.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
Status Changed: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from J&M Power Washing.
Please respond promptly to secure this sale!
    `.trim();

    const subjectLine = `🚨 SALE CONFIRMED: ${quote.name} - $${parseFloat(quote.total_price || 0).toLocaleString()} - ${quote.address || 'New Customer'}`;

    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: 'notifications@powerwashjm.com',
            Name: 'J&M Power Washing System'
          },
          To: [
            {
              Email: 'jmpowerwashing@yahoo.com',
              Name: 'J&M Power Washing Office'
            },
            {
              Email: 'ChrisMasse30@gmail.com',
              Name: 'Chris Masse'
            },
            {
              Email: 'sales@powerwashjm.com',
              Name: 'J&M Sales'
            }
          ],
          ReplyTo: {
            Email: 'sales@powerwashjm.com',
            Name: 'J&M Sales Team'
          },
          Subject: subjectLine,
          TextPart: plainTextBody,
          HTMLPart: emailBody
        }
      ]
    };

    const authString = btoa(`${mailjetApiKey}:${mailjetSecretKey}`);

    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mailjetPayload)
    });

    if (!mailjetResponse.ok) {
      const errorText = await mailjetResponse.text();
      throw new Error(`Mailjet API error: ${errorText}`);
    }

    const mailjetResult = await mailjetResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Urgent sold quote notification sent successfully via Mailjet',
        mailjetResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending sold quote notification:', error);
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