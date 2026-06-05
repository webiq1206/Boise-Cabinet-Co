/**
 * SEO alt-text builders. Every meaningful catalog/marketing image gets a
 * descriptive alt that (a) describes the image, (b) localizes us to the Treasure
 * Valley, and (c) ends with the business name. Locale tokens are chosen
 * deterministically per subject so identical images stay stable while the set
 * as a whole varies (avoids one repeated string sitewide). Decorative images
 * should pass alt="" directly and not use these helpers.
 */
import { SITE_CONFIG } from "@/shared/siteConfig";

const BRAND = SITE_CONFIG.name; // "Boise Cabinet Co"

/** Service-area locale phrases (grammatical with "... in <locale>"). */
const LOCALES = [
  "Boise",
  "Meridian",
  "Eagle",
  "Nampa",
  "Kuna",
  "Star",
  "the Treasure Valley",
  "Idaho",
] as const;

function localeFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return LOCALES[h % LOCALES.length];
}

/** Generic localized, branded alt: "<subject> <descriptor> in <locale> | Brand". */
export function seoAlt(subject: string, descriptor: string, seed?: string): string {
  const loc = localeFor(seed ?? subject);
  const phrase = [subject, descriptor].filter(Boolean).join(" ");
  return `${phrase} in ${loc} | ${BRAND}`;
}

type Named = { name: string; slug?: string };

export function finishAlt(finish: Named & { category?: string }): string {
  const cat = finish.category ? `${finish.category} ` : "";
  return seoAlt(finish.name, `${cat}cabinet finish`, finish.slug ?? finish.name);
}

export function doorStyleAlt(door: Named): string {
  return seoAlt(door.name, "cabinet door style", door.slug ?? door.name);
}

export function cabinetAlt(product: Named & { category?: string }): string {
  return seoAlt(product.name, "custom cabinet", product.slug ?? product.name);
}

export function collectionAlt(collection: Named): string {
  return seoAlt(collection.name, "cabinet collection", collection.slug ?? collection.name);
}

export function roomAlt(room: Named): string {
  return seoAlt(room.name, "custom cabinets", room.slug ?? room.name);
}

export function hardwareAlt(hardware: Named): string {
  return seoAlt(hardware.name, "cabinet hardware", hardware.slug ?? hardware.name);
}

export function accessoryAlt(accessory: Named): string {
  return seoAlt(accessory.name, "cabinet accessory", accessory.slug ?? accessory.name);
}
