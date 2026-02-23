import { Resend } from 'resend';

const ADMIN_EMAILS = [
  "hello@lawncarekuna.com",
  "webiq.co@gmail.com",
];

async function getCredentials() {
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: 'Lawn Care Kuna <hello@lawncarekuna.com>'
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.error('[RESEND] No auth token found');
    throw new Error('X_REPLIT_TOKEN not found');
  }

  if (!hostname) {
    console.error('[RESEND] REPLIT_CONNECTORS_HOSTNAME is not set');
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not found');
  }

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
    console.error('[RESEND] Connector API error:', response.status);
    throw new Error(`Resend connector API error: ${response.status}`);
  }

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings?.api_key) {
    console.error('[RESEND] No API key in connector response');
    throw new Error('Resend not connected');
  }
  
  const rawFrom = connectionSettings.settings.from_email || 'hello@lawncarekuna.com';
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: rawFrom.includes('<') ? rawFrom : `Lawn Care Kuna <${rawFrom}>`
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

async function sendEmailWithLogging(
  client: Resend,
  from: string,
  to: string | string[],
  subject: string,
  html: string,
  label: string
): Promise<boolean> {
  try {
    const result = await client.emails.send({ from, to, subject, html });
    
    const quota = (result as any)?.headers?.['x-resend-daily-quota'];
    const errorData = (result as any)?.error;
    
    if (errorData) {
      console.error(`[RESEND] ${label} API error:`, JSON.stringify(errorData));
      return false;
    }
    
    const emailId = (result as any)?.data?.id;
    console.log(`[RESEND] ${label} sent successfully. ID: ${emailId}, To: ${Array.isArray(to) ? to.join(', ') : to}`);
    if (quota !== undefined) {
      console.log(`[RESEND] Daily quota remaining: ${quota}`);
    }
    return true;
  } catch (error: any) {
    console.error(`[RESEND] ${label} FAILED:`, error?.message || error);
    if (error?.statusCode) console.error(`[RESEND] Status code: ${error.statusCode}`);
    return false;
  }
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

  const sent = await sendEmailWithLogging(
    client,
    fromEmail,
    data.to,
    `Quote Request Received - Lawn Care Kuna (Ref: ${data.quoteId.slice(0, 8)})`,
    html,
    'Customer confirmation'
  );
  if (!sent) throw new Error('Failed to send customer email');
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

  const subject = `New Quote: ${data.customerName} - ${data.city} (${data.services.length} services)`;
  let anySuccess = false;

  for (let i = 0; i < ADMIN_EMAILS.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 700));
    const sent = await sendEmailWithLogging(
      client,
      fromEmail,
      ADMIN_EMAILS[i],
      subject,
      html,
      `Admin notification (${ADMIN_EMAILS[i]})`
    );
    if (sent) anySuccess = true;
  }

  if (!anySuccess) {
    throw new Error('Failed to send admin notification to any admin email');
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
