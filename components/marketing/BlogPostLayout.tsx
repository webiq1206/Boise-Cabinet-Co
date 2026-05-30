import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Phone, Tag, User, Wrench } from "lucide-react";
import { MarketingCard } from "./MarketingCard";
import { Chip } from "./Chip";
import { BlogEndCta } from "./BlogEndCta";
import { RelatedPostCards } from "./RelatedPostCards";
import { Section } from "./Section";
import { CTA_PRIMARY } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";
import type { BlogPostData } from "@/shared/blogContent";
import { getBlogHeroImage, getBlogImageAlt } from "@/shared/blogImages";
import { BlogHeroBanner } from "./BlogHeroBanner";
import { ConsultCTA } from "@/components/modals/ConsultCTA";
import { GuideContentBlocks } from "./GuideContentBlocks";
import {
  injectHeadingIds,
  extractHeadingsFromHtml,
  estimateReadingTime,
  countWords,
} from "@/lib/content-utils";
import { getHubBySlug, categoryHubPath, guidePath, getHubPillarSlug, isCategoryHubIndexable } from "@/shared/contentHubs";
import { getBlogPostsByHub } from "@/shared/blogContent";

interface BlogPostLayoutProps {
  post: BlogPostData;
  formatDate: (date: string) => string;
}

export function BlogPostLayout({ post, formatDate }: BlogPostLayoutProps) {
  const heroImage = getBlogHeroImage(post.slug, post.heroImage);
  const heroAlt = getBlogImageAlt(post.slug);
  const blogPath = `/blog/${post.slug}`;
  const hub = getHubBySlug(post.hubSlug);
  const contentWithIds = injectHeadingIds(post.content);
  const tocHeadings = extractHeadingsFromHtml(contentWithIds).filter((h) => h.level === 2);
  const readingTime = estimateReadingTime(countWords(post.content));
  const hubPosts = getBlogPostsByHub(post.hubSlug);
  const pillarSlug = getHubPillarSlug(post.hubSlug);

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <BlogHeroBanner src={heroImage} alt={heroAlt} />

      <Section spacing="sm" className="pt-8 md:pt-10 pb-0">
        <div className="container px-4 max-w-6xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
            data-testid="link-back-to-blog"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <header className="max-w-3xl mb-8 md:mb-10">
            <Chip className="mb-4">
              {hub?.categoryLabel ?? post.category}
            </Chip>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-sans font-light tracking-tight text-foreground mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-5 max-w-2xl">{post.excerpt}</p>
            <div role="presentation" className="border-t border-border/60 mb-5" />
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span>{readingTime} min read</span>
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              )}
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 min-w-0 w-full">
              <GuideContentBlocks
                quickAnswer={post.quickAnswer}
                keyTakeaways={post.keyTakeaways}
                tocHeadings={tocHeadings.length >= 3 ? tocHeadings : undefined}
              >
                <article className="blog-content prose-measure" data-testid="blog-content">
                  {post.content && (
                    <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                  )}
                </article>
              </GuideContentBlocks>

              {hub && pillarSlug && (
                <p className="mt-8 text-sm text-muted-foreground">
                  Part of our{' '}
                  <Link href={guidePath(pillarSlug)} className="text-accent hover:underline">
                    {hub.title}
                  </Link>{' '}
                  guide
                  {isCategoryHubIndexable(post.hubSlug, hubPosts.length) && (
                    <>
                      {' '}
                      ·{' '}
                      <Link
                        href={categoryHubPath(post.hubSlug)}
                        className="text-accent hover:underline"
                      >
                        All articles
                      </Link>
                    </>
                  )}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border" data-testid="blog-tags">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:hidden mt-10">
                <SidebarCta />
              </div>
            </div>

            <aside
              className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-24"
              data-testid="blog-sidebar"
            >
              <SidebarCta />
              {post.tags && post.tags.length > 0 && (
                <MarketingCard className="mt-6 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </MarketingCard>
              )}
            </aside>
          </div>
        </div>
      </Section>

      <Section spacing="sm" divider>
        <div className="container px-4 max-w-6xl mx-auto">
          <RelatedPostCards path={blogPath} />
        </div>
      </Section>

      <Section divider>
        <div className="container px-4">
          <BlogEndCta />
        </div>
      </Section>
    </div>
  );
}

function SidebarCta() {
  return (
    <MarketingCard className="cta-card-dark">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
            <Wrench className="h-5 w-5 text-inverse-foreground/60" />
          </div>
          <h3 className="font-medium text-sm text-inverse-foreground">Free Consultation</h3>
        </div>
        <p className="text-sm text-inverse-muted">
          Planning a remodel? Get a free in-home visit and rough estimate from our team.
        </p>
        <ConsultCTA variant="brand" size="sm" className="w-full" data-testid="link-sidebar-cta-consult">
          {CTA_PRIMARY}
          <ArrowRight className="ml-2 h-4 w-4" />
        </ConsultCTA>
        <p className="text-xs text-inverse-muted text-center flex items-center justify-center gap-1">
          <Phone className="h-3 w-3" />
          {SITE_CONFIG.phone}
        </p>
      </div>
    </MarketingCard>
  );
}
