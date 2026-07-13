import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/shared/siteConfig';
import {
  clampMetaDescription,
  generateCityServiceDescription,
  generateCityServiceTitle,
  generateMetaDescription,
  generatePageTitle,
  generateSafePageTitle,
  getBaseUrl,
} from './seo';

const OG_DEFAULT_IMAGE = {
  url: '/images/marketing/og-default.webp',
  width: 1792,
  height: 1024,
  alt: `${SITE_CONFIG.name} custom cabinets`,
};

export type PageMetaKind =
  | 'home'
  | 'service'
  | 'area'
  | 'city-service'
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
}

export function buildCanonical(path: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
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
    case 'service':
      title = generateSafePageTitle(
        `${input.serviceName} in Boise & Treasure Valley`,
        'Design-Build',
      );
      description = generateMetaDescription({
        serviceName: input.serviceName!,
        serviceSlug: input.serviceSlug!,
      });
      break;
    case 'area':
      title = generateSafePageTitle(`Remodeling Contractor in ${input.cityName}, Idaho`);
      description = generateMetaDescription({
        serviceName: '',
        serviceSlug: '',
        city: input.cityName,
        citySlug: input.citySlug,
      });
      break;
    case 'city-service':
      title = generateCityServiceTitle(input.serviceName!, input.cityName!);
      description = generateCityServiceDescription(
        input.serviceName!,
        input.cityName!,
      );
      break;
    case 'about':
      title = 'About Us';
      description =
        `Learn about ${SITE_CONFIG.name}, Idaho's premier custom cabinet company. Design Studio, client portal, and installation across the Treasure Valley.`;
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

  const resolvedTitle: Metadata['title'] =
    input.kind === 'home' ? { absolute: title } : title;

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
      images: [OG_DEFAULT_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_DEFAULT_IMAGE.url],
    },
  };
}
