import {schemaTime} from './schemaTime';
/**
 * JSON-LD Schema Markup Generators
 * Creates structured data for Google rich snippets and search features
 */

import { BUSINESS_INFO, getBaseUrl } from './seo';
import { publicText, showFoundingYear } from '@/shared/claims';
import { SITE_CONFIG, showTestimonials } from '@/shared/siteConfig';
import { SERVICES } from '@/shared/contentData';

interface SchemaContext {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}

// Get the base URL for schema markup
const baseUrl = getBaseUrl();

/**
 * The parent entity. Boise Cabinet Co is a DBA of P5 Home Co LLC, not a
 * separate company. The P5 site already declares this site as one of its
 * `subOrganization` nodes using exactly this `@id` scheme
 * (`{childOrigin}/#organization`). Asserting `parentOrganization` back at P5
 * from this side closes the loop, so the two graphs join into one entity
 * instead of sitting on their domains as strangers.
 *
 * Hardcoded rather than derived: this is a fixed external origin, and the
 * `@id` must match the P5 graph byte for byte or the nodes will not merge.
 */
const P5_ORIGIN = 'https://p5homeco.com';
export const P5_ORG_ID = `${P5_ORIGIN}/#organization`;
export const P5_PARENT_ORGANIZATION = {
  '@type': 'Organization',
  '@id': P5_ORG_ID,
  name: 'P5 Home Co',
  url: P5_ORIGIN,
} as const;

/**
 * LocalBusiness subtype. HomeAndConstructionBusiness is the specific type
 * for this cabinet company.
 */
const LOCAL_BUSINESS_TYPE = ['LocalBusiness', 'HomeAndConstructionBusiness'] as const;

/** Idaho DOPL registration, attached to every LocalBusiness node. */
function contractorCredential() {
  return {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'registration',
    identifier: SITE_CONFIG.trust.licenseNumber,
    recognizedBy: {
      '@type': 'GovernmentOrganization',
      name: 'Idaho Division of Occupational and Professional Licenses',
      url: 'https://dopl.idaho.gov/con/',
    },
  };
}

/**
 * Postal address for the Meridian service-area business record.
 * Copied from backlink-engine/config.ts. This is not a public showroom:
 * the footer prints the same street with the not-a-storefront line.
 */
function serviceAreaPostalAddress() {
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: '4031 W Wapoot St' as const,
    addressLocality: 'Meridian' as const,
    addressRegion: 'ID' as const,
    postalCode: '83646' as const,
    addressCountry: 'US' as const,
  };
}

/**
 * Shared Person node. The @id lives on p5homeco.com so Cabinet, Handyman,
 * Construction, and P5 resolve to one Nick Perkins entity. worksFor points
 * at the parent organization, the same @id parentOrganization uses.
 * Visible email sender names stay "Nick".
 */
const PUBLIC_REPRESENTATIVE_NAME = 'Nick Perkins';
const PUBLIC_EMAIL = 'hello@boisecabinet.co';
const P5_PERSON_ID = `${P5_ORIGIN}/#nick-perkins`;
/** Schema telephone is E.164. Visible pages keep (208) 477-1169. */
const SCHEMA_TELEPHONE = '+1-208-477-1169';
/**
 * Nominatim point for 4031 W Wapoot St, Meridian, ID 83646.
 * Not the Meridian city centroid.
 */
const HQ_GEO = { latitude: 43.6515, longitude: -116.4444 } as const;

function publicRepresentative() {
  return {
    '@type': 'Person' as const,
    '@id': P5_PERSON_ID,
    name: PUBLIC_REPRESENTATIVE_NAME,
    jobTitle: 'Public representative' as const,
    worksFor: { '@id': P5_ORG_ID },
  };
}

function publicContactPoint() {
  return {
    '@type': 'ContactPoint' as const,
    name: PUBLIC_REPRESENTATIVE_NAME,
    contactType: 'Public representative' as const,
    telephone: SCHEMA_TELEPHONE,
    email: PUBLIC_EMAIL,
    areaServed: 'US-ID' as const,
    availableLanguage: 'English' as const,
  };
}

/** Cities we cover. A page city is areaServed, never a second postal address. */
function citiesServed(city?: string) {
  const names = [...BUSINESS_INFO.serviceArea];
  if (city && !names.includes(city)) names.unshift(city);
  return names.map((name) => ({ '@type': 'City' as const, name }));
}

/**
 * Generate LocalBusiness schema for homepage and location pages.
 * `city` is coverage for the description and areaServed. The postal address
 * stays the Meridian service-area locality on every page.
 */
export function generateLocalBusinessSchema(city?: string): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': [...LOCAL_BUSINESS_TYPE],
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: `Custom cabinet company serving ${city || 'Boise'} and the Treasure Valley, Idaho. Kitchen cabinets, bathroom vanities, closet systems, and built-in storage.`,
    image: `${baseUrl}/images/marketing/og-default.webp`,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/brc-logo.png`,
    },
    '@id': `${baseUrl}/#localbusiness`,
    url: baseUrl,
    telephone: SCHEMA_TELEPHONE,
    email: PUBLIC_EMAIL,
    address: serviceAreaPostalAddress(),
    parentOrganization: P5_PARENT_ORGANIZATION,
    employee: publicRepresentative(),
    contactPoint: publicContactPoint(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: HQ_GEO.latitude,
      longitude: HQ_GEO.longitude,
    },
    openingHoursSpecification: Object.entries(BUSINESS_INFO.hours).map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours === 'Closed' ? undefined : schemaTime(hours.split(' - ')[0]),
      closes: hours === 'Closed' ? undefined : schemaTime(hours.split(' - ')[1]),
    })).filter(spec => spec.opens),
    priceRange: '$$',
    areaServed: citiesServed(city),
    ...(showTestimonials() && BUSINESS_INFO.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: BUSINESS_INFO.rating,
            reviewCount: BUSINESS_INFO.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(showFoundingYear() ? { foundingDate: BUSINESS_INFO.founded } : {}),
    slogan: 'Idaho\'s Premier Custom Cabinet Company',
    paymentAccepted: 'Cash, Credit Card, Check, Financing',
    currenciesAccepted: 'USD',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cabinet Products & Services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        url: `${baseUrl}${s.url}`,
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.shortDescription,
        },
      })),
    },
    sameAs: BUSINESS_INFO.sameAs,
    hasCredential: contractorCredential(),
  };
}

/**
 * WebSite schema for homepage entity graph
 */
export function generateWebSiteSchema(): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_INFO.name,
    url: baseUrl,
    description:
      'Custom cabinet company serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and the Treasure Valley, Idaho.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

/**
 * Generate Service schema for individual service pages.
 * `city` is the place covered by this service. It is areaServed only.
 * The provider postal address is always the Meridian service-area locality.
 */
export function generateServiceSchema(serviceName: string, serviceDescription: string, city?: string): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': [...LOCAL_BUSINESS_TYPE],
      name: BUSINESS_INFO.name,
      telephone: SCHEMA_TELEPHONE,
      email: PUBLIC_EMAIL,
      address: serviceAreaPostalAddress(),
      parentOrganization: P5_PARENT_ORGANIZATION,
      employee: publicRepresentative(),
      contactPoint: publicContactPoint(),
      hasCredential: contractorCredential(),
    },
    areaServed: city
      ? {
          '@type': 'City',
          name: city,
        }
      : citiesServed(),
    serviceType: serviceName,
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Generate Organization schema for brand identity
 */
export function generateOrganizationSchema(): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    parentOrganization: P5_PARENT_ORGANIZATION,
    employee: publicRepresentative(),
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/brc-logo.png`,
    },
    description: publicText('Custom cabinet company serving the Treasure Valley since 2020. Kitchen cabinets, bathroom vanities, closet systems, pantry storage, built-ins, and professional installation. Idaho Registered Contractor #8381215, bonded and insured.'),
    ...(showFoundingYear() ? { foundingDate: BUSINESS_INFO.founded } : {}),
    telephone: SCHEMA_TELEPHONE,
    email: PUBLIC_EMAIL,
    address: serviceAreaPostalAddress(),
    slogan: "Idaho's Premier Custom Cabinet Company",
    knowsAbout: [
      'Custom kitchen cabinets',
      'Bathroom vanities',
      'Frameless cabinet construction options',
      'Cabinet door styles',
      'Cabinet finishes',
      'Soft-close hardware options',
      'Built-in storage and closets',
      'Treasure Valley, Idaho',
    ],
    areaServed: citiesServed(),
    sameAs: BUSINESS_INFO.sameAs,
    contactPoint: publicContactPoint(),
  };
}

/**
 * Generate Review schema for testimonials
 */
export function generateReviewSchema(reviews: Array<{
  author: string;
  rating: number;
  text: string;
  date: string;
}>): SchemaContext {
  if (!showTestimonials()) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_INFO.name,
    // Only with real reviews behind it: a 0-star aggregate is worse than none.
    ...(BUSINESS_INFO.reviewCount > 0 && BUSINESS_INFO.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: BUSINESS_INFO.rating,
            reviewCount: BUSINESS_INFO.reviewCount,
          },
        }
      : {}),
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.text,
    })),
  };
}

/**
 * Generate FAQPage schema for FAQ sections
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string;
  imageCaption?: string;
  slug: string;
  pathPrefix?: 'blog' | 'guides';
  canonicalUrl?: string;
}): SchemaContext {
  const canonicalPath = article.canonicalUrl
    ? (article.canonicalUrl.startsWith('http') ? article.canonicalUrl : `${baseUrl}${article.canonicalUrl}`)
    : `${baseUrl}/${article.pathPrefix ?? 'blog'}/${article.slug}`;
  const imageUrl = article.image?.startsWith('http')
    ? article.image
    : article.image
      ? `${baseUrl}${article.image}`
      : `${baseUrl}/images/marketing/og-default.webp`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      caption: article.imageCaption ?? article.description,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalPath,
    },
  };
}

export function generateCollectionPageSchema(page: {
  title: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.title,
    description: page.description,
    url: `${baseUrl}${page.url}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: page.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: `${baseUrl}${item.url}`,
      })),
    },
  };
}

/**
 * Generate Product schema for OSC cabinet SKU detail pages
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  url: string;
  image?: string;
  sku?: string;
}): SchemaContext {
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : product.image
      ? `${baseUrl}${product.image.startsWith('/') ? product.image : `/${product.image}`}`
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: `${baseUrl}${product.url}`,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Boise Cabinet Co',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Boise Cabinet Co',
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    // Custom, quote-only cabinets have no fixed price; an Offer without a price is
    // invalid for Product rich results, so it is intentionally omitted.
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(page: {
  title: string;
  description: string;
  url: string;
}): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${baseUrl}${page.url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: BUSINESS_INFO.name,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
  };
}

/**
 * Generate SpeakableSpecification schema for AI assistants and voice search
 */
export function generateSpeakableSchema(page: {
  name: string;
  url?: string;
  path?: string;
}): SchemaContext {
  const pagePath = page.url ?? page.path ?? '/';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ["[data-speakable='summary']"],
    },
    url: `${baseUrl}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`,
  };
}

/**
 * Generate ImageGallery schema for project showcase pages
 */
export function generateImageGallerySchema(gallery: {
  name: string;
  description: string;
  url: string;
  images: Array<{ url: string; caption: string; name?: string }>;
}): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: gallery.name,
    description: gallery.description,
    url: `${baseUrl}${gallery.url}`,
    image: gallery.images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
      caption: img.caption,
      ...(img.name ? { name: img.name } : {}),
    })),
  };
}

export type { SchemaContext };
