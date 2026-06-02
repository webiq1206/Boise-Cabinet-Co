import { NextRequest } from "next/server";

/**
 * Lightweight in-memory rate limiter for abuse / cost protection on public
 * endpoints. Buckets are per-process: on autoscale (multiple stateless
 * instances) limits are enforced per instance, not globally. This is a
 * meaningful first line of defense against scripted abuse, but for strict
 * global guarantees a shared store (Redis/DB) would be required.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

let lastSweep = 0;
function sweep(now: number) {
  // Periodically drop expired buckets so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfter: number };

/**
 * Fixed-window rate limit. Returns ok=false with retryAfter (seconds) when the
 * caller has exceeded `limit` hits within `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
