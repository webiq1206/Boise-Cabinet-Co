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
  isHomePage?: boolean;
}

/**
 * Generate SEO-optimized page title
 * Format: "Primary Keyword - Secondary Keyword | Lawn Care Kuna"
 * Max 60 characters for optimal Google display
 */
export function generatePageTitle(params: ServiceSEOParams): string {
  const { serviceName, city, isHomePage } = params;
  
  if (isHomePage) {
    return "Lawn Care Kuna | Professional Lawn & Landscaping";
  }
  
  if (city) {
    // Geo-targeted title: "Service in City | Lawn Care City"
    const brandName = `Lawn Care ${city}`;
    const title = `${serviceName} in ${city} | ${brandName} Idaho`;
    return title.length > 60 ? `${serviceName} ${city} | ${brandName}` : title;
  }
  
  // Service-only title (defaults to Kuna as home base)
  const title = `Professional ${serviceName} Services | Lawn Care Kuna Idaho`;
  return title.length > 60 ? `${serviceName} Services | Lawn Care Kuna` : title;
}

/**
 * Generate SEO-optimized meta description
 * 150-160 characters with compelling CTA and keywords
 */
export function generateMetaDescription(params: ServiceSEOParams): string {
  const { serviceName, city } = params;
  
  if (params.isHomePage) {
    return "Kuna's #1 lawn care & landscaping. Professional mowing, fertilization, aeration & more. Licensed & insured. Free quotes since 2010.";
  }
  
  if (city) {
    // Geo-targeted description - use city name for branding
    const cityPossessive = city.endsWith('s') ? `${city}'` : `${city}'s`;
    return `${cityPossessive} top-rated ${serviceName.toLowerCase()} service. Licensed professionals, guaranteed results, competitive pricing. Free quotes. Serving ${city} & Treasure Valley. Call today!`;
  }
  
  // Service-only description (defaults to Kuna as home base)
  return `Professional ${serviceName.toLowerCase()} services in Kuna & Treasure Valley, Idaho. Licensed, insured, satisfaction guaranteed. Get your free quote today. Serving residential & commercial properties.`;
}

/**
 * Generate keyword array for meta keywords tag
 * Mix of primary, secondary, and LSI keywords
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
  ];
  
  if (city) {
    return [
      `${serviceName.toLowerCase()} ${city}`,
      `${serviceName.toLowerCase()} ${city} Idaho`,
      `${city} lawn care`,
      `${city} landscaping`,
      ...baseKeywords,
      `professional ${serviceName.toLowerCase()}`,
      `best ${serviceName.toLowerCase()} ${city}`,
    ];
  }
  
  // Service-specific LSI keywords
  const lsiKeywords: Record<string, string[]> = {
    'lawn-mowing': ['grass cutting', 'lawn maintenance', 'yard mowing', 'lawn trimming'],
    'fertilization': ['lawn fertilizer', 'grass fertilization', 'nutrient application', 'soil treatment'],
    'aeration': ['core aeration', 'lawn aeration', 'soil aeration', 'lawn health'],
    'weed-control': ['weed removal', 'weed prevention', 'herbicide application', 'weed treatment'],
    'seasonal-cleanup': ['yard cleanup', 'leaf removal', 'spring cleanup', 'fall cleanup'],
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
    if (params.city) {
      canonical = `${baseUrl}/services/${params.serviceSlug}/${params.city.toLowerCase()}`;
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
