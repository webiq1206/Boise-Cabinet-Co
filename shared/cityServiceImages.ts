/**
 * Unique Unsplash images for every city × service combination (32 total)
 * and per-city hero images for the /areas/[city] pages.
 *
 * Key format for CITY_SERVICE_IMAGES: "service-slug/city-slug"
 */

export const CITY_SERVICE_IMAGES: Record<string, string> = {
  // ── Kitchen Remodel ─────────────────────────────────────────────────────────
  "kitchen-remodel/boise":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/meridian":
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/eagle":
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/nampa":
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/kuna":
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/star":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/middleton":
    "https://images.unsplash.com/photo-1549187994-cb18b4eff90f?auto=format&fit=crop&w=800&q=80",
  "kitchen-remodel/caldwell":
    "https://images.unsplash.com/photo-1556904256-74b8bc98c9e3?auto=format&fit=crop&w=800&q=80",

  // ── Bathroom Remodel ────────────────────────────────────────────────────────
  "bathroom-remodel/boise":
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/meridian":
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/eagle":
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/nampa":
    "https://images.unsplash.com/photo-1620626011761-996317702149?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/kuna":
    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/star":
    "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/middleton":
    "https://images.unsplash.com/photo-1540518978878-f60cbf21f54b?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel/caldwell":
    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=800&q=80",

  // ── Whole-Home Remodel ──────────────────────────────────────────────────────
  "whole-home-remodel/boise":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/meridian":
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/eagle":
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/nampa":
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/kuna":
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/star":
    "https://images.unsplash.com/photo-1600607687939-ce8a6c349922?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/middleton":
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel/caldwell":
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80",

  // ── Room Addition ───────────────────────────────────────────────────────────
  "room-addition/boise":
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  "room-addition/meridian":
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
  "room-addition/eagle":
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "room-addition/nampa":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  "room-addition/kuna":
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
  "room-addition/star":
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80",
  "room-addition/middleton":
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
  "room-addition/caldwell":
    "https://images.unsplash.com/photo-1600047508788-786f3865b34c?auto=format&fit=crop&w=800&q=80",
};

/**
 * Distinct aerial/neighborhood-style hero images for each city area page.
 */
export const CITY_HERO_IMAGES: Record<string, string> = {
  boise:
    "https://images.unsplash.com/photo-1598495996868-5e0dc19a6b8e?auto=format&fit=crop&w=1200&q=80",
  meridian:
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
  eagle:
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
  nampa:
    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
  kuna:
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
  star:
    "https://images.unsplash.com/photo-1598714805247-5dd1c6a5d184?auto=format&fit=crop&w=1200&q=80",
  middleton:
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
  caldwell:
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Service-category fallback images (used when no city match is available).
 * Each is visually distinct from the others.
 */
export const SERVICE_FALLBACK_IMAGES: Record<string, string> = {
  "kitchen-remodel":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
  "bathroom-remodel":
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
  "whole-home-remodel":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  "room-addition":
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
};

/**
 * Look up a unique image for a city-service URL.
 * Returns undefined if neither city nor service can be identified.
 */
export function getCityServiceImage(url: string): string | undefined {
  const serviceKeys = [
    "kitchen-remodel",
    "bathroom-remodel",
    "whole-home-remodel",
    "room-addition",
  ];
  const cityKeys = [
    "boise",
    "meridian",
    "eagle",
    "nampa",
    "kuna",
    "star",
    "middleton",
    "caldwell",
  ];

  const service = serviceKeys.find((s) => url.includes(s));
  const city = cityKeys.find((c) => url.includes(c));

  if (service && city) {
    const key = `${service}/${city}`;
    if (CITY_SERVICE_IMAGES[key]) return CITY_SERVICE_IMAGES[key];
  }

  if (city && CITY_HERO_IMAGES[city]) return CITY_HERO_IMAGES[city];
  if (service && SERVICE_FALLBACK_IMAGES[service])
    return SERVICE_FALLBACK_IMAGES[service];

  return undefined;
}
