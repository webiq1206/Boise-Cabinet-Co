import Image from "next/image";
import Link from "next/link";
import { getManifestLinks } from "@/lib/internal-links";
import { getBlogThumbnail } from "@/shared/blogImages";
import { BLOG_POSTS } from "@/shared/blogContent";
import { getCityServiceImage } from "@/shared/cityServiceImages";
import { MarketingCard } from "./MarketingCard";

interface RelatedPostCardsProps {
  path: string;
  title?: string;
  limit?: number;
}

function imageForUrl(url: string, usedImages: Set<string>): string {
  const post = BLOG_POSTS.find((p) => url.includes(`/blog/${p.slug}`));
  if (post) {
    const img = getBlogThumbnail(post.category, post.thumbnail);
    if (!usedImages.has(img)) { usedImages.add(img); return img; }
  }

  const csImage = getCityServiceImage(url);
  if (csImage && !usedImages.has(csImage)) {
    usedImages.add(csImage);
    return csImage;
  }

  const categoryFallbacks = [
    "/images/services/kitchen-remodel.png",
    "/images/services/bathroom-remodel.png",
    "/images/services/whole-home-remodel.png",
    "/images/services/room-addition.png",
    "/images/services/adu.png",
    "/images/areas/boise.png",
    "/images/areas/eagle.png",
  ];

  for (const fb of categoryFallbacks) {
    if (!usedImages.has(fb)) {
      usedImages.add(fb);
      return fb;
    }
  }

  return categoryFallbacks[0];
}

export function RelatedPostCards({
  path,
  title = "Related resources",
  limit = 6,
}: RelatedPostCardsProps) {
  const links = getManifestLinks(path).slice(0, limit);
  if (links.length === 0) return null;

  const usedImages = new Set<string>();

  return (
    <div>
      <h2 className="font-sans font-light text-section-title mb-6 text-foreground">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((link) => {
          const img = imageForUrl(link.url, usedImages);
          return (
            <Link key={link.url} href={link.url} className="block group">
              <MarketingCard className="overflow-hidden hover-elevate h-full">
                {img && (
                  <div className="relative aspect-[16/9] -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-4">
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="400px"
                      className="object-cover img-brand-grade"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                  {link.anchor}
                </p>
              </MarketingCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
