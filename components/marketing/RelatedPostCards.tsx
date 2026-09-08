import Image from "next/image";
import { getRoomBySlug } from "@/shared/catalog";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import Link from "next/link";
import { getManifestLinks } from "@/lib/internal-links";
import { getBlogImageAlt, getBlogThumbnail } from "@/shared/blogImages";
import { BLOG_POSTS } from "@/shared/blogContent";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { getCityServiceImage, getCityServiceImageAlt } from "@/shared/cityServiceImages";

interface RelatedPostCardsProps {
  path: string;
  title?: string;
  limit?: number;
}

function slugFromUrl(url: string): string | undefined {
  const pathname = url.split("?")[0].split("#")[0];
  const blogMatch = pathname.match(/\/blog\/([^/]+)$/);
  if (blogMatch) return blogMatch[1];
  const guideMatch = pathname.match(/\/guides\/([^/]+)$/);
  if (guideMatch) return guideMatch[1];
  return undefined;
}

function imageForUrl(url: string): { src: string; alt: string } | null {
  const slug = slugFromUrl(url);
  if (slug) {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (post) {
      return {
        src: getBlogThumbnail(post.slug, post.thumbnail),
        alt: getBlogImageAlt(post.slug),
      };
    }
    const guide = GUIDE_PAGES.find((g) => g.slug === slug);
    if (guide) {
      return {
        src: getBlogThumbnail(guide.slug, guide.heroImage),
        alt: getBlogImageAlt(guide.slug),
      };
    }
  }

  const csImage = getCityServiceImage(url);
  if (csImage) {
    return {
      src: csImage,
      alt: getCityServiceImageAlt(url) ?? "Boise Cabinet Co custom cabinet project photography",
    };
  }

  // Room pages carry their own hero; anything else gets the catalog default so
  // no card in the row is a bare title beside cards with photographs.
  const roomMatch = url.match(/\/cabinets\/([a-z0-9-]+)\/?$/);
  const room = roomMatch ? getRoomBySlug(roomMatch[1]) : undefined;
  if (room?.heroImage) {
    return { src: room.heroImage, alt: `${room.name} custom cabinets by Boise Cabinet Co` };
  }
  return { src: MARKETING_IMAGES.catalogDefault, alt: "Boise Cabinet Co custom cabinetry" };
}

export function RelatedPostCards({
  path,
  title = "Related resources",
  limit = 6,
}: RelatedPostCardsProps) {
  const links = getManifestLinks(path).slice(0, limit);
  if (links.length === 0) return null;

  return (
    <div>
      <h2 className="ed-h2-sm ed-statement-wide mb-8">{title}</h2>
      <div className="ed-cards-3 gap-5">
        {links.map((link) => {
          const image = imageForUrl(link.url);
          return (
            <Link key={link.url} href={link.url} className="block group">
              <article className="ed-card ed-card-link h-full overflow-hidden p-0">
                {image && (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="400px"
                      className="object-cover img-brand-grade"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                  {link.anchor}
                </p>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
