import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultationRequests } from "@/shared/schema";
import { getUncachableResendClient } from "@/server/resend";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  escapeHtml,
  wrapEmailHtml,
  htmlToPlainText,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
} from "@/server/services/emailLayout";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { extractZipFromAddress } from "@/shared/propertyProfile";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";

const PER_IP_LIMIT = 8;
const PER_IP_WINDOW_MS = 15 * 60 * 1000;

const propertyProfileSchema = z
  .object({
    formattedAddress: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  })
  .passthrough()
  .optional()
  .nullable();

const bodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().refine(phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE),
  email: z.string().email(),
  address: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  projectType: z.string().min(1),
  message: z.string().optional(),
  propertyProfile: propertyProfileSchema,
  estimate: z
    .object({
      project: z.string(),
      finish: z.string(),
      priceLow: z.number(),
      priceHigh: z.number(),
      roi: z.number(),
    })
    .optional()
    .nullable(),
  /** Honeypot — must be empty; bots often fill hidden fields. */
  companyWebsite: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`consultation:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.companyWebsite.trim().length > 0) {
      // Silently accept honeypot hits so bots don't adapt.
      return NextResponse.json({ success: true });
    }

    const zip = data.zip || extractZipFromAddress(data.address) || "";

    let dbSaved = false;
    if (db) {
      try {
        const profile = data.propertyProfile as Record<string, unknown> | null | undefined;
        await db.insert(consultationRequests).values({
          name: data.name,
          phone: data.phone,
          email: data.email,
          zip,
          address: data.address || null,
          city: (profile?.city as string) || null,
          propertyProfile: (data.propertyProfile as PropertyProfile | null) ?? null,
          projectType: data.projectType,
          message: data.message || null,
          estimateProject: data.estimate?.project || null,
          estimateFinish: data.estimate?.finish || null,
          estimateLow: data.estimate?.priceLow?.toString() || null,
          estimateHigh: data.estimate?.priceHigh?.toString() || null,
        });
        dbSaved = true;
      } catch (dbErr) {
        console.error("[consultation] DB insert failed:", dbErr);
      }
    }

    let emailSent = false;
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const from = formatFromAddress(fromEmail);

      const estimateBlock = data.estimate
        ? `<p><strong>Calculator estimate:</strong> ${escapeHtml(data.estimate.project)} (${escapeHtml(data.estimate.finish)}): $${Math.round(data.estimate.priceLow / 1000)}k to $${Math.round(data.estimate.priceHigh / 1000)}k</p>`
        : "";

      const profile = data.propertyProfile as {
        parcelId?: string;
        squareFootage?: number;
        lotSizeSqFt?: number;
        permittingAuthority?: string;
        jurisdiction?: string;
      } | null | undefined;
      const propertyBlock = profile
        ? `<div class="highlight-box" style="margin-top:12px;">
            <p><strong>Property (auto-enriched):</strong></p>
            <p style="margin-top:6px;">${escapeHtml(data.address)}</p>
            ${profile.parcelId ? `<p>Parcel: ${escapeHtml(profile.parcelId)}</p>` : ""}
            ${profile.squareFootage ? `<p>~${profile.squareFootage.toLocaleString()} sq ft</p>` : ""}
            ${profile.lotSizeSqFt ? `<p>Lot: ${profile.lotSizeSqFt.toLocaleString()} sq ft</p>` : ""}
            ${profile.permittingAuthority ? `<p>Permits: ${escapeHtml(profile.permittingAuthority)}</p>` : ""}
          </div>`
        : data.address
          ? `<p><strong>Address:</strong> ${escapeHtml(data.address)}</p>`
          : zip
            ? `<p><strong>Address:</strong> Not provided (ZIP ${escapeHtml(zip)})</p>`
            : `<p><strong>Address:</strong> Not provided</p>`;

      const adminHtml = wrapEmailHtml({
        title: "New Consultation Request",
        subtitle: escapeHtml(data.name),
        tagline: "Admin Notifications",
        content: `
          <table class="info-table">
            <tr><td class="label">Name:</td><td class="value">${escapeHtml(data.name)}</td></tr>
            <tr><td class="label">Phone:</td><td class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td></tr>
            <tr><td class="label">Email:</td><td class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
            ${zip ? `<tr><td class="label">ZIP:</td><td class="value">${escapeHtml(zip)}</td></tr>` : ""}
            <tr><td class="label">Project:</td><td class="value">${escapeHtml(data.projectType)}</td></tr>
          </table>
          ${propertyBlock}
          ${estimateBlock}
          <div class="highlight-box">
            <p><strong>Message:</strong></p>
            <p style="margin-top:8px;">${escapeHtml(data.message || "(none)")}</p>
          </div>
          <p style="font-size:12px;color:#888;margin-top:16px;">Submitted via ${escapeHtml(SITE_CONFIG.siteUrl)}</p>
        `,
      });

      const adminEmails = await getAdminRecipientEmails(SITE_CONFIG.email);
      for (const adminEmail of adminEmails) {
        await client.emails.send({
          from,
          replyTo: getReplyToAddress(),
          to: adminEmail,
          subject: `New consultation request: ${data.name}`,
          html: adminHtml,
          text: htmlToPlainText(adminHtml),
        });
      }

      const customerHtml = wrapEmailHtml({
        title: `Thanks, ${escapeHtml(data.name)}!`,
        subtitle: "We received your consultation request",
        tagline: "Custom Cabinets",
        content: `
          <p class="greeting">We received your cabinet consultation request and will reach out within one business day to schedule your free design visit.</p>
          <p>In the meantime, feel free to call us at <a href="${SITE_CONFIG.phoneHref}">${escapeHtml(SITE_CONFIG.phone)}</a> or reply to this email with any questions.</p>
          <p style="margin-top:24px;">The Boise Cabinet Co team</p>
        `,
      });

      await client.emails.send({
        from,
        replyTo: getReplyToAddress(),
        to: data.email,
        subject: "We received your request | Boise Cabinet Co",
        html: customerHtml,
        text: htmlToPlainText(customerHtml),
      });
      emailSent = true;
    } catch (emailErr) {
      console.error("[consultation] Email send failed:", emailErr);
    }

    if (!dbSaved && !emailSent) {
      return NextResponse.json(
        {
          message:
            "We couldn't save your request right now. Please try again in a moment or call us directly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[consultation] Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
