// Shared lead helpers used by capture, import, migration, and the sending engine.

export const TREASURE_VALLEY_CITIES = [
  "Boise",
  "Meridian",
  "Eagle",
  "Nampa",
  "Kuna",
  "Star",
  "Middleton",
  "Caldwell",
] as const;

// Conservative single-address email check. We never fabricate or guess emails,
// so this only validates shape on already-collected addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return EMAIL_RE.test(email.trim());
}

// A lead is emailable only when a valid email is present and the email status is
// not a hard stop (unsubscribed/failed/bounced). Suppression-list checks are
// applied separately at send time against outreach_suppressions.
export function deriveEmailable(
  email: string | null | undefined,
  emailStatus: string | null | undefined = "new",
): boolean {
  if (!isValidEmail(email)) return false;
  if (emailStatus === "unsubscribed" || emailStatus === "failed" || emailStatus === "bounced") return false;
  return true;
}

// Maps a free-text city to one of the eight service-area cities when it matches.
export function matchServiceArea(city: string | null | undefined): string | null {
  if (!city) return null;
  const normalized = city.trim().toLowerCase();
  const match = TREASURE_VALLEY_CITIES.find((c) => c.toLowerCase() === normalized);
  return match ?? null;
}
