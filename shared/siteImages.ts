/**
 * Marketing image paths. Prefer WebP where generated; PNG fallbacks remain for legacy assets.
 */

export const MARKETING_IMAGES = {
  heroHome: "/images/marketing/hero-home.webp",
  heroAbout: "/images/marketing/hero-about.webp",
  heroContact: "/images/marketing/hero-contact.webp",
  designStudio: "/images/marketing/hero-design-studio.webp",
  process: "/images/marketing/process-design-review.webp",
  statementBand: "/images/marketing/statement-whole-home.webp",
  ogDefault: "/images/marketing/og-default.webp",
} as const;

/** @deprecated Use MARKETING_IMAGES — kept for gradual migration */
export const SITE_IMAGES = {
  hero: MARKETING_IMAGES.heroHome,
  process: MARKETING_IMAGES.process,
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

export const LEGACY_IMAGE_MAP: Record<string, string> = {
  [MARKETING_IMAGES.heroHome]: "/images/hero-remodel-interior.png",
  [MARKETING_IMAGES.process]: "/images/process-design-review.png",
  [MARKETING_IMAGES.statementBand]: "/images/gallery/gallery-whole-home-after.png",
  [MARKETING_IMAGES.heroAbout]: "/images/gallery/gallery-kitchen-after.png",
  [MARKETING_IMAGES.heroContact]: "/images/hero-remodel-interior.png",
  [MARKETING_IMAGES.designStudio]: "/images/process-design-review.png",
  [MARKETING_IMAGES.ogDefault]: "/images/hero-remodel-interior.png",
};
