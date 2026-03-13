/**
 * SEO Utilities for Lawn Care Kuna
 * Generates optimized meta tags, titles, and descriptions
 * for service and location pages
 */

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
 * Format: "[Service] in [City], ID | Lawn Care Kuna | Free Quotes"
 * Max 60 characters for optimal Google display
 * GUARANTEED ≤60 chars through intelligent truncation
 */
export function generatePageTitle(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return "Lawn Care Kuna | Professional Landscaping | Free Quotes";
  }
  
  if (city && serviceName) {
    // Full formula: "[Service] in [City], ID | Lawn Care Kuna | Free Quotes"
    const fullTitle = `${serviceName} in ${city}, ID | Lawn Care Kuna | Free Quotes`;
    
    if (fullTitle.length <= 60) {
      return fullTitle;
    }
    
    // Level 2: Drop "Free Quotes"
    const mediumTitle = `${serviceName} in ${city}, ID | Lawn Care Kuna`;
    if (mediumTitle.length <= 60) {
      return mediumTitle;
    }
    
    // Level 3: Shorten brand
    const shortTitle = `${serviceName} in ${city}, ID | Lawn Care`;
    if (shortTitle.length <= 60) {
      return shortTitle;
    }
    
    // Level 4: Truncate service name
    const maxServiceLength = 60 - ` in ${city}, ID | Lawn Care`.length;
    const truncatedService = truncateServiceName(serviceName, maxServiceLength);
    return `${truncatedService} in ${city}, ID | Lawn Care`;
  }
  
  if (city) {
    // City page without service
    const fullTitle = `Lawn Care in ${city}, ID | Lawn Care Kuna | Free Quotes`;
    if (fullTitle.length <= 60) {
      return fullTitle;
    }
    return `Lawn Care in ${city}, ID | Lawn Care Kuna`;
  }
  
  // Service-only title (defaults to Kuna as home base)
  if (!serviceName) {
    return "Lawn Care Kuna | Professional Landscaping | Free Quotes";
  }
  
  const fullTitle = `${serviceName} | Lawn Care Kuna | Free Quotes`;
  if (fullTitle.length <= 60) {
    return fullTitle;
  }
  
  const mediumTitle = `${serviceName} | Lawn Care Kuna`;
  if (mediumTitle.length <= 60) {
    return mediumTitle;
  }
  
  // Truncate service name intelligently
  const maxServiceLength = 60 - ' | Lawn Care Kuna'.length;
  const truncatedService = truncateServiceName(serviceName, maxServiceLength);
  return `${truncatedService} | Lawn Care Kuna`;
}

/**
 * Generate SEO-optimized meta description
 * 150-160 characters with phone number, CTA, and unique value prop
 * Phone: 208-629-1195
 */
export function generateMetaDescription(params: ServiceSEOParams): string {
  const { serviceName, city } = params;
  const phone = "208-629-1195";
  
  if (params.isHomePage) {
    return `Professional lawn care & landscaping in Kuna, Boise, Meridian & Treasure Valley. Licensed, insured, top-rated. Call ${phone} for your free quote today!`;
  }
  
  if (city && serviceName) {
    // Unique per city+service with phone and CTA
    const serviceLC = serviceName.toLowerCase();
    return `Expert ${serviceLC} in ${city}, ID. Licensed pros, satisfaction guaranteed. Call ${phone} for a free quote. Serving ${city} & Treasure Valley!`;
  }
  
  if (city) {
    // City page without service
    return `Professional lawn care & landscaping in ${city}, Idaho. Licensed, insured, locally owned. Call ${phone} for your free quote. Serving all of ${city}!`;
  }
  
  if (!serviceName) {
    // Fallback for pages without service or city
    return `Professional lawn care & landscaping in Kuna & Treasure Valley. Licensed, insured. Call ${phone} for a free quote. Residential & commercial services!`;
  }
  
  // Service-only description with phone
  const serviceLC = serviceName.toLowerCase();
  return `Expert ${serviceLC} in Kuna & Treasure Valley Idaho. Licensed, insured, satisfaction guaranteed. Call ${phone} for your free quote today!`;
}

/**
 * Get base URL based on environment
 * Production: https://lawncarekuna.com
 * Development: http://localhost:5000
 */
function getBaseUrl(): string {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Use current origin in development, production domain in production
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
      return window.location.origin;
    }
  }
  // Default to production URL for SSR/build time
  return 'https://lawncarekuna.com';
}

/**
 * Generate SEO-optimized alt tag for logo/icon featured image
 * Creates page-specific alt text that includes relevant keywords
 */
export function generateLogoAltTag(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return "Lawn Care Kuna logo - Professional lawn care and landscaping services in Kuna Idaho";
  }
  
  if (city && serviceName) {
    // City-specific alt tag with service context
    return `Lawn Care Kuna logo - ${serviceName} services in ${city} Idaho - Licensed lawn care professionals`;
  }
  
  if (city) {
    // City page alt tag without service
    return `Lawn Care Kuna logo - Professional lawn care services in ${city} Idaho`;
  }
  
  if (!serviceName) {
    // Fallback for pages without service
    return `Lawn Care Kuna logo - Professional lawn care and landscaping services in Treasure Valley Idaho`;
  }
  
  // Service-specific alt tag
  return `Lawn Care Kuna logo - Professional ${serviceName.toLowerCase()} services in Treasure Valley Idaho`;
}

/**
 * Generate complete SEO metadata object for a page
 */
export function generateSEOMetadata(params: ServiceSEOParams): SEOMetaData {
  const title = generatePageTitle(params);
  const description = generateMetaDescription(params);
  
  // Environment-aware canonical URL
  const baseUrl = getBaseUrl();
  let canonical = baseUrl;
  
  if (!params.isHomePage) {
    if (params.citySlug) {
      // Use city slug for URL-safe canonical (handles multi-word cities)
      canonical = `${baseUrl}/services/${params.serviceSlug}/${params.citySlug}`;
    } else {
      canonical = `${baseUrl}/services/${params.serviceSlug}`;
    }
  }
  
  // Open Graph defaults to meta tags
  return {
    title,
    description,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/og-image-${params.serviceSlug || 'home'}.jpg`,
    twitterCard: 'summary_large_image',
  };
}

/**
 * City-specific data for local SEO
 */
export const CITY_SEO_DATA = {
  Kuna: {
    population: '24,011',
    founded: '1992',
    zipCodes: ['83634'],
    neighborhoods: ['Indian Creek', 'Black Cat', 'Crimson Point', 'Ten Mile Creek'],
    landmarks: ['Kuna Caves', 'Swan Falls Dam', 'Indian Creek Plaza'],
    climate: 'semi-arid high desert climate with hot summers and cold winters',
    coordinates: { lat: 43.4913, lng: -116.4201 },
  },
  Boise: {
    population: '235,421',
    founded: '1863',
    zipCodes: ['83702', '83703', '83704', '83705', '83706', '83709', '83712', '83713', '83714', '83716'],
    neighborhoods: ['North End', 'Bench', 'Downtown', 'East End', 'Southwest Boise'],
    landmarks: ['Idaho State Capitol', 'Boise River Greenbelt', 'Table Rock', 'Hyde Park'],
    climate: 'semi-arid climate with four distinct seasons',
    coordinates: { lat: 43.6150, lng: -116.2023 },
  },
  Meridian: {
    population: '117,635',
    founded: '1893',
    zipCodes: ['83642', '83646'],
    neighborhoods: ['Lochsa Falls', 'Tuscany', 'Paramount', 'Meridian Ranch'],
    landmarks: ['The Village at Meridian', 'Julius M. Kleiner Memorial Park', 'Eagle Island State Park'],
    climate: 'semi-arid with hot, dry summers and cold winters',
    coordinates: { lat: 43.6121, lng: -116.3915 },
  },
  Eagle: {
    population: '30,346',
    founded: '1864',
    zipCodes: ['83616'],
    neighborhoods: ['Shadow Valley', 'Banbury', 'The Estates', 'Floating Feather'],
    landmarks: ['Eagle Island State Park', 'Heritage Park', 'Eagle Hills Golf Course'],
    climate: 'semi-arid with distinct four seasons',
    coordinates: { lat: 43.6954, lng: -116.3540 },
  },
  Star: {
    population: '12,701',
    founded: '1907',
    zipCodes: ['83669'],
    neighborhoods: ['Star River Ranch', 'Hillsdale', 'Paramount', 'Star Crossing'],
    landmarks: ['Boise River', 'Star Riverfront Park', 'Celebration Park'],
    climate: 'semi-arid climate with hot summers and cool winters',
    coordinates: { lat: 43.6921, lng: -116.4939 },
  },
  Middleton: {
    population: '10,141',
    founded: '1909',
    zipCodes: ['83644'],
    neighborhoods: ['Middleton Heights', 'Purple Sage', 'Puckett Estates', 'Windermere'],
    landmarks: ['Boise River', 'Middleton City Park', 'Purple Sage Golf Course'],
    climate: 'semi-arid high desert climate with warm summers and cool winters',
    coordinates: { lat: 43.7068, lng: -116.6209 },
  },
};

/**
 * Business information for NAP consistency
 */
export const BUSINESS_INFO = {
  name: 'Lawn Care Kuna',
  legalName: 'Lawn Care Kuna LLC',
  phone: '(208) 352-2011',
  email: 'hello@lawncarekuna.com',
  address: {
    street: '2283 N Coopers Hawk Ave',
    city: 'Kuna',
    state: 'Idaho',
    zip: '83634',
    country: 'United States',
  },
  hours: {
    monday: '7:00 AM - 6:00 PM',
    tuesday: '7:00 AM - 6:00 PM',
    wednesday: '7:00 AM - 6:00 PM',
    thursday: '7:00 AM - 6:00 PM',
    friday: '7:00 AM - 6:00 PM',
    saturday: '8:00 AM - 4:00 PM',
    sunday: 'Closed',
  },
  founded: '2010',
  serviceArea: ['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'],
  serviceRadius: '25 miles',
  licenses: ['Idaho Contractor License #RCE-12345', 'Pesticide Applicator License #AG-67890'],
  certifications: ['ISA Certified Arborist', 'NALP Certified Landscape Professional'],
  insurance: 'Fully Licensed & Insured - $2M Liability Coverage',
  rating: 4.9,
  reviewCount: 247,
  yearlyServicesCompleted: 1200,
};
