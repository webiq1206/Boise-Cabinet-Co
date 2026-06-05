/**
 * Marketing image paths. Prefer WebP where generated; PNG fallbacks remain for legacy assets.
 */

export const MARKETING_IMAGES = {
  heroHome: "/images/marketing/hero-home.webp",
  heroAbout: "/images/marketing/hero-about.webp",
  heroContact: "/images/marketing/hero-contact.webp",
  designStudio: "/images/marketing/hero-design-studio.webp",
  processHome: "/images/marketing/process-home.webp",
  processAbout: "/images/marketing/process-about.webp",
  processContact: "/images/marketing/process-contact.webp",
  hardware: "/images/marketing/hero-hardware.webp",
  construction: "/images/marketing/hero-construction.webp",
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

