/** Optional files on the short project form. Not used by the multi-step intake. */

export const LEAD_UPLOAD_MAX_FILES = 3;
export const LEAD_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;
export const LEAD_UPLOAD_MAX_TOTAL = 12 * 1024 * 1024;

const EXT = /\.(jpe?g|png|webp|gif|heic|heif|pdf)$/i;

export function isAllowedLeadFile(file: { name: string; type: string }): boolean {
  const type = (file.type || "").toLowerCase();
  if (type === "application/pdf" || type.startsWith("image/")) return true;
  return EXT.test(file.name || "");
}

export function safeLeadFileName(name: string): string {
  const base = (name || "upload").split(/[/\\]/).pop() || "upload";
  const cleaned = base.replace(/[^\w.\- ()]/g, "_").replace(/_+/g, "_").slice(0, 120);
  return cleaned || "upload";
}

/** Returns a visitor-facing reason, or null when the set is acceptable. */
export function leadUploadError(files: { name: string; type: string; size: number }[]): string | null {
  if (files.length > LEAD_UPLOAD_MAX_FILES) {
    return `Attach up to ${LEAD_UPLOAD_MAX_FILES} photos, plans, or PDFs.`;
  }
  let total = 0;
  for (const file of files) {
    if (!isAllowedLeadFile(file)) return "Attach a photo, plan, or PDF.";
    if (file.size > LEAD_UPLOAD_MAX_BYTES) return "Each file must be under 6 MB.";
    total += file.size;
  }
  if (total > LEAD_UPLOAD_MAX_TOTAL) return "Those files together must be under 12 MB.";
  return null;
}
