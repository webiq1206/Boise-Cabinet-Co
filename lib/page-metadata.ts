import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/shared/siteConfig';
import {
  clampMetaDescription,
  generateMetaDescription,
  generatePageTitle,
  getBaseUrl,
} from './seo';

const OG_DEFAULT_IMAGE = {
  url: '/images/marketing/og-default.png',
  width: 1200,
  height: 630,
  alt: `${SITE_CONFIG.name} custom cabinets`,
};

/**
 * The remodeling-era 'service', 'area' and 'city-service' kinds were retired
 * (Phase 4): they produced "Remodeling Contractor in {city}, Idaho" and
 * "... | Design-Build" titles, and every caller overrode them anyway. Cabinet
 * service, builder and location pages use 'page' with an authored title and
 * description, so no new page can inherit a remodeling title by default.
 */
export type PageMetaKind =
  | 'home'
  | 'page'
  | 'about'
  | 'contact'
  | 'blog'
  | 'blog-post';

export interface PageMetaInput {
  kind: PageMetaKind;
  serviceName?: string;
  serviceSlug?: string;
  cityName?: string;
  citySlug?: string;
  titleOverride?: string;
  descriptionOverride?: string;
  path: string;
  /** When true, emit noindex,follow for tool / utility / B2B pages. */
  noindex?: boolean;
  /**
   * Page-specific Open Graph image (path under /public). Use JPEG/PNG -
   * iMessage and some crawlers do not render WebP link previews.
   */
  ogImage?: { url: string; width: number; height: number; alt: string };
}

export function buildCanonical(path: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Normalize metadata text while preserving complete authored phrases. */
export function fitTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim().replace(/[\s:|,-]+$/, '');
}

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const base = getBaseUrl();
  const canonical = buildCanonical(input.path);

  let title: string;
  let description: string;

  switch (input.kind) {
    case 'home':
      title = generatePageTitle({ serviceName: '', serviceSlug: '', isHomePage: true });
      description = generateMetaDescription({ serviceName: '', serviceSlug: '', isHomePage: true });
      break;
    case 'about':
      title = 'About Us';
      description =
        `Learn about ${SITE_CONFIG.name}: custom cabinets designed to your measurements, built to order, and installed by our own crew across the Treasure Valley.`;
      break;
    case 'contact':
      title = 'Contact Us';
      description =
        `Contact ${SITE_CONFIG.name} for a free design consultation. Call ${SITE_CONFIG.phone} or schedule online. Serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and the Treasure Valley.`;
      break;
    case 'blog':
      title = 'Cabinet Design Insights';
      description =
        `Honest cabinet design advice for Idaho homeowners: finishes, layouts, timelines, and planning guidance from ${SITE_CONFIG.name}.`;
      break;
    default:
      title = input.titleOverride || SITE_CONFIG.name;
      description = input.descriptionOverride || '';
  }

  if (input.titleOverride) title = input.titleOverride;
  if (input.descriptionOverride) description = input.descriptionOverride;
  description = clampMetaDescription(description);
  if (input.kind !== 'home') title = fitTitle(title);

  const resolvedTitle: Metadata['title'] =
    input.kind === 'home' ? { absolute: title } : title;

  const ogImage = input.ogImage ?? OG_DEFAULT_IMAGE;

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical },
    ...(input.noindex
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}
