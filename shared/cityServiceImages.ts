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

import { GALLERY_IMAGES, SITE_IMAGES } from "./siteImages";
import {
  getServiceBackground,
  type LandingImageSet,
} from "./serviceBackgrounds";

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
  boise: "/images/areas/boise.webp",
  meridian: "/images/areas/meridian.webp",
  eagle: "/images/areas/eagle.webp",
  nampa: "/images/areas/nampa.webp",
  kuna: "/images/areas/kuna.webp",
  star: "/images/areas/star.webp",
  middleton: "/images/areas/middleton.webp",
  caldwell: "/images/areas/caldwell.webp",
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
 * Per-service "finished room" gallery photos, used for the breather band on
 * city-service pages so it differs from the city-specific hero render.
 */
const SERVICE_GALLERY_AFTER: Record<string, string> = {
  "kitchen-remodel": GALLERY_IMAGES.kitchen.after,
  "bathroom-remodel": GALLERY_IMAGES.bathroom.after,
  "whole-home-remodel": GALLERY_IMAGES.wholeHome.after,
  "room-addition": GALLERY_IMAGES.addition.after,
  adu: GALLERY_IMAGES.basement.after,
};

const CITY_DISPLAY: Record<string, string> = {
  boise: "Boise",
  meridian: "Meridian",
  eagle: "Eagle",
  nampa: "Nampa",
  kuna: "Kuna",
  star: "Star",
  middleton: "Middleton",
  caldwell: "Caldwell",
};

const SERVICE_LABELS: Record<string, string> = {
  "kitchen-remodel": "Kitchen custom cabinets",
  "bathroom-remodel": "Bathroom vanity cabinets",
  "whole-home-remodel": "Whole-home custom cabinets",
  "room-addition": "Built-in cabinet addition",
  adu: "ADU kitchen and storage cabinets",
  "kitchen-cabinets": "Kitchen custom cabinets",
  "bathroom-cabinets": "Bathroom vanity cabinets",
  "custom-built-ins": "Custom built-in cabinets",
  "closet-cabinets": "Closet cabinet systems",
  "whole-home-cabinets": "Whole-home cabinet packages",
};

function cityServiceHeroAlt(serviceSlug: string, citySlug: string): string {
  const service = SERVICE_LABELS[serviceSlug] ?? "Custom cabinets";
  const city = CITY_DISPLAY[citySlug] ?? citySlug;
  return `${service} in ${city}, Idaho, Boise Cabinet Co cabinetry`;
}

function cityServiceProcessAlt(serviceSlug: string): string {
  const service = SERVICE_LABELS[serviceSlug] ?? "Custom cabinets";
  return `${service} installation and design process by Boise Cabinet Co`;
}

function areaHeroAlt(citySlug: string): string {
  const city = CITY_DISPLAY[citySlug] ?? citySlug;
  return `Custom kitchen and bathroom cabinets in ${city}, Idaho by Boise Cabinet Co`;
}

function areaProcessAlt(citySlug: string): string {
  const city = CITY_DISPLAY[citySlug] ?? citySlug;
  return `Whole-home custom cabinet package installed in ${city}, Idaho`;
}

/**
 * Three distinct images for a service-in-city page: the unique city-service
 * render as the hero, a finished-room gallery photo for the breather band, and
 * the generic service photo for the process panel. Each slot falls back to the
 * hero image when a dedicated photo is unavailable.
 */
export function getCityServiceImageSet(
  serviceSlug: string,
  citySlug: string,
): LandingImageSet {
  const hero =
    CITY_SERVICE_IMAGES[`${serviceSlug}/${citySlug}`] ??
    SERVICE_FALLBACK_IMAGES[serviceSlug] ??
    getServiceBackground(serviceSlug);
  const heroAlt = cityServiceHeroAlt(serviceSlug, citySlug);
  const processAlt = cityServiceProcessAlt(serviceSlug);
  return {
    hero,
    breather: SERVICE_GALLERY_AFTER[serviceSlug] ?? hero,
    process: SERVICE_FALLBACK_IMAGES[serviceSlug] ?? hero,
    heroAlt,
    processAlt,
  };
}

/**
 * Three distinct images for an area (city) page: the neighborhood hero, plus
 * two different service renders set in that same city for the breather band and
 * process panel. Each slot falls back to the hero image when unavailable.
 */
export function getAreaImageSet(citySlug: string): LandingImageSet {
  const hero = CITY_HERO_IMAGES[citySlug] ?? SITE_IMAGES.hero;
  const heroAlt = areaHeroAlt(citySlug);
  const processAlt = areaProcessAlt(citySlug);
  return {
    hero,
    breather: CITY_SERVICE_IMAGES[`kitchen-remodel/${citySlug}`] ?? hero,
    process: CITY_SERVICE_IMAGES[`whole-home-remodel/${citySlug}`] ?? hero,
    heroAlt,
    processAlt,
  };
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

export function getCityServiceImageAlt(url: string): string | undefined {
  const pathname = url.split("?")[0].split("#")[0];
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "services" && segments[1]) {
    const service = segments[1];
    const city = segments[2];
    if (city) return cityServiceHeroAlt(service, city);
    const label = SERVICE_LABELS[service] ?? "Custom cabinets";
    return `${label} by Boise Cabinet Co in the Treasure Valley`;
  }

  if (segments[0] === "areas" && segments[1]) {
    return areaHeroAlt(segments[1]);
  }

  return undefined;
}
