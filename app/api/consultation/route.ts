import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultationRequests, leads, submissions, leadQuotes } from "@/shared/schema";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";
import { notifyNewLead } from "@/server/services/leadNotifications";
import { getUncachableResendClient } from "@/server/resend";
import { SITE_CONFIG } from "@/shared/siteConfig";
import {
  escapeHtml,
  wrapEmailHtml,
  htmlToPlainText,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
  buildLeadReplyTo,
  buildEstimateDetailHtml,
  buildOwnerSignatureHtml,
  buildHomeownerStoryHtml,
} from "@/server/services/emailLayout";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { extractZipFromAddress } from "@/shared/propertyProfile";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { phoneHasEnoughDigits, PHONE_VALIDATION_MESSAGE } from "@/shared/phoneValidation";
import { sendCapiLead } from "@/lib/analytics/metaCapi";

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
      sizeLabel: z.string().optional(),
      confidenceLabel: z.string().optional(),
      // Per-room breakdown when the visitor planned multiple rooms at once.
      // Without this the multi-room detail is silently dropped by zod.
      rooms: z
        .array(
          z.object({
            project: z.string(),
            finish: z.string(),
            sizeLabel: z.string(),
            priceLow: z.number(),
            priceHigh: z.number(),
          }),
        )
        .optional(),
    })
    .optional()
    .nullable(),
  /** Shared event id for Meta pixel + Conversions API deduplication. */
  metaEventId: z.string().optional(),
  /** Honeypot - must be empty; bots often fill hidden fields. */
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
      const profile = data.propertyProfile as Record<string, unknown> | null | undefined;
      const city = (profile?.city as string) || "";

      try {
        await db.insert(consultationRequests).values({
          name: data.name,
          phone: data.phone,
          email: data.email,
          zip,
          address: data.address || null,
          city: city || null,
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

      // Mirror the consultation into the admin lead manager so it can be
      // triaged, accepted, and converted to a project from one inbox.
      try {
        const estimateLow = data.estimate?.priceLow;
        const estimateHigh = data.estimate?.priceHigh;
        const finalQuote =
          typeof estimateLow === "number" && typeof estimateHigh === "number"
            ? Math.round((estimateLow + estimateHigh) / 2).toString()
            : typeof estimateHigh === "number"
              ? Math.round(estimateHigh).toString()
              : null;

        const stateFromProfile = (profile?.state as string) || null;
        const zipFromProfile = (profile?.zip as string) || zip || null;
        const emailable = deriveEmailable(data.email, "new");

        const [insertedLead] = await db
          .insert(leads)
          .values({
            leadType: "homeowner",
            emailable,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address || null,
            city: city || "Unknown",
            serviceArea: matchServiceArea(city),
            state: stateFromProfile,
            zip: zipFromProfile,
            fullAddress: (profile?.formattedAddress as string) || data.address || null,
            propertyProfile: (data.propertyProfile as PropertyProfile | null) ?? undefined,
            propertyType: "residential",
            serviceType: data.projectType,
            selectedServices: [data.projectType],
            finalQuote,
            serviceData: data.estimate
              ? {
                  estimate: {
                    project: data.estimate.project,
                    finish: data.estimate.finish,
                    priceLow: data.estimate.priceLow,
                    priceHigh: data.estimate.priceHigh,
                    roi: data.estimate.roi,
                    sizeLabel: data.estimate.sizeLabel,
                    confidenceLabel: data.estimate.confidenceLabel,
                  },
                }
              : null,
            message: data.message || null,
            status: "pending_admin",
            source: "consultation",
            sourceDetail: "consultation_form",
            emailStatus: "new",
            pipelineStage: "new",
          })
          .returning({ id: leads.id });

        const leadId = insertedLead?.id;

        if (leadId) {
          // Immutable raw record of exactly what was submitted.
          await db.insert(submissions).values({
            leadId,
            formType: "consultation",
            rawPayload: data as unknown as Record<string, unknown>,
            sourcePage: "/consultation",
          });

          // Persist the estimator output as a planning range.
          if (data.estimate) {
            await db.insert(leadQuotes).values({
              leadId,
              projectType: data.estimate.project,
              sizeOrScope: data.estimate.sizeLabel ?? null,
              finish: data.estimate.finish,
              planningRangeLow:
                typeof data.estimate.priceLow === "number"
                  ? data.estimate.priceLow.toString()
                  : null,
              planningRangeHigh:
                typeof data.estimate.priceHigh === "number"
                  ? data.estimate.priceHigh.toString()
                  : null,
              estimatorInputs: data.estimate as unknown as Record<string, unknown>,
              status: "sent",
            });
          }

          // Instant, idempotent admin alert (in-app + email, optional SMS).
          await notifyNewLead({
            leadId,
            name: data.name,
            phone: data.phone,
            email: data.email,
            projectType: data.projectType,
            city: city || null,
            message: data.message || null,
            estimate: data.estimate ?? null,
          });
        }
      } catch (leadErr) {
        console.error("[consultation] Lead mirror insert failed:", leadErr);
      }
    }

    let emailSent = false;
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const from = formatFromAddress(fromEmail);

      const est = data.estimate;
      // One complete, self-contained estimate block (total range + every
      // selection, broken out per room) shared by the lead and admin emails,
      // so neither recipient ever needs to log in to understand the estimate.
      const estimateDetailBlock = buildEstimateDetailHtml(est);

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
          ${estimateDetailBlock}
          <div class="highlight-box">
            <p><strong>Notes from the lead:</strong></p>
            <p style="margin-top:8px;">${escapeHtml(data.message || "(none)")}</p>
          </div>
          <p style="font-size:13px;margin-top:16px;">Reply to this email to respond directly to ${escapeHtml(data.name)}, or <a href="tel:${escapeHtml(data.phone)}">call ${escapeHtml(data.phone)}</a>.</p>
          <p style="font-size:12px;color:#888;margin-top:16px;">Submitted via ${escapeHtml(SITE_CONFIG.siteUrl)}</p>
          ${buildOwnerSignatureHtml("Thanks,")}
        `,
      });

      const adminEmails = await getAdminRecipientEmails(SITE_CONFIG.email);
      for (const adminEmail of adminEmails) {
        await client.emails.send({
          from,
          // Reply from the admin's inbox goes straight to the lead.
          replyTo: buildLeadReplyTo(data.name, data.email),
          to: adminEmail,
          subject: `New consultation request: ${data.name}`,
          html: adminHtml,
          text: htmlToPlainText(adminHtml),
        });
      }

      const customerHtml = wrapEmailHtml({
        title: `Thanks, ${escapeHtml(data.name)}!`,
        subtitle: "I got your request",
        tagline: "Custom Cabinets",
        content: `
          <p class="greeting">Hi ${escapeHtml(data.name)},</p>
          <p>Thanks so much for reaching out. I got your request and I will personally be in touch within one business day to set up your free design visit and learn more about what you have in mind.</p>
          ${estimateDetailBlock}
          ${buildHomeownerStoryHtml()}
          <p>In the meantime, feel free to call or text me at <a href="${SITE_CONFIG.phoneHref}">${escapeHtml(SITE_CONFIG.phone)}</a>, or just reply to this email with any questions at all.</p>
          ${buildOwnerSignatureHtml()}
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

    // Server-side Meta conversion (Conversions API). Shares metaEventId with the
    // browser pixel Lead so Meta dedupes the pair. No-ops until
    // META_CAPI_ACCESS_TOKEN is set; never throws.
    await sendCapiLead({
      eventId: data.metaEventId,
      eventSourceUrl: request.headers.get("referer") || `${SITE_CONFIG.siteUrl}/contact`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      zip,
      clientIp: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[consultation] Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
