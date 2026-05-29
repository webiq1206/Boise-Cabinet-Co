import Image from "next/image";
import Link from "next/link";
import { getManifestLinks } from "@/lib/internal-links";
import { getBlogThumbnail } from "@/shared/blogImages";
import { BLOG_POSTS } from "@/shared/blogContent";
import { MarketingCard } from "./MarketingCard";

interface RelatedPostCardsProps {
  path: string;
  title?: string;
  limit?: number;
}

function imageForUrl(url: string): string | undefined {
  const post = BLOG_POSTS.find((p) => url.includes(`/blog/${p.slug}`));
  if (post) return getBlogThumbnail(post.category, post.thumbnail);
  if (url.includes("kitchen")) return getBlogThumbnail("Kitchen Remodeling");
  if (url.includes("bathroom")) return getBlogThumbnail("Bathroom Remodeling");
  return getBlogThumbnail("Planning & Budget");
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
      <h2 className="font-sans font-light text-section-title mb-6 text-foreground">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((link) => {
          const img = imageForUrl(link.url);
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
