/**
 * Minimal in-memory fixed-window rate limiter.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // per IP per window (default — used by /api/order)

const globalForRL = globalThis as unknown as { __orderRL?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = globalForRL.__orderRL ?? new Map();
globalForRL.__orderRL = buckets;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export function rateLimit(key: string, opts?: RateLimitOptions): RateLimitResult {
  const windowMs = opts?.windowMs ?? WINDOW_MS;
  const max = opts?.max ?? MAX_REQUESTS;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSec: 0 };
  }

  if (existing.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: max - existing.count,
    retryAfterSec: 0,
  };
}

/** Derive a client key from request headers (works behind Vercel/proxies). */
export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}