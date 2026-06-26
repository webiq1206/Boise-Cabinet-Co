import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GUIDE_PAGES, getGuideBySlug } from '@/shared/guideContent';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateServiceSchema,
  generateSpeakableSchema,
} from '@/lib/schema';
import { buildCanonical } from '@/lib/page-metadata';
import { GuidePageLayout } from '@/components/marketing/GuidePageLayout';
import { getHubBySlug, guidePath } from '@/shared/contentHubs';
import {
  getAbsoluteImageUrl,
  getBlogHeroImage,
  getBlogImageAlt,
} from '@/shared/blogImages';
import { getBaseUrl } from '@/lib/seo';

export async function generateStaticParams() {
  return GUIDE_PAGES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return { title: 'Guide Not Found' };

  const title = guide.seoTitle || guide.title;
  const description =
    guide.metaDescription ||
    (guide.excerpt.length > 160 ? guide.excerpt.substring(0, 157) + '...' : guide.excerpt);
  const heroPath = getBlogHeroImage(guide.slug, guide.heroImage);
  const imageUrl = getAbsoluteImageUrl(heroPath, getBaseUrl());
  const imageAlt = getBlogImageAlt(guide.slug);

  return {
    title,
    description,
    alternates: { canonical: buildCanonical(guidePath(guide.slug)) },
    openGraph: {
      title: `${title} | Boise Cabinet Co`,
      description,
      url: buildCanonical(guidePath(guide.slug)),
      type: 'article',
      publishedTime: guide.publishedAt,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Boise Cabinet Co`,
      description,
      images: [imageUrl],
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const hub = getHubBySlug(guide.hubSlug);
  const path = guidePath(guide.slug);

  const articleSchema = generateArticleSchema({
    title: guide.title,
    description: guide.excerpt,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    slug: guide.slug,
    pathPrefix: 'guides',
    image: getAbsoluteImageUrl(getBlogHeroImage(guide.slug, guide.heroImage), getBaseUrl()),
  });

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ];
  if (hub && hub.pillarSlug) {
    breadcrumbItems.push({
      name: hub.title,
      url: guidePath(hub.pillarSlug),
    });
  }
  breadcrumbItems.push({ name: guide.title, url: path });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = guide.faqs.length > 0 ? generateFAQSchema(guide.faqs) : null;
  const speakableSchema = guide.quickAnswer
    ? generateSpeakableSchema({ name: guide.title, path })
    : null;

  const locationCity =
    guide.guideType === 'location' && guide.linkedCities?.[0]
      ? guide.linkedCities[0].charAt(0).toUpperCase() + guide.linkedCities[0].slice(1)
      : null;
  const serviceSchema = locationCity
    ? generateServiceSchema(
        `Custom Cabinets in ${locationCity}, Idaho`,
        `Custom kitchen cabinets, bathroom vanities, and built-in storage designed, built, and installed for ${locationCity} homes by Boise Cabinet Co.`,
        locationCity,
      )
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {speakableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
        />
      )}
      {serviceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
      <GuidePageLayout guide={guide} formatDate={formatDate} />
    </>
  );
}
