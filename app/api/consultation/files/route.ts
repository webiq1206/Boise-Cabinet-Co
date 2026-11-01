import { and, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { consultationFiles } from "@/shared/schema";
import { QUOTE_FILE_MAX_BYTES, QUOTE_FILE_MAX_COUNT } from "@/shared/quoteFiles";
import { verifyDetailsToken } from "@/server/services/consultationDetails";
import { checkUploadedFile, quoteSecret } from "@/server/services/consultationFiles";
import { ensureConsultationFilesTable } from "@/server/services/consultationFileStore";

/**
 * One attachment for a quote request that has already been accepted (the
 * quote form's "Add photos, plans or files" tile). The lead is saved first by
 * /api/consultation; this route only ever adds to it, so a failed or slow
 * upload can never cost the lead. The request's details token proves the
 * caller is the browser that sent it. Files go to Postgres
 * (consultation_files); nothing is listed or public. The links that reach the
 * team are signed (server/services/consultationFiles.ts), and the files are
 * announced to the team by /api/consultation/details once uploaded.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_IP_LIMIT = 40;
const PER_IP_WINDOW_MS = 15 * 60 * 1000;
/** Multipart overhead on top of the largest allowed file. */
const MAX_BODY_BYTES = QUOTE_FILE_MAX_BYTES + 512 * 1024;

function fail(status: number, message: string, headers?: Record<string, string>) {
  return NextResponse.json({ ok: false, message }, { status, headers });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`consultation-files:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
  if (!limited.ok) {
    return fail(429, "Too many uploads. Please wait a moment, or text the files to us.", {
      "Retry-After": String(limited.retryAfter),
    });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return fail(413, "That file is too large to attach here. Please text it to us.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "We could not read that upload. Please try again.");
  }
  const requestId = String(form.get("requestId") ?? "").trim();
  const token = String(form.get("token") ?? "").trim();
  const file = form.get("file");
  if (!requestId || !token || !(file instanceof File)) return fail(400, "We could not read that upload. Please try again.");

  const check = verifyDetailsToken(requestId, token, quoteSecret());
  if (check !== "ok") {
    return fail(check === "expired" ? 410 : 403, "This page has expired for uploads. Please text the files to us.");
  }
  if (!db) return fail(503, "We could not save that file right now. Please text it to us.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const stored = checkUploadedFile({ name: file.name, type: file.type, size: file.size }, bytes);
  if (!stored.ok) return fail(stored.status, stored.message);

  try {
    await ensureConsultationFilesTable(db);
    const [existing] = await db
      .select({ id: consultationFiles.id })
      .from(consultationFiles)
      .where(and(eq(consultationFiles.requestId, requestId), eq(consultationFiles.sha256, stored.sha256)))
      .limit(1);
    if (existing) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        file: { id: existing.id, name: stored.name, size: bytes.length, contentType: stored.contentType },
      });
    }
    const [{ value: already } = { value: 0 }] = await db
      .select({ value: count() })
      .from(consultationFiles)
      .where(eq(consultationFiles.requestId, requestId));
    if (Number(already) >= QUOTE_FILE_MAX_COUNT) {
      return fail(409, `This request already has ${QUOTE_FILE_MAX_COUNT} files. Please text any others to us.`);
    }
    const [row] = await db
      .insert(consultationFiles)
      .values({
        requestId,
        name: stored.name,
        contentType: stored.contentType,
        sizeBytes: bytes.length,
        sha256: stored.sha256,
        dataBase64: Buffer.from(bytes).toString("base64"),
      })
      .onConflictDoNothing()
      .returning({ id: consultationFiles.id });
    let id = row?.id;
    if (!id) {
      const [raced] = await db
        .select({ id: consultationFiles.id })
        .from(consultationFiles)
        .where(and(eq(consultationFiles.requestId, requestId), eq(consultationFiles.sha256, stored.sha256)))
        .limit(1);
      id = raced?.id;
    }
    if (!id) return fail(503, "We could not save that file right now. Please text it to us.");
    return NextResponse.json({
      ok: true,
      file: { id, name: stored.name, size: bytes.length, contentType: stored.contentType },
    });
  } catch (error) {
    console.error("[consultation-files] store failed:", error instanceof Error ? error.message : error);
    return fail(503, "We could not save that file right now. Please text it to us.");
  }
}
