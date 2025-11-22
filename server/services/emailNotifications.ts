import { getUncachableResendClient } from '../resend';

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
  .warning-box {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  .warning-box p {
    margin: 0;
    color: #78350f;
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
  .badge {
    display: inline-block;
    background-color: #f0f9f4;
    color: #166534;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    margin: 5px 0;
  }
`;

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  // Validate recipient email
  if (!to || to.trim().length === 0) {
    throw new Error('Recipient email address is required');
  }
  
  try {
    const { client: resend, fromEmail } = await getUncachableResendClient();

    await resend.emails.send({
      from: `Lawn Care Kuna <${fromEmail}>`,
      to,
      subject,
      html: htmlBody
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
  const { fromEmail } = await getUncachableResendClient();
  
  const subject = `🎯 New Lead Available - ${leadData.name} (${leadData.city}) - $${leadData.finalQuote}`;
  
  const htmlBody = `
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
          <h1>🎯 New Lead Received</h1>
          <p>Lawn Care Kuna Lead Distribution System</p>
        </div>
        
        <div class="content">
          <p class="greeting">A new high-quality lead is now available in your dashboard.</p>
          
          <div class="highlight-box">
            <p><strong>⏰ 48-Hour Priority Window</strong></p>
            <p style="margin: 10px 0 0 0;">You have first right of refusal for the next 48 hours. After that, this lead will become available to your network of subcontractors.</p>
          </div>

          <div class="section">
            <h2 class="section-title">Lead Overview</h2>
            <p><span class="badge">Lead ID: ${leadData.id}</span></p>
            <table class="info-table">
              <tr>
                <td class="label">Customer Name:</td>
                <td class="value">${leadData.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td class="value"><a href="mailto:${leadData.email}" style="color: #166534; text-decoration: none;">${leadData.email}</a></td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td class="value"><a href="tel:${leadData.phone}" style="color: #166534; text-decoration: none;">${leadData.phone}</a></td>
              </tr>
              <tr>
                <td class="label">Service Area:</td>
                <td class="value">${leadData.city}</td>
              </tr>
              ${leadData.address ? `
              <tr>
                <td class="label">Property Address:</td>
                <td class="value">${leadData.address}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Service Type:</td>
                <td class="value">${leadData.serviceType}</td>
              </tr>
              <tr>
                <td class="label">Estimated Value:</td>
                <td class="value" style="font-size: 20px; font-weight: 600; color: #166534;">$${leadData.finalQuote}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/admin/dashboard" class="cta-button">Review Lead in Dashboard →</a>
          </div>
        </div>

        <div class="footer">
          <p class="footer-brand">Lawn Care Kuna</p>
          <p class="footer-tagline">Lead Distribution Platform</p>
          <p class="footer-contact">📧 <a href="mailto:${fromEmail}">${fromEmail}</a></p>
          <p class="footer-contact">🌐 <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(fromEmail, subject, htmlBody);
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
  const { fromEmail } = await getUncachableResendClient();
  
  const subject = `💰 Lead Purchased - ${leadData.name} (${leadData.city})`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);">
          <h1>💰 Lead Purchased</h1>
          <p>Transaction Notification</p>
        </div>
        
        <div class="content">
          <p class="greeting">A lead has been successfully purchased from your marketplace.</p>

          <div class="section">
            <h2 class="section-title">Subcontractor Details</h2>
            <table class="info-table">
              <tr>
                <td class="label">Name:</td>
                <td class="value">${purchaserData.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td class="value"><a href="mailto:${purchaserData.email}" style="color: #166534; text-decoration: none;">${purchaserData.email}</a></td>
              </tr>
            </table>
          </div>

          <div class="divider"></div>

          <div class="section">
            <h2 class="section-title">Lead Information</h2>
            <p><span class="badge">Lead ID: ${leadData.id}</span></p>
            <table class="info-table">
              <tr>
                <td class="label">Customer Name:</td>
                <td class="value">${leadData.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td class="value">${leadData.email}</td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td class="value">${leadData.phone}</td>
              </tr>
              <tr>
                <td class="label">Service Area:</td>
                <td class="value">${leadData.city}</td>
              </tr>
              ${leadData.address ? `
              <tr>
                <td class="label">Property Address:</td>
                <td class="value">${leadData.address}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Service Type:</td>
                <td class="value">${leadData.serviceType}</td>
              </tr>
              <tr>
                <td class="label">Quote Value:</td>
                <td class="value" style="font-size: 20px; font-weight: 600; color: #166534;">$${leadData.finalQuote}</td>
              </tr>
            </table>
          </div>

          <div class="highlight-box">
            <p><strong>✅ Transaction Complete</strong></p>
            <p style="margin: 10px 0 0 0;">The lead has been transferred to the subcontractor. They now have full access to customer contact information and are responsible for following up.</p>
          </div>
        </div>

        <div class="footer">
          <p class="footer-brand">Lawn Care Kuna</p>
          <p class="footer-tagline">Lead Distribution Platform</p>
          <p class="footer-contact">📧 <a href="mailto:${fromEmail}">${fromEmail}</a></p>
          <p class="footer-contact">🌐 <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(fromEmail, subject, htmlBody);
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
  const subject = `✅ Lead Purchase Confirmed - ${leadData.name}`;
  
  const htmlBody = `
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
          <h1>✅ Purchase Confirmed</h1>
          <p>Your lead is ready to contact</p>
        </div>
        
        <div class="content">
          <p class="greeting">Congratulations! Your lead purchase was successful.</p>
          
          <p style="color: #4b5563; margin: 0 0 20px 0;">You now have complete access to this customer's contact information. We recommend reaching out within the next 2-4 hours for the best conversion rates.</p>

          <div class="section">
            <h2 class="section-title">Customer Contact Information</h2>
            <p><span class="badge">Lead ID: ${leadData.id}</span></p>
            <table class="info-table">
              <tr>
                <td class="label">Customer Name:</td>
                <td class="value" style="font-weight: 600;">${leadData.name}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td class="value"><a href="mailto:${leadData.email}" style="color: #166534; text-decoration: none; font-weight: 600;">${leadData.email}</a></td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td class="value"><a href="tel:${leadData.phone}" style="color: #166534; text-decoration: none; font-weight: 600;">${leadData.phone}</a></td>
              </tr>
              <tr>
                <td class="label">Service Area:</td>
                <td class="value">${leadData.city}</td>
              </tr>
              ${leadData.address ? `
              <tr>
                <td class="label">Property Address:</td>
                <td class="value">${leadData.address}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Service Requested:</td>
                <td class="value">${leadData.serviceType}</td>
              </tr>
              <tr>
                <td class="label">Estimated Project Value:</td>
                <td class="value" style="font-size: 20px; font-weight: 600; color: #166534;">$${leadData.finalQuote}</td>
              </tr>
            </table>
          </div>

          <div class="highlight-box">
            <p><strong>💡 Tips for Success:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #4b5563;">
              <li>Contact the customer within 2-4 hours while they're actively searching</li>
              <li>Reference their specific service request to show you've reviewed their needs</li>
              <li>Offer to schedule a free property assessment at their convenience</li>
              <li>Be professional, friendly, and responsive to build trust quickly</li>
            </ul>
          </div>

          <div class="warning-box">
            <p><strong>⚠️ Important Purchase Terms:</strong></p>
            <p style="margin: 10px 0 0 0;">This lead purchase is non-refundable. Once purchased, you own exclusive access to this customer's contact information. Please reach out promptly to maximize your conversion opportunity.</p>
          </div>
        </div>

        <div class="footer">
          <p class="footer-brand">Lawn Care Kuna</p>
          <p class="footer-tagline">Lead Distribution Platform</p>
          <p style="font-size: 12px; color: #6b7280; margin: 15px 0;">Questions about your purchase? Contact us anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(purchaserEmail, subject, htmlBody);
}
