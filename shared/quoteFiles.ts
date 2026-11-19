/**
 * Attachment rules for the quote form's "Add photos, plans or files" tile,
 * shared by the browser (to refuse a file before it is sent) and the server
 * (app/api/consultation/files, which checks again and sniffs the bytes).
 *
 * The tile's small print states these limits; change them here and the copy
 * follows. Photos, PDFs and drawings only: anything else is refused with a
 * plain message and never blocks the rest of the form.
 */

/** Files one request may carry, across Step 1 and Step 2 together. */
export const QUOTE_FILE_MAX_COUNT = 10;
/** Per file. Stored in Postgres (consultation_files), so kept modest. */
export const QUOTE_FILE_MAX_MB = 20;
export const QUOTE_FILE_MAX_BYTES = QUOTE_FILE_MAX_MB * 1024 * 1024;
/** The picker filter: on phones this offers the camera, the photo library and files. */
export const QUOTE_FILE_ACCEPT = "image/*,application/pdf,.heic,.heif";
/** The tile's small print, built from the real limits. */
export const QUOTE_FILE_HINT = `Photos, PDFs or drawings. Up to ${QUOTE_FILE_MAX_COUNT} files, ${QUOTE_FILE_MAX_MB} MB each.`;

/**
 * Which rules a form's attachments follow. "builder" is the builders form
 * only (owner, 19 November 2026): it also takes CAD drawings, DWG and DXF.
 * The size and count limits are the same on every form.
 */
export type QuoteFileProfile = "standard" | "builder";

/** CAD drawings, by extension. Browsers report no dependable type for them. */
const CAD_TYPE_BY_EXTENSION: Readonly<Record<string, string>> = {
  dwg: "application/acad",
  dxf: "application/dxf",
};

/** The content types a CAD drawing is stored as. Never rendered: stored, linked and downloaded only. */
export const QUOTE_CAD_TYPES: ReadonlySet<string> = new Set(Object.values(CAD_TYPE_BY_EXTENSION));

export function isCadType(contentType: string): boolean {
  return QUOTE_CAD_TYPES.has(contentType);
}

/** The lead context the builders form sends as the start of its project type. */
export const BUILDER_REQUEST_CONTEXT = "builder-contractor";

/** The profile a saved request's project type gives its attachments. */
export function quoteFileProfileForProjectType(projectType: string | null | undefined): QuoteFileProfile {
  return (projectType ?? "").trim().toLowerCase().startsWith(`${BUILDER_REQUEST_CONTEXT}:`) ? "builder" : "standard";
}

export function quoteFileAccept(profile: QuoteFileProfile = "standard"): string {
  return profile === "builder" ? `${QUOTE_FILE_ACCEPT},.dwg,.dxf` : QUOTE_FILE_ACCEPT;
}

/** The tile's small print for a profile, built from the real limits. */
export function quoteFileHint(profile: QuoteFileProfile = "standard"): string {
  if (profile !== "builder") return QUOTE_FILE_HINT;
  return `Photos, PDFs, DWG or DXF drawings. Up to ${QUOTE_FILE_MAX_COUNT} files, ${QUOTE_FILE_MAX_MB} MB each. For a larger plan set, paste a share link in the box above.`;
}

const TYPE_BY_EXTENSION: Readonly<Record<string, string>> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/** Every content type the server will store. No SVG (it can carry script), no Office files. */
export const QUOTE_FILE_TYPES: ReadonlySet<string> = new Set(Object.values(TYPE_BY_EXTENSION));

function extensionOf(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

/**
 * The content type a file will be stored as, or null when it is not a photo
 * or a PDF. Phones sometimes report HEIC photos with an empty or generic type,
 * so the extension decides when the browser does not.
 */
export function resolveQuoteFileType(name: string, type: string, profile: QuoteFileProfile = "standard"): string | null {
  const claimed = type.trim().toLowerCase();
  // A CAD drawing is known by its extension (the reported type varies by
  // system), and only where the form takes them. The server checks the bytes.
  const cad = CAD_TYPE_BY_EXTENSION[extensionOf(name)];
  if (cad) return profile === "builder" ? cad : null;
  if (QUOTE_FILE_TYPES.has(claimed)) return claimed;
  if (claimed === "image/jpg" || claimed === "image/pjpeg") return "image/jpeg";
  if (claimed === "image/heic-sequence") return "image/heic";
  if (claimed === "image/heif-sequence") return "image/heif";
  if (claimed === "" || claimed === "application/octet-stream") {
    return TYPE_BY_EXTENSION[extensionOf(name)] ?? null;
  }
  return null;
}

export type QuoteFileCheck =
  | { ok: true; contentType: string }
  | { ok: false; reason: "type" | "size" | "empty"; message: string };

/** One file against the type and size rules; the message names the file. */
export function checkQuoteFile(
  file: { name: string; type: string; size: number },
  profile: QuoteFileProfile = "standard",
): QuoteFileCheck {
  const label = file.name || "That file";
  const contentType = resolveQuoteFileType(file.name, file.type, profile);
  if (!contentType) {
    const allowed = profile === "builder" ? "Attach photos, PDFs, DWG or DXF drawings only." : "Attach photos or PDFs only.";
    return { ok: false, reason: "type", message: `${label} was not added. ${allowed}` };
  }
  if (file.size <= 0) {
    return { ok: false, reason: "empty", message: `${label} was not added. The file is empty.` };
  }
  if (file.size > QUOTE_FILE_MAX_BYTES) {
    return {
      ok: false,
      reason: "size",
      message: `${label} was not added. It is ${formatFileSize(file.size)}; the limit is ${QUOTE_FILE_MAX_MB} MB per file.`,
    };
  }
  return { ok: true, contentType };
}

/** "2.4 MB", "640 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function isPdfType(contentType: string): boolean {
  return contentType === "application/pdf";
}
