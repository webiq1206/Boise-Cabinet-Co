/**
 * The single source of truth for every public, indexable URL on this site.
 * Both the XML sitemap (app/sitemap.ts) and the HTML sitemap page
 * (app/sitemap/page.tsx) render from these groups, so they cannot drift. Add
 * or remove a public URL here, never in either renderer. Exclusions mirror the
 * XML sitemap exactly (consolidated catalog subpages that now 301, location
 * guides that moved to /locations, thin category hubs).
 */
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { CITIES, locationPath } from '@/shared/contentData';
import { CONTENT_HUBS, categoryHubPath, guidePath, isCategoryHubIndexable } from '@/shared/contentHubs';

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
export interface SiteUrlEntry { path: string; label: string; changeFrequency: ChangeFrequency; priority: number; lastModified?: Date; }
export interface SiteUrlGroup { heading: string; entries: SiteUrlEntry[]; }

export function getSiteUrlGroups(): SiteUrlGroup[] {
  const core: SiteUrlEntry[] = [
    { path: '/', label: 'Home', changeFrequency: 'weekly', priority: 1 },
    { path: '/cabinets', label: 'Cabinets', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/catalog', label: 'Catalog', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/accessories', label: 'Accessories', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/construction', label: 'Cabinet construction', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/shaker-cabinets', label: 'Shaker cabinets', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/compare', label: 'Compare', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/builders', label: 'For builders', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/estimate', label: 'Get an estimate', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services/cabinet-installation', label: 'Cabinet installation', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/about', label: 'About', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/testimonials', label: 'Testimonials', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/contact', label: 'Contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/resources', label: 'Resources', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/resources/ada-canyon-permit-flow', label: 'Ada vs Canyon County permit flow', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/blog', label: 'Blog', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/guides', label: 'Guides', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/warranty', label: 'Warranty', changeFrequency: 'yearly', priority: 0.55 },
    { path: '/sitemap', label: 'Site map', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/privacy-policy', label: 'Privacy policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms-of-service', label: 'Terms of service', changeFrequency: 'yearly', priority: 0.3 },
  ];
  const rooms: SiteUrlEntry[] = ROOM_CATEGORIES.map((r) => ({ path: `/cabinets/${r.slug}`, label: r.name, changeFrequency: 'monthly', priority: 0.9 }));
  const locations: SiteUrlEntry[] = CITIES.map((c) => ({ path: locationPath(c.slug), label: c.name, changeFrequency: 'monthly', priority: 0.85 }));
  const guides: SiteUrlEntry[] = GUIDE_PAGES.filter((g) => g.guideType !== 'location').map((g) => ({
    path: guidePath(g.slug), label: g.title, changeFrequency: 'monthly', priority: 0.9, lastModified: new Date(g.updatedAt ?? g.publishedAt),
  }));
  const blog: SiteUrlEntry[] = BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`, label: p.title, changeFrequency: 'yearly', priority: 0.6, lastModified: new Date(p.updatedAt ?? p.publishedAt),
  }));
  const hubs: SiteUrlEntry[] = CONTENT_HUBS.flatMap((hub) => {
    const count = BLOG_POSTS.filter((p) => p.hubSlug === hub.hubSlug).length;
    return isCategoryHubIndexable(hub.hubSlug, count) ? [{ path: categoryHubPath(hub.hubSlug), label: hub.title, changeFrequency: 'weekly' as const, priority: 0.55 }] : [];
  });
  return [
    { heading: 'Main pages', entries: core },
    { heading: 'Cabinets by room', entries: rooms },
    { heading: 'Service areas', entries: locations },
    { heading: 'Guides', entries: guides },
    { heading: 'Blog topics', entries: hubs },
    { heading: 'Blog posts', entries: blog },
  ];
}
export function getAllSiteUrls(): SiteUrlEntry[] { return getSiteUrlGroups().flatMap((g) => g.entries); }
