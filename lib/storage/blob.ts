import { put, del } from "@vercel/blob";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

function isLocalBlobMode(): boolean {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (isLocalBlobMode()) {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return `/api/documents/local/${encodeURIComponent(key)}`;
  }

  const blob = await put(key, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteFile(urlOrKey: string): Promise<void> {
  if (isLocalBlobMode()) {
    const key = urlOrKey.replace(/^\/api\/documents\/local\//, "");
    const filePath = path.join(LOCAL_UPLOAD_DIR, decodeURIComponent(key));
    try {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    } catch {
      // ignore missing files
    }
    return;
  }

  if (urlOrKey.startsWith("http")) {
    await del(urlOrKey);
  }
}

export async function readLocalFile(key: string): Promise<Buffer | null> {
  try {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key);
    return await readFile(filePath);
  } catch {
    return null;
  }
}

export function isLocalUrl(url: string): boolean {
  return url.startsWith("/api/documents/local/");
}

export function extractLocalKey(url: string): string {
  return decodeURIComponent(url.replace(/^\/api\/documents\/local\//, ""));
}
