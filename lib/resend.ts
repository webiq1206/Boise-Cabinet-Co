import { Resend } from 'resend';
import { SITE_CONFIG } from '@/shared/siteConfig';

const ADMIN_EMAILS = [
  SITE_CONFIG.email,
  "webiq.co@gmail.com",
];

async function getCredentials() {
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: `Boise Remodeling Co <${SITE_CONFIG.email}>`
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
  
  const rawFrom = connectionSettings.settings.from_email || 'hello@boiseremodeling.co';
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: rawFrom.includes('<') ? rawFrom : `Boise Remodeling Co <${rawFrom}>`
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

const BLOCKED_EMAIL_DOMAINS = ['timberandlove.com'];

function isBlockedEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return BLOCKED_EMAIL_DOMAINS.some(d => domain === d);
}

function filterBlockedRecipients(to: string | string[]): string[] {
  const recipients = Array.isArray(to) ? to : [to];
  const allowed = recipients.filter(email => {
    if (isBlockedEmail(email)) {
      console.log(`[RESEND] Blocked email to ${email} (domain on blocklist)`);
      return false;
    }
    return true;
  });
  return allowed;
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
    const filteredTo = filterBlockedRecipients(to);
    if (filteredTo.length === 0) {
      console.log(`[RESEND] ${label} skipped: all recipients blocked`);
      return true;
    }
    const result = await client.emails.send({ from, to: filteredTo.length === 1 ? filteredTo[0] : filteredTo, subject, html });
    
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
  serviceFrequencies?: Record<string, string>;
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
        <div style="background: linear-gradient(135deg, #8B4A2E 0%, #3a9d63 50%, #ffffff 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="https://boiseremodeling.co/images/brc-logo.png" alt="Boise Remodeling Co" style="max-height: 60px; margin-bottom: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Quote Request!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Hi ${data.customerName},</p>
          
          <p style="font-size: 16px; color: #333;">
            Thank you for requesting a quote from Boise Remodeling Co! We've received your request and will be in touch within one business day to schedule your free consultation.
          </p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #8B4A2E;">Quote Details</h3>
            <p style="margin: 0 0 8px 0;"><strong>Reference:</strong> ${data.quoteId.slice(0, 8)}</p>
            <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${data.address}, ${data.city}, Idaho</p>
            ${buildResendFrequencyHtml(data.services, data.frequency, data.serviceFrequencies)}
            <p style="margin: 0 0 8px 0;"><strong>Services:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              ${servicesHtml}
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333;">
            If you have any questions in the meantime, feel free to call us at <strong>(208) 314-9867</strong> or reply to this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://boiseremodeling.co" style="display: inline-block; background: #8B4A2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            Boise Remodeling Co<br>
            Kuna, Idaho | (208) 314-9867<br>
            <a href="mailto:hello@boiseremodeling.co" style="color: #8B4A2E;">hello@boiseremodeling.co</a>
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
    `Quote Request Received - Boise Remodeling Co (Ref: ${data.quoteId.slice(0, 8)})`,
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
  serviceFrequencies?: Record<string, string>;
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
        <div style="background: linear-gradient(135deg, #8B4A2E 0%, #3a9d63 50%, #ffffff 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="https://boiseremodeling.co/images/brc-logo.png" alt="Boise Remodeling Co" style="max-height: 60px; margin-bottom: 10px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Quote Request!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <strong style="color: #92400e;">New lead received!</strong>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #8B4A2E;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="mailto:${data.customerEmail}" style="color: #8B4A2E;">${data.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><a href="tel:${data.customerPhone}" style="color: #8B4A2E;">${data.customerPhone}</a></td>
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
          
          <h3 style="margin: 20px 0 15px 0; color: #8B4A2E;">Quote Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Reference:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${data.quoteId}</td>
            </tr>
            ${buildResendFrequencyTableRow(data.services, data.frequency, data.serviceFrequencies)}
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
            <a href="https://boiseremodeling.co/admin" style="display: inline-block; background: #8B4A2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
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
    'one-time': 'One-time',
    'weekly': 'Weekly',
    'bi-weekly': 'Every 2 weeks',
    'monthly': 'Monthly'
  };
  return frequencies[freq] || freq;
}

const RESEND_RECURRING_ELIGIBLE = new Set<string>([]);

function getPerServiceFrequencies(
  services: string[],
  frequency: string,
  serviceFrequencies?: Record<string, string>,
): Array<{ name: string; freq: string }> {
  return services.map(sid => {
    let svcFreq = serviceFrequencies?.[sid] || frequency || "one-time";
    if (svcFreq !== "one-time" && !RESEND_RECURRING_ELIGIBLE.has(sid)) {
      svcFreq = "one-time";
    }
    return { name: formatServiceName(sid), freq: svcFreq };
  });
}

function buildResendFrequencyHtml(
  services: string[],
  frequency: string,
  serviceFrequencies?: Record<string, string>,
): string {
  const perService = getPerServiceFrequencies(services, frequency, serviceFrequencies);
  const uniqueFreqs = new Set(perService.map(s => s.freq));

  if (uniqueFreqs.size <= 1) {
    return `<p style="margin: 0 0 8px 0;"><strong>Frequency:</strong> ${formatFrequency(perService[0]?.freq || frequency)}</p>`;
  }

  const lines = perService.map(s =>
    `<li style="padding: 2px 0;">${s.name}: <strong>${formatFrequency(s.freq)}</strong></li>`
  ).join('');
  return `<p style="margin: 0 0 4px 0;"><strong>Frequency:</strong></p><ul style="margin: 0 0 8px 0; padding-left: 20px;">${lines}</ul>`;
}

function buildResendFrequencyTableRow(
  services: string[],
  frequency: string,
  serviceFrequencies?: Record<string, string>,
): string {
  const perService = getPerServiceFrequencies(services, frequency, serviceFrequencies);
  const uniqueFreqs = new Set(perService.map(s => s.freq));

  if (uniqueFreqs.size <= 1) {
    return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong>Frequency:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;">${formatFrequency(perService[0]?.freq || frequency)}</td></tr>`;
  }

  const lines = perService.map(s =>
    `<li style="padding: 2px 0;">${s.name}: <strong>${formatFrequency(s.freq)}</strong></li>`
  ).join('');
  return `<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5; vertical-align: top;"><strong>Frequency:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><ul style="margin: 0; padding-left: 20px;">${lines}</ul></td></tr>`;
}
