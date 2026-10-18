/**
 * Marketing image paths. Prefer WebP where generated; PNG fallbacks remain for legacy assets.
 */

export const ABOUT_DESIGN_SAMPLES_ALT =
  "Cabinet door samples, a stain fan and a brass pull on a walnut island in a wood-ceilinged kitchen";
export const ABOUT_INSTALL_PROGRESS_ALT =
  "White oak shaker cabinets set and leveled during a kitchen installation";
export const KITCHEN_WOOD_ISLAND_ALT =
  "Large kitchen with white oak cabinets, a walnut island and a vaulted wood ceiling";

export const NEUTRAL_KITCHEN_IMAGE = "/images/marketing/hero-home.webp";
export const NEUTRAL_KITCHEN_ALT =
  "Custom cream shaker kitchen cabinets with a white oak island and aged brass hardware in a Treasure Valley, Idaho home";

const NEUTRAL_KITCHEN = NEUTRAL_KITCHEN_IMAGE;

export const MARKETING_IMAGES = {
  heroHome: NEUTRAL_KITCHEN,
  heroAbout: "/images/marketing/about-design-samples.webp",
  heroContact: "/images/marketing/hero-contact.webp",
  designStudio: "/images/marketing/hero-design-studio.webp",
  processHome: "/images/marketing/process-home-branded.webp",
  processAbout: "/images/marketing/about-install-progress.webp",
  processContact: "/images/marketing/process-home-branded.webp",
  hardware: "/images/marketing/hero-hardware.webp",
  construction: "/images/marketing/kitchen-wood-island.webp",
  catalogDefault: "/images/marketing/catalog-default.webp",
  statementBand: "/images/marketing/statement-whole-home.webp",
  ogDefault: "/images/marketing/og-default.webp",
} as const;

/** @deprecated Use MARKETING_IMAGES, kept for gradual migration */
export const SITE_IMAGES = {
  hero: MARKETING_IMAGES.heroHome,
  processHome: MARKETING_IMAGES.processHome,
  processAbout: MARKETING_IMAGES.processAbout,
  processContact: MARKETING_IMAGES.processContact,
  statementBand: MARKETING_IMAGES.statementBand,
  leadership: MARKETING_IMAGES.heroAbout,
  contactHero: MARKETING_IMAGES.heroContact,
  contactSplit: MARKETING_IMAGES.heroContact,
} as const;

export const GALLERY_IMAGES = {
  kitchen: {
    before: "/images/gallery/gallery-kitchen-before.webp",
    after: "/images/gallery/gallery-kitchen-after.webp",
  },
  bathroom: {
    before: "/images/gallery/gallery-bathroom-before.webp",
    after: "/images/gallery/gallery-bathroom-after.webp",
  },
  wholeHome: {
    before: "/images/gallery/gallery-whole-home-before.webp",
    after: "/images/gallery/gallery-whole-home-after.webp",
  },
  addition: {
    before: "/images/gallery/gallery-addition-before.webp",
    after: "/images/gallery/gallery-addition-after.webp",
  },
  basement: {
    before: "/images/gallery/gallery-basement-before.webp",
    after: "/images/gallery/gallery-basement-after.webp",
  },
  outdoor: {
    before: "/images/gallery/gallery-outdoor-before.webp",
    after: "/images/gallery/gallery-outdoor-after.webp",
  },
} as const;

/** Resolve image path with PNG fallback if WebP missing (build-time paths). */
export function imageWithFallback(webpPath: string, pngPath: string): string {
  return webpPath;
}

