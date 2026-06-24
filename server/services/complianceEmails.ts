import type { User } from "@shared/schema";
import {
  escapeHtml,
  wrapEmailHtml,
  SITE_BASE_URL,
  buildOwnerSignatureHtml,
} from "./emailLayout";
import { sendEmail } from "./emailNotifications";

function contractorName(user: User): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contractor";
}

export async function sendComplianceReminderEmail(
  user: User,
  message: string
): Promise<void> {
  if (!user.email) return;

  const htmlBody = wrapEmailHtml({
    title: "Compliance Reminder",
    subtitle: "Action required",
    tagline: "Contractor Portal",
    content: `
      <p class="greeting">Hi ${escapeHtml(contractorName(user))},</p>
      <div class="highlight-box">
        <p>${escapeHtml(message)}</p>
      </div>
      <p>I will keep nudging you until this is squared away, just so nothing slips through the cracks.</p>
      <div style="text-align:center; margin: 30px 0;">
        <a href="${SITE_BASE_URL}/subcontractor/compliance" class="cta-button">Update Compliance Documents →</a>
      </div>
      ${buildOwnerSignatureHtml()}
    `,
  });

  await sendEmail(
    user.email,
    "Compliance Action Required - Boise Cabinet Co",
    htmlBody
  );
}

export async function sendContractSentEmail(
  user: User,
  contractTitle: string
): Promise<void> {
  if (!user.email) return;

  const prefs = (user.notificationPreferences as Record<string, boolean>) ?? {};
  if (prefs.contractReminders === false) return;

  const htmlBody = wrapEmailHtml({
    title: "Contract Ready for Signature",
    subtitle: escapeHtml(contractTitle),
    tagline: "Contractor Portal",
    content: `
      <p class="greeting">Hi ${escapeHtml(contractorName(user))},</p>
      <p>I have a new contract ready for you to look over and sign: <strong>${escapeHtml(contractTitle)}</strong>. Whenever you get a chance is fine.</p>
      <div style="text-align:center; margin: 30px 0;">
        <a href="${SITE_BASE_URL}/subcontractor/contracts" class="cta-button">Review &amp; Sign Contract →</a>
      </div>
      ${buildOwnerSignatureHtml()}
    `,
  });

  await sendEmail(
    user.email,
    `Contract Ready for Signature: ${contractTitle}`,
    htmlBody
  );
}

export async function sendProjectAssignedEmail(
  user: User,
  projectTitle: string
): Promise<void> {
  if (!user.email) return;

  const htmlBody = wrapEmailHtml({
    title: "New Project Assignment",
    subtitle: escapeHtml(projectTitle),
    tagline: "Contractor Portal",
    content: `
      <p class="greeting">Hi ${escapeHtml(contractorName(user))},</p>
      <p>Good news, I have lined you up for a project: <strong>${escapeHtml(projectTitle)}</strong>. Take a look when you can and reach out if you have any questions.</p>
      <div style="text-align:center; margin: 30px 0;">
        <a href="${SITE_BASE_URL}/subcontractor/projects" class="cta-button">View Project →</a>
      </div>
      ${buildOwnerSignatureHtml()}
    `,
  });

  await sendEmail(
    user.email,
    `New Project Assignment: ${projectTitle}`,
    htmlBody
  );
}
