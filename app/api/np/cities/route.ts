import { NextResponse } from 'next/server';
import { npCall, type NpCity } from '@/lib/nova-poshta';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// City names barely ever change — cache responses in-process so repeat
// queries (from any user) skip the upstream Nova Poshta call entirely.
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
type CacheEntry = { items: unknown[]; expires: number };
const globalForCache = globalThis as unknown as { __npCityCache?: Map<string, CacheEntry> };
const cache: Map<string, CacheEntry> = globalForCache.__npCityCache ?? new Map();
globalForCache.__npCityCache = cache;

export async function POST(request: Request) {
    // Lookups are read-only autocomplete traffic, not order submissions —
    // give them a much larger budget than the default (5/min) used for /api/order.
    const rl = rateLimit('np-city:' + clientKey(request.headers), { windowMs: 60_000, max: 60 });
    if (!rl.ok) {
        return NextResponse.json({ items: [] }, { status: 429 });
    }

    let q = '';
    try {
        ({ q } = (await request.json()) as { q?: string });
    } catch {
        return NextResponse.json({ items: [] }, { status: 400 });
    }

    const query = (q ?? '').trim().toLowerCase();
    if (query.length < 2) return NextResponse.json({ items: [] });

    const cached = cache.get(query);
    if (cached && cached.expires > Date.now()) {
        return NextResponse.json({ items: cached.items });
    }

    try {
        const data = await npCall<NpCity>('Address', 'getCities', {
            FindByString: query,
            Limit: '20',
        });
        const items = data.map((c) => ({
            ref: c.Ref,
            name: c.Description,
            area: c.AreaDescription ?? '',
            type: c.SettlementTypeDescription ?? '',
        }));
        cache.set(query, { items, expires: Date.now() + CACHE_TTL_MS });
        return NextResponse.json({ items });
    } catch (err) {
        console.error('[np/cities]', err);
        return NextResponse.json({ items: [], error: 'np_error' }, { status: 502 });
    }
}