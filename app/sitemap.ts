import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { CITIES, locationPath } from '@/shared/contentData';
import {
  CONTENT_HUBS,
  categoryHubPath,
  guidePath,
  isCategoryHubIndexable,
} from '@/shared/contentHubs';
import { getBaseUrl } from '@/lib/seo';

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
    { url: `${baseUrl}/accessories`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/construction`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare`, changeFrequency: 'monthly', priority: 0.75 },
    // Catalog category subpages (/collections, /finishes, /door-styles, /hardware,
    // /products, /finder) were consolidated into the single /catalog experience
    // and now 301 there, so they are intentionally omitted from the sitemap.
    { url: `${baseUrl}/catalog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/estimate`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/builders`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/shaker-cabinets`, changeFrequency: 'monthly', priority: 0.85 },
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

  // Catalog category subpages (collections, finishes, door styles, product
  // categories, and their detail pages) were consolidated into /catalog and now
  // 301 there, so they are no longer sitemapped.

  // Use updatedAt when available so edits are reflected; fall back to publishedAt.
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  // The 8 city cabinet guides now live at /locations/[city] (see next.config.js
  // redirects) and are sitemapped there instead of their old /guides/[slug] URL.
  const guidePages: MetadataRoute.Sitemap = GUIDE_PAGES.filter(
    (guide) => guide.guideType !== 'location',
  ).map((guide) => ({
    url: `${baseUrl}${guidePath(guide.slug)}`,
    lastModified: new Date(guide.updatedAt ?? guide.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const locationPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${baseUrl}${locationPath(city.slug)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
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
    ...locationPages,
    ...guidePages,
    ...blogPages,
    ...categoryHubPages,
  ];
}
