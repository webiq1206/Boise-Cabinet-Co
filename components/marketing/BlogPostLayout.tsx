import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Tag, User, BookOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Chip } from './Chip';
import { BlogEndCta } from './BlogEndCta';
import { RelatedPostCards } from './RelatedPostCards';
import { Section } from './Section';
import type { BlogPostData } from '@/shared/blogContent';
import { getBlogHeroImage, getBlogImageAlt } from '@/shared/blogImages';
import { BlogHeroBanner } from './BlogHeroBanner';
import { GuideContentBlocks, GuideJumpChips } from './GuideContentBlocks';
import { SectionedArticle } from './SectionedArticle';
import { ArticleSidebar, ArticleSidebarCta } from './ArticleSidebar';
import {
  injectHeadingIds,
  extractHeadingsFromHtml,
  estimateReadingTime,
  countSubstantiveWords,
} from '@/lib/content-utils';
import {
  getHubBySlug,
  categoryHubPath,
  guidePath,
  getHubPillarSlug,
  isCategoryHubIndexable,
} from '@/shared/contentHubs';
import { getBlogPostsByHub } from '@/shared/blogContent';
import { getResourcesForBlog } from '@/shared/guideResources';
import { GuideResourceDownloads } from './GuideResourceDownloads';
import { ShareBar } from '@/components/blog/ShareBar';
import { SITE_CONFIG } from '@/shared/siteConfig';

interface BlogPostLayoutProps {
  post: BlogPostData;
  formatDate: (date: string) => string;
}

export function BlogPostLayout({ post, formatDate }: BlogPostLayoutProps) {
  const heroImage = getBlogHeroImage(post.slug, post.heroImage);
  const heroAlt = getBlogImageAlt(post.slug);
  const heroCaption = `${post.title}, custom cabinet design and installation in the Treasure Valley by Boise Cabinet Co.`;
  const blogPath = `/blog/${post.slug}`;
  const hub = getHubBySlug(post.hubSlug);
  const contentWithIds = injectHeadingIds(post.content);
  const tocHeadings = extractHeadingsFromHtml(contentWithIds);
  const readingTime = estimateReadingTime(countSubstantiveWords(post.content));
  const hubPosts = getBlogPostsByHub(post.hubSlug);
  const pillarSlug = getHubPillarSlug(post.hubSlug);
  const resources = getResourcesForBlog(post.slug);
  const shareUrl = `${SITE_CONFIG.siteUrl}${blogPath}`;

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <BlogHeroBanner src={heroImage} alt={heroAlt} />
      <div className="container px-4 max-w-4xl mx-auto -mt-2 mb-2">
        <p className="text-sm text-muted-foreground text-center md:text-left">{heroCaption}</p>
      </div>

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
            <Chip className="mb-4">{hub?.categoryLabel ?? post.category}</Chip>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-serif tracking-tight text-foreground mb-4">
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

          <ShareBar url={shareUrl} title={post.title} className="mb-8" />

          <GuideJumpChips headings={tocHeadings} />

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 min-w-0 w-full">
              <GuideContentBlocks quickAnswer={post.quickAnswer} keyTakeaways={post.keyTakeaways}>
                <GuideResourceDownloads resources={resources} />

                {hub && pillarSlug && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-5 md:p-6 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      <p className="text-sm font-medium">Part of a larger guide</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      This article goes deep on one topic. Start with the overview if you have not
                      read it yet.
                    </p>
                    <Link
                      href={guidePath(pillarSlug)}
                      className="tap-target text-sm text-accent hover:underline inline-flex items-center font-medium"
                    >
                      {hub.title}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                    {isCategoryHubIndexable(post.hubSlug, hubPosts.length) && (
                      <>
                        <span className="text-muted-foreground mx-2">·</span>
                        <Link
                          href={categoryHubPath(post.hubSlug)}
                          className="text-sm text-muted-foreground hover:text-accent hover:underline"
                        >
                          All articles in this topic
                        </Link>
                      </>
                    )}
                  </div>
                )}

                <SectionedArticle html={contentWithIds} testId="blog-content" />
              </GuideContentBlocks>

              {post.faqs && post.faqs.length > 0 && (
                <section className="mt-12 pt-8 border-t border-border" data-testid="blog-faqs">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Common questions
                  </p>
                  <h2 className="text-xl md:text-2xl font-serif tracking-tight text-foreground mb-6">
                    Frequently asked questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {post.faqs.map((faq, i) => (
                      <AccordionItem
                        key={faq.question}
                        value={`faq-${i}`}
                        className="border-0 border-t border-border"
                      >
                        <AccordionTrigger className="text-left py-5 hover:no-underline font-sans font-medium text-sm text-foreground">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base leading-relaxed pb-6 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

              <div className="mt-12 pt-8 border-t border-border">
                <ShareBar url={shareUrl} title={post.title} withHeading />
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border lg:hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:hidden mt-10">
                <ArticleSidebarCta description="Planning cabinet work? Get a free design visit and planning range from our team." />
              </div>
            </div>

            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-24 self-start">
              <ArticleSidebar
                tocHeadings={tocHeadings}
                ctaDescription="Planning cabinet work? Get a free design visit and planning range from our team."
              />
              {post.tags && post.tags.length > 0 && (
                <div className="mt-6 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
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

      <BlogEndCta />
    </div>
  );
}
