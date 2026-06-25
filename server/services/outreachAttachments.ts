import { readFile } from "fs/promises";
import path from "path";

/**
 * Optional file attachments for outreach emails. Templates carry an
 * `attachmentKey` (usually null). When set, the sender resolves it to a real
 * file here and attaches it. Resolution is best effort: if the file is missing
 * we log and send without it rather than failing the whole send, since every
 * email already links to the same resource as a fallback.
 */

export interface OutreachAttachment {
  filename: string;
  content: Buffer;
}

const CATALOG_PATH = path.join(
  process.cwd(),
  "public",
  "downloads",
  "boise-cabinet-catalog.pdf",
);

export async function buildOutreachAttachments(
  attachmentKey?: string | null,
): Promise<OutreachAttachment[] | undefined> {
  if (!attachmentKey) return undefined;

  if (attachmentKey === "catalog") {
    try {
      const content = await readFile(CATALOG_PATH);
      return [{ filename: "Boise-Cabinet-Co-Catalog.pdf", content }];
    } catch (err) {
      console.warn(
        "[outreach] catalog attachment unavailable, sending without it:",
        err,
      );
      return undefined;
    }
  }

  return undefined;
}
