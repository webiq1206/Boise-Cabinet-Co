import type { User } from "@shared/schema";
import { getUncachableResendClient } from "../resend";

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boiseremodeling.co";

export async function sendComplianceReminderEmail(
  user: User,
  message: string
): Promise<void> {
  const resend = await getUncachableResendClient();
  if (!resend || !user.email) return;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contractor";

  await resend.emails.send({
    from: "Boise Remodeling Co <notifications@boiseremodeling.co>",
    to: user.email,
    subject: "Compliance Action Required - Boise Remodeling Co",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Compliance Reminder</h2>
        <p>Hi ${name},</p>
        <p>${message}</p>
        <p>
          <a href="${SITE_BASE_URL}/subcontractor/compliance" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Update Compliance Documents
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          You will continue to receive reminders until this issue is resolved.
        </p>
      </div>
    `,
  });
}

export async function sendContractSentEmail(
  user: User,
  contractTitle: string
): Promise<void> {
  const resend = await getUncachableResendClient();
  if (!resend || !user.email) return;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contractor";

  await resend.emails.send({
    from: "Boise Remodeling Co <notifications@boiseremodeling.co>",
    to: user.email,
    subject: `Contract Ready for Signature: ${contractTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Contract Ready for Signature</h2>
        <p>Hi ${name},</p>
        <p>A new contract is ready for your review and signature: <strong>${contractTitle}</strong></p>
        <p>
          <a href="${SITE_BASE_URL}/subcontractor/contracts" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Review & Sign Contract
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendProjectAssignedEmail(
  user: User,
  projectTitle: string
): Promise<void> {
  const resend = await getUncachableResendClient();
  if (!resend || !user.email) return;

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contractor";

  await resend.emails.send({
    from: "Boise Remodeling Co <notifications@boiseremodeling.co>",
    to: user.email,
    subject: `New Project Assignment: ${projectTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Project Assignment</h2>
        <p>Hi ${name},</p>
        <p>You have been assigned to project: <strong>${projectTitle}</strong></p>
        <p>
          <a href="${SITE_BASE_URL}/subcontractor/projects" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Project
          </a>
        </p>
      </div>
    `,
  });
}
