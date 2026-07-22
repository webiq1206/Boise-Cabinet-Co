import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { designPricingRequests, cabinetDesigns } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { getUncachableResendClient } from "@/server/resend";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  escapeHtml,
  wrapEmailHtml,
  htmlToPlainText,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
  buildLeadDashboardButton,
  buildOwnerSignatureHtml,
} from "@/server/services/emailLayout";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const PER_IP_LIMIT = 8;
const PER_IP_WINDOW_MS = 15 * 60 * 1000;

const pricingRequestSchema = z.object({
  designId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().refine(phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE),
  message: z.string().optional(),
  roomType: z.string().optional(),
  collectionId: z.string().optional(),
  styleJson: z.record(z.unknown()).optional(),
  layoutSummary: z.record(z.unknown()).optional(),
  selectionsSummary: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`pricing-request:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await request.json();
    const data = pricingRequestSchema.parse(body);

    if (!db) {
      return NextResponse.json({ success: true, id: "local-request" });
    }

    const composedMessage = [
      data.message,
      data.selectionsSummary ? `[Selections]\n${data.selectionsSummary}` : null,
      data.layoutSummary
        ? `[Layout summary, planning only]\n${JSON.stringify(data.layoutSummary, null, 2)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const [pricingRequest] = await db
      .insert(designPricingRequests)
      .values({
        designId: data.designId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: composedMessage || undefined,
        status: "pending",
      })
      .returning();

    if (data.designId) {
      await db
        .update(cabinetDesigns)
        .set({ status: "submitted", updatedAt: new Date() })
        .where(eq(cabinetDesigns.id, data.designId));
    }

    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const from = formatFromAddress(fromEmail);
      const adminHtml = wrapEmailHtml({
        title: "New Design Studio Pricing Request",
        subtitle: escapeHtml(data.name),
        tagline: "Admin Notifications",
        content: `
          <table class="info-table">
            <tr><td class="label">Name:</td><td class="value">${escapeHtml(data.name)}</td></tr>
            <tr><td class="label">Phone:</td><td class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>
            <tr><td class="label">Email:</td><td class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
            ${data.roomType ? `<tr><td class="label">Room:</td><td class="value">${escapeHtml(data.roomType)}</td></tr>` : ""}
            ${data.designId ? `<tr><td class="label">Design ID:</td><td class="value">${escapeHtml(data.designId)}</td></tr>` : ""}
          </table>
          ${composedMessage ? `<div class="highlight-box"><p><strong>Details:</strong></p><p style="margin-top:8px;white-space:pre-wrap;">${escapeHtml(composedMessage)}</p></div>` : ""}
          ${buildLeadDashboardButton()}
          ${buildOwnerSignatureHtml("Thanks,")}
        `,
      });
      const adminEmails = await getAdminRecipientEmails(SITE_CONFIG.email);
      for (const adminEmail of adminEmails) {
        await client.emails.send({
          from,
          replyTo: getReplyToAddress(),
          to: adminEmail,
          subject: `Design pricing request: ${data.name}`,
          html: adminHtml,
          text: htmlToPlainText(adminHtml),
        });
      }
    } catch (emailErr) {
      console.error("[pricing-request] Email send failed:", emailErr);
    }

    return NextResponse.json({ success: true, id: pricingRequest.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Pricing request error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
