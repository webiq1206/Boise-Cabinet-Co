/**
 * Browser side of the quote form's Step 2 and attachments. Both only ever add
 * to a request /api/consultation has already saved, using the details token
 * it returned (server/services/consultationDetails.ts).
 */

export interface DetailsKey {
  requestId: string;
  token: string;
}

export type UploadResult = { ok: true; id: string } | { ok: false; message: string };

/** One file, one request, so a failure names one file and the others still go through. */
export async function uploadQuoteFile(key: DetailsKey, file: File): Promise<UploadResult> {
  const body = new FormData();
  body.set("requestId", key.requestId);
  body.set("token", key.token);
  body.set("file", file, file.name);
  try {
    const res = await fetch("/api/consultation/files", { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; file?: { id?: string } };
    if (res.ok && json.ok && json.file?.id) return { ok: true, id: json.file.id };
    return { ok: false, message: json.message || "It did not upload." };
  } catch {
    return { ok: false, message: "It did not upload. Check your connection." };
  }
}

export interface DetailsPayload {
  kind: "details" | "files";
  fields?: {
    projectType?: string;
    address?: string;
    timing?: string;
    bestTime?: string;
    email?: string;
  };
  fileIds?: string[];
}

export async function postQuoteDetails(
  key: DetailsKey,
  payload: DetailsPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/consultation/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: key.requestId, token: key.token, ...payload }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (res.ok && json.ok) return { ok: true };
    return { ok: false, message: json.message || "We could not save that. Please try again, or call or text us." };
  } catch {
    return { ok: false, message: "We could not save that. Check your connection and try again, or call or text us." };
  }
}
