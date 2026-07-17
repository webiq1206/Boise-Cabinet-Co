/**
 * Meta Pixel standard-event helpers.
 *
 * Every function no-ops safely when the pixel is not configured or has not
 * loaded (dev, preview, ad-blockers), so callers never need to guard.
 * See components/seo/MetaPixel.tsx for the base pixel.
 */

type Fbq = (...args: unknown[]) => void;

function getFbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fbq === "function" ? fbq : undefined;
}

/**
 * Fire any Meta standard event (Lead, Contact, ViewContent, ...).
 * Pass `eventId` to deduplicate against the same event sent server-side via
 * the Conversions API (Meta counts the browser + server pair once).
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  const fbq = getFbq();
  if (!fbq) return;
  if (eventId) fbq("track", event, params, { eventID: eventId });
  else fbq("track", event, params);
}

/**
 * The site's primary conversion: a consultation / estimate request.
 * Maps to Meta's `Lead` standard event so campaigns can optimize for it.
 * Pass the shared `eventId` (same one sent to the Conversions API) for dedup.
 */
export function trackMetaLead(eventId?: string, params?: Record<string, unknown>): void {
  trackMetaEvent("Lead", { content_name: "Consultation request", ...params }, eventId);
}
