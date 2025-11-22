import { Request, Response, NextFunction } from 'express';

// Define all valid route patterns for the new site
const validRoutePatterns = [
  // Exact matches
  '/',
  '/about',
  '/contact',
  '/services',
  '/pricing',
  '/get-quote',
  '/blog',
  '/privacy-policy',
  '/terms-of-service',
  
  // Route prefixes that are valid
  '/services/',
  '/commercial/',
  '/areas/',
  '/blog/',
  '/admin/',
  '/subcontractor/',
  '/api/',
  
  // Static files
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/favicon.png',
  '/favicon.ico',
  '/assets/',
  '/src/',
  '/@',  // Vite HMR
];

// File extensions that should be redirected (old site artifacts)
const oldFileExtensions = ['.html', '.htm', '.php', '.asp', '.aspx', '.jsp'];

/**
 * Middleware to 301 redirect old URLs to homepage
 * This preserves SEO by sending proper permanent redirects instead of 404s
 */
export function legacyUrlRedirect(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Skip redirects for API routes - they have their own 404 handling
  if (path.startsWith('/api/')) {
    return next();
  }
  
  // Skip redirects for static assets
  if (path.startsWith('/assets/') || path.startsWith('/src/') || path.startsWith('/@')) {
    return next();
  }
  
  // Check if the URL has an old file extension (definitely not valid in new site)
  const hasOldExtension = oldFileExtensions.some(ext => path.toLowerCase().endsWith(ext));
  if (hasOldExtension) {
    return res.redirect(301, 'https://lawncarekuna.com/');
  }
  
  // Check if path matches any valid route pattern
  const isValidRoute = validRoutePatterns.some(pattern => {
    if (pattern === path) return true; // Exact match
    // Prefix match - but exclude "/" itself (otherwise all paths would match it)
    if (pattern.endsWith('/') && pattern.length > 1 && path.startsWith(pattern)) {
      return true; // Prefix match
    }
    return false;
  });
  
  if (isValidRoute) {
    return next(); // Valid route, continue to Vite/React router
  }
  
  // For any other unrecognized URL that doesn't match our valid patterns,
  // send a 301 redirect to preserve SEO during migration
  // This includes old WordPress assets, old pages, etc.
  return res.redirect(301, 'https://lawncarekuna.com/');
}
