/**
 * Google Ads conversion helpers shared by every lead path on this site.
 *
 * "P5 Raw Form Submitted" is the accepted-lead conversion, with a per-lead
 * value so Google Ads can report ROAS by campaign. Values are the per-lead
 * estimates agreed with P5 on 14 Sept 2026 (form fallback in Google Ads is $50).
 * A key starting with "intake:" or "estimator:" is an estimator finish. It fires
 * "P5 Estimator Completed" once for that exact key. The form label fires once
 * for the same key, with transaction_id equal to the key, when the finish
 * created an accepted lead. Pass acceptedLead: false for a submit replay
 * ({accepted:false, duplicate:true}); that fires only the estimator label.
 * The shared engine does not pass acceptedLead. An omitted flag still sends
 * the form label, because this helper cannot read the endpoint body. An intake
 * HTTP 409 never reaches this helper. Any other key fires the form label only,
 * once for that key. Conversion event params stay free of free text. Enhanced
 * conversions send email, phone, first name, last name, and ZIP through a
 * separate gtag user_data set, and only when this helper is about to fire.
 */
import {
  normalizedEnhancedConversionEmail,
  normalizedEnhancedConversionPhone,
} from "@/lib/ads/enhancedConversionContact";

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
   * Estimator finishes only. True sends the form label. False is a duplicate
   * or other non-accepted finish, so only the estimator label is sent.
   * Omitted: the engine does not pass the endpoint's accepted flag.
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

/** Raw contact fields from a lead form. Street address and project text are not accepted. */
export type GoogleAdsUserInput = {
  email?: string;
  phone?: string;
  name?: string;
  postalCode?: string;
  /** When false, the conversion still fires and user_data is skipped. */
  allowEnhancedConversions?: boolean;
};

export type GoogleAdsUserData = {
  email?: string;
  phone_number?: string;
  address?: {
    first_name?: string;
    last_name?: string;
    postal_code?: string;
    country: "US";
  };
};

/**
 * Trim and lowercase email. A phone is E.164 +1XXXXXXXXXX only when it has
 * exactly 10 digits; any other length is omitted. Name splits on whitespace
 * into first and last. ZIP is included only as 5 digits or ZIP+4. Country is
 * US when an address object is sent.
 */
export function buildGoogleAdsUserData(input: GoogleAdsUserInput): GoogleAdsUserData | null {
  const email = normalizedEnhancedConversionEmail(input.email);
  const phone_number = normalizedEnhancedConversionPhone(input.phone);
  const nameParts = (input.name ?? "").trim().split(/\s+/).filter(Boolean);
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(" ") || undefined;
  const postal = (input.postalCode ?? "").trim();
  const postal_code = /^\d{5}(?:-\d{4})?$/.test(postal) ? postal : undefined;
  const address =
    first_name || postal_code
      ? {
          ...(first_name ? { first_name } : {}),
          ...(last_name ? { last_name } : {}),
          ...(postal_code ? { postal_code } : {}),
          country: "US" as const,
        }
      : undefined;
  const data: GoogleAdsUserData = {};
  if (email) data.email = email;
  if (phone_number) data.phone_number = phone_number;
  if (address) data.address = address;
  return email || phone_number || address ? data : null;
}

const DRAFT_STORAGE_PREFIX = "p5-project-draft-v2";

function storedDraftContact(dedupeKey: string | undefined): GoogleAdsUserInput | undefined {
  if (!dedupeKey || typeof window === "undefined") return undefined;
  const estimatorId = dedupeKey.startsWith("estimator:") ? dedupeKey.slice("estimator:".length) : "";
  const intakeProjectId = dedupeKey.startsWith("intake:") ? dedupeKey.slice("intake:".length) : "";
  if (!estimatorId && !intakeProjectId) return undefined;
  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    return undefined;
  }
  if (!storage) return undefined;
  const fromContact = (value: unknown): GoogleAdsUserInput | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const draft = value as {
      id?: unknown;
      intake?: { projectId?: unknown };
      contact?: { name?: unknown; email?: unknown; phone?: unknown };
    };
    const idMatch = estimatorId && draft.id === estimatorId;
    const intakeMatch = intakeProjectId && draft.intake?.projectId === intakeProjectId;
    if (!idMatch && !intakeMatch) return undefined;
    const contact = draft.contact;
    if (!contact) return undefined;
    return {
      ...(typeof contact.email === "string" ? { email: contact.email } : {}),
      ...(typeof contact.phone === "string" ? { phone: contact.phone } : {}),
      ...(typeof contact.name === "string" ? { name: contact.name } : {}),
    };
  };
  try {
    const recovery: unknown[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(DRAFT_STORAGE_PREFIX)) continue;
      const parsed = JSON.parse(storage.getItem(key) || "null") as unknown;
      if (key.endsWith(":recovery-v1")) {
        if (Array.isArray(parsed)) {
          for (const item of parsed) recovery.push((item as { draft?: unknown } | null)?.draft);
        }
        continue;
      }
      const active = fromContact(parsed);
      if (active) return active;
    }
    for (const draft of recovery) {
      const archived = fromContact(draft);
      if (archived) return archived;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

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

let capturedEnhancedConversionAllowance: boolean | undefined;

/** Remember the boolean from the latest form-submit response. */
export function noteEnhancedConversionAllowance(allowed: boolean | undefined) {
  capturedEnhancedConversionAllowance = allowed;
}

export function peekEnhancedConversionAllowance(): boolean | undefined {
  return capturedEnhancedConversionAllowance;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

/** Read allowEnhancedConversions off submit responses before the engine calls gtag. */
export function installEnhancedConversionAllowanceCapture() {
  if (typeof window === "undefined") return;
  const host = window as Window & { __adsEnhancedFetch?: boolean };
  if (host.__adsEnhancedFetch) return;
  const original = window.fetch?.bind(window);
  if (!original) return;
  host.__adsEnhancedFetch = true;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await original(input, init);
    const url = requestUrl(input);
    if (!/\/api\/(?:consultation|p5-estimator\/submit|p5-estimator\/intake)(?:\?|$)/.test(url)) return response;
    try {
      const body = (await response.clone().json()) as { allowEnhancedConversions?: unknown };
      if (typeof body?.allowEnhancedConversions === "boolean") {
        capturedEnhancedConversionAllowance = body.allowEnhancedConversions;
      }
    } catch {
      // A non-JSON response is not a finished lead.
    }
    return response;
  };
}

if (typeof window !== "undefined") installEnhancedConversionAllowanceCapture();

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
 * ("intake:" or "estimator:") send the estimator label once per key. They also
 * send the form label once per key, with transaction_id equal to the key,
 * unless acceptedLead is false. Every other key sends the form label only.
 * If gtag is not ready, waits up to 10 seconds. Returns true when at least
 * one label was sent.
 */
export function trackGoogleAdsLeadConversion(
  ctx: LeadContext = {},
  dedupeKey?: string,
  retryCount = 0,
  user?: GoogleAdsUserInput,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const retryKey = dedupeKey ?? "google_ads_lead:conversion";
    const rawUser = user ?? storedDraftContact(dedupeKey);
    const pending: { storageKey: string; params: Record<string, unknown> }[] = [];
    if (isEstimatorFinishKey(dedupeKey)) {
      const estimatorStorage = `google_ads_estimator:${dedupeKey}`;
      if (!alreadySent(estimatorStorage)) {
        pending.push({
          storageKey: estimatorStorage,
          params: { send_to: GOOGLE_ADS_ESTIMATOR_COMPLETED_LABEL, transaction_id: dedupeKey },
        });
      }
      if (ctx.acceptedLead !== false) {
        const leadStorage = `google_ads_lead:${dedupeKey}`;
        if (!alreadySent(leadStorage)) {
          pending.push({ storageKey: leadStorage, params: googleAdsLeadParams(ctx, dedupeKey) });
        }
      }
    } else {
      const leadStorage = dedupeKey ? `google_ads_lead:${dedupeKey}` : "google_ads_lead:conversion";
      if (!alreadySent(leadStorage)) {
        pending.push({ storageKey: leadStorage, params: googleAdsLeadParams(ctx, dedupeKey) });
      }
    }
    if (!pending.length) return false;
    const gtag = gtagOrRetry(retryKey, retryCount, (next) => {
      trackGoogleAdsLeadConversion(ctx, dedupeKey, next, rawUser);
    });
    if (!gtag) return false;
    const userData = rawUser ? buildGoogleAdsUserData(rawUser) : null;
    const allowed = rawUser?.allowEnhancedConversions ?? peekEnhancedConversionAllowance();
    if (userData && allowed !== false) gtag("set", "user_data", userData);
    for (const label of pending) {
      gtag("event", "conversion", label.params);
      markSent(label.storageKey);
    }
    return true;
  } catch {
    return false;
  }
}
