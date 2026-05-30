import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { MarketingCard } from "./MarketingCard";
import { TextLink } from "./TextLink";
import { Chip } from "./Chip";
import type { BlogPostData } from "@/shared/blogContent";
import { getBlogThumbnail } from "@/shared/blogImages";

export interface BlogCardProps {
  post: BlogPostData;
  featured?: boolean;
  formatDate: (date: string) => string;
}

export function BlogCard({ post, featured = false, formatDate }: BlogCardProps) {
  const thumbnail = getBlogThumbnail(post.category, post.thumbnail);

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="block group">
        <article className="marketing-card overflow-hidden hover-elevate">
          <div className="relative aspect-[21/9] md:aspect-[2.4/1] overflow-hidden">
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover img-brand-grade transition-transform duration-300 ease-out group-hover:scale-[1.01]"
              priority
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Chip>{post.category}</Chip>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <h2 className="font-sans font-light text-2xl md:text-3xl tracking-tight text-foreground mb-3">
              {post.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl">
              {post.excerpt}
            </p>
            <TextLink href={`/blog/${post.slug}`} className="mt-4" showArrow>
              Read article
            </TextLink>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <MarketingCard className="h-full flex flex-col p-0 overflow-hidden hover-elevate">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full group">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover img-brand-grade transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </div>
        <div className="p-6 md:p-8 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Chip>{post.category}</Chip>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
          </div>
          <h3 className="text-lg font-serif font-light tracking-tight text-foreground line-clamp-2 mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
          <TextLink href={`/blog/${post.slug}`} className="mt-4" showArrow>
            Read article
          </TextLink>
        </div>
      </Link>
    </MarketingCard>
  );
}
