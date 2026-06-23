/**
 * @deprecated Legacy quote-form email helpers. New flows use `@/server/resend`
 * and `@/server/services/emailLayout`. Kept for the legacy `/api/quotes` pipeline only.
 */
import { Resend } from 'resend';
import { SITE_CONFIG } from '@/shared/siteConfig';
import {
  escapeHtml,
  wrapEmailHtml,
  htmlToPlainText,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
  PLATFORM_EMAIL,
  SITE_BASE_URL,
} from '@/server/services/emailLayout';

async function getCredentials() {
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: PLATFORM_EMAIL
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
  
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: PLATFORM_EMAIL,
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
  return recipients.filter(email => {
    if (isBlockedEmail(email)) {
      console.log(`[RESEND] Blocked email to ${email} (domain on blocklist)`);
      return false;
    }
    return true;
  });
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
    const result = await client.emails.send({
      from: formatFromAddress(from),
      replyTo: getReplyToAddress(),
      to: filteredTo.length === 1 ? filteredTo[0] : filteredTo,
      subject,
      html,
      text: htmlToPlainText(html),
    });
    
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

export async function sendQuoteConfirmationEmail(data: {
  to: string;
  customerName: string;
  quoteId: string;
  address: string;
  city: string;
  services: string[];
}) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const servicesHtml = data.services.map(s => 
    `<li style="padding: 4px 0;">${escapeHtml(formatServiceName(s))}</li>`
  ).join('');

  const html = wrapEmailHtml({
    title: 'Thank You for Your Quote Request!',
    subtitle: `Reference: ${data.quoteId.slice(0, 8)}`,
    tagline: 'Custom Cabinetry',
    content: `
      <p class="greeting">Hi ${escapeHtml(data.customerName)},</p>
      <p>Thank you for contacting Boise Cabinet Co! We've received your request and will be in touch within one business day to schedule your free design consultation.</p>
      <div class="highlight-box">
        <h3 style="margin: 0 0 15px 0; color: inherit;">Quote Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Reference:</strong> ${escapeHtml(data.quoteId.slice(0, 8))}</p>
        <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${escapeHtml(data.address)}, ${escapeHtml(data.city)}, Idaho</p>
        <p style="margin: 0 0 8px 0;"><strong>Services:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">${servicesHtml}</ul>
      </div>
      <p>If you have any questions in the meantime, feel free to call us at <strong>${escapeHtml(SITE_CONFIG.phone)}</strong> or reply to this email.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${SITE_BASE_URL}" class="cta-button">Visit Our Website</a>
      </div>
    `,
  });

  const sent = await sendEmailWithLogging(
    client,
    fromEmail,
    data.to,
    `Quote Request Received - Boise Cabinet Co (Ref: ${data.quoteId.slice(0, 8)})`,
    html,
    'Customer confirmation'
  );
  if (!sent) throw new Error('Failed to send customer email');
}

export async function sendAdminNotificationEmail(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quoteId: string;
  address: string;
  city: string;
  services: string[];
  message?: string;
  propertySize?: number;
}) {
  const { client, fromEmail } = await getUncachableResendClient();
  
  const servicesHtml = data.services.map(s => 
    `<li style="padding: 4px 0;">${escapeHtml(formatServiceName(s))}</li>`
  ).join('');

  const html = wrapEmailHtml({
    title: 'New Quote Request!',
    subtitle: `${escapeHtml(data.customerName)}, ${escapeHtml(data.city)}`,
    tagline: 'Admin Notifications',
    content: `
      <div class="warning-box">
        <p><strong>New lead received!</strong></p>
      </div>
      <div class="section">
        <h2 class="section-title">Customer Information</h2>
        <table class="info-table">
          <tr><td class="label">Name:</td><td class="value">${escapeHtml(data.customerName)}</td></tr>
          <tr><td class="label">Email:</td><td class="value"><a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></td></tr>
          <tr><td class="label">Phone:</td><td class="value"><a href="${SITE_CONFIG.phoneHref}">${escapeHtml(data.customerPhone)}</a></td></tr>
          <tr><td class="label">Address:</td><td class="value">${escapeHtml(data.address)}, ${escapeHtml(data.city)}, Idaho</td></tr>
          ${data.propertySize ? `<tr><td class="label">Property Size:</td><td class="value">${data.propertySize.toLocaleString()} sq ft</td></tr>` : ''}
        </table>
      </div>
      <div class="section">
        <h2 class="section-title">Quote Details</h2>
        <table class="info-table">
          <tr><td class="label">Reference:</td><td class="value">${escapeHtml(data.quoteId)}</td></tr>
          <tr>
            <td class="label" style="vertical-align: top;">Services:</td>
            <td class="value"><ul style="margin: 0; padding-left: 20px;">${servicesHtml}</ul></td>
          </tr>
        </table>
      </div>
      ${data.message ? `
      <div class="highlight-box">
        <strong>Customer Notes:</strong>
        <p style="margin: 8px 0 0 0;">${escapeHtml(data.message)}</p>
      </div>
      ` : ''}
      <div style="text-align: center; margin-top: 30px;">
        <a href="${SITE_BASE_URL}/admin" class="cta-button">View in Admin Dashboard</a>
      </div>
    `,
  });

  const subject = `New Quote: ${data.customerName} - ${data.city} (${data.services.length} services)`;
  const adminEmails = await getAdminRecipientEmails(SITE_CONFIG.email);
  let anySuccess = false;

  for (let i = 0; i < adminEmails.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 700));
    const sent = await sendEmailWithLogging(
      client,
      fromEmail,
      adminEmails[i],
      subject,
      html,
      `Admin notification (${adminEmails[i]})`
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

