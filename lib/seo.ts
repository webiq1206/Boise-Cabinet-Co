/**
 * SEO Utilities for Boise Cabinet Co
 * Generates optimized meta tags, titles, and descriptions
 * for service and location pages
 */

import { IDAHO_REGISTERED_CONTRACTOR, REGISTERED_BONDED_INSURED } from '@/shared/claims';
import { SITE_CONFIG } from '@/shared/siteConfig';

const BRAND = SITE_CONFIG.name;

/** Homepage title (50–60 chars) and meta description (120–160 chars). */
export const HOMEPAGE_TITLE = `${BRAND} | Custom Cabinets in Treasure Valley`;
export const HOMEPAGE_DESCRIPTION =
  'Kitchen, bath, and storage cabinets for Boise and the Treasure Valley. Idaho Registered Contractor #8381215, bonded and insured. Free design consultation.';

interface SEOMetaData {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

interface ServiceSEOParams {
  serviceName: string;
  serviceSlug: string;
  city?: string;
  citySlug?: string;
  isHomePage?: boolean;
}

/**
 * Intelligently truncate service name while keeping key words
 * Works on whole words to avoid breaking legitimate terms
 */
function truncateServiceName(serviceName: string, maxLength: number): string {
  if (serviceName.length <= maxLength) return serviceName;
  
  // Split into words
  const words = serviceName.split(' ');
  
  // Remove low-value filler words first (whole word removal only)
  const fillerWords = ['&', 'and', 'or', 'the', 'of', 'for', 'with', 'in', 'a', 'an'];
  let importantWords = words.filter(word => !fillerWords.includes(word.toLowerCase()));
  
  // Rebuild and check length
  let shortened = importantWords.join(' ');
  if (shortened.length <= maxLength) return shortened;
  
  // If still too long, remove words from end until it fits
  while (importantWords.length > 1 && shortened.length > maxLength) {
    importantWords.pop();
    shortened = importantWords.join(' ');
  }
  
  // If single word is too long, truncate it cleanly
  if (shortened.length > maxLength) {
    return shortened.substring(0, maxLength);
  }
  
  return shortened;
}

/**
 * Generate SEO-optimized page title
 * Format: "[Service] in [City], ID | Boise Cabinet Co | Free Quotes"
 * Max 60 characters for optimal Google display
 * GUARANTEED ≤60 chars through intelligent truncation
 */
export function generatePageTitle(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return HOMEPAGE_TITLE;
  }
  
  if (city && serviceName) {
    const fullTitle = `${serviceName} in ${city}, ID | ${BRAND} | Free Quotes`;
    
    if (fullTitle.length <= 60) {
      return fullTitle;
    }
    
    const mediumTitle = `${serviceName} in ${city}, ID | ${BRAND}`;
    if (mediumTitle.length <= 60) {
      return mediumTitle;
    }
    
    const shortTitle = `${serviceName} in ${city}, ID | Cabinets`;
    if (shortTitle.length <= 60) {
      return shortTitle;
    }
    
    const maxServiceLength = 60 - ` in ${city}, ID | Cabinets`.length;
    const truncatedService = truncateServiceName(serviceName, maxServiceLength);
    return `${truncatedService} in ${city}, ID | Cabinets`;
  }
  
  if (city) {
    const fullTitle = `Custom Cabinets in ${city}, ID | ${BRAND}`;
    if (fullTitle.length <= 60) {
      return fullTitle;
    }
    return `Cabinet Company ${city}, ID`;
  }
  
  if (!serviceName) {
    return `${BRAND} | Custom Cabinets Idaho`;
  }
  
  const fullTitle = `${serviceName} | ${BRAND} | Free Quotes`;
  if (fullTitle.length <= 60) {
    return fullTitle;
  }
  
  const mediumTitle = `${serviceName} | ${BRAND}`;
  if (mediumTitle.length <= 60) {
    return mediumTitle;
  }
  
  const maxServiceLength = 60 - ` | ${BRAND}`.length;
  const truncatedService = truncateServiceName(serviceName, maxServiceLength);
  return `${truncatedService} | ${BRAND}`;
}

const CITY_DESCRIPTION_VARIANTS: Record<string, string> = {
  Kuna: "Kuna",
  Boise: "Boise's custom cabinet",
  Meridian: "Meridian",
  Eagle: "Eagle's preferred",
  Star: "Star's reliable",
  Middleton: "Middleton's expert",
  Nampa: "Nampa",
  Caldwell: "Caldwell",
};

const CITY_CTA_VARIANTS: Record<string, string> = {
  Kuna: "Free design consultation",
  Boise: "Treasure Valley cabinet pros",
  Meridian: "In-home design visit",
  Eagle: "Clear written scope",
  Middleton: "Workmanship guarantee",
  Nampa: "Ada & Canyon County service",
  Caldwell: "Professional installation",
};

/** Keep a registration line inside the meta description length. */
function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const kept = clean.slice(0, max);
  const boundary = Math.max(kept.lastIndexOf(". "), kept.lastIndexOf("! "));
  if (boundary >= 110) return kept.slice(0, boundary + 1).trim();
  const space = kept.lastIndexOf(" ");
  const cut = (space > 110 ? kept.slice(0, space) : kept).replace(/[,:;]$/, "");
  return /[.!]$/.test(cut) ? cut : `${cut}.`;
}

/**
 * Generate SEO-optimized meta description
 * 150-160 characters with phone number, CTA, and unique value prop
 * Phone: (208) 477-1169
 */
export function generateMetaDescription(params: ServiceSEOParams): string {
  const { serviceName, city } = params;
  const phone = SITE_CONFIG.phone;
  
  if (params.isHomePage) {
    return HOMEPAGE_DESCRIPTION;
  }
  
  if (city && serviceName) {
    const serviceLC = serviceName.toLowerCase();
    const cityVariant = CITY_DESCRIPTION_VARIANTS[city] || `${city}'s trusted`;
    const ctaVariant = CITY_CTA_VARIANTS[city] || "Free design consultation";
    return clampDescription(`${cityVariant} ${serviceLC}. ${REGISTERED_BONDED_INSURED}. ${ctaVariant}. Call ${phone}.`);
  }
  
  if (city) {
    return clampDescription(`Custom cabinets and storage in ${city}, Idaho. ${REGISTERED_BONDED_INSURED}. Call ${phone} for a free design consultation.`);
  }
  
  if (!serviceName) {
    return `Custom cabinet company in Boise & the Treasure Valley. Kitchen cabinets, vanities, closets, and built-ins. Call ${phone} for a free design consultation!`;
  }
  
  const serviceLC = serviceName.toLowerCase();
  return clampDescription(`Expert ${serviceLC} in Boise and the Treasure Valley. ${REGISTERED_BONDED_INSURED}. Call ${phone}.`);
}

/**
 * Generate varied city-service title (used for page metadata title field)
 * Does NOT include brand name since layout template appends "| Boise Cabinet Co"
 * Target: under 40 chars so final rendered title stays under 60 chars
 */
export function generateCityServiceTitle(serviceName: string, cityName: string): string {
  const short = `${serviceName} in ${cityName}, Idaho`;
  if (short.length <= 40) {
    return short;
  }
  return `${serviceName} in ${cityName}, ID`;
}

/**
 * Generate varied city-service meta description
 * Guaranteed under 160 characters
 */
export function generateCityServiceDescription(
  serviceName: string,
  cityName: string,
  shortDescription?: string,
): string {
  const phone = SITE_CONFIG.phone;
  const serviceLC = serviceName.toLowerCase();
  const cityVariant = CITY_DESCRIPTION_VARIANTS[cityName] || "Local";
  const cityData = CITY_SEO_DATA[cityName as keyof typeof CITY_SEO_DATA];
  const neighborhood = cityData?.neighborhoods?.[0];

  if (neighborhood) {
    const withNeighborhood = clampDescription(`${cityVariant} ${serviceLC}. Serving ${neighborhood} and ${cityName}. ${REGISTERED_BONDED_INSURED}. Call ${phone}.`);
    if (withNeighborhood.length <= 160) return withNeighborhood;
  }

  if (shortDescription) {
    const desc = clampDescription(`${cityVariant} ${serviceLC}. ${shortDescription}. ${REGISTERED_BONDED_INSURED}. Call ${phone}.`);
    if (desc.length <= 160) return desc;
  }

  const base = clampDescription(`${cityVariant} ${serviceLC} in ${cityName}, ID. ${REGISTERED_BONDED_INSURED}. Call ${phone}.`);
  if (base.length <= 160) return base;

  return clampDescription(`${serviceLC} in ${cityName}, ID. ${REGISTERED_BONDED_INSURED}. Call ${phone}.`);
}

/** Keep complete authored titles; an optional secondary label may be omitted. */
export function generateSafePageTitle(primary: string, suffix?: string): string {
  const title = primary.replace(/\s+/g, ' ').trim();
  const detail = suffix?.replace(/\s+/g, ' ').trim();
  if (detail) {
    const candidate = title + ' | ' + detail;
    if (candidate.length + (' | ' + SITE_CONFIG.name).length <= 60) return candidate;
  }
  // Preserve the authored topic, including dates and qualifiers. A display
  // length preference must not become a broken title in the document itself.
  return title;
}

/** Normalize authored descriptions without clipping them or appending filler. */
export function clampMetaDescription(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Get base URL based on environment
 */
export function getBaseUrl(): string {
  // In Next.js, check for environment variable first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Use current origin in development, production domain in production
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
      return window.location.origin;
    }
  }
  // Default to production URL for SSR/build time
  return 'https://boisecabinet.co';
}

/**
 * Generate SEO-optimized alt tag for logo/icon featured image
 * Creates page-specific alt text that includes relevant keywords
 */
export function generateLogoAltTag(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return `${BRAND} logo - Custom cabinet company in Boise, Idaho`;
  }
  
  if (city && serviceName) {
    return `${BRAND} logo - ${serviceName} in ${city} Idaho - Custom cabinet professionals`;
  }
  
  if (city) {
    return `${BRAND} logo - Custom cabinets in ${city} Idaho`;
  }
  
  if (!serviceName) {
    return `${BRAND} logo - Custom cabinet company serving the Treasure Valley, Idaho`;
  }
  
  return `${BRAND} logo - ${serviceName.toLowerCase()} cabinets in Treasure Valley Idaho`;
}

/**
 * Generate complete SEO metadata object for a page
 */
export function generateSEOMetadata(params: ServiceSEOParams): SEOMetaData {
  const title = generatePageTitle(params);
  const description = generateMetaDescription(params);
  
  // Environment-aware canonical URL
  const baseUrl = getBaseUrl();
  const canonical = baseUrl;
  
  // Open Graph defaults to meta tags
  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/images/marketing/og-default.webp`,
    twitterCard: 'summary_large_image',
  };
}

/**
 * City-specific data for local SEO
 */
export const CITY_SEO_DATA: Record<string, {
  population: string;
  founded: string;
  zipCodes: string[];
  neighborhoods: string[];
  landmarks: string[];
  climate: string;
  coordinates: { lat: number; lng: number };
}> = {
  Kuna: {
    population: '24,011',
    founded: '1992',
    zipCodes: ['83634'],
    // Indian Creek and Ten Mile Creek are waterways. Indian Creek Plaza is in Caldwell.
    neighborhoods: ['Crimson Point', 'Black Cat'],
    landmarks: ['Bernie Fisher Park'],
    climate: 'semi-arid high desert climate with hot summers and cold winters',
    coordinates: { lat: 43.4913, lng: -116.4201 },
  },
  Boise: {
    population: '235,421',
    founded: '1863',
    zipCodes: ['83702', '83703', '83704', '83705', '83706', '83709', '83712', '83713', '83714', '83716'],
    neighborhoods: ['North End', 'Bench', 'Downtown', 'East End', 'Southwest Boise', 'Columbia Village'],
    landmarks: ['Idaho State Capitol', 'Boise River Greenbelt', 'Table Rock', 'Hyde Park'],
    climate: 'semi-arid climate with four distinct seasons',
    coordinates: { lat: 43.6150, lng: -116.2023 },
  },
  Meridian: {
    population: '117,635',
    founded: '1893',
    zipCodes: ['83642', '83646'],
    neighborhoods: ['Lochsa Falls', 'Tuscany', 'Paramount', 'Meridian Ranch'],
    landmarks: ['The Village at Meridian', 'Julius M. Kleiner Memorial Park', 'Settlers Park'],
    climate: 'semi-arid with hot, dry summers and cold winters',
    coordinates: { lat: 43.6121, lng: -116.3915 },
  },
  Eagle: {
    population: '30,346',
    founded: '1864',
    zipCodes: ['83616'],
    // Shadow Valley is Boise 83714 / unincorporated Ada County. Hidden Springs
    // is unincorporated Ada County, not a City of Eagle neighborhood.
    neighborhoods: ['Banbury', 'Legacy', 'Two Rivers'],
    landmarks: ['Eagle Island State Park', 'Heritage Park', 'Eagle Hills Golf Course'],
    climate: 'semi-arid with distinct four seasons',
    coordinates: { lat: 43.6954, lng: -116.3540 },
  },
  Star: {
    population: '12,701',
    founded: '1907',
    zipCodes: ['83669'],
    // Heron River and Reunion are named on City of Star pages. Freedom Park and
    // Star Riverwalk Park are City of Star parks. Hillsdale and Paramount are Meridian.
    neighborhoods: ['Heron River', 'Reunion'],
    landmarks: ['Freedom Park', 'Star Riverwalk Park', 'Boise River'],
    climate: 'semi-arid climate with hot summers and cool winters',
    coordinates: { lat: 43.6921, lng: -116.4939 },
  },
  Middleton: {
    population: '10,141',
    founded: '1909',
    zipCodes: ['83644'],
    // Purple Sage Golf Course is in Caldwell, so Purple Sage is not a Middleton neighborhood.
    neighborhoods: ['Middleton Heights', 'West Highlands Ranch', 'Falcon Valley'],
    landmarks: ['Boise River', 'Middleton Place Park', 'Piccadilly Park'],
    climate: 'semi-arid high desert climate with warm summers and cool winters',
    coordinates: { lat: 43.7068, lng: -116.6209 },
  },
  Nampa: {
    population: '108,188',
    founded: '1886',
    zipCodes: ['83651', '83653', '83686', '83687'],
    neighborhoods: ['Downtown Nampa', 'Karcher', 'Greenhurst'],
    landmarks: ['Ford Idaho Center', 'Nampa Train Depot'],
    climate: 'semi-arid with hot summers and cold winters',
    coordinates: { lat: 43.5407, lng: -116.5635 },
  },
  Caldwell: {
    population: '65,359',
    founded: '1883',
    zipCodes: ['83605', '83607'],
    neighborhoods: ['Downtown', 'Cleveland Blvd', 'Ustick', 'Wilson'],
    landmarks: ['Indian Creek Plaza', 'Caldwell Night Rodeo', 'College of Idaho', 'Purple Sage Golf Course'],
    climate: 'semi-arid high desert with four distinct seasons',
    coordinates: { lat: 43.6629, lng: -116.6874 },
  },
};

/**
 * Business information for NAP consistency
 */
export const BUSINESS_INFO = {
  name: SITE_CONFIG.name,
  legalName: SITE_CONFIG.legalName,
  phone: SITE_CONFIG.phone,
  email: SITE_CONFIG.email,
  // Service-area business: no street address or ZIP is published. Locality +
  // region + country only, for clean NAP / local SEO.
  address: {
    city: SITE_CONFIG.address.city,
    state: 'ID',
    country: 'United States',
  },
  hours: {
    monday: '9:00 AM - 6:00 PM',
    tuesday: '9:00 AM - 6:00 PM',
    wednesday: '9:00 AM - 6:00 PM',
    thursday: '9:00 AM - 6:00 PM',
    friday: '9:00 AM - 6:00 PM',
    saturday: '9:00 AM - 4:00 PM',
    sunday: 'Closed',
  },
  founded: '2020',
  serviceArea: ['Boise', 'Meridian', 'Eagle', 'Nampa', 'Kuna', 'Star', 'Middleton', 'Caldwell'],
  serviceRadius: '35 miles',
  licenses: [IDAHO_REGISTERED_CONTRACTOR],
  certifications: ['Custom Cabinetry', 'Frameless Euro Construction', 'Bonded & Insured'],
  insurance: REGISTERED_BONDED_INSURED,
  // Driven by env (NEXT_PUBLIC_REVIEW_*). 0 means schema omits aggregateRating.
  rating: SITE_CONFIG.trust.ratingValue,
  reviewCount: SITE_CONFIG.trust.reviewCount,
  yearlyServicesCompleted: 0,
  // TODO(client): add real GBP / Houzz / BBB / Yelp profile URLs via env.
  sameAs: [
    'https://www.facebook.com/boisecabinetco',
    'https://www.instagram.com/boisecabinetco',
    SITE_CONFIG.trust.gbpUrl,
    SITE_CONFIG.trust.houzzUrl,
    SITE_CONFIG.trust.bbbUrl,
    SITE_CONFIG.trust.yelpUrl,
  ].filter(Boolean),
};

export type { SEOMetaData, ServiceSEOParams };
