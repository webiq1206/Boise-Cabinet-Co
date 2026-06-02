/**
 * Central site configuration, NAP, URLs, and contact strings.
 * Override via env for staging; replace placeholder values before launch.
 */

const DEFAULT_PHONE = "(208) 555-0100";
const DEFAULT_PHONE_TEL = "2085550100";
const DEFAULT_EMAIL = "hello@boisecabinet.co";
const DEFAULT_SITE_URL = "https://boisecabinet.co";

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
} as const;

export function formatPhoneDisplay(tel: string = SITE_CONFIG.phoneTel): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return SITE_CONFIG.phone;
}
