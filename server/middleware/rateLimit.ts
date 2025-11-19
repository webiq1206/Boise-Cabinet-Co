import type { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter for API endpoints
 * Limits requests per IP address to prevent abuse and control costs
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 20, windowMs: number = 60000) {
    this.maxRequests = maxRequests; // Default: 20 requests
    this.windowMs = windowMs; // Default: per minute (60s)
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetAt) {
      // New window - allow request
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    record.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetAt) {
      return Date.now() + this.windowMs;
    }
    return record.resetAt;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.requests.forEach((record, key) => {
      if (now > record.resetAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.requests.delete(key));
  }
}

// Create rate limiter instances for different endpoints
const quoteCalculationLimiter = new RateLimiter(20, 60000); // 20 requests per minute

/**
 * Rate limiting middleware for quote calculations
 * Prevents abuse of AI-powered quote endpoint
 */
export function quoteCalculationRateLimit(req: Request, res: Response, next: NextFunction) {
  // Use IP address as identifier (in production, could use user ID if authenticated)
  const identifier = req.ip || req.socket.remoteAddress || "unknown";
  
  if (!quoteCalculationLimiter.isAllowed(identifier)) {
    const resetTime = quoteCalculationLimiter.getResetTime(identifier);
    const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);
    
    console.warn(`[Rate Limit] IP ${identifier} exceeded quote calculation limit`);
    
    return res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
      retryAfter: resetInSeconds,
    });
  }

  // Add rate limit info to response headers
  res.setHeader("X-RateLimit-Limit", "20");
  res.setHeader("X-RateLimit-Remaining", quoteCalculationLimiter.getRemaining(identifier).toString());
  res.setHeader("X-RateLimit-Reset", quoteCalculationLimiter.getResetTime(identifier).toString());

  next();
}
