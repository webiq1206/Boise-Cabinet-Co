// Resend email client integration
// Uses Replit's Resend connector for secure API key management
import { Resend } from 'resend';

async function getCredentials() {
  if (process.env.RESEND_API_KEY) {
    console.log('[RESEND] Using RESEND_API_KEY from environment');
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: 'hello@lawncarekuna.com'
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.error('[RESEND] No auth token found. REPL_IDENTITY:', !!process.env.REPL_IDENTITY, 'WEB_REPL_RENEWAL:', !!process.env.WEB_REPL_RENEWAL);
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  if (!hostname) {
    console.error('[RESEND] REPLIT_CONNECTORS_HOSTNAME is not set');
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not found');
  }

  console.log('[RESEND] Fetching credentials from Replit connector...');
  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  
  if (!response.ok) {
    console.error('[RESEND] Connector API returned status:', response.status, response.statusText);
    throw new Error(`Resend connector API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings?.api_key) {
    console.error('[RESEND] No API key found in connector response. Items count:', data.items?.length || 0);
    throw new Error('Resend not connected - no API key in connector settings');
  }
  
  console.log('[RESEND] Credentials obtained successfully, from_email:', connectionSettings.settings.from_email || 'hello@lawncarekuna.com');
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email || 'hello@lawncarekuna.com'
  };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function to get a fresh client.
async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

// Send quote confirmation email to customer
export async function sendQuoteConfirmationEmail(data: {
  to: string;
  customerName: string;
  quoteId: string;
  address: string;
  city: string;
  services: string[];
  frequency: string;
}) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const servicesHtml = data.services.map(s => 
    `<li style="padding: 4px 0;">${formatServiceName(s)}</li>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2D8652 0%, #3a9d63 50%, #ffffff 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="https://lawncarekuna.com/images/lawn-care-kuna-logo.png" alt="Lawn Care Kuna" style="max-height: 60px; margin-bottom: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Quote Request!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 16px; color: #333;">
            Thank you for requesting a quote from Lawn Care Kuna! We've received your request and will be in touch within 24 hours with a detailed estimate.
          </p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2D8652;">Quote Details</h3>
            <p style="margin: 0 0 8px 0;"><strong>Reference:</strong> ${data.quoteId.slice(0, 8)}</p>
            <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${data.address}, ${data.city}, Idaho</p>
            <p style="margin: 0 0 8px 0;"><strong>Frequency:</strong> ${formatFrequency(data.frequency)}</p>
            <p style="margin: 0 0 8px 0;"><strong>Services:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              ${servicesHtml}
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333;">
            If you have any questions in the meantime, feel free to call us at <strong>(208) 314-9867</strong> or reply to this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://lawncarekuna.com" style="display: inline-block; background: #2D8652; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            Lawn Care Kuna<br>
            Kuna, Idaho | (208) 314-9867<br>
            <a href="mailto:hello@lawncarekuna.com" style="color: #2D8652;">hello@lawncarekuna.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: data.to,
      subject: `Quote Request Received - Lawn Care Kuna (Ref: ${data.quoteId.slice(0, 8)})`,
      html
    });
    console.log('Customer email sent:', result);
    return result;
  } catch (error) {
    console.error('Failed to send customer email:', error);
    throw error;
  }
}

// Send new lead notification to admin
export async function sendAdminNotificationEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quoteId: string;
  address: string;
  city: string;
  services: string[];
  frequency: string;
  message?: string;
  propertySize?: number;
}) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const servicesHtml = data.services.map(s => 
    `<li style="padding: 4px 0;">${formatServiceName(s)}</li>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2D8652 0%, #3a9d63 50%, #ffffff 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="https://lawncarekuna.com/images/lawn-care-kuna-logo.png" alt="Lawn Care Kuna" style="max-height: 60px; margin-bottom: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Quote Request!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <strong style="color: #92400e;">New lead received!</strong>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #2D8652;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="mailto:${data.customerEmail}" style="color: #2D8652;">${data.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="tel:${data.customerPhone}" style="color: #2D8652;">${data.customerPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Address:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.address}, ${data.city}, Idaho</td>
            </tr>
            ${data.propertySize ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Property Size:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.propertySize.toLocaleString()} sq ft</td>
            </tr>
            ` : ''}
          </table>
          
          <h3 style="margin: 20px 0 15px 0; color: #2D8652;">Quote Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Reference:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.quoteId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Frequency:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${formatFrequency(data.frequency)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top;"><strong>Services:</strong></td>
              <td style="padding: 8px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${servicesHtml}
                </ul>
              </td>
            </tr>
          </table>
          
          ${data.message ? `
          <div style="background: #f4f4f5; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <strong>Customer Notes:</strong>
            <p style="margin: 8px 0 0 0;">${data.message}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://lawncarekuna.com/admin" style="display: inline-block; background: #2D8652; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: 'hello@lawncarekuna.com',
      subject: `New Quote: ${data.customerName} - ${data.city} (${data.services.length} services)`,
      html
    });
    console.log('Admin notification email sent:', result);
    return result;
  } catch (error) {
    console.error('Failed to send admin email:', error);
    throw error;
  }
}

function formatServiceName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatFrequency(freq: string): string {
  const frequencies: Record<string, string> = {
    'one-time': 'One-time service',
    'weekly': 'Weekly',
    'bi-weekly': 'Every 2 weeks',
    'monthly': 'Monthly'
  };
  return frequencies[freq] || freq;
}
