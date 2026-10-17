/**
 * Google Ads conversion helpers shared by every lead path on this site.
 *
 * "P5 Raw Form Submitted" is the accepted-lead conversion, with a per-lead
 * value so Google Ads can report ROAS by campaign. Values are the per-lead
 * estimates agreed with P5 on 14 Sept 2026 (form fallback in Google Ads is $50).
 * A key starting with "intake:" or "estimator:" is an estimator finish. It fires
 * "P5 Estimator Completed" once for that exact key, with transaction_id equal
 * to the key. It does not fire the form label, so one lead is not counted twice.
 * Any other key is a contact or consultation submit and fires the form label
 * only, once for that key, with transaction_id equal to the key. An intake
 * HTTP 409 never reaches this helper. Never pass PII here: no names, phones,
 * emails or free text.
 */
export const GOOGLE_ADS_ID = "AW-18354188204";
export const GOOGLE_ADS_LEAD_LABEL = "AW-18354188204/LE2vCPXstO8cEKzf-q9E";
/** "P5 Estimator Completed" (7851740531). */
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
  /**
   * Kept so older callers still type-check. Estimator keys never send the
   * form label, whether this flag is true, false, or omitted.
   */
  acceptedLead?: boolean;
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

/** Twenty attempts, 500ms apart: 10 seconds. */
export const GTAG_RETRY_LIMIT = 20;
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
 * another timer. Storage and timer failures are ignored.
 */
export function gtagOrRetry(key: string, retryCount: number, again: (nextRetry: number) => void): GtagFn | null {
  try {
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
      try {
        pendingGtagRetries.delete(key);
        again(retryCount + 1);
      } catch {
        pendingGtagRetries.delete(key);
      }
    }, GTAG_RETRY_MS);
    return null;
  } catch {
    return null;
  }
}

function isEstimatorFinishKey(dedupeKey: string | undefined): dedupeKey is string {
  return !!dedupeKey && (dedupeKey.startsWith("intake:") || dedupeKey.startsWith("estimator:"));
}

function alreadySent(storageKey: string): boolean {
  if (sentLeadKeys.has(storageKey)) return true;
  try {
    return window.sessionStorage.getItem(storageKey) === "sent";
  } catch {
    return false;
  }
}

function markSent(storageKey: string) {
  sentLeadKeys.add(storageKey);
  try {
    window.sessionStorage.setItem(storageKey, "sent");
  } catch {
    // Ignore; the in-memory guard covers this page load.
  }
}

/**
 * Fires the Google Ads conversion for this key. Estimator finish keys
 * ("intake:" or "estimator:") send only the estimator label, once per key,
 * with transaction_id equal to the key. Every other key sends only the form
 * label, once per key. If gtag is not ready, waits up to 10 seconds. Returns
 * true when a label was sent.
 */
export function trackGoogleAdsLeadConversion(
  ctx: LeadContext = {},
  dedupeKey?: string,
  retryCount = 0,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const retryKey = dedupeKey ?? "google_ads_lead:conversion";
    const pending: { storageKey: string; params: Record<string, unknown> }[] = [];
    if (isEstimatorFinishKey(dedupeKey)) {
      const estimatorStorage = `google_ads_estimator:${dedupeKey}`;
      if (!alreadySent(estimatorStorage)) {
        pending.push({
          storageKey: estimatorStorage,
          params: { send_to: GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL, transaction_id: dedupeKey },
        });
      }
    } else {
      const leadStorage = dedupeKey ? `google_ads_lead:${dedupeKey}` : "google_ads_lead:conversion";
      if (!alreadySent(leadStorage)) {
        pending.push({ storageKey: leadStorage, params: googleAdsLeadParams(ctx, dedupeKey) });
      }
    }
    if (!pending.length) return false;
    const gtag = gtagOrRetry(retryKey, retryCount, (next) => {
      trackGoogleAdsLeadConversion(ctx, dedupeKey, next);
    });
    if (!gtag) return false;
    for (const label of pending) {
      gtag("event", "conversion", label.params);
      markSent(label.storageKey);
    }
    return true;
  } catch {
    return false;
  }
}
