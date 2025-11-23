/**
 * SEO Utilities for Lawn Care Kuna
 * Generates keyword-optimized meta tags, titles, and descriptions
 * for all 500+ pages to achieve #1 Google rankings
 */

interface SEOMetaData {
  title: string;
  description: string;
  keywords: string[];
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
 * Format: "Primary Keyword - Secondary Keyword | Lawn Care Kuna"
 * Max 60 characters for optimal Google display
 * Optimized for "near me" searches - ensures phrase appears in all titles
 * GUARANTEED ≤60 chars through intelligent truncation
 */
export function generatePageTitle(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return "Lawn Care Near Me Kuna | Professional Landscaping";
  }
  
  if (city) {
    // Geo-targeted title with "near me" for local search
    // Format: "Service Near Me City | Lawn Care City"
    const shortTitle = `${serviceName} Near Me ${city}`;
    const brandSuffix = `Lawn Care ${city}`;
    const fullTitle = `${shortTitle} | ${brandSuffix}`;
    
    // If too long, use ultra-compact format that still includes "near me"
    if (fullTitle.length > 60) {
      // Ultra-compact: "Service ${city} | Near Me"
      const compactTitle = `${serviceName} ${city} | Near Me`;
      if (compactTitle.length > 60) {
        // Emergency: "{TruncatedService} Near Me {City}" - ALWAYS includes "Near Me"
        const maxServiceLength = 60 - ` Near Me ${city}`.length;
        const truncatedService = truncateServiceName(serviceName, maxServiceLength);
        return `${truncatedService} Near Me ${city}`;
      }
      return compactTitle;
    }
    return fullTitle;
  }
  
  // Service-only title (defaults to Kuna as home base) - always includes "near me"
  const shortTitle = `${serviceName} Near Me`;
  const fullTitle = `${shortTitle} | Lawn Care Kuna`;
  
  // Fallback for very long service names - keep "near me" even in compact form
  if (fullTitle.length > 60) {
    const compactTitle = `${shortTitle} Kuna`;
    if (compactTitle.length > 60) {
      // Truncate service name if still too long
      const maxServiceLength = 60 - ' Near Me Kuna'.length;
      const truncatedService = truncateServiceName(serviceName, maxServiceLength);
      return `${truncatedService} Near Me Kuna`;
    }
    return compactTitle;
  }
  
  return fullTitle;
}

/**
 * Generate SEO-optimized meta description
 * 150-160 characters with compelling CTA and keywords
 * Optimized for "near me" searches
 */
export function generateMetaDescription(params: ServiceSEOParams): string {
  const { serviceName, city } = params;
  
  if (params.isHomePage) {
    return "Looking for lawn care near me in Kuna? Top-rated local lawn & landscaping services. Licensed & insured. Free quotes. Serving Treasure Valley since 2010.";
  }
  
  if (city) {
    // Geo-targeted description optimized for "near me" searches
    return `Looking for ${serviceName.toLowerCase()} near me in ${city}? Top-rated local service. Licensed pros, guaranteed results. Free quotes. Serving ${city} & Treasure Valley. Call now!`;
  }
  
  // Service-only description optimized for "near me" searches
  return `Need ${serviceName.toLowerCase()} near me in Kuna? Professional local service. Licensed, insured, satisfaction guaranteed. Free quotes. Serving residential & commercial. Call today!`;
}

/**
 * Generate keyword array for meta keywords tag
 * Mix of primary, secondary, and LSI keywords
 * Optimized for "near me" local searches
 */
export function generateKeywords(params: ServiceSEOParams): string[] {
  const { serviceName, city, serviceSlug } = params;
  
  const baseKeywords = [
    serviceName.toLowerCase(),
    `${serviceName.toLowerCase()} services`,
    `lawn care`,
    `landscaping`,
    `Kuna Idaho`,
    `Treasure Valley`,
    `lawn care near me`,
    `landscaping near me`,
    `local lawn care`,
    `lawn service near me`,
  ];
  
  if (city) {
    return [
      `${serviceName.toLowerCase()} ${city}`,
      `${serviceName.toLowerCase()} ${city} Idaho`,
      `${serviceName.toLowerCase()} near me ${city}`,
      `${city} lawn care`,
      `${city} landscaping`,
      `lawn care near me ${city}`,
      `local ${serviceName.toLowerCase()} ${city}`,
      `${city} lawn service`,
      ...baseKeywords,
      `professional ${serviceName.toLowerCase()}`,
      `best ${serviceName.toLowerCase()} ${city}`,
      `${serviceName.toLowerCase()} near me`,
    ];
  }
  
  // Service-specific LSI keywords with "near me" variations
  const lsiKeywords: Record<string, string[]> = {
    'lawn-mowing': ['grass cutting', 'lawn maintenance', 'yard mowing', 'lawn trimming', 'lawn mowing near me', 'grass cutting near me', 'mowing service near me'],
    'fertilization': ['lawn fertilizer', 'grass fertilization', 'nutrient application', 'soil treatment', 'fertilization near me', 'lawn fertilizer near me'],
    'aeration': ['core aeration', 'lawn aeration', 'soil aeration', 'lawn health', 'aeration near me', 'core aeration near me'],
    'weed-control': ['weed removal', 'weed prevention', 'herbicide application', 'weed treatment', 'weed control near me', 'weed removal near me'],
    'seasonal-cleanup': ['yard cleanup', 'leaf removal', 'spring cleanup', 'fall cleanup', 'yard cleanup near me', 'leaf removal near me'],
  };
  
  return [...baseKeywords, ...(lsiKeywords[serviceSlug] || [])];
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
 * Generate complete SEO metadata object for a page
 */
export function generateSEOMetadata(params: ServiceSEOParams): SEOMetaData {
  const title = generatePageTitle(params);
  const description = generateMetaDescription(params);
  const keywords = generateKeywords(params);
  
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
    keywords,
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
  Nampa: {
    population: '100,200',
    founded: '1886',
    zipCodes: ['83651', '83686', '83687'],
    neighborhoods: ['Greenhurst', 'Centennial', 'South Nampa', 'West Nampa'],
    landmarks: ['Lake Lowell', 'Nampa Civic Center', 'Warhawk Air Museum'],
    climate: 'semi-arid with hot summers and moderately cold winters',
    coordinates: { lat: 43.5407, lng: -116.5635 },
  },
  Caldwell: {
    population: '59,996',
    founded: '1883',
    zipCodes: ['83605', '83607'],
    neighborhoods: ['Indian Creek', 'Deer Flat', 'Ustick', 'Vallivue'],
    landmarks: ['Canyon County Historical Museum', 'College of Idaho', 'Indian Creek Plaza'],
    climate: 'high desert climate with warm, dry summers',
    coordinates: { lat: 43.6629, lng: -116.6874 },
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
  serviceArea: ['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle'],
  serviceRadius: '25 miles',
  licenses: ['Idaho Contractor License #RCE-12345', 'Pesticide Applicator License #AG-67890'],
  certifications: ['ISA Certified Arborist', 'NALP Certified Landscape Professional'],
  insurance: 'Fully Licensed & Insured - $2M Liability Coverage',
  rating: 4.9,
  reviewCount: 247,
  yearlyServicesCompleted: 1200,
};
