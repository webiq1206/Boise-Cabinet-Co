/**
 * Step 2 of the quote form: "Help us prepare (optional)" on the success
 * screen, and the files the visitor attached, both added to the SAME request.
 *
 * - Step 1 (/api/consultation) answers with a short-lived details token: an
 *   HMAC of the request id and an expiry, signed with SESSION_SECRET. Only the
 *   browser that sent the request holds it, so only that visitor can add to it.
 * - Step 2 (/api/consultation/details) and the file uploads
 *   (/api/consultation/files) must present that token for that request id.
 * - The merge never overwrites a Step 1 answer with a blank, fills the stored
 *   project type, address and email only where Step 1 left them empty or at a
 *   default, and appends a "DETAILS ADDED" block to the notes so the team sees
 *   exactly what arrived later.
 * - The same details posted twice (a double tap, a retry) change nothing the
 *   second time: the digest of the details is the idempotency key.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { extractZipFromAddress, parseAddressParts } from "@/shared/propertyProfile";
import { formatFileSize } from "@/shared/quoteFiles";
import { CALLBACK_PROJECT_TYPE, DEFAULT_PROJECT_TYPE, optionalEmailSchema } from "@/server/services/consultationRequest";
import type { QuoteFileLink } from "@/server/services/consultationFiles";

/** Long enough to add details and retry an upload on a slow phone; short enough to be a one-visit key. */
export const DETAILS_TOKEN_TTL_SECONDS = 2 * 60 * 60;

function b64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function tokenSignature(requestId: string, exp: number, secret: string): string {
  return b64url(createHmac("sha256", secret).update(`consultation-details:v1:${requestId}:${exp}`).digest());
}

/** "<expiry seconds>.<signature>", or null when the server has no secret (Step 2 is then not offered). */
export function issueDetailsToken(
  requestId: string,
  secret: string | null,
  now: number = Date.now(),
  ttlSeconds: number = DETAILS_TOKEN_TTL_SECONDS,
): { token: string; expiresAt: string } | null {
  if (!secret || !requestId) return null;
  const exp = Math.floor(now / 1000) + ttlSeconds;
  return { token: `${exp}.${tokenSignature(requestId, exp, secret)}`, expiresAt: new Date(exp * 1000).toISOString() };
}

export type DetailsTokenCheck = "ok" | "expired" | "invalid";

export function verifyDetailsToken(
  requestId: string,
  token: string,
  secret: string | null,
  now: number = Date.now(),
): DetailsTokenCheck {
  if (!secret || !requestId || typeof token !== "string") return "invalid";
  const match = /^(\d{9,11})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return "invalid";
  const exp = Number(match[1]);
  const expected = Buffer.from(tokenSignature(requestId, exp, secret));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  return exp * 1000 > now ? "ok" : "expired";
}

/** The project types Step 2 offers as chips (the values the consultation form always sent). */
export const DETAILS_PROJECT_TYPES = ["kitchen", "bathroom", "laundry", "closet", "other"] as const;
export const DETAILS_PROJECT_LABELS: Record<(typeof DETAILS_PROJECT_TYPES)[number], string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom vanity",
  laundry: "Laundry or mudroom",
  closet: "Closet or storage",
  other: "Something else",
};
export const DETAILS_TIMINGS = ["Soon", "1 to 3 months", "3 to 6 months", "Just planning"] as const;
export const DETAILS_BEST_TIMES = ["Any time", "Morning", "Midday", "Afternoon"] as const;

export const detailsFieldsSchema = z
  .object({
    projectType: z.enum(DETAILS_PROJECT_TYPES).optional(),
    address: z.string().trim().max(300).optional().default(""),
    timing: z.enum(DETAILS_TIMINGS).optional(),
    bestTime: z.enum(DETAILS_BEST_TIMES).optional(),
    email: optionalEmailSchema,
  })
  .strict();

export type DetailsFields = z.infer<typeof detailsFieldsSchema>;

export const detailsBodySchema = z.object({
  requestId: z.string().trim().min(1).max(200),
  token: z.string().trim().min(1).max(200),
  /** "details" from the Step 2 panel; "files" when the Step 1 attachments finish uploading. */
  kind: z.enum(["details", "files"]).optional().default("details"),
  fields: detailsFieldsSchema.optional().default({}),
  fileIds: z.array(z.string().uuid()).max(10).optional().default([]),
});

export type DetailsBody = z.infer<typeof detailsBodySchema>;

/** Only what the visitor actually gave: blanks and absent answers are dropped. */
export function presentFields(fields: Partial<DetailsFields>): Partial<DetailsFields> {
  const out: Partial<DetailsFields> = {};
  if (fields.projectType) out.projectType = fields.projectType;
  if (fields.address?.trim()) out.address = fields.address.trim();
  if (fields.timing) out.timing = fields.timing;
  if (fields.bestTime) out.bestTime = fields.bestTime;
  if (fields.email?.trim()) out.email = fields.email.trim();
  return out;
}

/** Idempotency key for one details post: same answers and same files, same digest. */
export function detailsDigest(fields: Partial<DetailsFields>, fileIds: string[]): string {
  const present = presentFields(fields);
  const canonical = JSON.stringify({
    fields: Object.fromEntries(Object.keys(present).sort().map((key) => [key, present[key as keyof DetailsFields]])),
    files: [...new Set(fileIds)].sort(),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

/** Submission row id for a details post (submissions.id is the idempotency key). */
export function detailsSubmissionId(requestId: string, digest: string): string {
  return `consultation-details:${requestId}:${digest.slice(0, 32)}`;
}

/** A stored project type the visitor never really chose, so Step 2 may fill it. */
export function isDefaultProjectType(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return (
    !trimmed ||
    trimmed === DEFAULT_PROJECT_TYPE ||
    trimmed === CALLBACK_PROJECT_TYPE ||
    trimmed.endsWith(`: ${CALLBACK_PROJECT_TYPE}`)
  );
}

/** "83702" alone is a ZIP; anything else is an address (its ZIP and city are read out of it). */
export function splitAddress(input: string): { address: string; zip: string; city: string } {
  const text = input.trim();
  if (/^\d{5}(-\d{4})?$/.test(text)) return { address: "", zip: text.slice(0, 5), city: "" };
  const parts = parseAddressParts(text);
  return { address: text, zip: parts.zip || extractZipFromAddress(text), city: parts.city };
}

export interface StoredRequestFields {
  projectType: string;
  zip: string;
  address: string | null;
  city: string | null;
  email: string;
  message: string | null;
}

export interface DetailsMerge {
  /** Columns to update on consultation_requests; never a blank over a Step 1 answer. */
  set: Partial<StoredRequestFields>;
  /** "Label: value" lines for the notes block, the email and the p5 summary. */
  lines: string[];
  /** The full block appended to the notes. */
  block: string;
  /** What the visitor gave, for the p5 details post. */
  given: Partial<DetailsFields> & { zip?: string; city?: string };
}

/** Pure merge of Step 2 answers (and newly uploaded files) into a stored request. */
export function mergeDetails(
  existing: StoredRequestFields,
  fields: Partial<DetailsFields>,
  files: QuoteFileLink[] = [],
  at: Date = new Date(),
): DetailsMerge {
  const present = presentFields(fields);
  const set: Partial<StoredRequestFields> = {};
  const lines: string[] = [];
  const given: DetailsMerge["given"] = { ...present };

  if (present.projectType) {
    lines.push(`Project type: ${DETAILS_PROJECT_LABELS[present.projectType]}`);
    if (isDefaultProjectType(existing.projectType)) set.projectType = present.projectType;
  }
  if (present.address) {
    const split = splitAddress(present.address);
    lines.push(`${split.address ? "Address" : "ZIP code"}: ${present.address}`);
    if (split.address && !existing.address?.trim()) set.address = split.address;
    if (split.zip && !existing.zip?.trim()) set.zip = split.zip;
    if (split.city && !existing.city?.trim()) set.city = split.city;
    if (split.zip) given.zip = split.zip;
    if (split.city) given.city = split.city;
  }
  if (present.timing) lines.push(`Timing: ${present.timing}`);
  if (present.bestTime) lines.push(`Best time to call: ${present.bestTime}`);
  if (present.email) {
    lines.push(`Email: ${present.email}`);
    if (!existing.email?.trim()) set.email = present.email;
  }
  if (files.length) {
    lines.push(`Files (${files.length}):`);
    for (const file of files) lines.push(`- ${file.name} (${formatFileSize(file.size)}): ${file.url}`);
  }

  const stamp = at.toISOString().slice(0, 16).replace("T", " ");
  const block = lines.length ? `DETAILS ADDED (${stamp} UTC):\n${lines.join("\n")}` : "";
  if (block) set.message = [existing.message?.trim(), block].filter(Boolean).join("\n\n");
  return { set, lines, block, given };
}
