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
    await resend.emails.send({
      from: `Lawn Care Kuna <${fromEmail}>`,
      to: fromEmail,
      subject: `New Quote Request - ${customerName} (${city})`,
      html: ownerEmailHtml,
      replyTo: customerEmail
    });

    // Send confirmation email to customer
    if (customerEmail) {
      await resend.emails.send({
        from: `Lawn Care Kuna <${fromEmail}>`,
        to: customerEmail,
        subject: 'Your Lawn Care Quote Request - Lawn Care Kuna',
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
