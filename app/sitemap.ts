import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { COLLECTIONS } from '@/shared/catalog/collections';
import { DOOR_STYLES } from '@/shared/catalog/doorStyles';
import {
  CONTENT_HUBS,
  categoryHubPath,
  guidePath,
  isCategoryHubIndexable,
} from '@/shared/contentHubs';
import { getBaseUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/testimonials`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/cabinets`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/finishes`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/door-styles`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/accessories`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/hardware`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/construction`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${baseUrl}/design-studio`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${baseUrl}/resources/ada-canyon-permit-flow`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const cabinetRoomPages: MetadataRoute.Sitemap = ROOM_CATEGORIES.map((room) => ({
    url: `${baseUrl}/cabinets/${room.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const finishCategoryPages: MetadataRoute.Sitemap = ['matte', 'gloss', 'woodgrain'].map((cat) => ({
    url: `${baseUrl}/finishes/${cat}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const doorStylePages: MetadataRoute.Sitemap = DOOR_STYLES.map((d) => ({
    url: `${baseUrl}/door-styles/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDE_PAGES.map((guide) => ({
    url: `${baseUrl}${guidePath(guide.slug)}`,
    lastModified: new Date(guide.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const categoryHubPages: MetadataRoute.Sitemap = CONTENT_HUBS.flatMap((hub) => {
    const count = BLOG_POSTS.filter((p) => p.hubSlug === hub.hubSlug).length;
    if (!isCategoryHubIndexable(hub.hubSlug, count)) return [];
    return [
      {
        url: `${baseUrl}${categoryHubPath(hub.hubSlug)}`,
        lastModified: now,
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
    ...doorStylePages,
    ...guidePages,
    ...blogPages,
    ...categoryHubPages,
  ];
}
