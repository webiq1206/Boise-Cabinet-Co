export const HOUSE_NUMBER_REGEX = /^\d+[A-Za-z]?\s+\S/;

export const HOUSE_NUMBER_ERROR_MESSAGE =
  "Please include your house number (for example, 4521 W Cherry Ln).";

export function hasLeadingHouseNumber(address: string | null | undefined): boolean {
  if (!address) return false;
  return HOUSE_NUMBER_REGEX.test(address.trim());
}

export function extractLeadingHouseNumber(value: string | null | undefined): string {
  if (!value) return "";
  const m = value.trim().match(/^(\d+[A-Za-z]?)\b/);
  return m ? m[1] : "";
}

// ---------------------------------------------------------------------------
// Address normalization
//
// Stored addresses sometimes contain verbose Nominatim tails like
//   "South Old Farm Avenue, Kuna, Ada County, Idaho, 83634, United States"
// which then renders to subcontractors as
//   "South Old Farm Avenue, Kuna, Ada County, Idaho, 83634, United States, Kuna"
// because UI code adds ", {city}" after lead.address. We clean both at write
// time (backfill / API) and at render time (display fallback) so the sub
// always sees just "<number?> <street>".
// ---------------------------------------------------------------------------

const COUNTRY_RE = /[,\s]+(United States|U\.?S\.?A\.?)\s*$/i;
const ZIP_RE = /[,\s]+\d{5}(?:-\d{4})?\s*$/;
const STATE_RE = /[,\s]+(Idaho|ID)\s*$/i;
const COUNTY_RE =
  /[,\s]+(Ada County|Canyon County|Boise County|Gem County|Owyhee County|Elmore County|Payette County|Washington County|Twin Falls County)\s*$/i;
const TRAILING_PUNCT_RE = /[,\s]+$/;
const NUMBER_COMMA_PREFIX_RE = /^(\d+[A-Za-z]?),\s+/;

// Word-class unit hints (apt, suite, etc.) plus a separate alternation for
// "#" (which isn't a word character, so \b#\b doesn't match) so tokens like
// "#4B" are preserved during normalization.
const UNIT_HINT_RE =
  /\b(apt|apartment|suite|ste|unit|bldg|building|lot|fl|floor|rm|room)\b|(^|[\s,])#\s*\w/i;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanTail(input: string, city: string | null): string {
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
    if (city && city.trim()) {
      // Strip a trailing city token that's missing its comma, e.g.
      // "1354 W Sandalwood Dr Meridian" -> "1354 W Sandalwood Dr".
      const cityRe = new RegExp(`[,\\s]+${escapeRegex(city.trim())}\\s*$`, "i");
      if (cityRe.test(s)) {
        s = s.replace(cityRe, "");
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
 * Normalize a stored address into a clean "<number?> <street>" form.
 *
 * Drops geographic tail noise (country / state / zip / county / city /
 * subdivision label) and the verbose Nominatim "<number>, <street>" comma
 * form, while preserving unit/sub-premise tokens like "Apt 4B".
 *
 * Pure function; safe to call on any saved or geocoder-produced string,
 * idempotent (cleaning a clean address returns the same value).
 */
export function normalizeStoredAddress(
  raw: string,
  city: string | null
): string {
  let s = cleanTail(raw.trim(), city);

  // "497, North Shady Grove Way, ..." -> "497 North Shady Grove Way, ..."
  s = s.replace(NUMBER_COMMA_PREFIX_RE, "$1 ");

  // After the tail-noise pass, the first comma-separated segment is the actual
  // street. Anything that follows is subdivision / city / other noise UNLESS
  // it contains a unit hint (apt / suite / unit / etc.), which we always keep.
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  const kept: string[] = parts.length > 0 ? [parts[0]] : [];
  for (let i = 1; i < parts.length; i++) {
    if (UNIT_HINT_RE.test(parts[i])) {
      kept.push(parts[i]);
    }
  }
  s = kept.join(", ");

  return s.replace(TRAILING_PUNCT_RE, "");
}

export interface AddressDisplay {
  /** Cleaned street-only address suitable for display. May be empty string. */
  display: string;
  /**
   * True when the cleaned address still has no leading house number. UI uses
   * this as a fallback flag for legacy rows where the DB column has not yet
   * been backfilled.
   */
  missingHouseNumber: boolean;
}

/**
 * Clean a stored address for UI display. UI callers should render
 * `${display}, ${city}` (or similar) so the city is never duplicated, and
 * should surface the "No house #" badge when `missingHouseNumber` is true OR
 * when the persisted `addressMissingHouseNumber` column is true.
 *
 * Returns `{ display: "", missingHouseNumber: false }` for null / empty /
 * masked ("***") inputs so callers can simply skip rendering.
 */
export function cleanDisplayAddress(
  rawAddress: string | null | undefined,
  city: string | null | undefined
): AddressDisplay {
  if (!rawAddress || rawAddress === "***") {
    return { display: "", missingHouseNumber: false };
  }
  const display = normalizeStoredAddress(rawAddress, city ?? null);
  return {
    display,
    missingHouseNumber: !HOUSE_NUMBER_REGEX.test(display),
  };
}
