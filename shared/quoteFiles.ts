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
export const QUOTE_FILE_HINT = `Optional. Photos, PDFs or drawings. Up to ${QUOTE_FILE_MAX_COUNT} files, ${QUOTE_FILE_MAX_MB} MB each.`;

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
export function resolveQuoteFileType(name: string, type: string): string | null {
  const claimed = type.trim().toLowerCase();
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
export function checkQuoteFile(file: { name: string; type: string; size: number }): QuoteFileCheck {
  const label = file.name || "That file";
  const contentType = resolveQuoteFileType(file.name, file.type);
  if (!contentType) {
    return { ok: false, reason: "type", message: `${label} was not added. Attach photos or PDFs only.` };
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
