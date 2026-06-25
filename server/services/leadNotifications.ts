import { db } from "@/lib/db";
import { notifications } from "@/shared/schema";
import { and, eq } from "drizzle-orm";
import { storage } from "../storage";
import { getUncachableResendClient } from "../resend";
import {
  SITE_BASE_URL,
  escapeHtml,
  htmlToPlainText,
  wrapEmailHtml,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
} from "./emailLayout";

const NEW_LEAD_TYPE = "admin_new_lead";

export interface NewLeadAlert {
  leadId: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  projectType: string | null;
  city: string | null;
  message: string | null;
}

function adminLeadDeepLink(leadId: string): string {
  return `${SITE_BASE_URL}/admin/leads?leadId=${encodeURIComponent(leadId)}`;
}

/**
 * Fires the new-lead alert exactly once per lead: an in-app notification for
 * every admin, a Resend admin email with a deep link, and an optional Twilio
 * SMS (off unless TWILIO_* env is configured). All channels fail soft so a
 * notification problem never blocks lead capture.
 */
export async function notifyNewLead(alert: NewLeadAlert): Promise<void> {
  if (!db) return;

  // Idempotency: if any admin already has a new-lead notification for this lead,
  // assume the alert already fired (handles retries / double submits).
  try {
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.type, NEW_LEAD_TYPE), eq(notifications.leadId, alert.leadId)))
      .limit(1);
    if (existing.length > 0) return;
  } catch (err) {
    console.error("[leadNotifications] idempotency check failed:", err);
  }

  const summary = [alert.projectType, alert.city].filter(Boolean).join(" in ");
  const title = `New lead: ${alert.name || "Unknown"}`;
  const message = summary
    ? `${summary}${alert.phone ? ` | ${alert.phone}` : ""}`
    : alert.phone || alert.email || "New consultation request";

  // In-app notification for every admin.
  try {
    const admins = await storage.getAllAdmins();
    for (const admin of admins) {
      await storage.createNotification({
        userId: admin.id,
        type: NEW_LEAD_TYPE,
        title,
        message,
        leadId: alert.leadId,
      });
    }
  } catch (err) {
    console.error("[leadNotifications] in-app notification failed:", err);
  }

  // Admin email with a deep link to the lead.
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const from = formatFromAddress(fromEmail);
    const link = adminLeadDeepLink(alert.leadId);
    const html = wrapEmailHtml({
      title: "New lead captured",
      subtitle: escapeHtml(alert.name || "Unknown"),
      tagline: "Admin Notifications",
      content: `
        <table class="info-table">
          <tr><td class="label">Name:</td><td class="value">${escapeHtml(alert.name || "Unknown")}</td></tr>
          ${alert.phone ? `<tr><td class="label">Phone:</td><td class="value"><a href="tel:${escapeHtml(alert.phone)}">${escapeHtml(alert.phone)}</a></td></tr>` : ""}
          ${alert.email ? `<tr><td class="label">Email:</td><td class="value"><a href="mailto:${escapeHtml(alert.email)}">${escapeHtml(alert.email)}</a></td></tr>` : ""}
          ${alert.projectType ? `<tr><td class="label">Project:</td><td class="value">${escapeHtml(alert.projectType)}</td></tr>` : ""}
          ${alert.city ? `<tr><td class="label">City:</td><td class="value">${escapeHtml(alert.city)}</td></tr>` : ""}
        </table>
        ${
          alert.message
            ? `<div class="highlight-box"><p><strong>Message:</strong></p><p style="margin-top:8px;">${escapeHtml(alert.message)}</p></div>`
            : ""
        }
        <p style="margin-top:20px;"><a class="button" href="${link}">Open lead in admin</a></p>
      `,
    });

    const adminEmails = await getAdminRecipientEmails();
    for (const adminEmail of adminEmails) {
      await client.emails.send({
        from,
        replyTo: getReplyToAddress(),
        to: adminEmail,
        subject: `New lead: ${alert.name || "Unknown"}`,
        html,
        text: htmlToPlainText(html),
      });
    }
  } catch (err) {
    console.error("[leadNotifications] admin email failed:", err);
  }

  // Optional SMS. Stubbed and off unless Twilio env is fully configured.
  await maybeSendSms(alert);
}

async function maybeSendSms(alert: NewLeadAlert): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.ADMIN_SMS_TO;
  if (!sid || !token || !from || !to) return; // off by default

  try {
    const body = `New lead: ${alert.name || "Unknown"}${alert.phone ? ` (${alert.phone})` : ""}. ${adminLeadDeepLink(alert.leadId)}`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    });
  } catch (err) {
    console.error("[leadNotifications] SMS send failed:", err);
  }
}
