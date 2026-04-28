import { db } from "../lib/db";
import { leads } from "../shared/schema";
import { eq } from "drizzle-orm";
import {
  normalizeStoredAddress,
  hasLeadingHouseNumber,
} from "../shared/addressValidation";

async function main() {
  if (!db) {
    console.error("[BACKFILL] Database not available. Set DATABASE_URL.");
    process.exit(1);
  }

  const all = await db.select().from(leads);
  let scanned = 0;
  let cleaned = 0;
  let flagged = 0;
  let skipped = 0;

  for (const lead of all) {
    scanned++;
    const original = lead.address;
    if (!original || original === "***") {
      skipped++;
      continue;
    }

    const normalized = normalizeStoredAddress(original, lead.city);
    const missing = !hasLeadingHouseNumber(normalized);

    const updates: { address?: string; addressMissingHouseNumber?: boolean } = {};
    // Always rewrite the saved address to its cleaned form. Cleanup only
    // strips geographic noise (country/state/zip/county/city/subdivision) and
    // preserves unit hints, so it's safe even when the row lacks a leading
    // house number ("South Old Farm Avenue" reads better than the verbose
    // Nominatim tail).
    if (normalized && normalized !== original) {
      updates.address = normalized;
    }
    if (missing !== Boolean(lead.addressMissingHouseNumber)) {
      updates.addressMissingHouseNumber = missing;
    }

    if (Object.keys(updates).length === 0) {
      continue;
    }

    await db.update(leads).set(updates).where(eq(leads.id, lead.id));

    if (updates.address) cleaned++;
    if (updates.addressMissingHouseNumber === true) flagged++;
  }

  console.log("[BACKFILL] Done.");
  console.log(`  scanned: ${scanned}`);
  console.log(`  rewritten address strings: ${cleaned}`);
  console.log(`  flagged as missing-house-number: ${flagged}`);
  console.log(`  skipped (no address / masked): ${skipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[BACKFILL] Failed:", err);
    process.exit(1);
  });
