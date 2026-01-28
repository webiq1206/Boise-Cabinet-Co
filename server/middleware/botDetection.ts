/**
 * Bot Detection Middleware
 * Serves pre-rendered static HTML to search engine bots and AI crawlers
 * while regular browsers receive the React SPA
 */

import { type Request, type Response, type NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Known bot/crawler User-Agent patterns
const BOT_PATTERNS = [
  // Search Engines
  /googlebot/i,
  /bingbot/i,
  /slurp/i,           // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  
  // AI Systems / LLMs
  /gptbot/i,
  /chatgpt-user/i,
  /claude-web/i,
  /anthropic/i,
  /perplexitybot/i,
  /google-extended/i,
  /cohere-ai/i,
  /ai2bot/i,
  /omgili/i,
  /ccbot/i,           // Common Crawl
  
  // Social Media Crawlers
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /slackbot/i,
  /telegrambot/i,
  /discordbot/i,
  /pinterestbot/i,
  
  // SEO Tools
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,         // Majestic
  /dotbot/i,          // Moz
  /screaming frog/i,
  /rogerbot/i,
  /gigabot/i,
  
  // Other Crawlers
  /applebot/i,
  /ia_archiver/i,     // Internet Archive
  /archive\.org_bot/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
];

// Paths to skip (don't serve HTML for these)
const SKIP_PATHS = [
  /^\/api\//,
  /^\/admin/,
  /^\/subcontractor/,
  /^\/quote-status/,
  /^\/html\//,        // Already requesting HTML mirror directly
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|xml|txt)$/i,
];

/**
 * Check if the User-Agent indicates a bot/crawler
 */
function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * Check if the path should be skipped
 */
function shouldSkip(requestPath: string): boolean {
  return SKIP_PATHS.some(pattern => pattern.test(requestPath));
}

/**
 * Map a request path to the corresponding HTML file path
 */
function mapPathToHtmlFile(requestPath: string): string {
  // Remove trailing slash
  let cleanPath = requestPath.replace(/\/$/, '');
  
  // Handle root path
  if (cleanPath === '' || cleanPath === '/') {
    return path.join(process.cwd(), 'public', 'html', 'index.html');
  }
  
  // Handle /blog -> /blog/index.html
  if (cleanPath === '/blog') {
    return path.join(process.cwd(), 'public', 'html', 'blog', 'index.html');
  }
  
  // Handle /commercial -> /commercial/index.html
  if (cleanPath === '/commercial') {
    return path.join(process.cwd(), 'public', 'html', 'commercial', 'index.html');
  }
  
  // For all other paths, append .html
  // e.g., /services/aeration -> /public/html/services/aeration.html
  // e.g., /services/aeration/kuna -> /public/html/services/aeration/kuna.html
  return path.join(process.cwd(), 'public', 'html', `${cleanPath}.html`);
}

/**
 * Middleware to serve static HTML to bots
 */
export function serveBotHtml(req: Request, res: Response, next: NextFunction): void {
  const userAgent = req.get('User-Agent');
  const requestPath = req.path;
  
  // Skip if not a bot
  if (!isBot(userAgent)) {
    return next();
  }
  
  // Skip certain paths
  if (shouldSkip(requestPath)) {
    return next();
  }
  
  // Only handle GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Map path to HTML file
  const htmlFilePath = mapPathToHtmlFile(requestPath);
  
  // Check if file exists
  if (!fs.existsSync(htmlFilePath)) {
    // No static HTML for this path, fall through to SPA
    return next();
  }
  
  // Serve the static HTML file
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Served-By', 'bot-detection-middleware');
  
  // Read and send the file
  fs.readFile(htmlFilePath, 'utf-8', (err, content) => {
    if (err) {
      console.error(`[bot-detection] Error reading ${htmlFilePath}:`, err);
      return next();
    }
    res.send(content);
  });
}

/**
 * Export bot detection utility for testing
 */
export { isBot, mapPathToHtmlFile };
