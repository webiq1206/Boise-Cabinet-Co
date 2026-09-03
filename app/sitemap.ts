import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { getAllSiteUrls } from '@/lib/siteUrls';

/**
 * Rendered from lib/siteUrls.ts - the same list the HTML sitemap page renders,
 * so the two cannot drift. Static pages carry no lastModified (no reliable
 * per-page timestamp); blog and guide entries carry theirs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  return getAllSiteUrls().map((e) => ({
    url: e.path === '/' ? baseUrl : `${baseUrl}${e.path}`,
    ...(e.lastModified ? { lastModified: e.lastModified } : {}),
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
