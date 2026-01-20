import { getUncachableResendClient } from './resend';
import { formatQuoteForDisplay, calculateQuoteRange } from '../shared/utils';
import { SERVICE_FIELD_CONFIGS } from '../shared/serviceFieldConfig';
import { SERVICE_PRICING_CONFIG } from './services/pricing';

const SITE_BASE_URL = 'https://lawncarekuna.com';
const EMAIL_ASSET_BASE_URL = `${SITE_BASE_URL}/email`;
// NOTE: `lawn-care-kuna-logo.png` is the light-on-dark logo used in headers.
// We do not currently have a separate dark-on-light full logo in-repo, so we use the icon
// for light backgrounds (footer) as a branded fallback.
const EMAIL_LOGO_LIGHT_URL = `${EMAIL_ASSET_BASE_URL}/lawn-care-kuna-logo.png`;
const EMAIL_LOGO_DARK_URL = `${EMAIL_ASSET_BASE_URL}/lawn-care-kuna-icon.png`;

interface LineItem {
  service: string;
  serviceId: string;
  description: string;
  price: number;
  basePrice: number;
  calculationExplanation?: string;
}

function formatRateDisplay(serviceId: string): string {
  // Model-based display for tiered/minimum services
  if (serviceId === 'sprinkler-blowout') {
    return '$65 up to 6 zones + $5/extra zone';
  }
  if (serviceId === 'lawn-mowing') {
    return '$0.003/sq ft';
  }

  const config = SERVICE_PRICING_CONFIG[serviceId as keyof typeof SERVICE_PRICING_CONFIG];
  if (!config) return '';
  
  const unitLabels: Record<string, string> = {
    'sqft': 'sq ft',
    'linear_ft': 'linear ft',
    'per_zone': 'zone',
    'per_tree': 'tree',
    'per_fixture': 'fixture',
    'per_stump': 'stump',
    'per_sqft': 'sq ft',
    'base_service': 'base',
    'base_project': 'project',
  };
  
  const unitLabel = unitLabels[config.unit] || config.unit;
  const rateStr = config.rate < 1 ? `$${config.rate}` : `$${config.rate.toFixed(2)}`;
  
  return `${rateStr}/${unitLabel}`;
}

interface QuoteEmailData {
  quoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  city: string;
  propertySize?: number;
  propertyType?: string;
  serviceType: string;
  frequency?: string;
  selectedServices?: string[];
  finalQuote?: number;
  finalQuoteMin?: number;
  finalQuoteMax?: number;
  preferredDate?: string;
  lineItems?: LineItem[];
  serviceData?: any;
}

const emailStyles = `
  body { 
    margin: 0; 
    padding: 0; 
    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
    background-color: #f5f5f5;
    line-height: 1.6;
  }
  .email-wrapper { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff;
  }
  .header { 
    background: linear-gradient(135deg, #166534 0%, #15803d 100%); 
    color: #ffffff; 
    padding: 40px 30px; 
    text-align: center;
  }
  .logo-container {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo {
    max-width: 300px;
    height: auto;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.5px;
  }
  .header p {
    margin: 8px 0 0 0;
    font-size: 14px;
    opacity: 0.95;
  }
  .line-items {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  .line-item {
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .line-item:last-child {
    border-bottom: none;
  }
  .line-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .line-item-service {
    font-weight: 600;
    color: #166534;
    font-size: 15px;
  }
  .line-item-price {
    font-weight: 600;
    color: #1f2937;
    font-size: 15px;
  }
  .line-item-description {
    color: #6b7280;
    font-size: 13px;
    margin: 4px 0 0 0;
  }
  .content { 
    padding: 40px 30px;
    background-color: #ffffff;
  }
  .greeting {
    font-size: 18px;
    color: #1f2937;
    margin: 0 0 20px 0;
  }
  .section {
    margin: 30px 0;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #166534;
    margin: 0 0 15px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  .info-table td {
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-table .label {
    font-weight: 600;
    color: #4b5563;
    width: 40%;
  }
  .info-table .value {
    color: #1f2937;
  }
  .highlight-box {
    background: linear-gradient(to right, #f0f9f4 0%, #f0fdf4 100%);
    border-left: 4px solid #166534;
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  .highlight-box p {
    margin: 0;
    color: #1f2937;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #166534 0%, #15803d 100%);
    color: #ffffff !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .footer {
    background-color: #f9fafb;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  .footer-brand {
    font-size: 18px;
    font-weight: 600;
    color: #166534;
    margin: 0 0 8px 0;
  }
  .footer-tagline {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 15px 0;
  }
  .footer-contact {
    font-size: 13px;
    color: #4b5563;
    margin: 5px 0;
  }
  .footer-contact a {
    color: #166534;
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 25px 0;
  }
`;

// Helper function to delay execution (avoids Resend rate limits)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create mapping from service name to slug
const SERVICE_NAME_TO_SLUG: Record<string, string> = SERVICE_FIELD_CONFIGS.reduce(
  (acc, cfg) => {
    acc[cfg.serviceName] = cfg.serviceId;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Flattens nested serviceData structure and adds proper unit formatting
 * Input: { "lawn-mowing": { "propertySize": 5000 }, "aeration": { "propertySize": 3000 } }
 * Output: Array of { label, value, serviceId, serviceName } objects with proper units
 */
function flattenServiceDataWithUnits(serviceData: Record<string, Record<string, any>>): Array<{
  label: string;
  value: string;
  serviceId: string;
  serviceName: string;
}> {
  const flattened: Array<{ label: string; value: string; serviceId: string; serviceName: string }> = [];
  
  // Iterate over each service in serviceData
  Object.entries(serviceData).forEach(([serviceId, measurements]) => {
    // Skip if measurements is not an object or is empty
    if (!measurements || typeof measurements !== 'object') return;
    
    // Find the service config to get field metadata
    const serviceConfig = SERVICE_FIELD_CONFIGS.find(c => c.serviceId === serviceId);
    const serviceName = serviceConfig?.serviceName || serviceId;
    
    // Iterate over each measurement field for this service
    Object.entries(measurements).forEach(([fieldName, fieldValue]) => {
      // Skip empty/null/undefined values
      if (fieldValue === null || fieldValue === undefined || fieldValue === '') return;
      
      // Find the field config to get label and unit
      const fieldConfig = serviceConfig?.fields.find(f => f.name === fieldName);
      const label = fieldConfig?.label || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const unit = fieldConfig?.unit || '';
      
      // Format the value with unit
      let formattedValue: string;
      if (typeof fieldValue === 'number') {
        // Numeric values: add commas and unit
        formattedValue = unit 
          ? `${fieldValue.toLocaleString()} ${unit}`
          : fieldValue.toLocaleString();
      } else {
        // Text values: just convert to string
        formattedValue = String(fieldValue);
      }
      
      flattened.push({
        label,
        value: formattedValue,
        serviceId,
        serviceName,
      });
    });
  });
  
  return flattened;
}

/**
 * De-duplicates selectedServices array by removing the primary serviceType if present
 * Handles both slug and human-readable name formats by converting to slugs for comparison
 */
function deduplicateServices(serviceType: string, selectedServices?: string[]): string[] {
  if (!selectedServices || selectedServices.length === 0) return [];
  
  // Convert serviceType to slug if it's a human-readable name
  // serviceType might be "Lawn Mowing" or "lawn-mowing", selectedServices are always slugs
  const serviceTypeSlug = SERVICE_NAME_TO_SLUG[serviceType] || serviceType;
  
  // Filter out the primary service from the selected services list
  return selectedServices.filter(s => s !== serviceTypeSlug);
}

/**
 * Generate line items HTML for emails
 * @param lineItems - Array of line items
 * @param showMeasurements - If true, shows detailed measurements, rates, and explanations (for admin)
 *                          If false, shows only service names and prices (for customers)
 */
function generateLineItemsHtml(lineItems: LineItem[] | undefined, showMeasurements: boolean): string {
  if (!lineItems || lineItems.length === 0) return '';
  
  const title = showMeasurements ? 'Detailed Quote Breakdown' : 'Your Quote Summary';
  
  return `
    <div class="section">
      <h2 class="section-title">${title}</h2>
      <div class="line-items">
        ${lineItems.map(item => {
          // For customers, strip measurements from description (remove parenthetical content)
          const displayDescription = showMeasurements 
            ? item.description 
            : item.service; // Just show service name for customers
          
          const rateDisplay = showMeasurements ? formatRateDisplay(item.serviceId) : '';
          
          return `
          <div class="line-item">
            <div class="line-item-header">
              <span class="line-item-service">${item.service}</span>
              <span class="line-item-price">$${item.price.toLocaleString()}</span>
            </div>
            ${showMeasurements ? `<p class="line-item-description">${displayDescription}</p>` : ''}
            ${rateDisplay ? `<p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Rate: ${rateDisplay}</p>` : ''}
            ${showMeasurements && item.calculationExplanation ? `<p style="color: #9ca3af; font-size: 11px; font-style: italic; margin: 6px 0 0 0; padding-left: 12px; border-left: 2px solid #e5e7eb;">${item.calculationExplanation}</p>` : ''}
          </div>
        `}).join('')}
      </div>
    </div>
  `;
}

export async function sendQuoteNotification(data: QuoteEmailData) {
  const {
    quoteId,
    customerName,
    customerEmail,
    customerPhone,
    address,
    city,
    propertySize,
    propertyType,
    serviceType,
    frequency,
    selectedServices,
    finalQuote,
    finalQuoteMin,
    finalQuoteMax,
    preferredDate,
  } = data;

  console.log('[EMAIL] Starting quote notification for:', { customerName, customerEmail, city, serviceType });

  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();
    console.log('[EMAIL] Got Resend client, from email:', fromEmail);
    if ((resend as any)?.__noop) {
      console.log('[EMAIL] Skipping send (noop email client).');
      return { success: true, message: 'Email skipped (noop client)' };
    }

    // Generate line items HTML - detailed for admin, simple for customer
    const adminLineItemsHtml = generateLineItemsHtml(data.lineItems, true);
    const customerLineItemsHtml = generateLineItemsHtml(data.lineItems, false);

    // De-duplicate selectedServices (remove primary service if it appears in the list)
    const deduplicatedServices = deduplicateServices(serviceType, selectedServices);

    // Generate comprehensive property details HTML from serviceData (properly flattened)
    const propertyDetailsHtml = data.serviceData ? (() => {
      const serviceData = typeof data.serviceData === 'string' ? JSON.parse(data.serviceData) : data.serviceData;
      
      // Use the helper function to flatten and format serviceData with proper units
      const flattenedData = flattenServiceDataWithUnits(serviceData);
      
      if (flattenedData.length === 0) return '';
      
      // Group measurements by service for better organization
      const groupedByService: Record<string, Array<{ label: string; value: string }>> = {};
      flattenedData.forEach(item => {
        if (!groupedByService[item.serviceName]) {
          groupedByService[item.serviceName] = [];
        }
        groupedByService[item.serviceName].push({
          label: item.label,
          value: item.value,
        });
      });
      
      // Build HTML with measurements grouped by service (only render services with measurements)
      const sections = Object.entries(groupedByService)
        .filter(([serviceName, measurements]) => measurements.length > 0)
        .map(([serviceName, measurements]) => `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">${serviceName}</h3>
            <table class="info-table">
              ${measurements.map(m => `
                <tr>
                  <td class="label">${m.label}:</td>
                  <td class="value">${m.value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('');
      
      return `
        <div class="section">
          <h2 class="section-title">Property Measurements & Details</h2>
          ${sections}
        </div>
      `;
    })() : '';

    // Email to business owner
    const quoteDisplay = (() => {
      if (typeof finalQuoteMin === "number" && typeof finalQuoteMax === "number" && finalQuoteMin > 0 && finalQuoteMax > 0) {
        return `$${finalQuoteMin.toLocaleString()} - $${finalQuoteMax.toLocaleString()}`;
      }
      if (typeof finalQuote === "number" && Number.isFinite(finalQuote) && finalQuote > 0) {
        const { min, max } = calculateQuoteRange(finalQuote, 0.15);
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
      }
      return "Pending Property Assessment";
    })();

    const adminDashboardUrl = `${SITE_BASE_URL}/admin/dashboard?tab=pending&search=${encodeURIComponent(customerEmail)}`;
    const customerStatusUrl = `${SITE_BASE_URL}/quote-status/${quoteId}`;

    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo-container">
              <img src="${EMAIL_LOGO_LIGHT_URL}" alt="Lawn Care Kuna" class="logo" width="300" style="display:block; max-width:300px; height:auto;">
            </div>
            <h1>New Quote Request</h1>
            <p>AI-Powered Quote System</p>
          </div>
          
          <div class="content">
            <p class="greeting">A new customer has requested a quote from your website.</p>
            
            <div class="section">
              <h2 class="section-title">Customer Information</h2>
              <table class="info-table">
                <tr>
                  <td class="label">Name:</td>
                  <td class="value">${customerName}</td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td class="value"><a href="mailto:${customerEmail}" style="color: #166534; text-decoration: none;">${customerEmail}</a></td>
                </tr>
                ${customerPhone ? `
                <tr>
                  <td class="label">Phone:</td>
                  <td class="value"><a href="tel:${customerPhone}" style="color: #166534; text-decoration: none;">${customerPhone}</a></td>
                </tr>
                ` : ''}
                ${preferredDate ? `
                <tr>
                  <td class="label">Preferred Date:</td>
                  <td class="value">${preferredDate}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="divider"></div>

            <div class="section">
              <h2 class="section-title">Property Details</h2>
              <table class="info-table">
                <tr>
                  <td class="label">City:</td>
                  <td class="value">${city}</td>
                </tr>
                ${address ? `
                <tr>
                  <td class="label">Address:</td>
                  <td class="value">${address}</td>
                </tr>
                ` : ''}
                ${propertySize !== null && propertySize !== undefined ? `
                <tr>
                  <td class="label">Property Size:</td>
                  <td class="value">${propertySize.toLocaleString()} sq ft</td>
                </tr>
                ` : ''}
                ${propertyType !== null && propertyType !== undefined && propertyType !== '' ? `
                <tr>
                  <td class="label">Property Type:</td>
                  <td class="value">${propertyType}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="divider"></div>

            <div class="section">
              <h2 class="section-title">Service Details</h2>
              <table class="info-table">
                <tr>
                  <td class="label">Primary Service:</td>
                  <td class="value">${serviceType}</td>
                </tr>
                ${frequency ? `
                <tr>
                  <td class="label">Frequency:</td>
                  <td class="value">${frequency}</td>
                </tr>
                ` : ''}
                ${deduplicatedServices.length > 0 ? `
                <tr>
                  <td class="label">Additional Services:</td>
                  <td class="value">${deduplicatedServices.join(', ')}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${propertyDetailsHtml}

            ${adminLineItemsHtml}

            <div class="divider"></div>
            <div class="section">
              <h2 class="section-title">Total Estimated Quote</h2>
              <table class="info-table">
                <tr>
                  <td class="label">${finalQuote ? 'Estimated Range:' : 'Quote Status:'}</td>
                  <td class="value" style="font-size: 24px; font-weight: 700; color: #166534;">
                    ${quoteDisplay}
                  </td>
                </tr>
              </table>
            </div>
            ${!finalQuote ? `
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>Note:</strong> The AI quote system requires property measurements to generate an accurate estimate. Please conduct a site visit to assess the property and provide a detailed quote.</p>
            </div>
            ` : ''}

            <div class="highlight-box">
              <p><strong>Action Required:</strong> Please follow up with this customer within 24 hours to provide a detailed quote and schedule their service.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${adminDashboardUrl}" class="cta-button">Open Admin Dashboard →</a>
            </div>
          </div>

          <div class="footer">
            <div style="margin: 0 0 12px 0;">
              <img src="${EMAIL_LOGO_DARK_URL}" alt="Lawn Care Kuna" width="44" style="display:block; margin:0 auto; max-width:44px; height:auto;">
            </div>
            <p class="footer-brand">Lawn Care Kuna</p>
            <p class="footer-tagline">Kuna, Idaho's Most Trusted Lawn Care & Landscaping Service</p>
            <p class="footer-contact">Email: <a href="mailto:${fromEmail}">${fromEmail}</a></p>
            <p class="footer-contact">Web: <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${emailStyles}</style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo-container">
              <img src="${EMAIL_LOGO_LIGHT_URL}" alt="Lawn Care Kuna" class="logo" width="300" style="display:block; max-width:300px; height:auto;">
            </div>
            <h1>Thank You for Your Request</h1>
            <p>We're excited to help transform your outdoor space!</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${customerName},</p>
            
            <p style="color: #4b5563; margin: 0 0 20px 0;">Thank you for choosing Lawn Care Kuna for your ${serviceType.toLowerCase()} needs. We've received your quote request and our team is reviewing the details.</p>

            <div class="highlight-box">
              <p><strong>What happens next?</strong></p>
              <p style="margin: 10px 0 0 0;">Our team will contact you within 24 hours with a detailed quote tailored to your property's specific needs. We'll answer any questions and help you schedule your service at a time that works best for you.</p>
            </div>

            <div class="section">
              <h2 class="section-title">Your Request Summary</h2>
              <table class="info-table">
                <tr>
                  <td class="label">Primary Service:</td>
                  <td class="value">${serviceType}</td>
                </tr>
                ${deduplicatedServices.length > 0 ? `
                <tr>
                  <td class="label">Additional Services:</td>
                  <td class="value">${deduplicatedServices.join(', ')}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Location:</td>
                  <td class="value">${city}${address ? `, ${address}` : ''}</td>
                </tr>
                ${propertySize !== null && propertySize !== undefined ? `
                <tr>
                  <td class="label">Property Size:</td>
                  <td class="value">${propertySize.toLocaleString()} sq ft</td>
                </tr>
                ` : ''}
                ${propertyType !== null && propertyType !== undefined && propertyType !== '' ? `
                <tr>
                  <td class="label">Property Type:</td>
                  <td class="value">${propertyType}</td>
                </tr>
                ` : ''}
                ${frequency ? `
                <tr>
                  <td class="label">Service Frequency:</td>
                  <td class="value">${frequency}</td>
                </tr>
                ` : ''}
                ${preferredDate ? `
                <tr>
                  <td class="label">Preferred Start Date:</td>
                  <td class="value">${preferredDate}</td>
                </tr>
                ` : ''}
                ${customerPhone ? `
                <tr>
                  <td class="label">Contact Phone:</td>
                  <td class="value">${customerPhone}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${customerLineItemsHtml}

            <div class="divider"></div>
            <div class="section">
              <h2 class="section-title">Total Estimated Investment</h2>
              <table class="info-table">
                <tr>
                  <td class="label">${finalQuote ? 'Estimated Range:' : 'Quote Status:'}</td>
                  <td class="value" style="font-size: 24px; font-weight: 700; color: #166534;">
                    ${quoteDisplay}
                  </td>
                </tr>
              </table>
            </div>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>About Your Estimate:</strong> ${finalQuote 
                ? 'This is an estimated price range. Your final quote will be customized after we assess your property\'s unique characteristics and the full scope of work.'
                : 'Your personalized quote will be provided after our team completes a property assessment. We\'ll contact you within 24 hours with detailed pricing based on your property\'s unique characteristics and your specific preferences.'
              }</p>
            </div>

            <div class="divider"></div>

            <div class="section">
              <h2 class="section-title">Track Your Quote</h2>
              <p style="color: #4b5563; margin: 0 0 15px 0;">You can check the status of your quote anytime using the link below:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${customerStatusUrl}" class="cta-button">View Quote Status →</a>
              </div>
            </div>

            <div class="divider"></div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4b5563; margin: 0 0 10px 0;"><strong>Have questions?</strong></p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">You can reply to this email or call us at <a href="tel:+12083522011" style="color: #166534; text-decoration: none;">(208) 352-2011</a></p>
            </div>
          </div>

          <div class="footer">
            <div style="margin: 0 0 12px 0;">
              <img src="${EMAIL_LOGO_DARK_URL}" alt="Lawn Care Kuna" width="44" style="display:block; margin:0 auto; max-width:44px; height:auto;">
            </div>
            <p class="footer-brand">Lawn Care Kuna</p>
            <p class="footer-tagline">Kuna, Idaho's Most Trusted Lawn Care & Landscaping Service</p>
            <p class="footer-contact">Email: <a href="mailto:${fromEmail}">${fromEmail}</a></p>
            <p class="footer-contact">Phone: <a href="tel:+12083522011">(208) 352-2011</a></p>
            <p class="footer-contact">Address: 2283 N Coopers Hawk Ave, Kuna, ID 83634</p>
            <p class="footer-contact">Web: <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
            <p style="font-size: 12px; color: #9ca3af; margin: 15px 0 0 0;">Serving Kuna, Boise, Meridian, Nampa, Caldwell, Eagle, Star & Middleton</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to business owner
    console.log('[EMAIL] Sending admin notification to:', fromEmail);
    const adminResult = await resend.emails.send({
      from: `Lawn Care Kuna <${fromEmail}>`,
      to: fromEmail,
      subject: `New Quote Request - ${customerName} (${city})`,
      html: ownerEmailHtml,
      replyTo: customerEmail
    });
    console.log('[EMAIL] Admin email sent, result:', adminResult);

    // Wait 2 seconds to avoid Resend rate limit (max 2 requests per second)
    await delay(2000);

    // Send confirmation email to customer
    if (customerEmail) {
      console.log('[EMAIL] Sending customer confirmation to:', customerEmail);
      const customerResult = await resend.emails.send({
        from: `Lawn Care Kuna <${fromEmail}>`,
        to: customerEmail,
        subject: `Your Quote Request Received - Lawn Care Kuna`,
        html: customerEmailHtml
      });
      console.log('[EMAIL] Customer email sent, result:', customerResult);
    }

    console.log('[EMAIL] ✅ Quote notification emails sent successfully via Resend');
    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    console.error('[EMAIL] ❌ Error sending email via Resend:', error);
    if (error instanceof Error) {
      console.error('[EMAIL] Error message:', error.message);
      console.error('[EMAIL] Error stack:', error.stack);
    }
    return { success: false, message: 'Failed to send email', error };
  }
}
