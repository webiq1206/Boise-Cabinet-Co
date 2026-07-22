import type { MeasurementBundle } from "@/shared/measurementBundle";

/** Canonical property record gathered from address lookup + county assessor. */
export interface PropertyProfile {
  formattedAddress: string;
  streetAddress?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;

  parcelId?: string;
  county?: "ada" | "canyon";

  propertyType?: string;
  yearBuilt?: number;
  squareFootage?: number;
  lotSizeSqFt?: number;
  lotSizeAcres?: number;
  bedrooms?: number;
  bathrooms?: number;
  assessedValue?: number;
  ownerName?: string;
  photoUrls?: string[];

  jurisdiction?: string;
  permittingAuthority?: string;

  measurementBundle?: MeasurementBundle;

  source: "assessor" | "geocoder" | "manual" | "mixed";
  confidence: "high" | "medium" | "low";
  enrichedAt: string;

  /** Admin edits layered on top of auto-populated values */
  adminOverrides?: Partial<PropertyProfile>;
  assessorNote?: string;
}

export type PropertyProfileInput = Pick<
  PropertyProfile,
  | "formattedAddress"
  | "streetAddress"
  | "city"
  | "state"
  | "zip"
  | "latitude"
  | "longitude"
  | "placeId"
>;

/**
 * Pull a 5-digit US ZIP from a free-form address string. Matches a ZIP at the
 * end of the address (optionally followed by a +4) and returns just the 5
 * digits, or "" when none is found. Used to derive a ZIP from an autocompleted
 * or typed property address so we no longer ask for it separately.
 */
export function extractZipFromAddress(address: string | null | undefined): string {
  const raw = (address || "").trim();
  if (!raw) return "";
  const match = raw.match(/\b(\d{5})(?:-\d{4})?\b\s*$/);
  return match ? match[1] : "";
}

export interface AddressParts {
  street: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Split a formatted US address into its parts.
 *
 * The geocoder only returns a structured PropertyProfile when the visitor picks
 * a suggestion. If they type an address and submit without selecting one, city
 * and state would otherwise reach the CRM empty, so this recovers them from the
 * string itself. Returns empty strings for anything it cannot identify rather
 * than guessing - a wrong city is worse than a blank one.
 */
export function parseAddressParts(address: string | null | undefined): AddressParts {
  const empty: AddressParts = { street: "", city: "", state: "", zip: "" };
  const raw = (address || "").trim().replace(/,\s*(USA|United States)\s*$/i, "");
  if (!raw) return empty;

  const segments = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!segments.length) return empty;

  const zip = extractZipFromAddress(raw);

  // Trailing segment is normally "ST 83646", "ST", or just the ZIP.
  let state = "";
  const last = segments[segments.length - 1];
  const stateZip = last.match(/^([A-Za-z]{2})\b(?:\s+\d{5}(?:-\d{4})?)?$/);
  if (stateZip) {
    state = stateZip[1].toUpperCase();
    segments.pop();
  } else if (/^\d{5}(-\d{4})?$/.test(last)) {
    segments.pop();
  }

  const city = segments.length > 1 ? segments[segments.length - 1] : "";
  const street = segments.length > 1 ? segments.slice(0, -1).join(", ") : segments[0] || "";

  return { street, city, state, zip };
}

/** Merge admin overrides onto the base profile for display and downstream use. */
export function resolvePropertyProfile(
  base: PropertyProfile | null | undefined
): PropertyProfile | null {
  if (!base) return null;
  if (!base.adminOverrides || Object.keys(base.adminOverrides).length === 0) {
    return base;
  }
  return { ...base, ...base.adminOverrides };
}

export function getPropertyProfileSummary(profile: PropertyProfile): string[] {
  const p = resolvePropertyProfile(profile);
  if (!p) return [];
  const lines: string[] = [];
  if (p.squareFootage) lines.push(`${p.squareFootage.toLocaleString()} sq ft`);
  if (p.lotSizeSqFt) lines.push(`${p.lotSizeSqFt.toLocaleString()} sq ft lot`);
  if (p.bedrooms) lines.push(`${p.bedrooms} bed`);
  if (p.bathrooms) lines.push(`${p.bathrooms} bath`);
  if (p.yearBuilt) lines.push(`Built ${p.yearBuilt}`);
  if (p.parcelId) lines.push(`Parcel ${p.parcelId}`);
  if (p.permittingAuthority) lines.push(p.permittingAuthority);
  return lines;
}
