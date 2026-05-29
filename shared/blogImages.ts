import { GALLERY_IMAGES, SITE_IMAGES } from "./siteImages";

/** Default blog imagery by category until per-post assets are supplied. */
const CATEGORY_IMAGES: Record<string, string> = {
  "Kitchen Remodeling": GALLERY_IMAGES.kitchen.after,
  "Bathroom Remodeling": GALLERY_IMAGES.bathroom.after,
  "Whole-Home Remodeling": GALLERY_IMAGES.wholeHome.after,
  "Planning & Budget": SITE_IMAGES.process,
  "Design-Build": SITE_IMAGES.hero,
  "Treasure Valley": GALLERY_IMAGES.addition.after,
};

const DEFAULT_BLOG_IMAGE = GALLERY_IMAGES.kitchen.after;

export function getBlogThumbnail(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}

export function getBlogHeroImage(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}
