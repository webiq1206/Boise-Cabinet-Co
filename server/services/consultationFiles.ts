/**
 * Server side of the quote form's attachment tile.
 *
 * - The bytes decide the stored type: a file must both claim and BE a photo or
 *   a PDF (magic bytes), so a renamed page or script is refused.
 * - Every stored file is reachable only through a signed link
 *   (/api/consultation/files/<id>?sig=<hmac>): the id is a random UUID and the
 *   signature is an HMAC of it with the server secret, so a link cannot be
 *   guessed or enumerated and there is no listing. The same link goes into the
 *   internal email, the lead notes and the p5 intake (HubSpot), so the team can
 *   open a file from any of them without logging in.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { QUOTE_FILE_TYPES, checkQuoteFile } from "@/shared/quoteFiles";
import { SITE_CONFIG } from "@/shared/siteConfig";

/** The same secret the session cookie and the edit tokens use. */
export function quoteSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

function b64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The content type the bytes actually are, among the types we store, or null. */
export function sniffContentType(bytes: Uint8Array): string | null {
  const at = (offset: number, ascii: string) =>
    bytes.length >= offset + ascii.length &&
    Array.from(ascii).every((char, index) => bytes[offset + index] === char.charCodeAt(0));
  if (at(0, "%PDF-")) return "application/pdf";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && at(1, "PNG") && bytes[4] === 0x0d && bytes[5] === 0x0a) return "image/png";
  if (at(0, "GIF87a") || at(0, "GIF89a")) return "image/gif";
  if (at(0, "RIFF") && at(8, "WEBP")) return "image/webp";
  if (at(4, "ftyp")) {
    const brand = String.fromCharCode(...Array.from(bytes.slice(8, 12)));
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"].includes(brand)) return "image/heic";
    if (["mif1", "msf1"].includes(brand)) return "image/heif";
  }
  return null;
}

/** A name safe to store and to put in a Content-Disposition header. */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[\u0000-\u001f\u007f"<>]/g, "").replace(/\s+/g, " ").trim();
  return (cleaned || "file").slice(0, 160);
}

export type StoredFileCheck =
  | { ok: true; contentType: string; name: string; sha256: string }
  | { ok: false; status: 400 | 413 | 415; message: string };

/** The full server check for one uploaded file: claimed type, size, then the bytes. */
export function checkUploadedFile(file: { name: string; type: string; size: number }, bytes: Uint8Array): StoredFileCheck {
  const name = cleanFileName(file.name);
  const claimed = checkQuoteFile({ name, type: file.type, size: bytes.length || file.size });
  if (!claimed.ok) {
    return { ok: false, status: claimed.reason === "size" ? 413 : claimed.reason === "type" ? 415 : 400, message: claimed.message };
  }
  const sniffed = sniffContentType(bytes);
  if (!sniffed || !QUOTE_FILE_TYPES.has(sniffed)) {
    return { ok: false, status: 415, message: `${name} was not added. It does not look like a photo or a PDF.` };
  }
  return { ok: true, contentType: sniffed, name, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function fileSignature(id: string, secret: string): string {
  return b64url(createHmac("sha256", secret).update(`consultation-file:v1:${id}`).digest()).slice(0, 32);
}

/** Absolute signed link to one stored file, or null when the server has no secret. */
export function signedFileUrl(id: string, secret: string | null = quoteSecret(), origin: string = SITE_CONFIG.siteUrl): string | null {
  if (!secret) return null;
  return `${origin.replace(/\/$/, "")}/api/consultation/files/${encodeURIComponent(id)}?sig=${fileSignature(id, secret)}`;
}

export function verifyFileSignature(id: string, sig: string | null, secret: string | null = quoteSecret()): boolean {
  if (!secret || !sig) return false;
  const expected = Buffer.from(fileSignature(id, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export interface QuoteFileLink {
  id: string;
  name: string;
  url: string;
  contentType: string;
  size: number;
}
