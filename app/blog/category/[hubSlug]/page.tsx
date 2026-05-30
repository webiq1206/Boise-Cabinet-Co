import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '@/shared/blogContent';
import {
  CONTENT_HUBS,
  categoryHubPath,
  getHubBySlug,
  guidePath,
  isCategoryHubIndexable,
  CATEGORY_HUB_MIN_POSTS,
} from '@/shared/contentHubs';
import { buildCanonical } from '@/lib/page-metadata';
import { Section } from '@/components/marketing/Section';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/schema';

export async function generateStaticParams() {
  return CONTENT_HUBS.map((hub) => ({ hubSlug: hub.hubSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: { hubSlug: string };
}): Promise<Metadata> {
  const hub = getHubBySlug(params.hubSlug);
  if (!hub) return { title: 'Not Found' };

  const posts = BLOG_POSTS.filter((p) => p.hubSlug === params.hubSlug);
  const indexable = isCategoryHubIndexable(params.hubSlug, posts.length);
  const title = `${hub.title} Articles | Boise Remodeling Co`;
  const description = `Articles about ${hub.title.toLowerCase()} for Treasure Valley homeowners.`;

  return {
    title,
    description,
    alternates: { canonical: buildCanonical(categoryHubPath(params.hubSlug)) },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default function BlogCategoryHubPage({
  params,
}: {
  params: { hubSlug: string };
}) {
  const hub = getHubBySlug(params.hubSlug);
  if (!hub) notFound();

  const posts = BLOG_POSTS.filter((p) => p.hubSlug === params.hubSlug).sort(
    (a, b) => (a.publishedAt < b.publishedAt ? 1 : -1),
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: hub.title, url: categoryHubPath(hub.hubSlug) },
  ]);

  const collectionSchema =
    posts.length > 0
      ? generateCollectionPageSchema({
          title: hub.title,
          description: hub.description,
          url: categoryHubPath(hub.hubSlug),
          items: posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` })),
        })
      : null;

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section spacing="lg" className="pt-28 md:pt-32">
        <div className="container px-4 max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
          >
            ← Back to blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-sans font-light tracking-tight mb-4">
            {hub.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">{hub.description}</p>
          <Link
            href={guidePath(hub.pillarSlug)}
            className="inline-flex items-center text-accent hover:underline text-sm mb-10"
          >
            Read the complete guide
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>

          {posts.length < CATEGORY_HUB_MIN_POSTS && (
            <p className="text-sm text-muted-foreground mb-8">
              More articles in this topic are publishing soon.
            </p>
          )}

          <div className="grid gap-4">
            {posts.map((post) => (
              <MarketingCard key={post.slug} className="p-5">
                <Link href={`/blog/${post.slug}`} className="group">
                  <h2 className="font-medium text-lg group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
                </Link>
              </MarketingCard>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
