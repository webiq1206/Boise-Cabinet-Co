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

/** Fire any Meta standard event (Lead, Contact, ViewContent, ...). */
export function trackMetaEvent(event: string, params?: Record<string, unknown>): void {
  getFbq()?.("track", event, params);
}

/**
 * The site's primary conversion: a consultation / estimate request.
 * Maps to Meta's `Lead` standard event so campaigns can optimize for it.
 */
export function trackMetaLead(params?: Record<string, unknown>): void {
  trackMetaEvent("Lead", { content_name: "Consultation request", ...params });
}
