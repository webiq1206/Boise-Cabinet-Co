import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/marketing/Section';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { getBlogThumbnail, getBlogImageAlt } from '@/shared/blogImages';
import { CONTENT_HUBS, guidePath } from '@/shared/contentHubs';
import { GUIDE_PAGES, type GuidePageData } from '@/shared/guideContent';
import { locationPath } from '@/shared/contentData';
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import {
  countH2Headings,
  countSubstantiveWords,
  estimateReadingTime,
} from '@/lib/content-utils';

/** City guides moved to /locations/[city]; every other guide keeps /guides/[slug]. */
function guideHref(guide: GuidePageData): string {
  if (guide.guideType === 'location' && guide.linkedCities?.[0]) {
    return locationPath(guide.linkedCities[0]);
  }
  return guidePath(guide.slug);
}

function guideCardMeta(guide: GuidePageData) {
  const words = countSubstantiveWords(guide.content);
  const topics = countH2Headings(guide.content);
  const minutes = estimateReadingTime(words);
  return { minutes, topics };
}

function GuideCardStats({ guide }: { guide: GuidePageData }) {
  const { minutes, topics } = guideCardMeta(guide);
  return (
    <p className="text-sm text-muted-foreground mb-4">
      {topics} topics · {minutes} min read
    </p>
  );
}

export const metadata: Metadata = buildPageMetadata({
  kind: 'blog',
  path: '/guides',
  titleOverride: 'Cabinet Design Guides',
  descriptionOverride:
    'Treasure Valley cabinet guides: costs, kitchen and bath cabinetry, built-ins, company selection, project process, ROI, and local city resources.',
});

const PILLAR_TYPES = new Set(['hub-pillar', 'master']);

export default function GuidesIndexPage() {
  const pillarGuides = GUIDE_PAGES.filter((g) => PILLAR_TYPES.has(g.guideType));
  const locationGuides = GUIDE_PAGES.filter(
    (g) => g.guideType === 'location' || g.guideType === 'neighborhood',
  );
  const sortedHubs = [...CONTENT_HUBS].sort((a, b) => a.priorityTier - b.priorityTier);

  const webPageSchema = generateWebPageSchema({
    title: 'Cabinet Design Guides',
    description:
      'Treasure Valley cabinet guides: costs, kitchen and bath cabinetry, built-ins, company selection, project process, ROI, and local city resources.',
    url: '/guides',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ]);

  const pillarCollectionSchema = generateCollectionPageSchema({
    title: 'Cabinet Design Pillar Guides',
    description:
      'In-depth pillar guides covering kitchen and bath cabinetry, built-ins, costs, company selection, and project planning for Treasure Valley homeowners.',
    url: '/guides',
    items: pillarGuides.map((g) => ({
      name: g.title,
      url: guidePath(g.slug),
    })),
  });

  const locationCollectionSchema = generateCollectionPageSchema({
    title: 'Treasure Valley City & Neighborhood Cabinet Guides',
    description:
      'Local cabinet design guides for Boise, Meridian, Eagle, Nampa, and communities across Ada and Canyon County.',
    url: '/guides',
    items: locationGuides.map((g) => ({
      name: g.title,
      url: guideHref(g),
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pillarCollectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationCollectionSchema) }}
      />
      <Section spacing="lg" className="pt-28 md:pt-32">
        <div className="container px-4 max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Guides' }]} />
        </div>
        <div className="container px-4 max-w-4xl mx-auto text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-wider text-accent mb-3">
            Treasure Valley authority
          </p>
          <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight text-foreground mb-4">
            Cabinet Design Guides
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In-depth guides for Boise, Meridian, Eagle, Nampa, and the entire Treasure Valley, costs,
            finishes, layouts, and planning resources from Boise Cabinet Co.
          </p>
          <p className="mt-4">
            <Link
              href="/resources"
              className="text-sm text-accent hover:underline inline-flex items-center justify-center"
            >
              Free PDF worksheets & permit infographic
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </div>

        <div className="container px-4 max-w-6xl mx-auto mb-16">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">
            Hub pillar guides
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillarGuides.map((guide) => (
              <MarketingCard key={guide.slug} className="p-0 overflow-hidden flex flex-col h-full">
                <Link href={guidePath(guide.slug)} className="block relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={getBlogThumbnail(guide.slug, guide.heroImage)}
                    alt={getBlogImageAlt(guide.slug)}
                    fill
                    sizes="400px"
                    className="object-cover img-brand-grade"
                  />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                <BookOpen className="h-5 w-5 text-accent mb-3" />
                <h3 className="font-medium text-lg mb-2">{guide.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-3">{guide.excerpt}</p>
                <GuideCardStats guide={guide} />
                <Link
                  href={guidePath(guide.slug)}
                  className="tap-target inline-flex items-center text-sm text-accent hover:underline"
                >
                  Read guide
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                </div>
              </MarketingCard>
            ))}
          </div>
        </div>

        <div className="container px-4 max-w-6xl mx-auto mb-16">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">
            City &amp; neighborhood guides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {locationGuides.map((guide) => (
              <MarketingCard key={guide.slug} className="p-5 flex flex-col h-full">
                <MapPin className="h-4 w-4 text-accent mb-2" />
                <h3 className="font-medium text-base mb-1">{guide.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-2 line-clamp-2">
                  {guide.excerpt}
                </p>
                <GuideCardStats guide={guide} />
                <Link
                  href={guideHref(guide)}
                  className="text-sm text-accent hover:underline inline-flex items-center"
                >
                  Read
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </MarketingCard>
            ))}
          </div>
        </div>

        <div className="container px-4 max-w-6xl mx-auto">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">
            Browse by topic
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedHubs.map((hub) => {
              const hasPillar = !!hub.pillarSlug;
              return (
                <MarketingCard key={hub.hubSlug} className="p-5">
                  <h3 className="font-medium mb-1">{hub.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{hub.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {hasPillar && (
                      <Link
                        href={guidePath(hub.pillarSlug)}
                        className="text-accent hover:underline inline-flex items-center"
                      >
                        Pillar guide
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    )}
                    {hasPillar && (
                      <Link
                        href={`/blog/category/${hub.hubSlug}`}
                        className="text-muted-foreground hover:text-accent hover:underline"
                      >
                        Related articles
                      </Link>
                    )}
                  </div>
                </MarketingCard>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
