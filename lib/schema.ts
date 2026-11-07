import {schemaTime} from './schemaTime';
/**
 * JSON-LD Schema Markup Generators
 * Creates structured data for Google rich snippets and search features
 */

import { BUSINESS_INFO, getBaseUrl } from './seo';
import { publicText, showFoundingYear } from '@/shared/claims';
import { SITE_CONFIG, showTestimonials } from '@/shared/siteConfig';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { roomSeo, sentenceStart } from '@/shared/catalog/roomSeo';

interface SchemaContext {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}

// Get the base URL for schema markup
const baseUrl = getBaseUrl();

/** One business node for the whole site. Other pages reference this @id. */
export const BUSINESS_ID = `${baseUrl}/#business`;

/**
 * Boise Cabinet Co is a brand of P5 Home Co. parentOrganization points at
 * P5's business node so the two graphs join.
 *
 * Hardcoded rather than derived: this is a fixed external origin, and the
 * `@id` must match the P5 graph byte for byte or the nodes will not merge.
 */
const P5_ORIGIN = 'https://p5homeco.com';
export const P5_ORG_ID = `${P5_ORIGIN}/#business`;
/**
 * Footer still links the numeric Facebook page id. Schema sameAs uses the
 * verified vanity URL on the parent node, not this constant.
 */
export const P5_FACEBOOK_URL = 'https://www.facebook.com/1228704823655951';
/** Existing Google knowledge-graph id. Kept on the parent node. */
export const P5_GOOGLE_BUSINESS_PROFILE_URL = 'https://www.google.com/search?kgmid=/g/11ntl1t7dc';
/**
 * Verified P5 profiles only. BBB, Houzz, and BuildZoom stay out.
 * The kgmid entry stays at the end of this list.
 */
export const P5_VERIFIED_SAME_AS = [
  'https://www.facebook.com/p5homeco',
  'https://nextdoor.com/pages/boise-remodeling-co-meridian-id/',
  'https://ezlocal.com/id/meridian/home-remodeling/0919899218',
  'https://www.cylex.us.com/company/p5-home-co--llc-40749871.html',
  'https://www.google.com/maps?cid=11869148461693849141',
  P5_GOOGLE_BUSINESS_PROFILE_URL,
] as const;
export const P5_PARENT_ORGANIZATION = {
  '@type': 'Organization',
  '@id': P5_ORG_ID,
  name: 'P5 Home Co',
  url: P5_ORIGIN,
  sameAs: P5_VERIFIED_SAME_AS,
} as const;

/**
 * HomeAndConstructionBusiness plus GeneralContractor. No showroom type.
 */
const LOCAL_BUSINESS_TYPE = ['HomeAndConstructionBusiness', 'GeneralContractor'] as const;

/** Idaho DOPL registration, attached to every LocalBusiness node. */
function contractorCredential() {
  return {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'registration',
    name: 'Idaho Registered Contractor',
    identifier: SITE_CONFIG.trust.licenseNumber,
    recognizedBy: {
      '@type': 'GovernmentOrganization',
      name: 'Idaho Division of Occupational and Professional Licenses',
      url: 'https://dopl.idaho.gov/con/',
    },
  };
}

/**
 * Public service-area locality only: Meridian, ID, US.
 * streetAddress pending owner approval. Do not add streetAddress or postalCode.
 */
function serviceAreaLocality() {
  return {
    '@type': 'PostalAddress' as const,
    addressLocality: 'Meridian',
    addressRegion: 'ID',
    addressCountry: 'US',
  };
}

/**
 * Boise Cabinet Co's own wordmark (charcoal on transparent). It replaced
 * /images/brc-logo.png, a file named for Boise Remodeling Co left over from
 * the shared scaffold.
 */
const BRAND_LOGO_PATH = '/brand/png/wordmark/light/boise-cabinet-co-wordmark-charcoal-1200w.png';

/**
 * Shared Person node. The @id lives on p5homeco.com so Cabinet, Handyman,
 * Construction, and P5 resolve to one Nick Perkins entity. worksFor points
 * at the parent organization, the same @id parentOrganization uses.
 * Visible email sender names stay "Nick".
 */
const FOUNDER_NAME = 'Nick Perkins';
const PUBLIC_EMAIL = 'hello@boisecabinet.co';
const P5_PERSON_ID = `${P5_ORIGIN}/#nick-perkins`;
/** Schema telephone is E.164. Visible pages keep (208) 477-1169. */
const SCHEMA_TELEPHONE = '+1-208-477-1169';

function founderPerson() {
  return {
    '@type': 'Person' as const,
    '@id': P5_PERSON_ID,
    name: FOUNDER_NAME,
    jobTitle: 'Founder' as const,
    worksFor: { '@id': P5_ORG_ID },
  };
}

function publicContactPoint() {
  return {
    '@type': 'ContactPoint' as const,
    name: FOUNDER_NAME,
    contactType: 'customer service' as const,
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

/** Counties the site already names, alongside the city list. */
function areasServed(city?: string) {
  return [
    ...citiesServed(city),
    { '@type': 'AdministrativeArea' as const, name: 'Ada County' },
    { '@type': 'AdministrativeArea' as const, name: 'Canyon County' },
  ];
}

/**
 * Offer catalog from live service pages only: each cabinet room page, plus
 * cabinet installation. Each offer is a name and a url. Room descriptions
 * stay off this node.
 */
function cabinetOfferCatalog() {
  const roomOffers = ROOM_CATEGORIES.map((room) => ({
    '@type': 'Offer' as const,
    url: `${baseUrl}/cabinets/${room.slug}`,
    itemOffered: {
      '@type': 'Service' as const,
      name: sentenceStart(roomSeo(room).phrase),
    },
  }));
  return {
    '@type': 'OfferCatalog' as const,
    name: 'Cabinet services',
    itemListElement: [
      ...roomOffers,
      {
        '@type': 'Offer' as const,
        url: `${baseUrl}/services/cabinet-installation`,
        itemOffered: {
          '@type': 'Service' as const,
          name: 'Cabinet installation',
        },
      },
    ],
  };
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
      url: `${baseUrl}${BRAND_LOGO_PATH}`,
    },
    '@id': BUSINESS_ID,
    url: baseUrl,
    telephone: SCHEMA_TELEPHONE,
    email: PUBLIC_EMAIL,
    address: serviceAreaLocality(),
    parentOrganization: P5_PARENT_ORGANIZATION,
    employee: founderPerson(),
    contactPoint: publicContactPoint(),
    openingHoursSpecification: Object.entries(BUSINESS_INFO.hours).map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours === 'Closed' ? undefined : schemaTime(hours.split(' - ')[0]),
      closes: hours === 'Closed' ? undefined : schemaTime(hours.split(' - ')[1]),
    })).filter(spec => spec.opens),
    areaServed: areasServed(city),
    // No aggregateRating here. The repo holds no real, dated review data, and an
    // env flag is not evidence. Add it back only from reviews visible on the page.
    ...(showFoundingYear() ? { foundingDate: BUSINESS_INFO.founded } : {}),
    slogan: 'Custom cabinets planned around your home',
    paymentAccepted: 'Cash, Credit Card, Check, Financing',
    currenciesAccepted: 'USD',
    hasOfferCatalog: cabinetOfferCatalog(),
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
      '@id': BUSINESS_ID,
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
      '@id': BUSINESS_ID,
      name: BUSINESS_INFO.name,
      telephone: SCHEMA_TELEPHONE,
      email: PUBLIC_EMAIL,
      address: serviceAreaLocality(),
      parentOrganization: P5_PARENT_ORGANIZATION,
      employee: founderPerson(),
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
 * Plain brand node for /about. It is not a second HomeAndConstructionBusiness.
 * The page points at the business entity with WebPage.about.
 */
export function generateOrganizationSchema(): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_INFO.name,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}${BRAND_LOGO_PATH}`,
    },
    description: publicText('Custom cabinet design and installation for Treasure Valley homes, from kitchens and vanities to pantries and built-ins. Work by P5 Home Co LLC, an Idaho registered contractor, insured with proof on request.'),
    parentOrganization: P5_PARENT_ORGANIZATION,
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
    // No aggregateRating here. An env-driven count is not review data in the repo.
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
  /** Reference the single business node. Used by /about. */
  aboutId?: string;
}): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${baseUrl}${page.url}`,
    ...(page.aboutId ? { about: { '@id': page.aboutId } } : {}),
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
