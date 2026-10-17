/**
 * Google Ads conversion helpers shared by every lead path on this site.
 *
 * "P5 Raw Form Submitted" is only for a real accepted lead, with a per-lead
 * value so Google Ads can report ROAS by campaign. Values are the per-lead
 * estimates agreed with P5 on 14 Sept 2026 (form fallback in Google Ads is $50).
 * "P5 Estimator Completed" fires when the estimator finishes, and does not use
 * the form label. If that finish also accepts a lead, both fire, and the form
 * label fires once for that lead id.
 * Never pass PII here: no names, phones, emails or free text. The form
 * conversion may include a service/project category and an opaque id.
 */
export const GOOGLE_ADS_ID = "AW-18354188204";
export const GOOGLE_ADS_LEAD_LABEL = "AW-18354188204/LE2vCPXstO8cEKzf-q9E";
/** "P5 Estimator Completed" (7851740531). Payload is send_to only. */
export const GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL = "AW-18354188204/cEzmCPOagKAdEKzf-q9E";
/** "P5 Website Call (60s+)": swaps the visible number for a Google forwarding number. */
export const GOOGLE_ADS_WEBSITE_CALL_LABEL = "AW-18354188204/YHR0CIaPz_ccEKzf-q9E";
export const GOOGLE_ADS_PHONE_DISPLAY = "(208) 477-1169";
/** sessionStorage key written by GoogleAnalytics.tsx on the first page view. */
export const ENTRY_PATH_KEY = "p5_entry_path";

export interface LeadContext {
  /** Unified estimator service id (e.g. "re10", "cabinet-install"). */
  service?: string;
  /** Consultation form project type. */
  projectType?: string;
}

export type GoogleAdsLeadParams = {
  send_to: string;
  value: number;
  currency: "USD";
  transaction_id?: string;
};

/** The path the visitor landed on, which is what the ad campaign controls. */
export function readEntryPath(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(ENTRY_PATH_KEY) ?? window.location.pathname;
  } catch {
    return window.location.pathname;
  }
}

/** Per-lead value in USD for this site (brand: cabinet). */
export function googleAdsLeadValue(ctx: LeadContext = {}): number {
  // Cabinets Trade campaign lands on /builders; Installation Only lands on
  // /services/cabinet-installation; everything else is the homeowner campaign.
  const entry = readEntryPath();
  if (entry.startsWith("/builders")) return 200;
  if (ctx.service === "cabinet-install" || entry.startsWith("/services/cabinet-installation")) return 50;
  return 150;
}

export function googleAdsLeadParams(
  ctx: LeadContext = {},
  transactionId?: string,
): GoogleAdsLeadParams {
  const params: GoogleAdsLeadParams = {
    send_to: GOOGLE_ADS_LEAD_LABEL,
    value: googleAdsLeadValue(ctx),
    currency: "USD",
  };
  if (transactionId) params.transaction_id = transactionId;
  return params;
}

const sentLeadKeys = new Set<string>();
const pendingGtagRetries = new Set<string>();

/** Ten attempts, 500ms apart: about 5 seconds, matching the Remodeling inquiry retry. */
export const GTAG_RETRY_LIMIT = 10;
export const GTAG_RETRY_MS = 500;

type GtagFn = (...args: unknown[]) => void;

export function readGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof gtag === "function" ? gtag : null;
}

/**
 * Returns gtag when it is already loaded. Otherwise schedules one retry chain
 * for this key and returns null. The sent marker must not be written by the caller
 * until this returns a function. A second call with the same key does not start
 * another timer.
 */
export function gtagOrRetry(key: string, retryCount: number, again: (nextRetry: number) => void): GtagFn | null {
  const gtag = readGtag();
  if (gtag) {
    pendingGtagRetries.delete(key);
    return gtag;
  }
  if (retryCount >= GTAG_RETRY_LIMIT) {
    pendingGtagRetries.delete(key);
    return null;
  }
  if (retryCount === 0 && pendingGtagRetries.has(key)) return null;
  pendingGtagRetries.add(key);
  window.setTimeout(() => {
    pendingGtagRetries.delete(key);
    again(retryCount + 1);
  }, GTAG_RETRY_MS);
  return null;
}

/**
 * Fires one conversion once per storage key. The sent marker is written only
 * after gtag exists. A second call while a retry is pending does not start
 * another timer.
 */
function trackLabeledConversion(
  storagePrefix: string,
  params: Record<string, unknown>,
  dedupeKey: string | undefined,
  retryCount: number,
  again: (nextRetry: number) => void,
): boolean {
  if (typeof window === "undefined") return false;
  const storageKey = dedupeKey ? `${storagePrefix}:${dedupeKey}` : undefined;
  const retryKey = storageKey ?? `${storagePrefix}:conversion`;
  if (!storageKey && sentLeadKeys.has(retryKey)) return false;
  if (storageKey) {
    if (sentLeadKeys.has(storageKey)) return false;
    try {
      if (window.sessionStorage.getItem(storageKey) === "sent") return false;
    } catch {
      // Storage can be unavailable under strict privacy settings; the in-memory guard still applies.
    }
  }
  const gtag = gtagOrRetry(retryKey, retryCount, again);
  if (!gtag) return false;
  if (storageKey) {
    sentLeadKeys.add(storageKey);
    try {
      window.sessionStorage.setItem(storageKey, "sent");
    } catch {
      // Ignore; in-memory guard is enough for this page load.
    }
  } else {
    sentLeadKeys.add(retryKey);
  }
  gtag("event", "conversion", params);
  return true;
}

/**
 * Fires the form lead conversion once per lead id. If gtag is not ready yet,
 * waits up to about 5 seconds and fires once. Returns true when it was sent.
 */
export function trackGoogleAdsLeadConversion(
  ctx: LeadContext = {},
  dedupeKey?: string,
  retryCount = 0,
): boolean {
  return trackLabeledConversion(
    "google_ads_lead",
    googleAdsLeadParams(ctx, dedupeKey),
    dedupeKey,
    retryCount,
    (next) => {
      trackGoogleAdsLeadConversion(ctx, dedupeKey, next);
    },
  );
}

/**
 * Fires "P5 Estimator Completed" once per estimator key. This is not the form
 * lead label. The payload is send_to only.
 */
export function trackGoogleAdsEstimatorCompleted(
  _ctx: LeadContext = {},
  dedupeKey?: string,
  retryCount = 0,
): boolean {
  return trackLabeledConversion(
    "google_ads_estimator",
    { send_to: GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL },
    dedupeKey,
    retryCount,
    (next) => {
      trackGoogleAdsEstimatorCompleted(_ctx, dedupeKey, next);
    },
  );
}

/**
 * Estimator completion always attempts the estimator conversion. When the same
 * finish accepted a lead, the form conversion is attempted once for that lead id.
 */
export function trackEstimatorCompletion(
  ctx: LeadContext,
  estimatorKey: string,
  leadId?: string,
): { estimator: boolean; lead: boolean } {
  return {
    estimator: trackGoogleAdsEstimatorCompleted(ctx, estimatorKey),
    lead: leadId ? trackGoogleAdsLeadConversion(ctx, leadId) : false,
  };
}
