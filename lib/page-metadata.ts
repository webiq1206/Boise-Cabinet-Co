import type { Metadata } from 'next';
import {
  generateCityServiceDescription,
  generateCityServiceTitle,
  generateMetaDescription,
  generatePageTitle,
  generateSafePageTitle,
  getBaseUrl,
} from './seo';

const OG_IMAGE = '/og-default.svg';

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
        'Learn about Boise Remodeling Co — Treasure Valley design-build remodeling. Licensed, insured, and committed to clear communication from consultation to walkthrough.';
      break;
    case 'contact':
      title = 'Contact Us';
      description =
        'Contact Boise Remodeling Co for a free in-home consultation. Call (208) 555-0100 or schedule online. Serving Boise, Meridian, Eagle, Nampa, and the Treasure Valley.';
      break;
    case 'blog':
      title = 'Remodeling Insights & Ideas';
      description =
        'Honest remodeling advice for Idaho homeowners — budgeting, timelines, permits, and design-build guidance from Boise Remodeling Co.';
      break;
    default:
      title = input.titleOverride || 'Boise Remodeling Co';
      description = input.descriptionOverride || '';
  }

  if (input.titleOverride) title = input.titleOverride;
  if (input.descriptionOverride) description = input.descriptionOverride;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: `${base}${OG_IMAGE}`, width: 1200, height: 630, alt: 'Boise Remodeling Co' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${base}${OG_IMAGE}`],
    },
  };
}
