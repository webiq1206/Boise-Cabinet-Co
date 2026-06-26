/**
 * JSON-LD Schema Markup Generators
 * Creates structured data for Google rich snippets and search features
 */

import { BUSINESS_INFO, CITY_SEO_DATA, getBaseUrl } from './seo';
import { SERVICES } from '@/shared/contentData';

interface SchemaContext {
  '@context': string;
  '@type': string | string[];
  [key: string]: unknown;
}

// Get the base URL for schema markup
const baseUrl = getBaseUrl();

/**
 * Generate LocalBusiness schema for homepage and location pages
 */
export function generateLocalBusinessSchema(city?: string): SchemaContext {
  const cityData = city ? CITY_SEO_DATA[city as keyof typeof CITY_SEO_DATA] : null;
  const coordinates = cityData?.coordinates || CITY_SEO_DATA.Kuna.coordinates;
  
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'FurnitureStore', 'HomeAndConstructionBusiness'],
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: `Custom cabinet company serving ${city || 'Boise'} and the Treasure Valley, Idaho. Kitchen cabinets, bathroom vanities, closet systems, and built-in storage.`,
    image: `${baseUrl}/images/marketing/og-default.webp`,
    '@id': baseUrl,
    url: baseUrl,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    // Service-area business: no streetAddress/postalCode published.
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: 'ID',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    },
    openingHoursSpecification: Object.entries(BUSINESS_INFO.hours).map(([day, hours]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hours === 'Closed' ? undefined : hours.split(' - ')[0],
      closes: hours === 'Closed' ? undefined : hours.split(' - ')[1],
    })).filter(spec => spec.opens),
    priceRange: '$$',
    areaServed: BUSINESS_INFO.serviceArea.map(area => ({
      '@type': 'City',
      name: area,
    })),
    ...(BUSINESS_INFO.reviewCount > 0
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
    foundingDate: BUSINESS_INFO.founded,
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
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
  };
}

/**
 * Generate Service schema for individual service pages
 */
export function generateServiceSchema(serviceName: string, serviceDescription: string, city?: string): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone,
      email: BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city || BUSINESS_INFO.address.city,
        addressRegion: 'ID',
        addressCountry: 'US',
      },
    },
    areaServed: city ? {
      '@type': 'City',
      name: city,
      addressCountry: 'US',
      addressRegion: 'ID',
    } : BUSINESS_INFO.serviceArea.map(area => ({
      '@type': 'City',
      name: area,
    })),
    serviceType: serviceName,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
    },
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
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    url: baseUrl,
    description: 'Custom cabinet company serving the Treasure Valley since 2017. Kitchen cabinets, bathroom vanities, closet systems, pantry storage, built-ins, and professional installation. Licensed, insured, and committed to craftsmanship.',
    foundingDate: BUSINESS_INFO.founded,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    // Service-area business: no streetAddress/postalCode published.
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: 'ID',
      addressCountry: 'US',
    },
    slogan: "Idaho's Premier Custom Cabinet Company",
    knowsAbout: [
      'Custom kitchen cabinets',
      'Bathroom vanities',
      'Frameless Euro cabinet construction',
      'Cabinet door styles',
      'Cabinet finishes',
      'Soft-close cabinet hardware',
      'Built-in storage and closets',
      'Treasure Valley, Idaho',
    ],
    areaServed: BUSINESS_INFO.serviceArea.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    sameAs: BUSINESS_INFO.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_INFO.phone,
      contactType: 'Customer Service',
      areaServed: 'US-ID',
      availableLanguage: 'English',
    },
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_INFO.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BUSINESS_INFO.rating,
      reviewCount: BUSINESS_INFO.reviewCount,
    },
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
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      priceCurrency: 'USD',
      seller: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
      },
    },
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
