/** Default blog imagery by category — each category uses a distinct Unsplash photo.
 *  Keys must match the `category` strings in shared/blogContent.ts exactly. */
const CATEGORY_IMAGES: Record<string, string> = {
  "Kitchen Remodeling":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
  "Bathroom Remodeling":
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
  "Whole-Home Remodeling":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  "Room Additions":
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  "Planning & Permits":
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  "Design-Build":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
  "Treasure Valley":
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80";

export function getBlogThumbnail(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}

export function getBlogHeroImage(category: string, override?: string): string {
  return override ?? CATEGORY_IMAGES[category] ?? DEFAULT_BLOG_IMAGE;
}
