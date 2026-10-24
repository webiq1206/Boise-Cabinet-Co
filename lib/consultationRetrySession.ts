/** Tab-session retry protection only. Never store contact fields or request bodies. */
export const CONSULTATION_RETRY_SLOT = "p5_cabinet_consultation_retry_v1";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function consultationSessionKey(createId: () => string): string | null {
  let storageReadable = false;
  try {
    const existing = window.sessionStorage.getItem(CONSULTATION_RETRY_SLOT);
    // Preserve a readable pending key; never replace a corrupt marker automatically.
    if (existing !== null) return UUID.test(existing) ? existing : null;
    storageReadable = true;
  } catch {
    // Storage is optional. The mounted form retains its UUID and exact body in memory.
    // After reload, an inaccessible earlier marker cannot be recovered or detected.
  }
  const id = createId();
  if (!UUID.test(id)) return null;
  try {
    // Never overwrite a pending marker whose read failed.
    if (storageReadable) window.sessionStorage.setItem(CONSULTATION_RETRY_SLOT, id);
  } catch {
    // First submission and same-page retries remain usable without browser storage.
  }
  return id;
}

/** Only definite validation rejection or confirmed persistence may clear a key. */
export function clearConsultationSessionKey(id: string): boolean {
  try {
    const storage = window.sessionStorage;
    if (storage.getItem(CONSULTATION_RETRY_SLOT) !== id) return false;
    storage.removeItem(CONSULTATION_RETRY_SLOT);
    return storage.getItem(CONSULTATION_RETRY_SLOT) === null;
  } catch {
    // A stale marker is conservative: the server still rejects changed payloads.
    return false;
  }
}
