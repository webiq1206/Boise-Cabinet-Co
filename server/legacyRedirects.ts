import { Request, Response, NextFunction } from 'express';

/**
 * Legacy URL redirect mappings for SEO preservation during site migration
 * Handles old WordPress/static site URLs and redirects them to new Next.js routes
 */

// Map old service names to new service slugs
const serviceNameMappings: Record<string, string> = {
  // Core lawn care services
  'lawn-mowing': 'lawn-mowing',
  'lawn-mowing-and-trimming': 'lawn-mowing',
  'lawn-care-services': 'lawn-care',
  'lawn-fertilization': 'fertilization',
  'fertilization-and-weed-control': 'fertilization',
  'lawn-aeration': 'aeration',
  'lawn-aeration-2': 'aeration',
  'thatching': 'dethatching',
  'weekly-lawn-maintenance': 'lawn-mowing',
  
  // Seasonal services
  'spring-cleanup': 'spring-cleanup',
  'fall-cleanup': 'fall-cleanup',
  'seasonal-cleanup': 'seasonal-cleanup',
  'leaf-removal': 'fall-cleanup',
  'leaf-removal-2': 'fall-cleanup',
  'snow-removal': 'seasonal-cleanup',
  'snow-removal-2': 'seasonal-cleanup',
  'snow-plowing': 'seasonal-cleanup',
  
  // Shrub/hedge services
  'hedge-trimming': 'hedge-trimming',
  'hedge-trimming-2': 'hedge-trimming',
  'shrub-trimming': 'hedge-trimming',
  
  // Irrigation services
  'sprinkler-blowouts': 'sprinkler-blowout',
  'sprinkler-blowouts-2': 'sprinkler-blowout',
  'sprinkler-blowouts-3': 'sprinkler-blowout',
  'sprinkler-repair': 'sprinkler-repair',
  'sprinkler-system-installation': 'sprinkler-system-installation',
  
  // Christmas lights
  'christmas-light-installation': 'christmas-light-installation',
  'christmas-lights-installation': 'christmas-light-installation',
};

// Map old city slugs (note: garden-city doesn't exist in new site)
const citySlugMappings: Record<string, string | null> = {
  'kuna': 'kuna',
  'boise': 'boise',
  'meridian': 'meridian',
  'nampa': 'nampa',
  'caldwell': 'caldwell',
  'eagle': 'eagle',
  'star': 'star',
  'middleton': 'middleton',
  'garden-city': null, // Redirect to homepage - city no longer serviced
};

// Direct path mappings (old path → new path)
const directPathMappings: Record<string, string> = {
  '/service-quote': '/get-quote',
  '/service-quote/': '/get-quote',
};

/**
 * Middleware to handle legacy URL redirects
 * Must be placed BEFORE the general legacyUrlRedirect middleware
 */
export function specificLegacyRedirects(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Remove trailing slash for consistent matching
  const normalizedPath = path.endsWith('/') && path.length > 1 
    ? path.slice(0, -1) 
    : path;
  
  // Check direct path mappings first
  if (directPathMappings[path] || directPathMappings[normalizedPath]) {
    const newPath = directPathMappings[path] || directPathMappings[normalizedPath];
    return res.redirect(301, `https://lawncarekuna.com${newPath}`);
  }
  
  // Pattern 1: Root-level service pages (e.g., /lawn-mowing/, /christmas-light-installation/)
  const rootServiceMatch = normalizedPath.match(/^\/([a-z-]+[a-z0-9-]*)$/);
  if (rootServiceMatch) {
    const oldServiceSlug = rootServiceMatch[1];
    const newServiceSlug = serviceNameMappings[oldServiceSlug];
    
    if (newServiceSlug) {
      return res.redirect(301, `https://lawncarekuna.com/services/${newServiceSlug}`);
    }
  }
  
  // Pattern 2: City root pages (e.g., /kuna/, /boise/)
  const cityMatch = normalizedPath.match(/^\/([a-z-]+)$/);
  if (cityMatch) {
    const oldCitySlug = cityMatch[1];
    const newCitySlug = citySlugMappings[oldCitySlug];
    
    // If city exists in new site, redirect to /areas/:city
    if (newCitySlug) {
      return res.redirect(301, `https://lawncarekuna.com/areas/${newCitySlug}`);
    }
    // If city no longer serviced (e.g., garden-city), redirect to homepage
    if (newCitySlug === null && oldCitySlug in citySlugMappings) {
      return res.redirect(301, 'https://lawncarekuna.com/');
    }
  }
  
  // Pattern 3: City + Service pages (e.g., /kuna/hedge-trimming-location-1city-name/)
  const cityServiceMatch = normalizedPath.match(/^\/([a-z-]+)\/([a-z-]+(?:-[a-z-]+)*)-location-1city-name$/);
  if (cityServiceMatch) {
    const oldCitySlug = cityServiceMatch[1];
    const oldServiceSlug = cityServiceMatch[2];
    
    const newCitySlug = citySlugMappings[oldCitySlug];
    const newServiceSlug = serviceNameMappings[oldServiceSlug];
    
    // If both city and service exist, redirect to /services/:service/:city
    if (newCitySlug && newServiceSlug) {
      return res.redirect(301, `https://lawncarekuna.com/services/${newServiceSlug}/${newCitySlug}`);
    }
    
    // If only service exists (city no longer serviced), redirect to service page
    if (newServiceSlug && (newCitySlug === null || !newCitySlug)) {
      return res.redirect(301, `https://lawncarekuna.com/services/${newServiceSlug}`);
    }
  }
  
  // No specific redirect matched, continue to next middleware
  next();
}
