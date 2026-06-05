/**
 * Central site configuration, NAP, URLs, and contact strings.
 * Override via env for staging; replace placeholder values before launch.
 */

// TODO(client): replace the placeholder phone before launch via env
// NEXT_PUBLIC_PHONE / NEXT_PUBLIC_PHONE_TEL. (208) 555-0100 is a placeholder.
const DEFAULT_PHONE = "(208) 555-0100";
const DEFAULT_PHONE_TEL = "2085550100";
const DEFAULT_EMAIL = "hello@boisecabinet.co";
const DEFAULT_SITE_URL = "https://boisecabinet.co";

function numFromEnv(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export const SITE_CONFIG = {
  name: "Boise Cabinet Co",
  legalName: "Boise Cabinet Co LLC",
  tagline: "Idaho's premier custom cabinet company",
  phone: process.env.NEXT_PUBLIC_PHONE ?? DEFAULT_PHONE,
  phoneTel: process.env.NEXT_PUBLIC_PHONE_TEL ?? DEFAULT_PHONE_TEL,
  phoneHref: `tel:${process.env.NEXT_PUBLIC_PHONE_TEL ?? DEFAULT_PHONE_TEL}`,
  email: process.env.NEXT_PUBLIC_EMAIL ?? DEFAULT_EMAIL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  address: {
    street: "2283 N Coopers Hawk Ave",
    city: "Kuna",
    state: "ID",
    zip: "83634",
    full: "2283 N Coopers Hawk Ave, Kuna, ID 83634",
  },
  /**
   * Trust / credential signals. All env-driven so real values can be set
   * without code changes. Until set, schema omits ratings and the UI shows
   * "available on request" rather than fabricated numbers.
   * TODO(client): set NEXT_PUBLIC_* for license, GBP, and reviews before launch.
   */
  trust: {
    // Idaho registered contractor / business license number.
    licenseNumber: process.env.NEXT_PUBLIC_LICENSE_NUMBER ?? "",
    // Google Business Profile URL (strongest local entity signal).
    gbpUrl: process.env.NEXT_PUBLIC_GBP_URL ?? "",
    houzzUrl: process.env.NEXT_PUBLIC_HOUZZ_URL ?? "",
    bbbUrl: process.env.NEXT_PUBLIC_BBB_URL ?? "",
    yelpUrl: process.env.NEXT_PUBLIC_YELP_URL ?? "",
    // Aggregate review data. Schema aggregateRating only emits when count > 0.
    ratingValue: numFromEnv(process.env.NEXT_PUBLIC_REVIEW_RATING),
    reviewCount: numFromEnv(process.env.NEXT_PUBLIC_REVIEW_COUNT),
  },
} as const;

export function formatPhoneDisplay(tel: string = SITE_CONFIG.phoneTel): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return SITE_CONFIG.phone;
}
