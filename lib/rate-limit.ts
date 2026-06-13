/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Suitable for a single-instance deployment or light traffic. For multi-region
 * / serverless-at-scale, swap this for a shared store (Upstash Redis, etc.).
 * State lives in module scope so it survives across requests on a warm lambda.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // per IP per window

// Avoid re-creating the map on hot-reload in dev.
const globalForRL = globalThis as unknown as { __orderRL?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = globalForRL.__orderRL ?? new Map();
globalForRL.__orderRL = buckets;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX_REQUESTS - 1, retryAfterSec: 0 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: MAX_REQUESTS - existing.count,
    retryAfterSec: 0,
  };
}

/** Derive a client key from request headers (works behind Vercel/proxies). */
export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
