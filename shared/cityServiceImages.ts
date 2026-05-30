/**
 * Unique, custom photorealistic images for every service × city combination
 * (5 services × 8 cities = 40 total) plus per-city hero images for the
 * /areas/[city] pages and per-service fallback images.
 *
 * All images are local static assets under `public/images/`. Each service has a
 * coherent look, subtly varied per city with regional cues. No two pages share
 * the same image.
 *
 * Key format for CITY_SERVICE_IMAGES: "service-slug/city-slug"
 */

const SERVICE_SLUGS = [
  "kitchen-remodel",
  "bathroom-remodel",
  "whole-home-remodel",
  "room-addition",
  "adu",
] as const;

const CITY_SLUGS = [
  "boise",
  "meridian",
  "eagle",
  "nampa",
  "kuna",
  "star",
  "middleton",
  "caldwell",
] as const;

function buildCityServiceImages(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const service of SERVICE_SLUGS) {
    for (const city of CITY_SLUGS) {
      map[`${service}/${city}`] = `/images/city-service/${service}__${city}.png`;
    }
  }
  return map;
}

export const CITY_SERVICE_IMAGES: Record<string, string> = buildCityServiceImages();

/**
 * Distinct neighborhood-style hero images for each city area page.
 */
export const CITY_HERO_IMAGES: Record<string, string> = {
  boise: "/images/areas/boise.png",
  meridian: "/images/areas/meridian.png",
  eagle: "/images/areas/eagle.png",
  nampa: "/images/areas/nampa.png",
  kuna: "/images/areas/kuna.png",
  star: "/images/areas/star.png",
  middleton: "/images/areas/middleton.png",
  caldwell: "/images/areas/caldwell.png",
};

/**
 * Service-category fallback images (used when no city match is available).
 * Each is visually distinct from the others.
 */
export const SERVICE_FALLBACK_IMAGES: Record<string, string> = {
  "kitchen-remodel": "/images/services/kitchen-remodel.png",
  "bathroom-remodel": "/images/services/bathroom-remodel.png",
  "whole-home-remodel": "/images/services/whole-home-remodel.png",
  "room-addition": "/images/services/room-addition.png",
  "adu": "/images/services/adu.png",
};

/**
 * Resolve the dedicated hero image for a specific service-in-city page.
 * Falls back to the service hero image, then undefined.
 */
export function getCityServiceBackground(
  serviceSlug: string,
  citySlug: string,
): string | undefined {
  return (
    CITY_SERVICE_IMAGES[`${serviceSlug}/${citySlug}`] ??
    SERVICE_FALLBACK_IMAGES[serviceSlug]
  );
}

/**
 * Look up a unique image for an internal URL (used by related-link cards).
 * Uses exact path-segment matching so partial names (e.g. a blog slug that
 * contains "star" or "eagle") can never accidentally match a city or service.
 * Returns undefined if the URL is not a service or area page.
 */
export function getCityServiceImage(url: string): string | undefined {
  const pathname = url.split("?")[0].split("#")[0];
  const segments = pathname.split("/").filter(Boolean);

  // /services/:service or /services/:service/:city
  if (segments[0] === "services" && segments[1]) {
    const service = segments[1];
    const city = segments[2];
    if (city) {
      const key = `${service}/${city}`;
      if (CITY_SERVICE_IMAGES[key]) return CITY_SERVICE_IMAGES[key];
    }
    if (SERVICE_FALLBACK_IMAGES[service]) return SERVICE_FALLBACK_IMAGES[service];
  }

  // /areas/:city
  if (segments[0] === "areas" && segments[1]) {
    const city = segments[1];
    if (CITY_HERO_IMAGES[city]) return CITY_HERO_IMAGES[city];
  }

  return undefined;
}
