import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Phone,
  Tag,
  User,
  Wrench,
  BookOpen,
} from 'lucide-react';
import { MarketingCard } from './MarketingCard';
import { Chip } from './Chip';
import { BlogEndCta } from './BlogEndCta';
import { RelatedPostCards } from './RelatedPostCards';
import { Section } from './Section';
import { GuideContentBlocks } from './GuideContentBlocks';
import { CTA_PRIMARY } from '@/shared/ctaCopy';
import { SITE_CONFIG } from '@/shared/siteConfig';
import type { GuidePageData } from '@/shared/guideContent';
import { getBlogHeroImage, getBlogImageAlt } from '@/shared/blogImages';
import { BlogHeroBanner } from './BlogHeroBanner';
import { ConsultCTA } from '@/components/modals/ConsultCTA';
import { injectHeadingIds, extractHeadingsFromHtml, estimateReadingTime, countWords } from '@/lib/content-utils';
import { getHubBySlug, guidePath, getClustersForHub, categoryHubPath } from '@/shared/contentHubs';
import { CATEGORY_HUB_MIN_POSTS } from '@/shared/contentHubs';

interface GuidePageLayoutProps {
  guide: GuidePageData;
  formatDate: (date: string) => string;
}

export function GuidePageLayout({ guide, formatDate }: GuidePageLayoutProps) {
  const hub = getHubBySlug(guide.hubSlug);
  const heroImage = getBlogHeroImage(guide.slug, guide.heroImage);
  const heroAlt = getBlogImageAlt(guide.slug);
  const guideUrl = guidePath(guide.slug);
  const contentWithIds = injectHeadingIds(guide.content);
  const tocHeadings = extractHeadingsFromHtml(contentWithIds).filter((h) => h.level === 2);
  const wordCount = countWords(guide.content);
  const readingTime = estimateReadingTime(wordCount);
  const publishedClusters = getClustersForHub(guide.hubSlug, true);

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <BlogHeroBanner src={heroImage} alt={heroAlt} />

      <Section spacing="sm" className="pt-8 md:pt-10 pb-0">
        <div className="container px-4 max-w-6xl mx-auto">
          <Link
            href="/guides"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
            data-testid="link-back-to-guides"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Remodeling Guides
          </Link>

          <header className="max-w-3xl mb-8 md:mb-10">
            {hub && (
              <Chip className="mb-4">{hub.categoryLabel}</Chip>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-sans font-light tracking-tight text-foreground mb-4">
              {guide.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-5 max-w-2xl">{guide.excerpt}</p>
            <div role="presentation" className="border-t border-border/60 mb-5" />
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(guide.publishedAt)}
              </span>
              <span>{readingTime} min read</span>
              {guide.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {guide.author}
                </span>
              )}
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 min-w-0 w-full">
              <GuideContentBlocks
                quickAnswer={guide.quickAnswer}
                keyTakeaways={guide.keyTakeaways}
                tocHeadings={tocHeadings}
              >
                <article className="blog-content prose-measure" data-testid="guide-content">
                  <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                </article>
              </GuideContentBlocks>

              {publishedClusters.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-medium">Related articles in this guide</h2>
                  </div>
                  <ul className="space-y-2">
                    {publishedClusters.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/blog/${c.replacesSlug ?? c.slug}`}
                          className="text-sm text-accent hover:underline"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {publishedClusters.length >= CATEGORY_HUB_MIN_POSTS && (
                    <Link
                      href={categoryHubPath(guide.hubSlug)}
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mt-4"
                    >
                      View all in {hub?.title}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}

              {guide.tags && guide.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {guide.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:hidden mt-10">
                <SidebarCta />
              </div>
            </div>

            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-24">
              <SidebarCta />
            </aside>
          </div>
        </div>
      </Section>

      <Section spacing="sm" divider>
        <div className="container px-4 max-w-6xl mx-auto">
          <RelatedPostCards path={guideUrl} />
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
          Ready for a written scope? Schedule an in-home visit with our design-build team.
        </p>
        <ConsultCTA variant="brand" size="sm" className="w-full">
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
