import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
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

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
async function getGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

interface QuoteEmailData {
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
  preferredDate?: string;
}

function createEmailMessage(to: string, from: string, subject: string, htmlBody: string, replyTo?: string): string {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
  ];

  if (replyTo) {
    messageParts.push(`Reply-To: ${replyTo}`);
  }

  messageParts.push('');
  messageParts.push(htmlBody);

  const message = messageParts.join('\r\n');
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendQuoteNotification(data: QuoteEmailData) {
  const {
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
    preferredDate,
  } = data;

  try {
    const gmail = await getGmailClient();

    // Email to business owner
    const ownerEmailHtml = `
      <h2>New Quote Request from Lawn Care Kuna Website</h2>
      
      <h3>Customer Information</h3>
      <ul>
        <li><strong>Name:</strong> ${customerName}</li>
        <li><strong>Email:</strong> ${customerEmail}</li>
        ${customerPhone ? `<li><strong>Phone:</strong> ${customerPhone}</li>` : ''}
        ${preferredDate ? `<li><strong>Preferred Date:</strong> ${preferredDate}</li>` : ''}
      </ul>

      <h3>Property Details</h3>
      <ul>
        <li><strong>Address:</strong> ${address || 'Not provided'}</li>
        <li><strong>City:</strong> ${city}</li>
        ${propertySize ? `<li><strong>Property Size:</strong> ${propertySize.toLocaleString()} sq ft</li>` : ''}
        ${propertyType ? `<li><strong>Property Type:</strong> ${propertyType}</li>` : ''}
      </ul>

      <h3>Service Details</h3>
      <ul>
        <li><strong>Primary Service:</strong> ${serviceType}</li>
        ${frequency ? `<li><strong>Frequency:</strong> ${frequency}</li>` : ''}
        ${selectedServices && selectedServices.length > 0 ? `<li><strong>Add-ons:</strong> ${selectedServices.join(', ')}</li>` : ''}
        ${finalQuote ? `<li><strong>AI Quote:</strong> $${finalQuote.toLocaleString()}</li>` : ''}
      </ul>

      <p style="margin-top: 20px; padding: 15px; background: #f0f9f4; border-left: 4px solid #10b981;">
        <strong>Action Required:</strong> Please follow up with this customer within 24 hours.
      </p>
    `;

    // Email to customer
    const customerEmailHtml = `
      <h2>Thank you for your quote request!</h2>
      
      <p>Hi ${customerName},</p>
      
      <p>Thank you for requesting a quote from Lawn Care Kuna. We've received your request and will get back to you within 24 hours with a detailed proposal.</p>
      
      <h3>Your Request Details</h3>
      <ul>
        <li><strong>Service:</strong> ${serviceType}</li>
        <li><strong>Location:</strong> ${city}${address ? `, ${address}` : ''}</li>
        ${finalQuote ? `<li><strong>Estimated Quote:</strong> $${finalQuote.toLocaleString()}</li>` : ''}
      </ul>

      ${finalQuote ? `
        <p style="margin-top: 20px; padding: 15px; background: #f0f9f4; border-left: 4px solid #10b981;">
          <strong>Note:</strong> This is an AI-generated estimate. Final pricing will be confirmed after we assess your property.
        </p>
      ` : ''}

      <p style="margin-top: 20px;">
        <strong>Questions?</strong> Reply to this email or call us at (208) 555-LAWN
      </p>

      <p>
        Best regards,<br>
        <strong>Lawn Care Kuna Team</strong><br>
        Kuna, Idaho's Most Trusted Lawn Care Service
      </p>
    `;

    // Send email to business owner
    const ownerMessage = createEmailMessage(
      'hello@lawncarekuna.com',
      'Lawn Care Kuna <hello@lawncarekuna.com>',
      `New Quote Request - ${customerName} (${city})`,
      ownerEmailHtml,
      customerEmail
    );

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: ownerMessage,
      },
    });

    // Send confirmation email to customer
    if (customerEmail) {
      const customerMessage = createEmailMessage(
        customerEmail,
        'Lawn Care Kuna <hello@lawncarekuna.com>',
        'Your Lawn Care Quote Request - Lawn Care Kuna',
        customerEmailHtml
      );

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: customerMessage,
        },
      });
    }

    console.log('Quote notification emails sent successfully via Gmail API');
    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    return { success: false, message: 'Failed to send email', error };
  }
}
