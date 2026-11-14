import { NextResponse } from 'next/server';
import { npCall, type NpWarehouse } from '@/lib/nova-poshta';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Warehouse lists change rarely — cache per city+query in-process.
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
type CacheEntry = { items: unknown[]; expires: number };
const globalForCache = globalThis as unknown as { __npWarehouseCache?: Map<string, CacheEntry> };
const cache: Map<string, CacheEntry> = globalForCache.__npWarehouseCache ?? new Map();
globalForCache.__npWarehouseCache = cache;

export async function POST(request: Request) {
    const rl = rateLimit('np-wh:' + clientKey(request.headers), { windowMs: 60_000, max: 60 });
    if (!rl.ok) {
        return NextResponse.json({ items: [] }, { status: 429 });
    }

    let body: { cityRef?: string; q?: string };
    try {
        body = (await request.json()) as { cityRef?: string; q?: string };
    } catch {
        return NextResponse.json({ items: [] }, { status: 400 });
    }

    const cityRef = body.cityRef ?? '';
    if (!cityRef) return NextResponse.json({ items: [] });

    const query = (body.q ?? '').trim().toLowerCase();
    const cacheKey = `${cityRef}::${query}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return NextResponse.json({ items: cached.items });
    }

    try {
        const data = await npCall<NpWarehouse>('AddressGeneral', 'getWarehouses', {
            CityRef: cityRef,
            FindByString: query,
            Page: '1',
            Limit: '50',
        });
        const items = data.map((w) => ({
            ref: w.Ref,
            number: w.Number,
            description: w.Description,
            type: w.TypeOfWarehouse,
        }));
        cache.set(cacheKey, { items, expires: Date.now() + CACHE_TTL_MS });
        return NextResponse.json({ items });
    } catch (err) {
        console.error('[np/warehouses]', err);
        return NextResponse.json({ items: [], error: 'np_error' }, { status: 502 });
    }
}