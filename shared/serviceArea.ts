/**
 * Published service area. Owner decision: match the P5 Home Co Google
 * Business Profile. The order below is the order used on the site.
 *
 * Town pages outside this list stay published and in the sitemap. They are
 * not part of the service area and do not belong in nav or town lists.
 *
 * Owner decisions, 20 November 2026 (SEO audit): the official list is nine
 * cities. Middleton (on the P5 Home Co profile, with a published page) and
 * Garden City (added by the owner) joined the seven. SERVICE_AREA_SLUGS lists
 * only the cities with a location page here, because it drives links (the
 * footer area row). Garden City's page is /locations/garden-city.
 */

export const SERVICE_AREA_CITY_NAMES = [
  "Boise",
  "Meridian",
  "Nampa",
  "Eagle",
  "Kuna",
  "Caldwell",
  "Star",
  "Middleton",
  "Garden City",
] as const;

export const SERVICE_AREA_SLUGS = [
  "boise",
  "meridian",
  "nampa",
  "eagle",
  "kuna",
  "caldwell",
  "star",
  "middleton",
  "garden-city",
] as const;

export const SERVICE_AREA_COUNTY_NAMES = ["Ada County", "Canyon County"] as const;

export function joinWithAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Ada County members of the nine-city list. Garden City is in Ada County. */
export const ADA_COUNTY_CITY_NAMES = ["Boise", "Meridian", "Eagle", "Kuna", "Star", "Garden City"] as const;

/** Canyon County members of the nine-city list. */
export const CANYON_COUNTY_CITY_NAMES = ["Nampa", "Middleton", "Caldwell"] as const;

export const ADA_COUNTY_CITY_LIST = joinWithAnd(ADA_COUNTY_CITY_NAMES);
export const CANYON_COUNTY_CITY_LIST = joinWithAnd(CANYON_COUNTY_CITY_NAMES);

/** "Boise, Meridian, Nampa, Eagle, Kuna, Caldwell, Star, Middleton, and Garden City" */
export const SERVICE_AREA_CITY_LIST = joinWithAnd(SERVICE_AREA_CITY_NAMES);

/** Cities, then both counties. */
export const SERVICE_AREA_LIST = `${SERVICE_AREA_CITY_LIST}, plus ${joinWithAnd(SERVICE_AREA_COUNTY_NAMES)}`;

const SERVICE_AREA_SLUG_SET = new Set<string>(SERVICE_AREA_SLUGS);

export function isServiceAreaSlug(slug: string): boolean {
  return SERVICE_AREA_SLUG_SET.has(slug);
}
