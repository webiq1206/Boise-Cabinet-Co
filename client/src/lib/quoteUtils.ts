import { useEffect, useRef, useState } from "react";

/**
 * Normalizes property size input to square feet
 * Handles formats: "5000", "5000 sq ft", "50x100", "0.25 acres", "1/4 acre"
 * Returns null if invalid or outside reasonable range (500-100,000 sq ft)
 */
export function normalizePropertySize(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  
  // Remove commas and normalize
  const normalized = input.toLowerCase().replace(/,/g, '').trim();
  
  let sqft = 0;
  
  // Handle dimension format: "50x100" or "50 x 100"
  const dimensionMatch = normalized.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/);
  if (dimensionMatch) {
    const length = parseFloat(dimensionMatch[1]);
    const width = parseFloat(dimensionMatch[2]);
    sqft = Math.round(length * width);
  } else if (normalized.includes('acre')) {
    // Handle acres: "0.5 acres" or "1/2 acre"
    const acreMatch = normalized.match(/(\d+\.?\d*|\d+\/\d+)/);
    if (acreMatch) {
      let acres = 0;
      if (acreMatch[1].includes('/')) {
        const [num, den] = acreMatch[1].split('/').map(Number);
        acres = num / den;
      } else {
        acres = parseFloat(acreMatch[1]);
      }
      sqft = Math.round(acres * 43560); // 1 acre = 43,560 sq ft
    }
  } else {
    // Handle plain numbers: "5000" or "5000 sq ft"
    const numberMatch = normalized.match(/(\d+\.?\d*)/);
    if (numberMatch) {
      sqft = Math.round(parseFloat(numberMatch[1]));
    }
  }
  
  // Validate reasonable size range
  if (sqft < 500 || sqft > 100000) return null;
  
  return sqft;
}

/**
 * Debounce hook - delays executing a callback until after wait time
 * Useful for expensive operations like AI API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Cache key generator for AI quotes
 * Creates consistent cache keys based on quote parameters
 */
export function getQuoteCacheKey(params: {
  serviceType: string;
  propertyType: string;
  sqft: number;
}): string {
  return `ai-quote:${params.serviceType}:${params.propertyType}:${params.sqft}`;
}

/**
 * Simple in-memory cache for AI quote results
 * Prevents duplicate API calls for identical requests
 */
class QuoteCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxAge = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiQuoteCache = new QuoteCache();

/**
 * Abort controller manager for preventing race conditions
 * Ensures only the latest request is processed
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  };

  const getSignal = () => {
    abort(); // Cancel previous request
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  };

  useEffect(() => {
    return () => {
      abort();
    };
  }, []);

  return { getSignal, abort };
}
