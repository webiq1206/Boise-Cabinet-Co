/** Default blog imagery by category — each category uses a distinct local,
 *  on-brand photorealistic image (no remote stock photography).
 *  Keys must match the `category` strings in shared/blogContent.ts exactly. */
const CATEGORY_IMAGES: Record<string, string> = {
  "Kitchen Remodeling": "/images/services/kitchen-remodel.png",
  "Bathroom Remodeling": "/images/services/bathroom-remodel.png",
  "Whole-Home Remodeling": "/images/services/whole-home-remodel.png",
  "Room Additions": "/images/services/room-addition.png",
  "Planning & Permits": "/images/areas/boise.png",
  "Design-Build": "/images/services/adu.png",
  "Treasure Valley": "/images/areas/eagle.png",
};

const DEFAULT_BLOG_IMAGE = "/images/services/whole-home-remodel.png";

export function getBlogThumbnail(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}

export function getBlogHeroImage(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}
