import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createMimeMessage(to: string, subject: string, htmlBody: string, from?: string): string {
  const fromEmail = from || 'noreply@lawncarekuna.com';
  const message = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ].join('\r\n');

  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  // Validate recipient email
  if (!to || to.trim().length === 0) {
    throw new Error('Recipient email address is required');
  }
  
  try {
    const gmail = await getUncachableGmailClient();
    const encodedMessage = createMimeMessage(to, subject, htmlBody);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Email sent successfully to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendNewLeadNotification(leadData: {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  finalQuote: string;
  address?: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lawncarekuna.com';
  
  const subject = `New Lead: ${leadData.name} - ${leadData.city} - $${leadData.finalQuote}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .cta { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 New Lead Received!</h1>
          </div>
          <div class="content">
            <div class="detail">
              <span class="label">Lead ID:</span>
              <span class="value">${leadData.id}</span>
            </div>
            <div class="detail">
              <span class="label">Customer Name:</span>
              <span class="value">${leadData.name}</span>
            </div>
            <div class="detail">
              <span class="label">Email:</span>
              <span class="value">${leadData.email}</span>
            </div>
            <div class="detail">
              <span class="label">Phone:</span>
              <span class="value">${leadData.phone}</span>
            </div>
            <div class="detail">
              <span class="label">City:</span>
              <span class="value">${leadData.city}</span>
            </div>
            ${leadData.address ? `
            <div class="detail">
              <span class="label">Address:</span>
              <span class="value">${leadData.address}</span>
            </div>
            ` : ''}
            <div class="detail">
              <span class="label">Service Type:</span>
              <span class="value">${leadData.serviceType}</span>
            </div>
            <div class="detail">
              <span class="label">Quote Value:</span>
              <span class="value" style="font-size: 18px; color: #22c55e; font-weight: bold;">$${leadData.finalQuote}</span>
            </div>
            <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/admin/dashboard" class="cta">
              Review Lead in Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            You have 48 hours first right of refusal before this lead becomes available to subcontractors.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(adminEmail, subject, htmlBody);
}

export async function sendLeadPurchasedNotification(leadData: {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  finalQuote: string;
  address?: string;
}, purchaserData: {
  name: string;
  email: string;
}): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lawncarekuna.com';
  
  const subject = `Lead Purchased: ${leadData.name} - ${leadData.city}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Lead Purchased!</h1>
          </div>
          <div class="content">
            <h2>Purchased By:</h2>
            <div class="detail">
              <span class="label">Subcontractor:</span>
              <span class="value">${purchaserData.name}</span>
            </div>
            <div class="detail">
              <span class="label">Email:</span>
              <span class="value">${purchaserData.email}</span>
            </div>
            
            <h2 style="margin-top: 30px;">Lead Details:</h2>
            <div class="detail">
              <span class="label">Customer Name:</span>
              <span class="value">${leadData.name}</span>
            </div>
            <div class="detail">
              <span class="label">Email:</span>
              <span class="value">${leadData.email}</span>
            </div>
            <div class="detail">
              <span class="label">Phone:</span>
              <span class="value">${leadData.phone}</span>
            </div>
            <div class="detail">
              <span class="label">City:</span>
              <span class="value">${leadData.city}</span>
            </div>
            ${leadData.address ? `
            <div class="detail">
              <span class="label">Address:</span>
              <span class="value">${leadData.address}</span>
            </div>
            ` : ''}
            <div class="detail">
              <span class="label">Service Type:</span>
              <span class="value">${leadData.serviceType}</span>
            </div>
            <div class="detail">
              <span class="label">Quote Value:</span>
              <span class="value" style="font-size: 18px; color: #22c55e; font-weight: bold;">$${leadData.finalQuote}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(adminEmail, subject, htmlBody);
}

export async function sendLeadPurchaseConfirmation(purchaserEmail: string, leadData: {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  serviceType: string;
  finalQuote: string;
  address?: string;
}): Promise<void> {
  const subject = `Lead Purchase Confirmation - ${leadData.name}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Lead Purchase Confirmed!</h1>
          </div>
          <div class="content">
            <p>Thank you for your purchase. Here are the customer details:</p>
            
            <div class="detail">
              <span class="label">Customer Name:</span>
              <span class="value">${leadData.name}</span>
            </div>
            <div class="detail">
              <span class="label">Email:</span>
              <span class="value">${leadData.email}</span>
            </div>
            <div class="detail">
              <span class="label">Phone:</span>
              <span class="value">${leadData.phone}</span>
            </div>
            <div class="detail">
              <span class="label">City:</span>
              <span class="value">${leadData.city}</span>
            </div>
            ${leadData.address ? `
            <div class="detail">
              <span class="label">Address:</span>
              <span class="value">${leadData.address}</span>
            </div>
            ` : ''}
            <div class="detail">
              <span class="label">Service Type:</span>
              <span class="value">${leadData.serviceType}</span>
            </div>
            <div class="detail">
              <span class="label">Estimated Value:</span>
              <span class="value" style="font-size: 18px; color: #22c55e; font-weight: bold;">$${leadData.finalQuote}</span>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Reminder:</strong><br>
              This lead is non-refundable. Please contact the customer as soon as possible to schedule their service.
            </div>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            If you have any questions, please contact Lawn Care Kuna support.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail(purchaserEmail, subject, htmlBody);
}
