import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { arModels } from "@/shared/schema";

/**
 * Delete AR model rows whose `expiresAt` has passed. AR previews are only needed
 * for a few minutes while a phone downloads them, so old rows are purged to keep
 * the `ar_models` table from growing without bound. Best-effort: failures are
 * logged but never thrown so they can't break the request that triggered them.
 */
export async function purgeExpiredArModels(): Promise<void> {
  if (!db) return;
  try {
    await db.delete(arModels).where(lt(arModels.expiresAt, new Date()));
  } catch (error) {
    console.error("Purge expired AR models error:", error);
  }
}
