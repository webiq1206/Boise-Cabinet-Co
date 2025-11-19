import { LRUCache } from "lru-cache";
import type { Request, Response, NextFunction } from "express";

/**
 * LRU cache for quote calculations
 * Prevents duplicate AI calls for identical requests
 * Cache key: serviceType:propertyType:sqft
 */
const quoteCache = new LRUCache<string, any>({
  max: 500, // Store up to 500 quotes
  ttl: 1000 * 60 * 10, // 10 minutes
  updateAgeOnGet: true, // Refresh TTL on cache hit
});

/**
 * Generate cache key from quote parameters
 */
function getCacheKey(params: {
  serviceType: string;
  propertyType: string;
  propertySize: number;
}): string {
  return `${params.serviceType}:${params.propertyType}:${Math.round(params.propertySize)}`;
}

/**
 * Cache middleware for quote calculations
 * Returns cached result if available, otherwise proceeds to calculation
 */
export function quoteCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { serviceType, propertyType, propertySize } = req.body;
    
    if (!serviceType || !propertyType || !propertySize) {
      return next(); // Missing params, skip cache
    }
    
    const cacheKey = getCacheKey({ serviceType, propertyType, propertySize });
    const cached = quoteCache.get(cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return res.json({
        ...cached,
        cached: true, // Add flag to indicate cache hit
      });
    }
    
    console.log(`[Cache MISS] ${cacheKey}`);
    
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache successful responses
    res.json = function(data: any) {
      if (data.success !== false) {
        quoteCache.set(cacheKey, data);
        console.log(`[Cache SET] ${cacheKey}`);
      }
      return originalJson(data);
    };
    
    next();
  } catch (error) {
    console.error("Cache middleware error:", error);
    next(); // Continue on error
  }
}

/**
 * Clear the entire cache (useful for testing or when pricing changes)
 */
export function clearQuoteCache() {
  quoteCache.clear();
  console.log("[Cache] Cleared all cached quotes");
}
