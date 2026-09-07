/**
 * Sends a GA4 event via gtag(). No-op (dev console log only) when gtag hasn't
 * loaded - GoogleAnalytics.tsx intentionally skips loading it outside
 * production, so this never throws in local dev or preview.
 *
 * Callers must never pass PII: no names, phone numbers, email addresses,
 * full addresses, project descriptions, parcel numbers, file names, or
 * document contents. Pass identifiers and categories only (e.g. a project
 * type, a step name, a boolean), never free-text user input.
 */
export type TrackParams = Record<string, string | number | boolean | undefined>;

const GOOGLE_ADS_LEAD_DESTINATION =
  "AW-18354188204/LE2vCPXstO8cEKzf-q9E";
const sentGoogleAdsLeadIds = new Set<string>();

export function track(eventName: string, params?: TrackParams): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
    return;
  }
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", eventName, params);
  }
}

/**
 * Sends the verified Google Ads "P5 Raw Form Submitted" conversion once for a
 * server-accepted consultation. The opaque submission id is used only for
 * browser-side deduplication and is never included in analytics parameters.
 */
export function trackGoogleAdsLeadOnce(submissionId: string): boolean {
  if (typeof window === "undefined" || !submissionId) return false;

  const storageKey = `google_ads_lead:${submissionId}`;
  if (sentGoogleAdsLeadIds.has(submissionId)) return false;
  try {
    if (window.sessionStorage.getItem(storageKey) === "sent") return false;
  } catch {
    // Storage can be unavailable under strict browser privacy settings.
  }

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return false;

  sentGoogleAdsLeadIds.add(submissionId);
  try {
    window.sessionStorage.setItem(storageKey, "sent");
  } catch {
    // The in-memory guard still prevents duplicate callbacks in this page load.
  }
  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_DESTINATION,
  });
  return true;
}
