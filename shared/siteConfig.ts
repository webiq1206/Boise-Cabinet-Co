/**
 * Central site configuration, NAP, URLs, and contact strings.
 * Override via env for staging; replace placeholder values before launch.
 */

// Business phone (NAP). Override via env NEXT_PUBLIC_PHONE / NEXT_PUBLIC_PHONE_TEL.
const DEFAULT_PHONE = "(208) 477-1169";
const DEFAULT_PHONE_TEL = "2084771169";
const DEFAULT_EMAIL = "hello@boisecabinet.co";
const DEFAULT_SITE_URL = "https://boisecabinet.co";

function numFromEnv(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Seed testimonials and ratings stay in the repo. They render only when this
 * value is exactly "true". Unset, empty, or any other string stays hidden.
 * NEXT_PUBLIC_ is read as well so client bundles follow the same switch.
 */
export function showTestimonials(
  value: string | undefined = process.env.SHOW_TESTIMONIALS ?? process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS,
): boolean {
  return value === "true";
}

const PHONE_TEL = process.env.NEXT_PUBLIC_PHONE_TEL ?? DEFAULT_PHONE_TEL;
// E.164 (+1) form for tel:/sms: links - most reliable across carriers and devices.
const PHONE_E164 = `+1${PHONE_TEL.replace(/\D/g, "")}`;

export const SITE_CONFIG = {
  name: "Boise Cabinet Co",
  /**
   * The registered legal entity. This brand is an Idaho assumed business name
   * (DBA) of P5 Home Co LLC - there is no separate "Boise Cabinet Co LLC" company.
   * `name` above stays the DBA, which is what customers know and what belongs
   * in a GBP business-name field; `legalName` is the entity that actually
   * signs contracts, holds the registration and gets verified against state
   * records, so the two are deliberately different values.
   */
  legalName: "P5 Home Co LLC",
  tagline: "Idaho's premier custom cabinet company",
  phone: process.env.NEXT_PUBLIC_PHONE ?? DEFAULT_PHONE,
  phoneTel: PHONE_TEL,
  phoneHref: `tel:${PHONE_E164}`,
  phoneSmsHref: `sms:${PHONE_E164}`,
  email: process.env.NEXT_PUBLIC_EMAIL ?? DEFAULT_EMAIL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  // The owner who personally signs every outgoing email. The sender display
  // name shows Nick (not the bare company name) while the underlying address,
  // domain, and reply-to stay unchanged.
  owner: {
    name: process.env.NEXT_PUBLIC_OWNER_NAME ?? "Nick",
    title: "Owner",
  },
  senderDisplayName:
    process.env.EMAIL_SENDER_NAME ?? "Nick from Boise Cabinet Co",
  // Service-area business, not a staffed storefront. The street is published
  // in the family footer line. This object stays city and region for the
  // shorter lines already used on legal pages and in email.
  address: {
    city: "Meridian",
    state: "ID",
    country: "United States",
    region: "Treasure Valley",
  },
  serviceAreaLabel: "Serving Boise & the Treasure Valley",
  /**
   * Trust / credential signals. All env-driven so real values can be set
   * without code changes. Until set, schema omits ratings and the UI shows
   * "available on request" rather than fabricated numbers.
   * TODO(client): set NEXT_PUBLIC_* for license, GBP, and reviews before launch.
   */
  trust: {
    // Idaho registered contractor number. The code default is the verified
    // registration, so the footer and schema do not depend on an env var.
    licenseNumber: process.env.NEXT_PUBLIC_LICENSE_NUMBER || "8381215",
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
