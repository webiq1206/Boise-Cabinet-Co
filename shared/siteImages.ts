/**
 * Marketing image paths. SVG placeholders ship with the repo; replace with
 * your own project photography (same filenames, .jpg or .webp also work if
 * you update paths here).
 */

export const SITE_IMAGES = {
  hero: "/images/hero-remodel-interior.svg",
  process: "/images/process-design-review.svg",
  statementBand: "/images/gallery/gallery-whole-home-after.svg",
  leadership: "/images/gallery/gallery-kitchen-after.svg",
} as const;

export const GALLERY_IMAGES = {
  kitchen: {
    before: "/images/gallery/gallery-kitchen-before.svg",
    after: "/images/gallery/gallery-kitchen-after.svg",
  },
  bathroom: {
    before: "/images/gallery/gallery-bathroom-before.svg",
    after: "/images/gallery/gallery-bathroom-after.svg",
  },
  wholeHome: {
    before: "/images/gallery/gallery-whole-home-before.svg",
    after: "/images/gallery/gallery-whole-home-after.svg",
  },
  addition: {
    before: "/images/gallery/gallery-addition-before.svg",
    after: "/images/gallery/gallery-addition-after.svg",
  },
  basement: {
    before: "/images/gallery/gallery-basement-before.svg",
    after: "/images/gallery/gallery-basement-after.svg",
  },
  outdoor: {
    before: "/images/gallery/gallery-outdoor-before.svg",
    after: "/images/gallery/gallery-outdoor-after.svg",
  },
} as const;
