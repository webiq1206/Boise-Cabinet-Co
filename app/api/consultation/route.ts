import { eq } from "drizzle-orm";
import { saveConsultationOnce, ConsultationReplayConflict, CONSULTATION_KEY } from "@/lib/consultationReplay";
import { after, NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultationRequests, leads, submissions, leadQuotes } from "@/shared/schema";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";
import { notifyNewLead } from "@/server/services/leadNotifications";
import { getUncachableResendClient } from "@/server/resend";
import { preferToTextHtml, SITE_CONFIG } from "@/shared/siteConfig";
import {
  escapeHtml,
  wrapEmailHtml,
  htmlToPlainText,
  getAdminRecipientEmails,
  formatFromAddress,
  getReplyToAddress,
  buildLeadReplyTo,
  buildEstimateDetailHtml,
  buildLeadDashboardButton,
  buildOwnerSignatureHtml,
  buildHomeownerStoryHtml,
} from "@/server/services/emailLayout";
import type { PropertyProfile } from "@/shared/propertyProfile";
import { extractZipFromAddress, parseAddressParts } from "@/shared/propertyProfile";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendCapiLead } from "@/lib/analytics/metaCapi";
import { forwardLeadToDashboard } from "@/lib/leadDashboard";
import { forwardConsultationToP5Intake } from "@/server/services/p5IntakeBridge";
import type { EstimateRecord } from "@/shared/estimateRecord";
import { issueDetailsToken } from "@/server/services/consultationDetails";
import { quoteSecret } from "@/server/services/consultationFiles";
import {
  buildLeadNotes,
  consultationBodySchema,
  internalSubject,
  resolveProjectType,
} from "@/server/services/consultationRequest";

const PER_IP_LIMIT = 8;
const PER_IP_WINDOW_MS = 15 * 60 * 1000;

// The body schema lives in server/services/consultationRequest.ts so the full
// request and the "Have us call you" callback shape are tested without a database.
const bodySchema = consultationBodySchema;

/**
 * Step 2 key: lets the browser that sent this request add details and files to
 * it (server/services/consultationDetails.ts). Absent when the server has no
 * SESSION_SECRET; the form then simply does not offer Step 2 or uploads.
 */
function detailsKey(requestId: string | null): { detailsToken?: string; detailsExpiresAt?: string } {
  const issued = requestId ? issueDetailsToken(requestId, quoteSecret()) : null;
  return issued ? { detailsToken: issued.token, detailsExpiresAt: issued.expiresAt } : {};
}

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
    // What every destination stores: the visitor's project type or a sortable
    // default, and their own words led by the callback marker or reply channel.
    const projectType = resolveProjectType(data);
    const notes = buildLeadNotes(data);
    const requestKey = request.headers.get("Idempotency-Key");
    if (requestKey !== null && !CONSULTATION_KEY.test(requestKey)) {
      return NextResponse.json({ accepted: false, message: "Invalid request key." }, { status: 400 });
    }

    if (data.companyWebsite.trim().length > 0) {
      // Silently accept honeypot hits so bots don't adapt.
      return NextResponse.json({ success: true, accepted: false });
    }

    // The geocoder only returns a structured profile when the visitor picks a
    // suggestion. Parsing the address string as a fallback keeps city/state/zip
    // populated on the lead when they type one instead.
    const addressForParse = data.estimateRecord?.propertyAddress || data.address || "";
    const parts = parseAddressParts(addressForParse);
    const zip = data.zip || parts.zip || extractZipFromAddress(data.address) || "";
    const leadCity = (data.propertyProfile?.city as string) || parts.city || "";
    const leadState = (data.propertyProfile?.state as string) || parts.state || "";


    if (!db) {
      return NextResponse.json({ accepted: false, message: "We couldn't save your request. Please try again later or call us directly." }, { status: 503 });
    }
    let dbSaved = false;
    let persistedRequestId: string | null = null;
    // Set once the lead row exists; the admin email's dashboard button uses it
    // to deep link. Stays null when the DB is unavailable, and the button then
    // falls back to the dashboard root.
    let capturedLeadId: string | null = null;
    if (db) {
      const profile = data.propertyProfile as Record<string, unknown> | null | undefined;
      const city = (profile?.city as string) || "";

      try {
        const savedRequest = await saveConsultationOnce(db, requestKey, data as Record<string, unknown>, {
          name: data.name,
          phone: data.phone,
          email: data.email,
          zip,
          address: data.address || null,
          city: city || null,
          propertyProfile: (data.propertyProfile as PropertyProfile | null) ?? null,
          projectType: projectType,
          message: notes || null,
          estimateProject: data.estimate?.project || null,
          estimateFinish: data.estimate?.finish || null,
          estimateLow: data.estimate?.priceLow?.toString() || null,
          estimateHigh: data.estimate?.priceHigh?.toString() || null,
        });
        persistedRequestId = savedRequest.requestId;
        if (savedRequest.replayed) {
          return NextResponse.json({ success: true, accepted: true, persisted: true, replayed: true,
            requestId: savedRequest.requestId, submissionId: data.metaEventId,
            notificationStatus: "unconfirmed", crmRoutingStatus: "unconfirmed",
            ...detailsKey(savedRequest.requestId) });
        }
        dbSaved = true;
      } catch (dbErr) {
        if (dbErr instanceof ConsultationReplayConflict) {
          return NextResponse.json({ accepted: false, message: "This request key was already used. Please contact us before submitting changed details." }, { status: 409 });
        }
        console.error("[consultation] DB insert failed:", dbErr);
        return NextResponse.json({ accepted: false, message: "We couldn't save your request. Please try again later or call us directly." }, { status: 503 });
      }

      // HubSpot contact + mapped deal + lead_created mail live on p5 intake.
      // Started as soon as the lead is durable so it overlaps Resend, and kept
      // alive with after() so the visitor response does not wait on it.
      // Failures stay inside the bridge and cannot change this status.
      try {
        const bridge = forwardConsultationToP5Intake({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: leadCity || city || null,
          zip: zip || null,
          projectType: projectType,
          message: notes,
          inquiryId: persistedRequestId,
          // The family quote form contract (p5 reads these as it adds them).
          requestKind: data.requestKind,
          contactPreference: data.requestKind === "callback" ? "call" : data.preferredContact ?? null,
          bestTime: data.requestKind === "callback" ? data.bestTime : null,
          submissionKind: "initial",
        });
        after(() => bridge);
      } catch (bridgeErr) {
        console.error("[p5-intake] Could not schedule HubSpot bridge:", bridgeErr);
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
            email: data.email || null,
            phone: data.phone,
            address: data.address || null,
            city: city || "Unknown",
            serviceArea: matchServiceArea(city),
            state: stateFromProfile,
            zip: zipFromProfile,
            fullAddress: (profile?.formattedAddress as string) || data.address || null,
            propertyProfile: (data.propertyProfile as PropertyProfile | null) ?? undefined,
            propertyType: "residential",
            serviceType: projectType,
            selectedServices: [projectType],
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
            message: notes || null,
            status: "pending_admin",
            source: data.source,
            sourceDetail:
              data.sourceDetail ??
              (data.source === "assistant" ? "assistant_chat" : "consultation_form"),
            emailStatus: "new",
            pipelineStage: "new",
          })
          .returning({ id: leads.id });

        const leadId = insertedLead?.id;
        // Hoisted out of this block so the admin email below can deep link the
        // dashboard button at the lead that was just created.
        capturedLeadId = leadId ?? null;

        if (leadId) {
          // Link the committed raw receipt; never insert another receipt on replay.
          await db.update(submissions).set({ leadId }).where(eq(submissions.id, persistedRequestId!));

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
            projectType: projectType,
            city: city || null,
            message: notes || null,
            estimate: data.estimate ?? null,
          }, { sendAdminEmail: false });
        }
      } catch (leadErr) {
        console.error("[consultation] Lead mirror insert failed:", leadErr);
      }
    }

    // Mirror the lead to the external Boise Remodeling lead dashboard.
    // Only after a durable local request exists. This does not prove CRM receipt.
    // The zod schema for the record is deliberately permissive (rooms are
    // validated as loose objects so a new field never 400s a real lead), so the
    // parsed type is wider than EstimateRecord. The client builds this with
    // buildEstimateRecord, so the shape is known at runtime.
    const rec = (data.estimateRecord ?? null) as EstimateRecord | null;
    forwardLeadToDashboard({
      fullName: data.name,
      email: data.email,
      phone: data.phone || undefined,
      // The record carries the address the homeowner picked from autocomplete;
      // fall back to the typed field for the lighter forms that have no record.
      propertyAddress: rec?.propertyAddress || data.address || undefined,
      zip: zip || undefined,
      city: leadCity || undefined,
      state: leadState || undefined,
      timeline: data.timeline || undefined,
      // The dashboard shows projectGoals next to projectScope, so the
      // homeowner's own words land in a field of their own rather than only
      // inside the generated block.
      projectGoals: notes || undefined,
      // A multi-room estimate spans several project types; send them all rather
      // than the single collapsed "other".
      projectTypes: rec?.rooms?.length
        ? Array.from(new Set(rec.rooms.map((r) => String(r.projectLabel)).filter(Boolean)))
        : projectType
          ? [projectType]
          : undefined,
      budgetRange: data.budget || rec?.budget || undefined,
      estimateLow: rec?.rangeLow ?? data.estimate?.priceLow,
      estimateHigh: rec?.rangeHigh ?? data.estimate?.priceHigh,
      estimateRange: rec?.rangeFormatted,
      estimate: rec,
      notes: notes || undefined,
    });


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
            <tr><td class="label">Email:</td><td class="value">${data.email ? `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>` : "Not provided"}</td></tr>
            ${zip ? `<tr><td class="label">ZIP:</td><td class="value">${escapeHtml(zip)}</td></tr>` : ""}
            <tr><td class="label">Project:</td><td class="value">${escapeHtml(projectType)}</td></tr>
          </table>
          ${propertyBlock}
          ${estimateDetailBlock}
          <div class="highlight-box">
            <p><strong>Notes from the lead:</strong></p>
            <p style="margin-top:8px;">${escapeHtml(notes || "(none)").replace(/\n/g, "<br>")}</p>
          </div>
          <p style="font-size:13px;margin-top:16px;">Reply to this email to respond directly to ${escapeHtml(data.name)}, or <a href="tel:${escapeHtml(data.phone)}">call ${escapeHtml(data.phone)}</a>.</p>
          ${buildLeadDashboardButton(capturedLeadId)}
          <p style="font-size:12px;color:#888;margin-top:16px;">Submitted via ${escapeHtml(SITE_CONFIG.siteUrl)}</p>
          ${buildOwnerSignatureHtml("Thanks,")}
        `,
      });

      const adminEmails = await getAdminRecipientEmails(SITE_CONFIG.email);
      for (const adminEmail of adminEmails) {
        await client.emails.send({
          from,
          // Reply from the admin's inbox goes straight to the lead.
          replyTo: data.email ? buildLeadReplyTo(data.name, data.email) : getReplyToAddress(),
          to: adminEmail,
          subject: internalSubject(data),
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
          <p>${preferToTextHtml()}</p>
          ${estimateDetailBlock}
          ${buildHomeownerStoryHtml()}
          <p>In the meantime, feel free to call or text me at <a href="${SITE_CONFIG.phoneHref}">${escapeHtml(SITE_CONFIG.phone)}</a>, or just reply to this email with any questions at all.</p>
          ${buildOwnerSignatureHtml()}
        `,
      });

      // A callback or a call/text-only request may come without an email; the
      // team's own email above still goes out.
      if (data.email) {
        await client.emails.send({
          from,
          replyTo: getReplyToAddress(),
          to: data.email,
          subject: "We received your request | Boise Cabinet Co",
          html: customerHtml,
          text: htmlToPlainText(customerHtml),
        });
      }
      emailSent = true;
    } catch (emailErr) {
      console.error("[consultation] Email send failed:", emailErr);
    }

    if (!dbSaved) {
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
      email: data.email || undefined,
      phone: data.phone,
      name: data.name,
      zip,
      clientIp: ip,
      userAgent: request.headers.get("user-agent") || undefined,
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
    });

    return NextResponse.json({
      success: true,
      accepted: true,
      submissionId: data.metaEventId,
      requestId: persistedRequestId,
      persisted: true,
      notificationStatus: emailSent ? "attempted" : "unconfirmed",
      crmRoutingStatus: "unconfirmed",
      ...detailsKey(persistedRequestId),
    });
  } catch (err) {
    console.error("[consultation] Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
