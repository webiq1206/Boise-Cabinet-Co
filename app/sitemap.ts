import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { COLLECTIONS } from '@/shared/catalog/collections';
import { DOOR_STYLES } from '@/shared/catalog/doorStyles';
import { CABINET_PRODUCTS } from '@/shared/catalog/cabinetProducts';
import {
  CONTENT_HUBS,
  categoryHubPath,
  guidePath,
  isCategoryHubIndexable,
} from '@/shared/contentHubs';
import { getBaseUrl } from '@/lib/seo';
import { indexableFinishes } from '@/lib/catalog/indexation';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl().replace(/\/$/, '');

  // Static pages: no reliable per-page modified timestamp, so omit lastModified
  // rather than stamping every build with `new Date()`.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/testimonials`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/guides`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/resources`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/cabinets`, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/collections`, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/finishes`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/door-styles`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/accessories`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/hardware`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/construction`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/catalog`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/estimate`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/finder`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/warranty`, changeFrequency: 'yearly', priority: 0.55 },
    {
      url: `${baseUrl}/resources/ada-canyon-permit-flow`,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const cabinetRoomPages: MetadataRoute.Sitemap = ROOM_CATEGORIES.map((room) => ({
    url: `${baseUrl}/cabinets/${room.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const finishCategoryPages: MetadataRoute.Sitemap = ['matte', 'gloss', 'woodgrain'].map((cat) => ({
    url: `${baseUrl}/finishes/${cat}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const doorStylePages: MetadataRoute.Sitemap = DOOR_STYLES.map((d) => ({
    url: `${baseUrl}/door-styles/${d.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Only the curated, indexable finish subset is sitemapped. Long-tail
  // woodgrain SKUs are noindex,follow. See lib/catalog/indexation.ts.
  const finishDetailPages: MetadataRoute.Sitemap = indexableFinishes().map((f) => ({
    url: `${baseUrl}/finishes/${f.category}/${f.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const productCategorySlugs = Array.from(
    new Set(CABINET_PRODUCTS.map((p) => p.category)),
  );
  const productCategoryPages: MetadataRoute.Sitemap = productCategorySlugs.map((category) => ({
    url: `${baseUrl}/products/${category}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Individual cabinet SKU pages are intentionally excluded from the sitemap:
  // they are noindex,follow (near-duplicate spec/configurator pages). See
  // seo-audit/doorway-page-analysis.md and lib/catalog/indexation.ts.

  // Use updatedAt when available so edits are reflected; fall back to publishedAt.
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDE_PAGES.map((guide) => ({
    url: `${baseUrl}${guidePath(guide.slug)}`,
    lastModified: new Date(guide.updatedAt ?? guide.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const categoryHubPages: MetadataRoute.Sitemap = CONTENT_HUBS.flatMap((hub) => {
    const count = BLOG_POSTS.filter((p) => p.hubSlug === hub.hubSlug).length;
    if (!isCategoryHubIndexable(hub.hubSlug, count)) return [];
    return [
      {
        url: `${baseUrl}${categoryHubPath(hub.hubSlug)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.55,
      },
    ];
  });

  return [
    ...staticPages,
    ...cabinetRoomPages,
    ...collectionPages,
    ...finishCategoryPages,
    ...finishDetailPages,
    ...doorStylePages,
    ...productCategoryPages,
    ...guidePages,
    ...blogPages,
    ...categoryHubPages,
  ];
}
