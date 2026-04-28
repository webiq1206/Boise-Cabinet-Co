import { db } from "../lib/db";
import { leads } from "../shared/schema";
import { eq } from "drizzle-orm";

const COUNTRY_RE = /,\s*(United States|U\.?S\.?A\.?)\s*$/i;
const ZIP_RE = /,\s*\d{5}(?:-\d{4})?\s*$/;
const STATE_RE = /,\s*(Idaho|ID)\s*$/i;
const COUNTY_RE = /,\s*(Ada County|Canyon County|Boise County|Gem County|Owyhee County|Elmore County|Payette County|Washington County|Twin Falls County)\s*$/i;
const TRAILING_PUNCT_RE = /[,\s]+$/;

const HOUSE_NUMBER_RE = /^\d+[A-Za-z]?\s+\S/;
const NUMBER_COMMA_PREFIX_RE = /^(\d+[A-Za-z]?),\s+/;

function cleanTail(input: string): string {
  let s = input;
  let changed = true;
  while (changed) {
    changed = false;
    for (const re of [COUNTRY_RE, ZIP_RE, STATE_RE, COUNTY_RE]) {
      if (re.test(s)) {
        s = s.replace(re, "");
        changed = true;
      }
    }
    const trimmed = s.replace(TRAILING_PUNCT_RE, "");
    if (trimmed !== s) {
      s = trimmed;
      changed = true;
    }
  }
  return s;
}

/**
 * Try to normalize a Nominatim-style stored address into a clean
 * "<number> <street>" form. Returns the cleaned string. The caller decides
 * whether to write it back and whether to flag the row.
 */
export function normalizeStoredAddress(raw: string, city: string | null): string {
  let s = cleanTail(raw.trim());

  // "497, North Shady Grove Way, ..." -> "497 North Shady Grove Way, ..."
  s = s.replace(NUMBER_COMMA_PREFIX_RE, "$1 ");

  // If the value has a leading house number, the first comma-separated segment
  // is the actual street ("497 North Shady Grove Way"). Everything after that
  // is geographic noise — typically a subdivision label and the city — UNLESS
  // it contains unit/sub-premise info like "Apt 4B" / "Suite 200" / "Unit 5".
  // Per spec: collapse `497 N Shady Grove Way, Spice Wood, Kuna` to
  // `497 N Shady Grove Way` while preserving any real apt/suite token.
  if (HOUSE_NUMBER_RE.test(s)) {
    const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
    const isUnitHint = (p: string) =>
      /\b(apt|apartment|suite|ste|unit|#|bldg|building|lot|fl|floor|rm|room)\b/i.test(p);
    const kept: string[] = parts.length > 0 ? [parts[0]] : [];
    for (let i = 1; i < parts.length; i++) {
      if (isUnitHint(parts[i])) {
        kept.push(parts[i]);
      }
    }
    s = kept.join(", ");
  } else {
    // No leading digit: still strip a duplicated trailing city if present so
    // the flagged value is at least readable.
    const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
    const cityLower = (city || "").toLowerCase();
    if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === cityLower) {
      parts.pop();
      s = parts.join(", ");
    }
  }

  return s.replace(TRAILING_PUNCT_RE, "");
}

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
    const missing = !HOUSE_NUMBER_RE.test(normalized);

    const updates: { address?: string; addressMissingHouseNumber?: boolean } = {};
    // Only rewrite the saved address when the cleaned value still has a leading
    // house number. If the row is flagged as missing, leave the original
    // address untouched so a human can read whatever info we have and call the
    // customer to confirm.
    if (!missing && normalized !== original) {
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
