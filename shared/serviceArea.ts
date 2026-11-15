/**
 * Published service area. Owner decision: match the P5 Home Co Google
 * Business Profile. The order below is the order used on the site.
 *
 * Town pages outside this list stay published and in the sitemap. They are
 * not part of the service area and do not belong in nav or town lists.
 */

export const SERVICE_AREA_CITY_NAMES = [
  "Boise",
  "Meridian",
  "Nampa",
  "Eagle",
  "Kuna",
  "Caldwell",
  "Star",
] as const;

export const SERVICE_AREA_SLUGS = [
  "boise",
  "meridian",
  "nampa",
  "eagle",
  "kuna",
  "caldwell",
  "star",
] as const;

export const SERVICE_AREA_COUNTY_NAMES = ["Ada County", "Canyon County"] as const;

export function joinWithAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** "Boise, Meridian, Nampa, Eagle, Kuna, Caldwell, and Star" */
export const SERVICE_AREA_CITY_LIST = joinWithAnd(SERVICE_AREA_CITY_NAMES);

/** Cities, then both counties. */
export const SERVICE_AREA_LIST = `${SERVICE_AREA_CITY_LIST}, plus ${joinWithAnd(SERVICE_AREA_COUNTY_NAMES)}`;

const SERVICE_AREA_SLUG_SET = new Set<string>(SERVICE_AREA_SLUGS);

export function isServiceAreaSlug(slug: string): boolean {
  return SERVICE_AREA_SLUG_SET.has(slug);
}
