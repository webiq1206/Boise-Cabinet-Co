import { getUncachableResendClient } from './resend';

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
    const { client: resend, fromEmail } = await getUncachableResendClient();

    // Email to business owner
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
            <h1>🌱 New Quote Request</h1>
            <p>Lawn Care Kuna Website</p>
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
                ${propertySize ? `
                <tr>
                  <td class="label">Property Size:</td>
                  <td class="value">${propertySize.toLocaleString()} sq ft</td>
                </tr>
                ` : ''}
                ${propertyType ? `
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
                ${selectedServices && selectedServices.length > 0 ? `
                <tr>
                  <td class="label">Additional Services:</td>
                  <td class="value">${selectedServices.join(', ')}</td>
                </tr>
                ` : ''}
                ${finalQuote ? `
                <tr>
                  <td class="label">AI-Generated Quote:</td>
                  <td class="value" style="font-size: 20px; font-weight: 600; color: #166534;">$${finalQuote.toLocaleString()}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="highlight-box">
              <p><strong>⏰ Action Required:</strong> Please follow up with this customer within 24 hours to provide a detailed quote and schedule their service.</p>
            </div>
          </div>

          <div class="footer">
            <p class="footer-brand">Lawn Care Kuna</p>
            <p class="footer-tagline">Kuna, Idaho's Most Trusted Lawn Care & Landscaping Service</p>
            <p class="footer-contact">📧 <a href="mailto:${fromEmail}">${fromEmail}</a></p>
            <p class="footer-contact">🌐 <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
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
            <h1>🌱 Thank You for Your Request</h1>
            <p>We're excited to help transform your outdoor space!</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${customerName},</p>
            
            <p style="color: #4b5563; margin: 0 0 20px 0;">Thank you for choosing Lawn Care Kuna for your ${serviceType.toLowerCase()} needs. We've received your quote request and our team is reviewing the details.</p>

            <div class="highlight-box">
              <p><strong>✅ What happens next?</strong></p>
              <p style="margin: 10px 0 0 0;">Our team will contact you within 24 hours with a detailed quote tailored to your property's specific needs. We'll answer any questions and help you schedule your service at a time that works best for you.</p>
            </div>

            <div class="section">
              <h2 class="section-title">Your Request Summary</h2>
              <table class="info-table">
                <tr>
                  <td class="label">Service:</td>
                  <td class="value">${serviceType}</td>
                </tr>
                <tr>
                  <td class="label">Location:</td>
                  <td class="value">${city}${address ? `, ${address}` : ''}</td>
                </tr>
                ${frequency ? `
                <tr>
                  <td class="label">Frequency:</td>
                  <td class="value">${frequency}</td>
                </tr>
                ` : ''}
                ${finalQuote ? `
                <tr>
                  <td class="label">Estimated Investment:</td>
                  <td class="value" style="font-size: 20px; font-weight: 600; color: #166534;">$${finalQuote.toLocaleString()}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${finalQuote ? `
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>💡 About Your Estimate:</strong> This is an AI-generated estimate based on typical projects. Your final quote will be customized after we assess your property's unique characteristics and your specific preferences.</p>
              </div>
            ` : ''}

            <div class="divider"></div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4b5563; margin: 0 0 10px 0;"><strong>Have questions?</strong></p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">You can reply to this email or give us a call anytime.</p>
            </div>
          </div>

          <div class="footer">
            <p class="footer-brand">Lawn Care Kuna</p>
            <p class="footer-tagline">Kuna, Idaho's Most Trusted Lawn Care & Landscaping Service</p>
            <p class="footer-contact">📧 <a href="mailto:${fromEmail}">${fromEmail}</a></p>
            <p class="footer-contact">📞 (208) 352-2011</p>
            <p class="footer-contact">📍 2283 N Coopers Hawk Ave, Kuna, ID 83634</p>
            <p class="footer-contact">🌐 <a href="https://lawncarekuna.com">www.lawncarekuna.com</a></p>
            <p style="font-size: 12px; color: #9ca3af; margin: 15px 0 0 0;">Serving Kuna, Boise, Meridian, Nampa, Caldwell, Eagle, Star & Middleton</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to business owner
    await resend.emails.send({
      from: `Lawn Care Kuna <${fromEmail}>`,
      to: fromEmail,
      subject: `🌱 New Quote Request - ${customerName} (${city})`,
      html: ownerEmailHtml,
      replyTo: customerEmail
    });

    // Send confirmation email to customer
    if (customerEmail) {
      await resend.emails.send({
        from: `Lawn Care Kuna <${fromEmail}>`,
        to: customerEmail,
        subject: `Your Quote Request Received - Lawn Care Kuna`,
        html: customerEmailHtml
      });
    }

    console.log('Quote notification emails sent successfully via Resend');
    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return { success: false, message: 'Failed to send email', error };
  }
}
