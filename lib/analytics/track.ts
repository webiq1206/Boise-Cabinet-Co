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
import {
  trackGoogleAdsLeadConversion,
  type GoogleAdsUserInput,
  type LeadContext,
} from "@/lib/googleAdsConversion";

export type { GoogleAdsUserInput };

export type TrackParams = Record<string, string | number | boolean | undefined>;

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
 * server-accepted consultation. This does not fire the estimator-completed
 * label. The opaque submission id is the dedupe key and is not a name, email,
 * or phone number. Optional user data is for the Ads enhanced-conversion set
 * only and is not sent as a GA4 parameter.
 */
export function trackGoogleAdsLeadOnce(
  submissionId: string,
  context: LeadContext = {},
  retryCount = 0,
  user?: GoogleAdsUserInput,
): boolean {
  if (!submissionId) return false;
  return trackGoogleAdsLeadConversion(context, submissionId, retryCount, user);
}
