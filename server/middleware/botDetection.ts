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
  /petalbot/i,        // Huawei
  /seznambot/i,       // Czech search engine
  /qwantify/i,        // Qwant
  
  // AI Systems / LLMs - OpenAI
  /gptbot/i,
  /chatgpt-user/i,
  /chatgpt/i,
  /oai-searchbot/i,
  /openai/i,
  
  // AI Systems / LLMs - Other
  /claude-web/i,
  /claude/i,
  /anthropic/i,
  /perplexitybot/i,
  /perplexity/i,
  /google-extended/i,
  /cohere-ai/i,
  /cohere/i,
  /ai2bot/i,
  /omgili/i,
  /ccbot/i,           // Common Crawl
  /diffbot/i,
  /bytespider/i,      // ByteDance/TikTok
  /amazonbot/i,
  /youbot/i,          // You.com
  /meta-externalagent/i,
  /meta-externalfetcher/i,
  /brightbot/i,
  /imagesiftbot/i,
  /friendly_crawler/i,
  
  // Social Media Crawlers
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /slackbot/i,
  /slack-imgproxy/i,
  /telegrambot/i,
  /discordbot/i,
  /pinterestbot/i,
  /redditbot/i,
  /embedly/i,
  /quora link preview/i,
  /outbrain/i,
  /w3c_validator/i,
  
  // SEO Tools
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,         // Majestic
  /dotbot/i,          // Moz
  /screaming frog/i,
  /rogerbot/i,
  /gigabot/i,
  /seokicks/i,
  /blexbot/i,
  /sistrix/i,
  /seostar/i,
  
  // Other Crawlers & Tools
  /applebot/i,
  /ia_archiver/i,     // Internet Archive
  /archive\.org_bot/i,
  /webarchive/i,
  /wget/i,
  /curl/i,
  /libwww/i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpx/i,
  /axios/i,
  /node-fetch/i,
  /got\//i,
  /undici/i,
  /go-http-client/i,
  /java\//i,
  /okhttp/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /httrack/i,
  /scrapy/i,
  /spider/i,
  /crawler/i,
  /bot\b/i,           // Generic "bot" at word boundary
  /crawl/i,           // Generic "crawl"
  /fetch/i,           // Generic "fetch" tools
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
 * Additional heuristics to detect bots that don't identify themselves
 * Checks for suspicious patterns in request headers
 */
function hasBotCharacteristics(req: Request): boolean {
  // Check for OpenAI-specific headers
  const forwardedFor = req.get('X-Forwarded-For') || '';
  const origin = req.get('Origin') || '';
  
  // OpenAI's browsing feature sometimes includes these
  if (origin.includes('openai.com') || origin.includes('chatgpt.com')) {
    return true;
  }
  
  // Check for missing typical browser headers (heuristic)
  const acceptLanguage = req.get('Accept-Language');
  const accept = req.get('Accept') || '';
  
  // Bots often have minimal Accept headers or are missing Accept-Language
  // Only use this as a hint, not definitive
  if (!acceptLanguage && accept === '*/*') {
    // Very likely a simple HTTP client/bot
    return true;
  }
  
  return false;
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
  const userAgent = req.get('User-Agent') || '';
  const requestPath = req.path;
  
  // Check for explicit HTML request via query parameter (for tools that can't be detected)
  // ?_html=1 or ?_escaped_fragment_ forces HTML serving
  const forceHtml = req.query._html === '1' || req.query._escaped_fragment_ !== undefined;
  
  // Check if this is a bot via User-Agent or request characteristics
  const isBotByUA = isBot(userAgent);
  const isBotByHeuristics = hasBotCharacteristics(req);
  const detectedAsBot = forceHtml || isBotByUA || isBotByHeuristics;
  
  // Log bot detection for debugging when a bot is detected or HTML is forced
  if (detectedAsBot) {
    console.log(`[bot-detection] Path: ${requestPath}, UA: ${userAgent.substring(0, 100)}, detected: true (UA: ${isBotByUA}, Heuristics: ${isBotByHeuristics}, ForceHTML: ${forceHtml})`);
  }
  
  // Skip if not a bot
  if (!detectedAsBot) {
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
    console.log(`[bot-detection] HTML file not found: ${htmlFilePath}`);
    return next();
  }
  
  // Log successful bot serving
  console.log(`[bot-detection] Serving static HTML to bot: ${requestPath} -> ${htmlFilePath}`);
  
  // Serve the static HTML file
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Served-By', 'bot-detection-middleware');
  res.setHeader('X-Bot-Detected', 'true');
  
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
