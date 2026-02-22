/**
 * JSON-LD Schema Markup Generators
 * Creates structured data for Google rich snippets and search features
 */

import { BUSINESS_INFO, CITY_SEO_DATA, getBaseUrl } from './seo';

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
    '@type': ['LocalBusiness', 'LawnService'],
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: `Professional lawn care and landscaping services in ${city || 'Kuna'} and the Treasure Valley, Idaho. ${BUSINESS_INFO.yearlyServicesCompleted}+ happy customers annually.`,
    image: `${baseUrl}/images/lawn-care-kuna-logo.png`,
    '@id': baseUrl,
    url: baseUrl,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: BUSINESS_INFO.address.state,
      postalCode: BUSINESS_INFO.address.zip,
      addressCountry: BUSINESS_INFO.address.country,
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
      '@id': `${baseUrl}/areas/${area.toLowerCase()}`,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BUSINESS_INFO.rating,
      reviewCount: BUSINESS_INFO.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    foundingDate: BUSINESS_INFO.founded,
    slogan: 'Kuna\'s Most Trusted Lawn Care Service',
    paymentAccepted: 'Cash, Credit Card, Check, Venmo, PayPal',
    currenciesAccepted: 'USD',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Lawn Care Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Lawn Mowing & Edging',
            description: 'Professional grass cutting and trimming services',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Fertilization',
            description: 'Seasonal lawn fertilization and nutrient application',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Core Aeration',
            description: 'Professional core aeration for healthier lawns',
          },
        },
      ],
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
        addressRegion: BUSINESS_INFO.address.state,
        addressCountry: BUSINESS_INFO.address.country,
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
      priceRange: '$$',
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
    logo: `${baseUrl}/images/lawn-care-kuna-logo.png`,
    description: 'Professional lawn care and landscaping services serving the Treasure Valley since 2010. Licensed, insured, and committed to excellence.',
    foundingDate: BUSINESS_INFO.founded,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: BUSINESS_INFO.address.state,
      postalCode: BUSINESS_INFO.address.zip,
      addressCountry: BUSINESS_INFO.address.country,
    },
    sameAs: [
      'https://share.google/qS8UCGzYV6EcS3iUP',
    ],
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
  author?: string;
  image?: string;
  slug: string;
}): SchemaContext {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || `${baseUrl}/images/lawn-care-kuna-logo.png`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/lawn-care-kuna-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`,
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

export type { SchemaContext };
