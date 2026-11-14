import { and, eq, inArray } from "drizzle-orm";
import { after, NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";
import { consultationFiles, consultationRequests, leads, submissions } from "@/shared/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { getUncachableResendClient } from "@/server/resend";
import {
  buildLeadDashboardButton,
  escapeHtml,
  formatFromAddress,
  getAdminRecipientEmails,
  getReplyToAddress,
  htmlToPlainText,
  wrapEmailHtml,
} from "@/server/services/emailLayout";
import {
  CABINET_EMAIL_ACCENT,
  requestConfirmation,
} from "@/server/services/leadConfirmationEmail";
import {
  detailsBodySchema,
  detailsDigest,
  detailsSubmissionId,
  isDefaultProjectType,
  mergeDetails,
  presentFields,
  splitAddress,
  verifyDetailsToken,
} from "@/server/services/consultationDetails";
import { quoteSecret, signedFileUrl, type QuoteFileLink } from "@/server/services/consultationFiles";
import { ensureConsultationFilesTable } from "@/server/services/consultationFileStore";
import { buildP5DetailsBody, forwardConsultationToP5Intake } from "@/server/services/p5IntakeBridge";

/**
 * Step 2 of the quote form ("Help us prepare (optional)") and the
 * announcement of uploaded files: adds to the SAME request Step 1 saved.
 * Validates the details token, merges without overwriting Step 1 answers,
 * appends a "DETAILS ADDED" block to the request and the lead manager notes,
 * then tells the team (a short "Details added" email) and p5 intake
 * (submission_kind "details", same external_id) so HubSpot gets it too.
 * The same post twice changes nothing the second time.
 *
 * Not re-forwarded: the external Boise Remodeling lead dashboard. It accepts
 * new leads only (no update by id), so a second post would create a duplicate
 * lead there; the details reach the team through the email, the local lead
 * manager and HubSpot instead.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 15 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

function fail(status: number, message: string) {
  return NextResponse.json({ ok: false, message }, { status });
}

type Step1Payload = {
  requestKind?: "request" | "callback";
  preferredContact?: "call" | "text" | "email";
};

export async function POST(request: NextRequest) {
  const limited = rateLimit(`consultation-details:${getClientIp(request)}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
  if (!limited.ok) return fail(429, "Too many requests. Please wait a moment and try again.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail(413, "Request too large.");

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail(400, "We could not read those details. Please try again.");
  }
  const parsed = detailsBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Please check those details.", errors: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  const check = verifyDetailsToken(body.requestId, body.token, quoteSecret());
  if (check !== "ok") {
    return fail(check === "expired" ? 410 : 403, "This page has expired. Please call or text us with the details.");
  }
  const fields = presentFields(body.fields);
  const fileIds = [...new Set(body.fileIds)];
  if (!Object.keys(fields).length && !fileIds.length) return fail(400, "There was nothing to save.");
  if (!db) return fail(503, "We could not save those details right now. Please call or text us.");
  const database = db;

  try {
    if (fileIds.length) await ensureConsultationFilesTable(database);
    const fileRows = fileIds.length
      ? await database
          .select({
            id: consultationFiles.id,
            name: consultationFiles.name,
            contentType: consultationFiles.contentType,
            size: consultationFiles.sizeBytes,
          })
          .from(consultationFiles)
          .where(and(eq(consultationFiles.requestId, body.requestId), inArray(consultationFiles.id, fileIds)))
      : [];
    const files: QuoteFileLink[] = fileRows.flatMap((row) => {
      const url = signedFileUrl(row.id);
      return url ? [{ id: row.id, name: row.name, contentType: row.contentType, size: row.size, url }] : [];
    });
    if (!Object.keys(fields).length && !files.length) return fail(400, "Those files were not found on this request.");

    const digest = detailsDigest(fields, files.map((file) => file.id));
    const outcome = await database.transaction(async (tx) => {
      const [stored] = await tx
        .select()
        .from(consultationRequests)
        .where(eq(consultationRequests.id, body.requestId))
        .limit(1);
      if (!stored) return { status: "missing" as const };
      const [original] = await tx
        .select({ leadId: submissions.leadId, payload: submissions.rawPayload })
        .from(submissions)
        .where(eq(submissions.id, body.requestId))
        .limit(1);
      const inserted = await tx
        .insert(submissions)
        .values({
          id: detailsSubmissionId(body.requestId, digest),
          leadId: original?.leadId ?? null,
          formType: "consultation_details",
          rawPayload: { requestId: body.requestId, kind: body.kind, fields, fileIds: files.map((file) => file.id) },
          sourcePage: "/consultation/details",
        })
        .onConflictDoNothing({ target: submissions.id })
        .returning({ id: submissions.id });
      if (!inserted.length) return { status: "replayed" as const };

      const merge = mergeDetails(
        {
          projectType: stored.projectType,
          zip: stored.zip,
          address: stored.address,
          city: stored.city,
          email: stored.email,
          message: stored.message,
        },
        fields,
        files,
      );
      if (Object.keys(merge.set).length) {
        await tx.update(consultationRequests).set(merge.set).where(eq(consultationRequests.id, body.requestId));
      }
      const leadId = original?.leadId ?? null;
      if (leadId) {
        const [lead] = await tx.select().from(leads).where(eq(leads.id, leadId)).limit(1);
        if (lead) {
          const leadSet: Partial<typeof leads.$inferInsert> = {};
          if (merge.block) leadSet.message = [lead.message?.trim(), merge.block].filter(Boolean).join("\n\n");
          if (merge.set.projectType && isDefaultProjectType(lead.serviceType)) {
            leadSet.serviceType = merge.set.projectType;
            leadSet.selectedServices = [merge.set.projectType];
          }
          if (merge.given.zip && !lead.zip) leadSet.zip = merge.given.zip;
          if (merge.set.address && !lead.address) {
            leadSet.address = merge.set.address;
            if (!lead.fullAddress) leadSet.fullAddress = merge.set.address;
          }
          if (merge.given.city && (!lead.city || lead.city === "Unknown")) {
            leadSet.city = merge.given.city;
            leadSet.serviceArea = matchServiceArea(merge.given.city);
          }
          if (fields.email && !lead.email) {
            leadSet.email = fields.email;
            leadSet.emailable = deriveEmailable(fields.email, lead.emailStatus);
          }
          if (Object.keys(leadSet).length) await tx.update(leads).set(leadSet).where(eq(leads.id, leadId));
        }
      }
      return {
        status: "saved" as const,
        stored,
        merge,
        leadId,
        step1: (original?.payload ?? {}) as Step1Payload,
      };
    });

    if (outcome.status === "missing") return fail(404, "We could not find that request. Please call or text us.");
    if (outcome.status === "replayed") return NextResponse.json({ ok: true, replayed: true });

    const { stored, merge, leadId, step1 } = outcome;
    const name = stored.name;
    const requestKind = step1.requestKind === "callback" ? "callback" : "request";
    // Step 1 already confirmed the lead when it had an email. This step sends
    // the same note once, and only when it is what first records an address.
    const confirmationEmail = typeof merge.set.email === "string" ? merge.set.email.trim() : "";
    if (confirmationEmail) {
      const confirmation = requestConfirmation({
        firstName: name,
        brandName: SITE_CONFIG.name,
        intent: requestKind === "callback" ? "consult" : "walkthrough",
        phone: SITE_CONFIG.phone,
        accent: CABINET_EMAIL_ACCENT,
      });
      after(async () => {
        try {
          const { client, fromEmail } = await getUncachableResendClient();
          await client.emails.send({
            from: formatFromAddress(fromEmail),
            replyTo: getReplyToAddress(),
            to: confirmationEmail,
            subject: confirmation.subject,
            html: confirmation.html,
            text: confirmation.text,
          });
        } catch (emailErr) {
          console.error("[consultation-details] Customer confirmation failed:", emailErr);
        }
      });
    }
    const place = fields.address ? splitAddress(fields.address) : null;

    // HubSpot by way of p5 intake: same brand and external_id, submission_kind "details".
    try {
      const p5 = forwardConsultationToP5Intake({
        body: buildP5DetailsBody({
          name,
          email: fields.email || stored.email,
          phone: stored.phone,
          inquiryId: body.requestId,
          requestKind,
          contactPreference: requestKind === "callback" ? "call" : step1.preferredContact ?? null,
          projectType: fields.projectType ?? null,
          address: place?.address || null,
          zip: place?.zip || null,
          city: place?.city || null,
          timeline: fields.timing ?? null,
          bestTime: fields.bestTime ?? null,
          files: files.map(({ name: fileName, url, contentType, size }) => ({ name: fileName, url, contentType, size })),
          lines: merge.lines,
        }),
      });
      after(() => p5);
    } catch (bridgeErr) {
      console.error("[p5-intake] Could not schedule the details post:", bridgeErr);
    }

    // The team: a short follow-up to the original "New consultation request".
    after(async () => {
      try {
        const { client, fromEmail } = await getUncachableResendClient();
        const html = wrapEmailHtml({
          title: body.kind === "files" ? "Files added" : "Details added",
          subtitle: escapeHtml(name),
          tagline: "Admin Notifications",
          content: `
            <p>${escapeHtml(name)} (<a href="tel:${escapeHtml(stored.phone)}">${escapeHtml(stored.phone)}</a>) added to the request they sent earlier.</p>
            <div class="highlight-box">
              ${merge.lines
                .map((line) => {
                  const link = /^- (.*): (https:\/\/\S+)$/.exec(line);
                  return link
                    ? `<p>&bull; <a href="${escapeHtml(link[2])}">${escapeHtml(link[1])}</a></p>`
                    : `<p>${escapeHtml(line)}</p>`;
                })
                .join("")}
            </div>
            ${buildLeadDashboardButton(leadId)}
            <p style="font-size:12px;color:#888;margin-top:16px;">Submitted via ${escapeHtml(SITE_CONFIG.siteUrl)}</p>
          `,
        });
        const recipients = await getAdminRecipientEmails(SITE_CONFIG.email);
        for (const to of recipients) {
          await client.emails.send({
            from: formatFromAddress(fromEmail),
            replyTo: getReplyToAddress(),
            to,
            subject: `${body.kind === "files" ? "Files added" : "Details added"}: ${name}`,
            html,
            text: htmlToPlainText(html),
          });
        }
      } catch (emailErr) {
        console.error("[consultation-details] Email send failed:", emailErr);
      }
    });

    return NextResponse.json({ ok: true, saved: Object.keys(fields), files: files.length });
  } catch (error) {
    console.error("[consultation-details] failed:", error instanceof Error ? error.message : error);
    return fail(503, "We could not save those details right now. Please call or text us.");
  }
}
